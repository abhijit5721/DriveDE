import { useState, useEffect, useRef } from 'react';
import { Play, Square, Volume2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { examCommands } from '../data/examCommands';

interface ExamSimulationProps {
  onBack: () => void;
}

export function ExamSimulation({ onBack }: ExamSimulationProps) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const currentCommand = examCommands[currentCommandIndex];

  useEffect(() => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(currentCommand);
    utterance.lang = 'de-DE';
    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utteranceRef.current = utterance;

    return () => {
      synth.cancel();
    };
  }, [currentCommand]);

  const speakCommand = () => {
    if (utteranceRef.current) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utteranceRef.current);
    }
  };

  const startSimulation = () => {
    setCurrentCommandIndex(0);
    setIsSimulating(true);
    // Speak the first command automatically
    setTimeout(speakCommand, 500);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    window.speechSynthesis.cancel();
  };

  const nextCommand = () => {
    const nextIndex = (currentCommandIndex + 1) % examCommands.length;
    setCurrentCommandIndex(nextIndex);
    setTimeout(speakCommand, 500);
  };

  return (
    <div className="flex h-full flex-col bg-slate-900 text-white">
      <header className="flex items-center p-4">
        <button onClick={onBack} className="p-2">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2 className="ml-4 text-lg font-bold">Prüfungssimulation</h2>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <motion.div
          key={currentCommandIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold"
        >
          {currentCommand}
        </motion.div>
        
        <button onClick={speakCommand} disabled={isSpeaking} className="mt-8 rounded-full bg-white/10 p-4 disabled:opacity-50">
          <Volume2 className="h-8 w-8" />
        </button>
      </main>

      <footer className="p-8">
        <div className="grid grid-cols-2 gap-4">
          {!isSimulating ? (
            <button
              onClick={startSimulation}
              className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-4 text-lg font-semibold text-white transition-colors hover:bg-green-600"
            >
              <Play className="h-6 w-6" />
              Simulation starten
            </button>
          ) : (
            <>
              <button
                onClick={stopSimulation}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-4 text-lg font-semibold text-white transition-colors hover:bg-red-600"
              >
                <Square className="h-6 w-6" />
                Beenden
              </button>
              <button
                onClick={nextCommand}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-600"
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
