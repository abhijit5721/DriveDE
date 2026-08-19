/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * UmschreibungCountryGuide.tsx
 *
 * Searchable country selector that shows users exactly what they need to do
 * to convert their foreign driving licence in Germany. Three tiers:
 *   • EU/EEA  → card exchange only (no tests)
 *   • Annex 11 → simplified admin process (no tests)
 *   • Other   → theory + practical test required
 */

import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, CheckCircle2, AlertTriangle, ChevronRight, Clock, FileText, BadgeCheck, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UMSCHREIBUNG_COUNTRIES, TIER_CONFIG, type UmschreibungCountry, type UmschreibungTier } from '../../data/umschreibungCountries';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../utils/cn';

interface UmschreibungCountryGuideProps {
  onClose?: () => void;
  /** If true, renders as a standalone full-screen page rather than a modal */
  standalone?: boolean;
}

const TIER_BADGE: Record<UmschreibungTier, { bg: string; text: string; border: string; dot: string }> = {
  eu: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-500/30',
    dot: 'bg-emerald-500',
  },
  annex11: {
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-500/30',
    dot: 'bg-blue-500',
  },
  other: {
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-500/30',
    dot: 'bg-amber-500',
  },
};

export function UmschreibungCountryGuide({ onClose, standalone = false }: UmschreibungCountryGuideProps) {
  const { language } = useAppStore();
  const isDe = language === 'de';

  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<UmschreibungCountry | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter countries by search query
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return UMSCHREIBUNG_COUNTRIES.slice(0, 20); // show top 20 when empty
    return UMSCHREIBUNG_COUNTRIES.filter(c =>
      c.nameEn.toLowerCase().includes(q) ||
      c.nameDe.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q)
    ).slice(0, 15);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (country: UmschreibungCountry) => {
    setSelected(country);
    setQuery(isDe ? country.nameDe : country.nameEn);
    setShowDropdown(false);
  };

  const handleClear = () => {
    setSelected(null);
    setQuery('');
    inputRef.current?.focus();
  };

  const tierConfig = selected ? TIER_CONFIG[selected.tier] : null;
  const badge = selected ? TIER_BADGE[selected.tier] : null;

  const wrapper = standalone
    ? 'min-h-screen bg-slate-50 dark:bg-slate-900 px-4 py-8 md:px-8'
    : 'fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-slate-400/50 backdrop-blur-md dark:bg-slate-950/70 p-4 pt-16';

  const card = standalone
    ? 'mx-auto w-full max-w-2xl'
    : 'relative w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-6 shadow-2xl';

  return (
    <div className={wrapper}>
      <div className={card}>
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Globe className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-blue-500 dark:text-blue-400">
                {isDe ? 'Umschreibungs-Guide' : 'Licence Conversion Guide'}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isDe ? 'Woher kommt dein Führerschein?' : 'Where is your licence from?'}
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {isDe
                ? 'Wähle dein Land: wir zeigen dir genau, was du tun musst.'
                : 'Select your country: we\'ll show you exactly what you need to do.'}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 transition hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* ── Search Input ────────────────────────────────────────── */}
        <div className="relative mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setShowDropdown(true); setSelected(null); }}
              onFocus={() => setShowDropdown(true)}
              placeholder={isDe ? 'Land suchen … z.B. Indien, USA, Türkei' : 'Search country … e.g. India, USA, Turkey'}
              className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-3.5 pl-11 pr-11 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Dropdown */}
          <AnimatePresence>
            {showDropdown && filtered.length > 0 && !selected && (
              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl overflow-hidden"
              >
                <div className="max-h-64 overflow-y-auto">
                  {filtered.map(country => {
                    const b = TIER_BADGE[country.tier];
                    return (
                      <button
                        key={country.code}
                        onClick={() => handleSelect(country)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-100 dark:hover:bg-slate-700/60"
                      >
                        <span className="text-2xl leading-none">{country.flag}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {isDe ? country.nameDe : country.nameEn}
                          </p>
                        </div>
                        <span className={cn(
                          'shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                          b.bg, b.text, b.border
                        )}>
                          {TIER_CONFIG[country.tier][isDe ? 'labelDe' : 'labelEn']}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {!query && (
                  <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-2">
                    <p className="text-[11px] text-slate-500 dark:text-slate-500">
                      {isDe ? `${UMSCHREIBUNG_COUNTRIES.length} Länder verfügbar, tippe zum Suchen` : `${UMSCHREIBUNG_COUNTRIES.length} countries available, type to search`}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Quick-pick tier buttons ─────────────────────────────── */}
        {!selected && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {(['eu', 'annex11', 'other'] as UmschreibungTier[]).map(tier => {
              const cfg = TIER_CONFIG[tier];
              const b = TIER_BADGE[tier];
              return (
                <button
                  key={tier}
                  onClick={() => {
                    const first = UMSCHREIBUNG_COUNTRIES.find(c => c.tier === tier);
                    if (first) {
                      setQuery(isDe ? first.nameDe : first.nameEn);
                      setShowDropdown(true);
                    }
                  }}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition hover:opacity-80',
                    b.bg, b.border
                  )}
                >
                  <span className="text-xl">{cfg.iconEmoji}</span>
                  <span className={cn('text-[11px] font-bold leading-tight', b.text)}>
                    {isDe ? cfg.labelDe : cfg.labelEn}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Result Card ─────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {selected && tierConfig && badge && (
            <motion.div
              key={selected.code}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Country header */}
              <div className={cn(
                'flex items-center gap-4 rounded-2xl border p-4',
                badge.bg, badge.border
              )}>
                <span className="text-4xl leading-none">{selected.flag}</span>
                <div className="flex-1">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {isDe ? selected.nameDe : selected.nameEn}
                  </p>
                  <span className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider',
                    badge.bg, badge.text, badge.border
                  )}>
                    <span className={cn('h-1.5 w-1.5 rounded-full', badge.dot)} />
                    {isDe ? tierConfig.labelDe : tierConfig.labelEn}
                  </span>
                </div>
                <button onClick={handleClear} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Summary */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/50 p-4">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {isDe ? tierConfig.summaryDe : tierConfig.summaryEn}
                </p>
                {selected.noteEn && (
                  <p className={cn('mt-2 text-xs font-medium', badge.text)}>
                    ℹ️ {isDe ? selected.noteDe : selected.noteEn}
                  </p>
                )}
              </div>

              {/* Tests required banner */}
              <div className={cn(
                'flex items-center gap-3 rounded-2xl border p-3',
                tierConfig.testsRequired
                  ? 'border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10'
                  : 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10'
              )}>
                {tierConfig.testsRequired
                  ? <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                  : <BadgeCheck className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                }
                <div>
                  <p className={cn(
                    'text-sm font-bold',
                    tierConfig.testsRequired ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-700 dark:text-emerald-300'
                  )}>
                    {tierConfig.testsRequired
                      ? (isDe ? 'Theorie- & Praxisprüfung erforderlich' : 'Theory & practical test required')
                      : (isDe ? 'Keine Prüfungen erforderlich' : 'No tests required')
                    }
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {isDe ? tierConfig.timelineDe : tierConfig.timelineEn}
                  </p>
                </div>
              </div>

              {/* Step by step */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {isDe ? 'Schritt für Schritt' : 'Step by step'}
                  </p>
                </div>
                <ol className="space-y-2">
                  {(isDe ? tierConfig.stepsDe : tierConfig.stepsEn).map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className={cn(
                        'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black',
                        badge.bg, badge.text
                      )}>
                        {i + 1}
                      </span>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>

              {/* DriveDE CTA if tests required */}
              {tierConfig.testsRequired && (
                <div className="rounded-2xl border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
                        {isDe ? 'DriveDE hilft dir beim Bestehen' : 'DriveDE helps you pass'}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {isDe
                          ? 'Tracke deine Fahrstunden, erhalte KI-Auswertungen nach jeder Fahrt und sieh genau, wann du prüfungsreif bist.'
                          : 'Track your driving lessons, get AI debriefs after every drive, and know the exact day you\'re ready to book your Fahrprüfung.'
                        }
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Empty state ─────────────────────────────────────────── */}
        {!selected && !showDropdown && (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <span className="text-4xl">🌍</span>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {isDe
                ? 'Wähle dein Heimatland aus, um deine persönliche Umschreibungs-Checkliste zu sehen.'
                : 'Select your home country to see your personalised conversion checklist.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
