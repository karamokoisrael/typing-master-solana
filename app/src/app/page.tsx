'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { TypingGame } from '@/components/TypingGame';
import { PlayerStats } from '@/components/PlayerStats';
import { ContestList } from '@/components/ContestList';
import { useSolanaProgram } from '@/hooks/useSolanaProgram';
import { useState } from 'react';

export default function Home() {
  const { connected } = useWallet();
  const { isInitialized, isLoading, initializePlayer } = useSolanaProgram();
  const [activeTab, setActiveTab] = useState<'practice' | 'contests' | 'stats'>('practice');

  const handleInitialize = async () => {
    try {
      await initializePlayer();
    } catch (error) {
      console.error('Failed to initialize:', error);
      alert('Failed to initialize account. Please check console and wallet setup.');
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Typing Master</h1>
          <p className="text-gray-400 mb-8">Connect your Solana wallet to start typing!</p>
          <WalletMultiButton />
          <div className="mt-8 p-4 bg-yellow-900 border border-yellow-700 rounded-lg text-yellow-100">
            <p className="text-sm">
              💡 <strong>Using localhost?</strong> Make sure your wallet is set to localhost network!
              <br />See WALLET_SETUP.md for detailed instructions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold mb-4">Welcome to Typing Master!</h1>
          <p className="text-gray-400 mb-8">
            First time here? Initialize your account on the Solana blockchain to get started.
          </p>
          <button
            onClick={handleInitialize}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            {isLoading ? 'Initializing...' : 'Initialize Account'}
          </button>
          <div className="mt-8 p-4 bg-blue-900 border border-blue-700 rounded-lg text-blue-100">
            <p className="text-sm">
              🔐 This will create your player account on the Solana blockchain.
              <br />You&apos;ll need to approve the transaction in your wallet.
            </p>
          </div>
          <div className="mt-4 p-4 bg-yellow-900 border border-yellow-700 rounded-lg text-yellow-100">
            <p className="text-sm">
              ⚠️ <strong>Getting errors?</strong> Check WALLET_SETUP.md for troubleshooting.
              <br />Make sure your wallet is on localhost network with SOL balance.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Typing Master</h1>
          <WalletMultiButton />
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('practice')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'practice'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              Practice
            </button>
            <button
              onClick={() => setActiveTab('contests')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'contests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              Contests
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              Statistics
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'practice' && <TypingGame />}
        {activeTab === 'contests' && <ContestList />}
        {activeTab === 'stats' && <PlayerStats />}
      </main>
    </div>
  );
}
