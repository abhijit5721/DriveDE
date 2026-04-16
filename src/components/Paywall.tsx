import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Star, Check, X } from 'lucide-react';

export const Paywall: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { language, setPremium } = useAppStore();

  const handleSubscribe = () => {
    setPremium(true);
    onClose();
  };

  const content = {
    de: {
      title: 'DriveDE Pro freischalten',
      subtitle: 'Meistere deine Prüfung mit allen Funktionen',
      features: [
        'Alle 25+ Video-Lektionen & Animationen',
        'Interaktiver Fahrstunden-Tracker',
        'Spezialisierte Umschreibung-Inhalte',
        'Detaillierte Prüfungstipps & Checklisten',
        'Offline-Zugriff auf alle Inhalte'
      ],
      price: 'Einmalig 9,99 €',
      button: 'Jetzt freischalten',
      cancel: 'Vielleicht später'
    },
    en: {
      title: 'Unlock DriveDE Pro',
      subtitle: 'Master your exam with all features',
      features: [
        'All 25+ Video lessons & animations',
        'Interactive driving lesson tracker',
        'Specialized license conversion content',
        'Detailed exam tips & checklists',
        'Offline access to all content'
      ],
      price: 'One-time €9.99',
      button: 'Unlock Now',
      cancel: 'Maybe later'
    }
  };

  const t = content[language];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6">
            <Star className="w-8 h-8 text-blue-600 fill-blue-600" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {t.title}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            {t.subtitle}
          </p>

          <ul className="space-y-4 mb-8">
            {t.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                <div className="mt-1 bg-green-100 dark:bg-green-900/30 p-0.5 rounded-full">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm font-medium">{feature}</span>
              </li>
            ))}
          </ul>

          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4 mb-6 text-center border border-slate-100 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400 text-sm line-through block mb-1">€19.99</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{t.price}</span>
          </div>

          <button
            onClick={handleSubscribe}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-600/20 transition-all transform active:scale-95 mb-4"
          >
            {t.button}
          </button>

          <button
            onClick={onClose}
            className="w-full text-slate-500 dark:text-slate-400 text-sm font-medium py-2"
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};
