'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, TransactionInstruction, SystemProgram } from '@solana/web3.js';
import { useState, useEffect, useCallback } from 'react';

// Program ID - deployed smart contract
const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID || 'BLLAnstcntKVpbHqmfE4qx7SAydKWMs2udMQah5SEw7o'
);

// Instruction types matching your Solana program
enum InstructionType {
  InitializePlayer = 0,
  CreateContest = 1,
  JoinContest = 2,
  SubmitResult = 3,
  UpdatePracticeStats = 4,
}

interface PlayerData {
  owner: PublicKey;
  total_tests: number;
  best_wpm: number;
  average_wpm: number;
  best_accuracy: number;
  total_words_typed: number;
  created_at: number;
  last_activity: number;
}

interface ContestData {
  creator: PublicKey;
  text_id: number;
  duration: number;
  status: number;
  participants: PublicKey[];
  created_at: number;
  started_at: number | null;
  ended_at: number | null;
  max_participants: number;
}

export function useSolanaProgram() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [contests, setContests] = useState<ContestData[]>([]);

  // Get player PDA
  const getPlayerPDA = useCallback(async (playerPubkey: PublicKey) => {
    const [playerPDA] = await PublicKey.findProgramAddress(
      [Buffer.from('player'), playerPubkey.toBuffer()],
      PROGRAM_ID
    );
    return playerPDA;
  }, []);

    // Check if player account exists
  const checkPlayerAccount = useCallback(async () => {
    if (!publicKey || isLoading) return;

    setIsLoading(true);
    setError(null);
    try {
      const playerPDA = await getPlayerPDA(publicKey);
      const accountInfo = await connection.getAccountInfo(playerPDA);
      
      if (accountInfo) {
        setIsInitialized(true);
        // TODO: Parse player data properly
      } else {
        setIsInitialized(false);
      }
      setHasChecked(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to check player account');
      setError(error);
      setIsInitialized(false);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, connection, getPlayerPDA, isLoading]);

  // Initialize player account
  const initializePlayer = useCallback(async (): Promise<string> => {
    if (!publicKey || isLoading) {
      throw new Error('Wallet not connected or operation in progress');
    }

    setIsLoading(true);
    setError(null);
    try {
      const playerPDA = await getPlayerPDA(publicKey);
      
      // Double-check if account already exists
      const accountInfo = await connection.getAccountInfo(playerPDA);
      if (accountInfo) {
        setIsInitialized(true);
        setHasChecked(true);
        setIsLoading(false);
        return 'Account already exists';
      }

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: playerPDA, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: Buffer.from([InstructionType.InitializePlayer]),
      });

      const transaction = new Transaction().add(instruction);
        
      // Get recent blockhash for the transaction
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      
      setIsInitialized(true);
      setHasChecked(true); // Mark as checked after successful initialization
      return signature;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize player account');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, connection, sendTransaction, getPlayerPDA, isLoading]);  // Update practice stats
  
  const updatePracticeStats = useCallback(async (wpm: number, accuracy: number, wordsTyped: number) => {
    if (!publicKey || !isInitialized) return;

    try {
      const playerPDA = await getPlayerPDA(publicKey);

      const instructionData = Buffer.alloc(13);
      instructionData.writeUInt8(InstructionType.UpdatePracticeStats, 0);
      instructionData.writeUInt32LE(wpm, 1);
      instructionData.writeUInt32LE(accuracy, 5);
      instructionData.writeUInt32LE(wordsTyped, 9);

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: playerPDA, isSigner: false, isWritable: true },
        ],
        programId: PROGRAM_ID,
        data: instructionData,
      });

      const transaction = new Transaction().add(instruction);
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      console.log('Practice stats updated:', signature);
      await fetchPlayerData();
    } catch (error) {
      console.error('Error updating practice stats:', error);
    }
  }, [publicKey, isInitialized, connection, sendTransaction, getPlayerPDA]);

  // Create contest
  const createContest = useCallback(async (textId: number, duration: number) => {
    if (!publicKey) return;

    try {
      const contestKeypair = new PublicKey(Math.random().toString()); // In real app, generate properly

      const instructionData = Buffer.alloc(13);
      instructionData.writeUInt8(InstructionType.CreateContest, 0);
      instructionData.writeUInt32LE(textId, 1);
      instructionData.writeBigUInt64LE(BigInt(duration), 5);

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: contestKeypair, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: instructionData,
      });

      const transaction = new Transaction().add(instruction);
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      console.log('Contest created:', signature);
      await fetchContests();
    } catch (error) {
      console.error('Error creating contest:', error);
    }
  }, [publicKey, connection, sendTransaction]);

  // Join contest
  const joinContest = useCallback(async (contestPubkey: PublicKey) => {
    if (!publicKey || !isInitialized) return;

    try {
      const playerPDA = await getPlayerPDA(publicKey);

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: contestPubkey, isSigner: false, isWritable: true },
          { pubkey: playerPDA, isSigner: false, isWritable: true },
        ],
        programId: PROGRAM_ID,
        data: Buffer.from([InstructionType.JoinContest]),
      });

      const transaction = new Transaction().add(instruction);
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      console.log('Joined contest:', signature);
      await fetchContests();
    } catch (error) {
      console.error('Error joining contest:', error);
    }
  }, [publicKey, isInitialized, connection, sendTransaction, getPlayerPDA]);

  // Submit contest result
  const submitContestResult = useCallback(async (contestPubkey: PublicKey, wpm: number, accuracy: number, timeTaken: number) => {
    if (!publicKey || !isInitialized) return;

    try {
      const playerPDA = await getPlayerPDA(publicKey);

      const instructionData = Buffer.alloc(17);
      instructionData.writeUInt8(InstructionType.SubmitResult, 0);
      instructionData.writeUInt32LE(wpm, 1);
      instructionData.writeUInt32LE(accuracy, 5);
      instructionData.writeBigUInt64LE(BigInt(timeTaken), 9);

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: contestPubkey, isSigner: false, isWritable: true },
          { pubkey: playerPDA, isSigner: false, isWritable: true },
        ],
        programId: PROGRAM_ID,
        data: instructionData,
      });

      const transaction = new Transaction().add(instruction);
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      console.log('Contest result submitted:', signature);
      await fetchContests();
      await fetchPlayerData();
    } catch (error) {
      console.error('Error submitting contest result:', error);
    }
  }, [publicKey, isInitialized, connection, sendTransaction, getPlayerPDA]);

  // Fetch player data
  const fetchPlayerData = useCallback(async () => {
    if (!publicKey) return;

    try {
      const playerPDA = await getPlayerPDA(publicKey);
      const accountInfo = await connection.getAccountInfo(playerPDA);

      if (accountInfo) {
        // Parse player data based on your struct
        setIsInitialized(true);
        // TODO: Deserialize player data properly
      }
    } catch (error) {
      console.error('Error fetching player data:', error);
    }
  }, [publicKey, connection, getPlayerPDA]);

  // Fetch contests
  const fetchContests = useCallback(async () => {
    try {
      // Fetch all program accounts that are contests
      const accounts = await connection.getProgramAccounts(PROGRAM_ID);
      // TODO: Parse and filter contest accounts
      setContests([]);
    } catch (error) {
      console.error('Error fetching contests:', error);
    }
  }, [connection]);

  // Check if player is initialized on wallet connect
  useEffect(() => {
    const checkAccount = async () => {
      if (!publicKey || isLoading) return;

      setIsLoading(true);
      try {
        const playerPDA = await getPlayerPDA(publicKey);
        const accountInfo = await connection.getAccountInfo(playerPDA);
        
        if (accountInfo) {
          setIsInitialized(true);
          console.log('Player account found');
        } else {
          setIsInitialized(false);
          console.log('Player account not found - ready for initialization');
        }
        setHasChecked(true);
      } catch (error) {
        console.error('Error checking player account:', error);
        setIsInitialized(false);
        setHasChecked(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (publicKey && !hasChecked && !isLoading) {
      checkAccount();
    } else if (!publicKey) {
      setIsInitialized(false);
      setPlayerData(null);
      setContests([]);
      setHasChecked(false);
    }
  }, [publicKey, hasChecked, isLoading, connection, getPlayerPDA]); // Include all dependencies

  return {
    isInitialized,
    isLoading,
    error,
    playerData,
    contests,
    initializePlayer,
    checkPlayerAccount,
    updatePracticeStats,
    createContest,
    joinContest,
    submitContestResult,
  };
}