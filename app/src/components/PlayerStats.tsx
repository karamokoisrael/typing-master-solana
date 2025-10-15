'use client';

import { useSolanaProgram } from '@/hooks/useSolanaProgram';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Target, Zap, Calendar, Activity, Wallet, Trophy, TrendingUp } from 'lucide-react';

export function PlayerStats() {
  const { publicKey } = useWallet();
  const { playerData, isInitialized, initializePlayer } = useSolanaProgram();

  if (!publicKey) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Wallet className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">Connect Your Wallet</p>
          <p className="text-sm text-muted-foreground text-center">
            Connect your wallet to view your typing statistics and progress
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!isInitialized) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <User className="h-5 w-5" />
            Welcome to Typing Master!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Initialize your player account on Solana to start tracking your progress.
          </p>
          <Button onClick={initializePlayer} size="lg">
            Initialize Player Account
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Your Statistics
          </CardTitle>
        </CardHeader>
      </Card>
      
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-muted-foreground">Best WPM</span>
            </div>
            <div className="text-4xl font-bold text-blue-600">
              {playerData?.best_wpm || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-muted-foreground">Average WPM</span>
            </div>
            <div className="text-4xl font-bold text-green-600">
              {playerData?.average_wpm || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-muted-foreground">Best Accuracy</span>
            </div>
            <div className="text-4xl font-bold text-purple-600">
              {playerData?.best_accuracy || 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Practice Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Practice Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Tests:</span>
              <Badge variant="secondary">{playerData?.total_tests || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Words Typed:</span>
              <Badge variant="secondary">{playerData?.total_words_typed || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Account Created:</span>
              <span className="text-sm">
                {playerData?.created_at 
                  ? new Date(playerData.created_at * 1000).toLocaleDateString()
                  : 'N/A'
                }
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Wallet Address:</span>
              </div>
              <code className="text-xs bg-muted px-2 py-1 rounded break-all">
                {publicKey.toString()}
              </code>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Last Activity:</span>
              </div>
              <span className="text-sm">
                {playerData?.last_activity 
                  ? new Date(playerData.last_activity * 1000).toLocaleDateString()
                  : 'N/A'
                }
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Typing Speed Progress</span>
              <span className="text-sm text-muted-foreground">
                {Math.min((playerData?.best_wpm || 0) / 100 * 100, 100)}% to 100 WPM
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min((playerData?.best_wpm || 0), 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Accuracy Mastery</span>
              <span className="text-sm text-muted-foreground">{playerData?.best_accuracy || 0}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className="bg-green-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${playerData?.best_accuracy || 0}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}