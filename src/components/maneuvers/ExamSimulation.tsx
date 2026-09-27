/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { useState, useEffect } from 'react';
import { Play, Square, Volume2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { examCommands } from '../../data/examCommands';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

interface ExamSimulationProps {
  onBack: () => void;
}

console.log('[ExamSimulation] File loaded');

export default function ExamSimulation({ onBack }: ExamSimulationProps) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const currentCommand = examCommands[currentCommandIndex];

  useEffect(() => {
    console.log('[ExamSimulation] Component mounted. currentCommand:', currentCommand);
    return () => {
      TextToSpeech.stop();
    };
  }, [currentCommand]);

  const speakCommand = async (command?: any) => {
    const textToSpeak = typeof command === 'string' ? command : (command?.de || currentCommand.de);
    if (!textToSpeak) return;
    
    try {
      console.log('[ExamSimulation] Speaking command:', textToSpeak);
      setIsSpeaking(true);
      
      await TextToSpeech.stop();
      await TextToSpeech.speak({
        text: textToSpeak,
        lang: 'de-DE',
        rate: 0.9,
        pitch: 1.0,
        volume: 1.0,
        category: 'ambient',
      });
      
      setIsSpeaking(false);
    } catch (err) {
      console.error('[ExamSimulation] Native Speak failed:', err);
      setIsSpeaking(false);
    }
  };

  const startSimulation = () => {
    console.log('[ExamSimulation] Starting simulation');
    setCurrentCommandIndex(0);
    setIsSimulating(true);
    // Speak the first command automatically
    setTimeout(() => speakCommand(examCommands[0]), 500);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    TextToSpeech.stop();
  };

  const nextCommand = () => {
    const nextIndex = (currentCommandIndex + 1) % examCommands.length;
    setCurrentCommandIndex(nextIndex);
    // Pass the next command explicitly to avoid stale closure issues
    setTimeout(() => speakCommand(examCommands[nextIndex]), 500);
  };

  return (
    // Full-screen layer with safe-area padding: the app runs edge to edge
    // (viewport-fit=cover, black-translucent status bar), so on an iPhone in portrait the
    // old header sat under the notch and the back button could not be tapped; users had
    // to rotate the phone to get out (26 Sep). It also filled only half the screen.
    <div
      className="fixed inset-0 z-[80] flex flex-col overflow-y-auto bg-brand-surface text-white"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      data-testid="exam-simulation"
    >
      <header className="flex items-center p-4">
        <button onClick={onBack} aria-label="Zurück" data-testid="exam-simulation-back" className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/10 transition hover:bg-white/15 active:scale-95">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2 className="ml-3 text-lg font-bold">Prüfungssimulation</h2>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <motion.div
          key={currentCommandIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-4"
        >
          <div className="text-3xl font-bold leading-tight">
            {currentCommand.de}
          </div>
          <div className="text-xl italic text-slate-400">
            {currentCommand.en}
          </div>
        </motion.div>
        
        <button onClick={() => speakCommand()} disabled={isSpeaking} className="mt-8 rounded-full bg-white/10 p-4 disabled:opacity-50">
          <Volume2 className="h-8 w-8" />
        </button>
      </main>

      <footer className="p-8">
        <div className="grid grid-cols-2 gap-4">
          {!isSimulating ? (
            <button
              onClick={startSimulation}
              className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <Play className="h-6 w-6" />
              Simulation starten
            </button>
          ) : (
            <>
              <button
                onClick={stopSimulation}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-4 text-lg font-semibold text-white transition-colors hover:bg-white/10"
              >
                <Square className="h-6 w-6" />
                Beenden
              </button>
              <button
                onClick={nextCommand}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Nächster Befehl
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>
      </footer>
    </div>
  );
}
