/**
 * (c) 2026 DriveDE. All rights reserved.
 * 
 * PrivacyConsentModal.tsx
 * 
 * A high-visibility modal that requests explicit user consent for data processing
 * (GPS, sensors, telemetry) as required by GDPR Art. 6 & 7.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Check, Info } from 'lucide-react';
import { cn } from '../../utils/cn';

interface PrivacyConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onOpenPrivacyPolicy: () => void;
}

export function PrivacyConsentModal({ isOpen, onAccept, onOpenPrivacyPolicy }: PrivacyConsentModalProps) {
  const [hasChecked, setHasChecked] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl dark:bg-slate-900 border border-white/10"
          >
            {/* Background Decorative Element */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />
            <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/5 blur-3xl" />

            <div className="relative">
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-blue-400/20" />
                  <div className="relative rounded-full bg-blue-100 p-5 dark:bg-blue-900/30">
                    <ShieldCheck className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>
              
              <h3 className="mb-3 text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Privacy Matters
              </h3>
              
              <p className="mb-6 text-center text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                To provide DriveDE's core features like route tracking and driving analysis, we need to process your location and sensor data.
              </p>

              <div className="mb-6 space-y-4 rounded-3xl bg-slate-50 p-5 dark:bg-slate-800/50">
                <div className="flex gap-3">
                  <div className="mt-1 rounded-lg bg-blue-100 p-1.5 dark:bg-blue-900/50">
                    <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">GPS & Sensors</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Real-time speed and route analysis during sessions.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="mt-1 rounded-lg bg-indigo-100 p-1.5 dark:bg-indigo-900/50">
                    <Check className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Telemetry Analysis</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Anonymous data used to detect driving mistakes.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="mt-1 rounded-lg bg-emerald-100 p-1.5 dark:bg-emerald-900/50">
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Full Control</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Export or delete your data anytime under Account settings.</p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <label className="group flex cursor-pointer items-start gap-4 rounded-2xl border-2 border-transparent bg-slate-50/50 p-4 transition-all hover:bg-slate-100/50 dark:bg-slate-800/30 dark:hover:bg-slate-800/50">
                  <div className="relative flex h-6 w-6 shrink-0 items-center justify-center mt-0.5">
                    <input 
                      type="checkbox" 
                      data-testid="privacy-consent-checkbox"
                      checked={hasChecked}
                      onChange={(e) => setHasChecked(e.target.checked)}
                      className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-slate-300 bg-white transition-all checked:border-blue-500 checked:bg-blue-500 dark:border-slate-600 dark:bg-slate-800"
                    />
                    <Check className="pointer-events-none absolute h-4 w-4 scale-0 text-white transition-transform peer-checked:scale-100" />
                  </div>
                  <span className="text-xs font-bold leading-snug text-slate-700 dark:text-slate-300">
                    I agree to the processing of my data as described above and in the <button onClick={(e) => { e.preventDefault(); onOpenPrivacyPolicy(); }} className="text-blue-600 underline hover:text-blue-500 dark:text-blue-400">Privacy Policy</button>.
                  </span>
                </label>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={onAccept}
                  data-testid="accept-privacy-btn"
                  disabled={!hasChecked}
                  className={cn(
                    'w-full rounded-2xl py-4 text-sm font-bold text-white shadow-xl transition-all active:scale-95',
                    hasChecked 
                      ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/25' 
                      : 'bg-slate-300 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500'
                  )}
                >
                  Accept & Continue
                </button>
                <div className="flex items-center justify-center gap-1.5 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <Info className="h-3 w-3" />
                  GDPR Compliant Processing
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
