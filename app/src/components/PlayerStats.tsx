'use client';

import { useSolanaProgram } from '@/hooks/useSolanaProgram';
import { useWallet } from '@solana/wallet-adapter-react';

export function PlayerStats() {
  const { publicKey } = useWallet();
  const { playerData, isInitialized, initializePlayer } = useSolanaProgram();

  if (!publicKey) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Connect your wallet to view statistics</p>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Welcome to Typing Master!</h2>
          <p className="text-gray-400 mb-6">
            Initialize your player account on Solana to start tracking your progress.
          </p>
          <button
            onClick={initializePlayer}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors font-semibold"
          >
            Initialize Player Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-6">Your Statistics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-700 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {playerData?.best_wpm || 0}
            </div>
            <div className="text-gray-400 text-sm">Best WPM</div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {playerData?.average_wpm || 0}
            </div>
            <div className="text-gray-400 text-sm">Average WPM</div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {playerData?.best_accuracy || 0}%
            </div>
            <div className="text-gray-400 text-sm">Best Accuracy</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Practice Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Tests:</span>
                <span className="font-semibold">{playerData?.total_tests || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Words Typed:</span>
                <span className="font-semibold">{playerData?.total_words_typed || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Account Created:</span>
                <span className="font-semibold">
                  {playerData?.created_at 
                    ? new Date(playerData.created_at * 1000).toLocaleDateString()
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Account Info</h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-400 block">Wallet Address:</span>
                <span className="font-mono text-sm break-all">
                  {publicKey.toString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last Activity:</span>
                <span className="font-semibold">
                  {playerData?.last_activity 
                    ? new Date(playerData.last_activity * 1000).toLocaleDateString()
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress indicators */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Typing Speed Progress</span>
                <span className="text-sm">{Math.min((playerData?.best_wpm || 0) / 100 * 100, 100)}%</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((playerData?.best_wpm || 0), 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Accuracy Mastery</span>
                <span className="text-sm">{playerData?.best_accuracy || 0}%</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${playerData?.best_accuracy || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}