'use client';

import { useState } from 'react';
import { useSolanaProgram } from '@/hooks/useSolanaProgram';
import { PublicKey } from '@solana/web3.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, Trophy, Plus, Play, Eye } from 'lucide-react';
import { toast } from 'sonner';

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
    try {
      await createContest(selectedTextId, duration);
      setShowCreateForm(false);
      toast.success('Contest created successfully!', {
        description: 'Your contest has been posted to the blockchain'
      });
    } catch (error) {
      toast.error('Failed to create contest', {
        description: 'Please check your connection and try again'
      });
    }
  };

  if (!isInitialized) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Trophy className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">Initialize Your Account</p>
          <p className="text-sm text-muted-foreground text-center">
            Initialize your player account to access typing contests and compete with other players
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Typing Contests
            </CardTitle>
            <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Contest
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Create Contest Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Contest</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Contest Text</label>
                <select
                  value={selectedTextId}
                  onChange={(e) => setSelectedTextId(parseInt(e.target.value))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {CONTEST_TEXTS.map((text) => (
                    <option key={text.id} value={text.id}>
                      {text.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration (seconds)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  min="30"
                  max="300"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Preview Text</label>
              <Card>
                <CardContent className="p-4">
                  <p className="font-mono text-sm">
                    {CONTEST_TEXTS.find(t => t.id === selectedTextId)?.text}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleCreateContest}>
                Create Contest
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Contests */}
      <div className="space-y-4">
        {contests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Eye className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Active Contests</h3>
              <p className="text-muted-foreground text-center">
                Create a contest to start competing with other players!
              </p>
            </CardContent>
          </Card>
        ) : (
          contests.map((contest, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      Contest #{index + 1}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {CONTEST_TEXTS.find(t => t.id === contest.text_id)?.name || 'Unknown'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {contest.duration}s
                      </span>
                    </div>
                  </div>
                  
                  <Badge variant={
                    contest.status === 0 ? 'secondary' :
                    contest.status === 1 ? 'default' : 'outline'
                  }>
                    {contest.status === 0 ? 'Waiting' :
                     contest.status === 1 ? 'Active' : 'Ended'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                    <Users className="h-4 w-4" />
                    Participants ({contest.participants.length}/{contest.max_participants})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {contest.participants.length === 0 ? (
                      <span className="text-sm text-muted-foreground">No participants yet</span>
                    ) : (
                      contest.participants.map((participant, idx) => (
                        <Badge key={idx} variant="outline" className="font-mono text-xs">
                          {participant.toString().slice(0, 8)}...
                        </Badge>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">Contest Text:</div>
                  <Card>
                    <CardContent className="p-4">
                      <p className="font-mono text-sm">
                        {CONTEST_TEXTS.find(t => t.id === contest.text_id)?.text}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex gap-3">
                  {contest.status === 0 && contest.participants.length < contest.max_participants && (
                    <Button onClick={() => joinContest(new PublicKey('placeholder'))}>
                      Join Contest
                    </Button>
                  )}
                  
                  {contest.status === 1 && (
                    <Button className="flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      Enter Contest
                    </Button>
                  )}
                  
                  {contest.status === 2 && (
                    <Button variant="outline" disabled>
                      Contest Ended
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Sample Contests for Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Sample Contests (Demo)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CONTEST_TEXTS.map((text) => (
              <Card key={text.id}>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">{text.name}</h4>
                  <p className="text-sm text-muted-foreground mb-3 font-mono">{text.text}</p>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedTextId(text.id);
                      setShowCreateForm(true);
                    }}
                    className="w-full"
                  >
                    Create Contest
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}