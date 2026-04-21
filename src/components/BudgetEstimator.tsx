import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PiggyBank, 
  Calculator, 
  TrendingUp, 
  CheckCircle2, 
  Wallet, 
  Info, 
  Settings2, 
  ChevronRight, 
  Save, 
  X,
  CreditCard,
  GraduationCap
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../utils/cn';
import { getAllLessons } from '../data/curriculum';
import { filterLessonsForSelection } from '../utils/contentFilter';
import { getLearningPathFromLicenseType, getTransmissionFromLicenseType } from '../utils/license';

export function BudgetEstimator() {
  const { language, userProgress, licenseType, updateFixedCosts, setHourlyRate45 } = useAppStore();
  const isDE = language === 'de';
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const learningPath = getLearningPathFromLicenseType(licenseType);
  const transmissionType = getTransmissionFromLicenseType(licenseType);
  
  // Use costs from store
  const costs = userProgress.fixedCosts;
  const hourlyRate45 = userProgress.hourlyRate45 || 60;
  const specialRateFactor = 1.2;

  // Local state for editing to avoid laggy inputs
  const [editValues, setEditValues] = useState({
    registration: costs.registration,
    theoryExam: costs.theoryExam,
    practicalExam: costs.practicalExam,
    learningMaterial: costs.learningMaterial,
    firstAid: costs.firstAid,
    visionTest: costs.visionTest,
    hourlyRate: hourlyRate45
  });

  const handleSave = () => {
    updateFixedCosts({
      registration: Number(editValues.registration),
      theoryExam: Number(editValues.theoryExam),
      practicalExam: Number(editValues.practicalExam),
      learningMaterial: Number(editValues.learningMaterial),
      firstAid: Number(editValues.firstAid),
      visionTest: Number(editValues.visionTest),
    });
    setHourlyRate45(Number(editValues.hourlyRate));
    setIsSettingsOpen(false);
  };

  const totalNormalSessions = userProgress.drivingSessions.filter(s => s.type === 'normal').length;
  const totalUeberland = userProgress.drivingSessions.filter(s => s.type === 'ueberland').length;
  const totalAutobahn = userProgress.drivingSessions.filter(s => s.type === 'autobahn').length;
  const totalNacht = userProgress.drivingSessions.filter(s => s.type === 'nacht').length;

  const currentSpend = useMemo(() => {
    let sum = 0;
    userProgress.drivingSessions.forEach(s => {
      const units = s.duration / 45;
      const rate = s.type === 'normal' ? hourlyRate45 : hourlyRate45 * specialRateFactor;
      sum += units * rate;
    });
    // Assuming base fees are paid if you've started driving
    if (userProgress.drivingSessions.length > 0) {
      sum += costs.registration + costs.firstAid + costs.visionTest + costs.learningMaterial;
    }
    return Math.round(sum);
  }, [userProgress.drivingSessions, hourlyRate45, costs]);

  const visibleLessons = filterLessonsForSelection(getAllLessons(), transmissionType, learningPath);
  const totalLessons = visibleLessons.length;
  const completedLessonsCount = userProgress.completedLessons.length;
  const activeLessonsPercent = totalLessons > 0 ? (completedLessonsCount / totalLessons) * 100 : 0;
  const mainQuizScore = userProgress.quizScores['main-scenarios'] || 0;
  const readiness = Math.round((activeLessonsPercent * 0.7) + (mainQuizScore * 0.3));

  const estimation = useMemo(() => {
    const MANDATORY_SPECIAL = { ueberland: 5, autobahn: 4, nacht: 3 };
    const targetLessons = 30;
    const remainingSpecialUeberland = Math.max(0, MANDATORY_SPECIAL.ueberland - totalUeberland);
    const remainingSpecialAutobahn = Math.max(0, MANDATORY_SPECIAL.autobahn - totalAutobahn);
    const remainingSpecialNacht = Math.max(0, MANDATORY_SPECIAL.nacht - totalNacht);
    
    const progressFactor = (100 - readiness) / 100;
    const remainingNormal = Math.max(
      readiness > 80 ? 2 : 5, 
      Math.round((targetLessons - totalNormalSessions) * (0.5 + progressFactor))
    );

    const remainingSpecialCost = (remainingSpecialUeberland + remainingSpecialAutobahn + remainingSpecialNacht) * (hourlyRate45 * specialRateFactor);
    const remainingNormalCost = remainingNormal * hourlyRate45;
    const examFees = costs.theoryExam + costs.practicalExam;

    const totalEstimate = currentSpend + remainingNormalCost + remainingSpecialCost + examFees;

    return {
      remainingNormal,
      remainingSpecial: remainingSpecialUeberland + remainingSpecialAutobahn + remainingSpecialNacht,
      remainingCost: Math.round(remainingNormalCost + remainingSpecialCost + examFees),
      totalEstimate: Math.round(totalEstimate),
      isLowReadiness: readiness < 40,
      isHighReadiness: readiness > 80
    };
  }, [readiness, totalNormalSessions, totalUeberland, totalAutobahn, totalNacht, currentSpend, hourlyRate45, costs]);

  return (
    <div className="space-y-6 pb-26 px-4 pt-4 max-w-2xl mx-auto">
      {/* Header Card */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl dark:bg-slate-950">
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-blue-600/20 blur-[100px]"></div>
        <div className="absolute -bottom-10 -left-10 h-64 w-64 rounded-full bg-emerald-600/20 blur-[100px]"></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10">
                <PiggyBank className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">{isDE ? 'Finanzen' : 'Finances'}</h2>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">{isDE ? 'Kosten-Monitor' : 'Cost Monitor'}</p>
              </div>
            </div>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
            >
              <Settings2 className="h-5 w-5 text-slate-300" />
            </button>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-8">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{isDE ? 'Bisher ausgegeben' : 'Spent So Far'}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">€{currentSpend.toLocaleString()}</span>
              </div>
            </div>
            <div className="text-right space-y-1 border-l border-white/5 pl-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{isDE ? 'Voraussichtliches Ziel' : 'Total Goal'}</p>
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-4xl font-black text-emerald-400">€{estimation.totalEstimate.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Calculator className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{isDE ? 'Nächste Schritte' : 'Next Steps'}</h3>
                <p className="text-[10px] text-slate-500">{isDE ? 'Geschätzte Fahrstunden' : 'Est. lessons remaining'}</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                ~{estimation.remainingNormal + estimation.remainingSpecial}
              </span>
            </div>
          </div>
          
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                 <span className="text-xs text-slate-500">{isDE ? 'Normalfahrten' : 'Normal Lessons'}</span>
              </div>
              <span className="text-xs font-bold">{estimation.remainingNormal}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <div className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                 <span className="text-xs text-slate-500">{isDE ? 'Sonderfahrten' : 'Special Drives'}</span>
              </div>
              <span className="text-xs font-bold text-orange-600">{estimation.remainingSpecial}</span>
            </div>
            
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
                initial={{ width: 0 }}
                animate={{ width: `${readiness}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">{isDE ? 'Restbudget' : 'Remaining'}</h3>
              <p className="text-[10px] text-slate-500">{isDE ? 'Noch zu investieren' : 'Yet to be invested'}</p>
            </div>
          </div>
          <div className="mt-8">
            <p className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">€{estimation.remainingCost.toLocaleString()}</p>
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/50 p-3 dark:border-blue-900/30 dark:bg-blue-900/10">
              <Info className="h-4 w-4 text-blue-500 shrink-0" />
              <p className="text-[10px] font-medium leading-tight text-blue-600 dark:text-blue-400">
                {isDE 
                  ? 'Exkl. Fremdkosten wie TÜV-Gebühren (~€200).' 
                  : 'Excl. external costs like TÜV fees (~€200).'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* AI Advice Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className={cn(
          "rounded-[2rem] p-6 border transition-all duration-500",
          estimation.isHighReadiness 
            ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-900/30 shadow-[0_10px_40px_-15px_rgba(16,185,129,0.1)]" 
            : "bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/30 shadow-[0_10px_40px_-15px_rgba(245,158,11,0.1)]"
        )}
      >
        <div className="flex items-start gap-4">
          <div className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm",
            estimation.isHighReadiness ? "bg-white text-emerald-600" : "bg-white text-amber-600"
          )}>
            {estimation.isHighReadiness ? <CheckCircle2 className="h-7 w-7" /> : <TrendingUp className="h-7 w-7" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className={cn(
                "font-black uppercase tracking-widest text-[10px]",
                estimation.isHighReadiness ? "text-emerald-600" : "text-amber-600"
              )}>
                {isDE ? 'DriveDE Strategie' : 'DriveDE Strategy'}
              </h4>
            </div>
            <p className={cn(
              "mt-2 text-sm font-semibold leading-relaxed",
              estimation.isHighReadiness ? "text-emerald-900 dark:text-emerald-200" : "text-amber-900 dark:text-amber-200"
            )}>
              {estimation.isHighReadiness
                ? (isDE 
                    ? 'Maximale Ersparnis möglich!' 
                    : 'Maximum savings possible!')
                : (isDE 
                    ? 'Effizienz-Potential erkannt' 
                    : 'Efficiency potential detected')}
            </p>
            <p className={cn(
              "mt-1 text-sm opacity-80",
              estimation.isHighReadiness ? "text-emerald-800 dark:text-emerald-400" : "text-amber-800 dark:text-amber-400"
            )}>
              {estimation.isHighReadiness
                ? (isDE 
                    ? 'Deine Bereitschaft ist top. Schließe die Sonderfahrten zügig ab, um unnötige Übungsstunden zu vermeiden.' 
                    : 'Your readiness is peak. Finish special drives quickly to avoid extra practice lessons.')
                : (isDE 
                    ? `Fokussiere dich auf Theorie & Simulation. Jede Stunde, die du dadurch sparst, bringt dir ca. €${hourlyRate45} zurück.` 
                    : `Focus on theory & simulation. Every lesson you save through prep puts €${hourlyRate45} back in your pocket.`)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white shadow-2xl dark:bg-slate-900"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                      <Settings2 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      {isDE ? 'Preise anpassen' : 'Adjust Rates'}
                    </h3>
                  </div>
                  <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  {/* Hourly Rate */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                      <GraduationCap className="h-3 w-3" />
                      {isDE ? 'Stundenpreis (45 Min)' : 'Hourly Rate (45 Min)'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">€</span>
                      <input 
                        type="number"
                        value={editValues.hourlyRate}
                        onChange={(e) => setEditValues({...editValues, hourlyRate: e.target.value})}
                        className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 py-3 pl-8 pr-4 font-bold text-slate-900 transition-all focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Base Fee */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                      <CreditCard className="h-3 w-3" />
                      {isDE ? 'Grundbetrag' : 'Registration Fee'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">€</span>
                      <input 
                        type="number"
                        value={editValues.registration}
                        onChange={(e) => setEditValues({...editValues, registration: e.target.value})}
                        className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 py-3 pl-8 pr-4 font-bold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Exams */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{isDE ? 'Theorie-Prüf.' : 'Theory Exam'}</label>
                      <input 
                        type="number"
                        value={editValues.theoryExam}
                        onChange={(e) => setEditValues({...editValues, theoryExam: e.target.value})}
                        className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-3 font-bold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{isDE ? 'Praxis-Prüf.' : 'Practical Exam'}</label>
                      <input 
                        type="number"
                        value={editValues.practicalExam}
                        onChange={(e) => setEditValues({...editValues, practicalExam: e.target.value})}
                        className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-3 font-bold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                   {/* Other */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{isDE ? 'Lernmaterial' : 'Materials'}</label>
                      <input 
                        type="number"
                        value={editValues.learningMaterial}
                        onChange={(e) => setEditValues({...editValues, learningMaterial: e.target.value})}
                        className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-3 font-bold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{isDE ? 'Erste Hilfe' : 'First Aid'}</label>
                      <input 
                        type="number"
                        value={editValues.firstAid}
                        onChange={(e) => setEditValues({...editValues, firstAid: e.target.value})}
                        className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-3 font-bold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button 
                    onClick={() => setIsSettingsOpen(false)}
                    className="flex-1 rounded-2xl border-2 border-slate-100 py-4 font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    {isDE ? 'Abbrechen' : 'Cancel'}
                  </button>
                  <button 
                    onClick={handleSave}
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
                  >
                    <Save className="h-5 w-5" />
                    {isDE ? 'Speichern' : 'Save'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
