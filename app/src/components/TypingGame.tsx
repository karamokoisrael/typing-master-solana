'use client';

import { useState, useEffect, useRef } from 'react';
import { useSolanaProgram } from '@/hooks/useSolanaProgram';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Timer, Target, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { article } from 'txtgen';

const SAMPLE_TEXTS = [
  article(),
  "The quick brown fox jumps over the lazy dog. This classic pangram contains every letter of the alphabet and is perfect for typing practice.",
  "In the heart of Silicon Valley, innovative minds work tirelessly to create the next breakthrough technology that will change the world forever.",
  "Coffee shops buzz with energy as writers, students, and entrepreneurs gather to pursue their dreams while sipping on carefully crafted beverages.",
  "Modern web development combines powerful frameworks like React and Next.js with blockchain technology to create decentralized applications.",
  "The art of coding requires patience, creativity, and problem-solving skills that improve with consistent practice and dedication to learning.",
  "Mountains tower majestically above misty valleys where ancient forests whisper secrets of times long past to those who listen carefully.",
  "Digital transformation has revolutionized how businesses operate, making remote work and global collaboration more accessible than ever before.",
  "Musicians blend traditional instruments with electronic synthesizers to create unique soundscapes that transport listeners to otherworldly realms."
];

export function TypingGame() {
  const [currentText, setCurrentText] = useState(SAMPLE_TEXTS[0]);
  const [userInput, setUserInput] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [errors, setErrors] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
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

  // Auto-scroll effect when user progresses through text (throttled for performance)
  const scrollTrigger = Math.floor(userInput.length / 50);
  useEffect(() => {
    if (textContainerRef.current && userInput.length > 0) {
      const container = textContainerRef.current;
      
      // Simple scroll calculation - scroll down every 50 characters approximately
      const charsPerLine = 80; // approximate characters per line
      const currentLine = Math.floor(userInput.length / charsPerLine);
      const lineHeight = 48; // approximate line height in pixels
      const targetScrollTop = Math.max(0, (currentLine - 2) * lineHeight);
      
      if (Math.abs(container.scrollTop - targetScrollTop) > lineHeight) {
        container.scrollTop = targetScrollTop;
      }
    }
  }, [scrollTrigger, userInput.length]);

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
              <div 
                ref={textContainerRef}
                className="font-mono text-lg leading-loose min-h-[120px] max-h-[200px] overflow-y-auto overflow-x-hidden"
                style={{ 
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, "Liberation Mono", "Courier New", monospace',
                  letterSpacing: '0.05em',
                  lineHeight: '2',
                  wordWrap: 'break-word',
                  scrollBehavior: 'smooth'
                }}
              >
                {currentText.split('').map((char, index) => (
                  <span 
                    key={index}
                    className={`${getCharacterClass(index)} inline-block relative`}
                    style={{ 
                      padding: '2px 1px',
                      borderRadius: '3px'
                    }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                    {index === userInput.length && (
                      <span className="absolute -left-0.5 top-0 w-0.5 h-full bg-blue-500 animate-pulse" />
                    )}
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
              className="flex h-14 w-full rounded-md border border-input bg-background px-4 py-3 text-lg ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ 
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Menlo, "Liberation Mono", "Courier New", monospace',
                letterSpacing: '0.05em',
                lineHeight: '1.5'
              }}
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