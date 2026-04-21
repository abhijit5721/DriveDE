import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PiggyBank, Calculator, TrendingUp, AlertCircle, CheckCircle2, Wallet, ArrowUpRight, BarChart3, Info } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../utils/cn';
import { getAllLessons } from '../data/curriculum';
import { filterLessonsForSelection } from '../utils/contentFilter';
import { getLearningPathFromLicenseType, getTransmissionFromLicenseType } from '../utils/license';

export function BudgetEstimator() {
  const { language, userProgress, licenseType } = useAppStore();
  const isDE = language === 'de';

  const learningPath = getLearningPathFromLicenseType(licenseType);
  const transmissionType = getTransmissionFromLicenseType(licenseType);

  // Constants for German Driving School (Approximate)
  const FIXED_COSTS = {
    registration: 350,
    theoryExam: 25,
    practicalExam: 116,
    licenseFee: 45,
    eyeTest: 7,
    firstAid: 40,
  };

  const MANDATORY_SPECIAL = {
    ueberland: 5,
    autobahn: 4,
    nacht: 3,
  };

  const hourlyRate45 = userProgress.hourlyRate45 || 60; // Default if not set
  const specialRateFactor = 1.2; // Special drives usually cost ~20% more

  const totalNormalSessions = userProgress.drivingSessions.filter(s => s.type === 'normal').length;
  const totalUeberland = userProgress.drivingSessions.filter(s => s.type === 'ueberland').length;
  const totalAutobahn = userProgress.drivingSessions.filter(s => s.type === 'autobahn').length;
  const totalNacht = userProgress.drivingSessions.filter(s => s.type === 'nacht').length;

  // Calculate current spend
  const currentSpend = useMemo(() => {
    let sum = 0;
    userProgress.drivingSessions.forEach(s => {
      const units = s.duration / 45;
      const rate = s.type === 'normal' ? hourlyRate45 : hourlyRate45 * specialRateFactor;
      sum += units * rate;
    });
    // Add registration and basic fees if they have sessions
    if (userProgress.drivingSessions.length > 0) {
      sum += FIXED_COSTS.registration + FIXED_COSTS.firstAid + FIXED_COSTS.eyeTest;
    }
    return Math.round(sum);
  }, [userProgress.drivingSessions, hourlyRate45]);

  // Calculate Progress for Estimation
  const visibleLessons = filterLessonsForSelection(getAllLessons(), transmissionType, learningPath);
  const totalLessons = visibleLessons.length;
  const completedLessonsCount = userProgress.completedLessons.length;
  const activeLessonsPercent = totalLessons > 0 ? (completedLessonsCount / totalLessons) * 100 : 0;
  const mainQuizScore = userProgress.quizScores['main-scenarios'] || 0;
  const readiness = Math.round((activeLessonsPercent * 0.7) + (mainQuizScore * 0.3));

  // Estimation Logic
  const estimation = useMemo(() => {
    // Average normal lessons needed in Germany is ~30 for 17-25 year olds
    // We adjust based on current readiness
    const targetLessons = 30;
    const remainingSpecialUeberland = Math.max(0, MANDATORY_SPECIAL.ueberland - totalUeberland);
    const remainingSpecialAutobahn = Math.max(0, MANDATORY_SPECIAL.autobahn - totalAutobahn);
    const remainingSpecialNacht = Math.max(0, MANDATORY_SPECIAL.nacht - totalNacht);
    
    // Remaining normal lessons based on readiness gaps
    // If readiness is 50%, and we have done 10 lessons, we likely need another 10-20
    const progressFactor = (100 - readiness) / 100;
    const remainingNormal = Math.max(
      readiness > 80 ? 2 : 5, 
      Math.round((targetLessons - totalNormalSessions) * (0.5 + progressFactor))
    );

    const remainingSpecialCost = (remainingSpecialUeberland + remainingSpecialAutobahn + remainingSpecialNacht) * (hourlyRate45 * specialRateFactor);
    const remainingNormalCost = remainingNormal * hourlyRate45;
    const examFees = FIXED_COSTS.theoryExam + FIXED_COSTS.practicalExam + FIXED_COSTS.licenseFee;

    const totalEstimate = currentSpend + remainingNormalCost + remainingSpecialCost + examFees;

    return {
      remainingNormal,
      remainingSpecial: remainingSpecialUeberland + remainingSpecialAutobahn + remainingSpecialNacht,
      remainingCost: Math.round(remainingNormalCost + remainingSpecialCost + examFees),
      totalEstimate: Math.round(totalEstimate),
      isLowReadiness: readiness < 40,
      isHighReadiness: readiness > 80
    };
  }, [readiness, totalNormalSessions, totalUeberland, totalAutobahn, totalNacht, currentSpend, hourlyRate45]);

  return (
    <div className=\"space-y-6 pb-20\">
      {/* Header Card */}
      <div className=\"relative overflow-hidden rounded-3xl bg-slate-900 p-6 text-white shadow-xl dark:bg-slate-950\">
        <div className=\"absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl\"></div>
        <div className=\"absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl\"></div>
        
        <div className=\"relative z-10\">
          <div className=\"flex items-center gap-3\">
            <div className=\"flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md\">
              <PiggyBank className=\"h-7 w-7 text-emerald-400\" />
            </div>
            <div>
              <h2 className=\"text-xl font-bold\">{isDE ? 'Kosten-Schätzer' : 'License Estimator'}</h2>
              <p className=\"text-sm text-slate-400\">{isDE ? 'Basierend auf deinem Fortschritt' : 'Based on your current progress'}</p>
            </div>
          </div>

          <div className=\"mt-8 grid grid-cols-2 gap-4\">
            <div>
              <p className=\"text-xs font-bold uppercase tracking-widest text-slate-500\">{isDE ? 'Bisher ausgegeben' : 'Spent So Far'}</p>
              <p className=\"text-3xl font-black text-white\">€{currentSpend.toLocaleString()}</p>
            </div>
            <div className=\"text-right\">
              <p className=\"text-xs font-bold uppercase tracking-widest text-slate-500\">{isDE ? 'Gesamtschätzung' : 'Total Estimate'}</p>
              <p className=\"text-3xl font-black text-emerald-400\">€{estimation.totalEstimate.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className=\"grid grid-cols-1 gap-4 sm:grid-cols-2\">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className=\"rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900\"
        >
          <div className=\"flex items-center justify-between\">
            <div className=\"flex items-center gap-3\">
              <div className=\"flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400\">
                <Calculator className=\"h-5 w-5\" />
              </div>
              <h3 className=\"font-bold\">{isDE ? 'Restliche Fahrten' : 'Remaining Lessons'}</h3>
            </div>
            <span className=\"rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300\">
              ~{estimation.remainingNormal + estimation.remainingSpecial}
            </span>
          </div>
          
          <div className=\"mt-4 space-y-3\">
            <div className=\"flex items-center justify-between text-sm\">
              <span className=\"text-slate-500\">{isDE ? 'Normale Stunden' : 'Normal Lessons'}</span>
              <span className=\"font-semibold\">{estimation.remainingNormal}</span>
            </div>
            <div className=\"flex items-center justify-between text-sm\">
              <span className=\"text-slate-500\">{isDE ? 'Sonderfahrten' : 'Special Drives'}</span>
              <span className=\"font-semibold text-orange-600\">{estimation.remainingSpecial}</span>
            </div>
            <div className=\"h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800\">
              <div 
                className=\"h-full bg-blue-500 transition-all duration-1000\" 
                style={{ width: `${readiness}%` }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className=\"rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900\"
        >
          <div className=\"flex items-center gap-3\">
            <div className=\"flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400\">
              <Wallet className=\"h-5 w-5\" />
            </div>
            <h3 className=\"font-bold\">{isDE ? 'Geschätzte Restkosten' : 'Estimated Remaining'}</h3>
          </div>
          <div className=\"mt-2\">
            <p className=\"text-2xl font-black text-slate-900 dark:text-white\">€{estimation.remainingCost.toLocaleString()}</p>
            <p className=\"mt-1 text-xs text-slate-500\">{isDE ? 'Inkl. Prüfungsgebühren & Material' : 'Incl. exam fees & learning materials'}</p>
          </div>
          
          <div className=\"mt-4 flex items-center gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50\">
            <Info className=\"h-4 w-4 text-blue-500\" />
            <p className=\"text-[10px] leading-tight text-slate-500\">
              {isDE 
                ? 'Schätzung basiert auf Durchschnittswerten für deutsche Fahrschulen.' 
                : 'Estimates based on average German driving school costs.'}
            </p>
          </div>
        </motion.div>
      </div>

      {/* AI Advice Card */}
      <div className={cn(
        \"rounded-2xl p-5 border\",
        estimation.isHighReadiness 
          ? \"bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30\" 
          : \"bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30\"
      )}>
        <div className=\"flex items-start gap-4\">
          <div className={cn(
            \"flex h-10 w-10 shrink-0 items-center justify-center rounded-xl\",
            estimation.isHighReadiness ? \"bg-emerald-100 text-emerald-600\" : \"bg-amber-100 text-amber-600\"
          )}>
            {estimation.isHighReadiness ? <CheckCircle2 className=\"h-6 w-6\" /> : <TrendingUp className=\"h-6 w-6\" />}
          </div>
          <div>
            <h4 className={cn(
              \"font-bold\",
              estimation.isHighReadiness ? \"text-emerald-900 dark:text-emerald-200\" : \"text-amber-900 dark:text-amber-200\"
            )}>
              {isDE ? 'DriveDE Spar-Tipp' : 'DriveDE Savings Tip'}
            </h4>
            <p className={cn(
              \"mt-1 text-sm leading-relaxed\",
              estimation.isHighReadiness ? \"text-emerald-700 dark:text-emerald-400\" : \"text-amber-700 dark:text-amber-400\"
            )}>
              {estimation.isHighReadiness
                ? (isDE 
                    ? 'Deine Prüfungsreife ist hoch! Du könntest Geld sparen, indem du jetzt die Sonderfahrten abschließt und die Prüfung buchst.' 
                    : 'Your exam readiness is high! You could save money by finishing special drives and booking your test now.')
                : (isDE 
                    ? `Dein Fokus-Bereich zeigt noch Schwächen. Jede Stunde, die du durch bessere Vorbereitung sparst, bringt dir ca. €${hourlyRate45}.` 
                    : `Your focus areas still show weaknesses. Every lesson you save through better prep saves you approx. €${hourlyRate45}.`)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
