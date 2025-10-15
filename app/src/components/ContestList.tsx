'use client';

import { useState } from 'react';
import { useSolanaProgram } from '@/hooks/useSolanaProgram';
import { PublicKey } from '@solana/web3.js';

const CONTEST_TEXTS = [
  { id: 1, name: "Quick Brown Fox", text: "The quick brown fox jumps over the lazy dog." },
  { id: 2, name: "Pangram Pack", text: "Pack my box with five dozen liquor jugs." },
  { id: 3, name: "Zebra Jump", text: "How vexingly quick daft zebras jump!" },
  { id: 4, name: "Boxing Wizards", text: "The five boxing wizards jump quickly." },
];

export function ContestList() {
  const { contests, isInitialized, createContest, joinContest } = useSolanaProgram();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTextId, setSelectedTextId] = useState(1);
  const [duration, setDuration] = useState(60);

  const handleCreateContest = async () => {
    await createContest(selectedTextId, duration);
    setShowCreateForm(false);
  };

  if (!isInitialized) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Initialize your player account to access contests</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Typing Contests</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors"
        >
          Create Contest
        </button>
      </div>

      {/* Create Contest Form */}
      {showCreateForm && (
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Create New Contest</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Text</label>
              <select
                value={selectedTextId}
                onChange={(e) => setSelectedTextId(parseInt(e.target.value))}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
              >
                {CONTEST_TEXTS.map((text) => (
                  <option key={text.id} value={text.id}>
                    {text.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Duration (seconds)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                min="30"
                max="300"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Preview Text</label>
            <div className="p-3 bg-gray-700 rounded border border-gray-600 font-mono text-sm">
              {CONTEST_TEXTS.find(t => t.id === selectedTextId)?.text}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCreateContest}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors"
            >
              Create Contest
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Active Contests */}
      <div className="space-y-4">
        {contests.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3v8m0 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v8a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
            </div>
            <p className="text-xl font-semibold mb-2">No Active Contests</p>
            <p className="text-gray-400">Create a contest to start competing with other players!</p>
          </div>
        ) : (
          contests.map((contest, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Contest #{index + 1}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Text: {CONTEST_TEXTS.find(t => t.id === contest.text_id)?.name || 'Unknown'}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Duration: {contest.duration} seconds
                  </p>
                </div>
                
                <div className="text-right">
                  <div className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                    contest.status === 0 ? 'bg-yellow-600 text-yellow-100' :
                    contest.status === 1 ? 'bg-green-600 text-green-100' :
                    'bg-gray-600 text-gray-100'
                  }`}>
                    {contest.status === 0 ? 'Waiting' :
                     contest.status === 1 ? 'Active' : 'Ended'}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm text-gray-400 mb-2">
                  Participants ({contest.participants.length}/{contest.max_participants}):
                </div>
                <div className="flex flex-wrap gap-2">
                  {contest.participants.length === 0 ? (
                    <span className="text-gray-500 text-sm">No participants yet</span>
                  ) : (
                    contest.participants.map((participant, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-700 rounded text-xs font-mono"
                      >
                        {participant.toString().slice(0, 8)}...
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm text-gray-400 mb-2">Contest Text:</div>
                <div className="p-3 bg-gray-700 rounded font-mono text-sm">
                  {CONTEST_TEXTS.find(t => t.id === contest.text_id)?.text}
                </div>
              </div>

              <div className="flex gap-3">
                {contest.status === 0 && contest.participants.length < contest.max_participants && (
                  <button
                    onClick={() => joinContest(new PublicKey('placeholder'))} // Replace with actual contest pubkey
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                  >
                    Join Contest
                  </button>
                )}
                
                {contest.status === 1 && (
                  <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors">
                    Enter Contest
                  </button>
                )}
                
                {contest.status === 2 && (
                  <button className="px-4 py-2 bg-gray-600 cursor-not-allowed rounded" disabled>
                    Contest Ended
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sample Contests for Demo */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Sample Contests (Demo)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CONTEST_TEXTS.map((text) => (
            <div key={text.id} className="bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold mb-2">{text.name}</h4>
              <p className="text-gray-400 text-sm mb-3 font-mono">{text.text}</p>
              <button
                onClick={() => {
                  setSelectedTextId(text.id);
                  setShowCreateForm(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors text-sm"
              >
                Create Contest
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}