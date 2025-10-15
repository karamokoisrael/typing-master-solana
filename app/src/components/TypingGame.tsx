'use client';

import { useState, useEffect, useRef } from 'react';
import { useSolanaProgram } from '@/hooks/useSolanaProgram';

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
    if (index >= userInput.length) return 'text-gray-400';
    if (userInput[index] === currentText[index]) return 'text-green-400 bg-green-900/20';
    return 'text-red-400 bg-red-900/20';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Practice Typing</h2>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-700 rounded p-4 text-center">
            <div className="text-2xl font-bold">{wpm}</div>
            <div className="text-sm text-gray-400">WPM</div>
          </div>
          <div className="bg-gray-700 rounded p-4 text-center">
            <div className="text-2xl font-bold">{accuracy}%</div>
            <div className="text-sm text-gray-400">Accuracy</div>
          </div>
          <div className="bg-gray-700 rounded p-4 text-center">
            <div className="text-2xl font-bold">{timeTaken.toFixed(1)}s</div>
            <div className="text-sm text-gray-400">Time</div>
          </div>
        </div>

        {/* Text Display */}
        <div className="bg-gray-900 rounded p-6 mb-4 font-mono text-lg leading-relaxed">
          {currentText.split('').map((char, index) => (
            <span key={index} className={getCharacterClass(index)}>
              {char}
            </span>
          ))}
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          disabled={isComplete}
          className="w-full p-4 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none font-mono text-lg"
          placeholder={isComplete ? "Test completed!" : "Start typing..."}
          autoComplete="off"
        />

        {/* Controls */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={resetGame}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            New Text
          </button>
          
          {isComplete && (
            <div className="text-green-400 font-semibold">
              Test completed! WPM: {wpm}, Accuracy: {accuracy}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
}