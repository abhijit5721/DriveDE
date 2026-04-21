import { Car, BadgeCheck, Cog, Zap, Users, Trophy, Shield, Star } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../utils/cn';

export function Welcome() {
  const { language, setLicenseType, setHasVisited } = useAppStore();
  const isDE = language === 'de';

  const handleSelect = (type: 'manual' | 'automatic' | 'umschreibung-manual' | 'umschreibung-automatic') => {
    setLicenseType(type);
    setHasVisited(true);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 text-center dark:bg-slate-900">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-500 text-4xl text-white shadow-lg">
        🚗
      </div>
      <h1 className="mt-6 text-3xl font-bold text-slate-900 dark:text-white">
        {isDE ? 'Willkommen bei DriveDE!' : 'Welcome to DriveDE!'}
      </h1>
      <p className="mt-2 max-w-lg text-base text-slate-600 dark:text-slate-300">
        {isDE
          ? 'Deine App für die praktische Fahrprüfung in Deutschland. Wähle deinen Lernpfad, um zu beginnen.'
          : 'Your app for the practical driving test in Germany. Choose your learning path to get started.'}
      </p>

      {/* Social Proof Section */}
      <div className="mt-8 flex flex-wrap justify-center gap-4 px-4">
        <div className="flex items-center gap-2 rounded-2xl bg-white/50 px-4 py-2 shadow-sm border border-slate-100 dark:bg-slate-800/50 dark:border-slate-700">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 w-6 rounded-full border-2 border-white bg-slate-200 dark:border-slate-800 overflow-hidden">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} 
                  alt="User"
                  className="h-full w-full object-cover" 
                />
              </div>
            ))}
          </div>
          <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
            <span className="text-slate-900 dark:text-white">2.5k+</span> {isDE ? 'Lernende' : 'Learners'}
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-white/50 px-4 py-2 shadow-sm border border-slate-100 dark:bg-slate-800/50 dark:border-slate-700">
          <Trophy className="h-4 w-4 text-amber-500" />
          <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
            <span className="text-slate-900 dark:text-white">94%</span> {isDE ? 'Erfolgsquote' : 'Pass Rate'}
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-white/50 px-4 py-2 shadow-sm border border-slate-100 dark:bg-slate-800/50 dark:border-slate-700">
          <div className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
            <span className="text-slate-900 dark:text-white">142</span> {isDE ? 'gerade online' : 'online now'}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-4 text-slate-400 dark:text-slate-500">
        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em]">
          <Shield className="h-3 w-3" />
          TÜV / DEKRA 2026
        </div>
        <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em]">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          4.9 Rating
        </div>
      </div>

      <div className="mt-8 w-full max-w-md space-y-3">
        <button
          onClick={() => handleSelect('manual')}
          className="flex w-full items-center gap-4 rounded-xl border-2 border-transparent bg-white p-4 text-left shadow-sm transition-all hover:border-orange-500 hover:shadow-lg dark:bg-slate-800"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/50">
            <Cog className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{isDE ? 'Neuer Führerschein (Schaltung)' : 'New License (Manual)'}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{isDE ? 'Klasse B - Der Klassiker' : 'Class B - The Classic'}</p>
          </div>
        </button>
        <button
          onClick={() => handleSelect('automatic')}
          className="flex w-full items-center gap-4 rounded-xl border-2 border-transparent bg-white p-4 text-left shadow-sm transition-all hover:border-blue-500 hover:shadow-lg dark:bg-slate-800"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/50">
            <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{isDE ? 'Neuer Führerschein (Automatik)' : 'New License (Automatic)'}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{isDE ? 'Klasse B197 - Modern & einfach' : 'Class B197 - Modern & Easy'}</p>
          </div>
        </button>
        <button
          onClick={() => handleSelect('umschreibung-manual')}
          className="flex w-full items-center gap-4 rounded-xl border-2 border-transparent bg-white p-4 text-left shadow-sm transition-all hover:border-purple-500 hover:shadow-lg dark:bg-slate-800"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/50">
            <BadgeCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{isDE ? 'Umschreibung (Schaltung)' : 'Conversion (Manual)'}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{isDE ? 'Ausländischen Führerschein umschreiben' : 'Convert a foreign license'}</p>
          </div>
        </button>
        <button
          onClick={() => handleSelect('umschreibung-automatic')}
          className="flex w-full items-center gap-4 rounded-xl border-2 border-transparent bg-white p-4 text-left shadow-sm transition-all hover:border-purple-500 hover:shadow-lg dark:bg-slate-800"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/50">
            <BadgeCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{isDE ? 'Umschreibung (Automatik)' : 'Conversion (Automatic)'}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{isDE ? 'Ausländischen Führerschein umschreiben' : 'Convert a foreign license'}</p>
          </div>
        </button>
      </div>
    </div>
  );
}
