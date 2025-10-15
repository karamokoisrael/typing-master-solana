'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { TypingGame } from '@/components/TypingGame';
import { PlayerStats } from '@/components/PlayerStats';
import { ContestList } from '@/components/ContestList';
import { useSolanaProgram } from '@/hooks/useSolanaProgram';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ErrorDialog } from '@/components/ui/error-dialog';
import { SuccessDialog } from '@/components/ui/success-dialog';
import { LoadingDialog } from '@/components/ui/loading-dialog';

export default function Home() {
  const { connected } = useWallet();
  const { isInitialized, isLoading, error, initializePlayer } = useSolanaProgram();
  const [activeTab, setActiveTab] = useState<'practice' | 'contests' | 'stats'>('practice');
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [transactionSignature, setTransactionSignature] = useState('');

  const handleInitialize = async () => {
    try {
      const signature = await initializePlayer();
      if (signature === 'Account already exists') {
        setSuccessMessage('Your account is already initialized and ready to use!');
        setTransactionSignature('');
      } else {
        setSuccessMessage('Your player account has been successfully initialized on the Solana blockchain!');
        setTransactionSignature(signature);
      }
      setShowSuccessDialog(true);
    } catch (error) {
      setInitError(error instanceof Error ? error : new Error('Unknown error occurred'));
      setShowErrorDialog(true);
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Typing Master</CardTitle>
            <CardDescription>
              Connect your Solana wallet to start typing!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <WalletMultiButton />
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-yellow-600">💡</span>
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Using localhost?</p>
                  <p>Make sure your wallet is set to localhost network!</p>
                  <p className="text-xs mt-1">See WALLET_SETUP.md for detailed instructions.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold">Welcome to Typing Master!</CardTitle>
              <CardDescription>
                Initialize your account on the Solana blockchain to get started.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleInitialize}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? 'Initializing...' : 'Initialize Account'}
              </Button>
              
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600">🔐</span>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Blockchain Account</p>
                      <p>This will create your player account on the Solana blockchain.</p>
                      <p className="text-xs mt-1">You&apos;ll need to approve the transaction in your wallet.</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-amber-600">⚠️</span>
                    <div className="text-sm text-amber-800">
                      <p className="font-medium">Getting errors?</p>
                      <p>Check WALLET_SETUP.md for troubleshooting.</p>
                      <p className="text-xs mt-1">Make sure your wallet is on localhost network with SOL balance.</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dialogs */}
        <LoadingDialog
          open={isLoading}
          title="Initializing Account"
          description="Creating your player account on the Solana blockchain..."
        />
        
        <ErrorDialog
          open={showErrorDialog}
          onClose={() => setShowErrorDialog(false)}
          title="Initialization Failed"
          description="There was an error initializing your account. Please check your wallet connection and try again."
          error={initError}
        />
        
        <SuccessDialog
          open={showSuccessDialog}
          onClose={() => setShowSuccessDialog(false)}
          title="Account Initialized!"
          description={successMessage}
          transactionSignature={transactionSignature}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Typing Master</h1>
            <Badge variant="secondary" className="text-xs">
              Solana Powered
            </Badge>
          </div>
          <WalletMultiButton />
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1">
            <Button
              variant={activeTab === 'practice' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('practice')}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Practice
            </Button>
            <Button
              variant={activeTab === 'contests' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('contests')}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Contests
            </Button>
            <Button
              variant={activeTab === 'stats' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('stats')}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Statistics
            </Button>
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
