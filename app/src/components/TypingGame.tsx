'use client';

import { useState, useEffect, useRef } from 'react';
import { useSolanaProgram } from '@/hooks/useSolanaProgram';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Timer, Target, Zap } from 'lucide-react';
import { toast } from 'sonner';

const SAMPLE_TEXTS = [
  "The quick brown fox jumps over the lazy dog.",
  "Pack my box with five dozen liquor jugs.",
  "How vexingly quick daft zebras jump!",
  "The five boxing wizards jump quickly.",
  "Sphinx of black quartz, judge my vow.",
];

export function TypingGame() {
  const [currentText, setCurrentText] = useState(SAMPLE_TEXTS[0]);
  const [userInput, setUserInput] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [errors, setErrors] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { updatePracticeStats, isInitialized } = useSolanaProgram();

  const isComplete = userInput.length === currentText.length;
  const timeTaken = startTime && endTime ? (endTime - startTime) / 1000 : 0;
  const wpm = timeTaken > 0 ? Math.round((currentText.split(' ').length / timeTaken) * 60) : 0;
  const accuracy = currentText.length > 0 ? Math.round(((currentText.length - errors) / currentText.length) * 100) : 100;

  useEffect(() => {
    if (isComplete && startTime) {
      setEndTime(Date.now());
      setIsActive(false);
      
      // Submit stats to Solana
      if (isInitialized) {
        updatePracticeStats(wpm, accuracy, currentText.split(' ').length);
        toast.success(`Great job! ${wpm} WPM with ${accuracy}% accuracy`, {
          description: "Your stats have been saved to the blockchain"
        });
      } else {
        toast.info("Complete your account setup to save stats to blockchain");
      }
    }
  }, [isComplete, startTime, wpm, accuracy, currentText, updatePracticeStats, isInitialized]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (!isActive && value.length === 1) {
      setIsActive(true);
      setStartTime(Date.now());
      setErrors(0);
    }
    
    if (value.length <= currentText.length) {
      setUserInput(value);
      
      // Count errors
      let errorCount = 0;
      for (let i = 0; i < value.length; i++) {
        if (value[i] !== currentText[i]) {
          errorCount++;
        }
      }
      setErrors(errorCount);
    }
  };

  const resetGame = () => {
    setUserInput('');
    setIsActive(false);
    setStartTime(null);
    setEndTime(null);
    setErrors(0);
    setCurrentText(SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)]);
    inputRef.current?.focus();
  };

  const getCharacterClass = (index: number) => {
    if (index >= userInput.length) return 'text-muted-foreground';
    if (userInput[index] === currentText[index]) return 'text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400';
    return 'text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Practice Typing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-muted-foreground">WPM</span>
                </div>
                <div className="text-3xl font-bold">{wpm}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-muted-foreground">Accuracy</span>
                </div>
                <div className="text-3xl font-bold">{accuracy}%</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Timer className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-muted-foreground">Time</span>
                </div>
                <div className="text-3xl font-bold">{timeTaken.toFixed(1)}s</div>
              </CardContent>
            </Card>
          </div>

          {/* Text Display */}
          <Card>
            <CardContent className="p-6">
              <div className="font-mono text-lg leading-relaxed min-h-[120px] flex items-center">
                {currentText.split('').map((char, index) => (
                  <span key={index} className={`${getCharacterClass(index)} px-0.5 py-1 rounded`}>
                    {char}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {isComplete ? "Test completed!" : "Type the text above"}
            </label>
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={handleInputChange}
              disabled={isComplete}
              className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
              placeholder={isComplete ? "Great job! Click 'New Text' to continue" : "Start typing here..."}
              autoComplete="off"
            />
          </div>

          {/* Controls and Results */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Button onClick={resetGame} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              New Text
            </Button>
            
            {isComplete && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  Completed!
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {wpm} WPM • {accuracy}% accuracy
                </span>
              </div>
            )}
            
            {!isInitialized && (
              <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                <span>💡</span>
                <span>Initialize your account to save progress</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}