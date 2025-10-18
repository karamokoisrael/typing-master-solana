'use client';

import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: FC<WalletProviderProps> = ({ children }) => {
  // Use environment variables to configure the endpoint
  const endpoint = useMemo(() => {
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
    const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK;
    
    if (rpcUrl) {
      return rpcUrl;
    }
    
    // Fallback based on network
    switch (network) {
      case 'devnet':
        return clusterApiUrl('devnet');
      case 'mainnet-beta':
        return clusterApiUrl('mainnet-beta');
      case 'localhost':
      default:
        return 'http://localhost:8899';
    }
  }, []);

  // Empty wallets array to start with - let the wallet adapter auto-detect
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
;}