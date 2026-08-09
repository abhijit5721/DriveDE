/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { useEffect, useState } from 'react';
import { Share, PlusSquare, X, Download } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const DISMISS_KEY = 'drivede-pwa-hint-dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

/**
 * DriveDE isn't in the app stores yet, and iOS never prompts for PWA install —
 * so mobile visitors have no idea the site installs like an app. This is a
 * small dismissible banner: on iOS it explains Share → Add to Home Screen; on
 * Android/Chrome it triggers the native install prompt. Hidden when already
 * running installed, on desktop, and after dismissal.
 */
export function PwaInstallHint() {
  const { language } = useAppStore();
  const isDe = language === 'de';
  const [visible, setVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return;
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return; // already installed

    const ua = navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua);
    const mobile = ios || /android/i.test(ua);
    if (!mobile) return;

    setIsIos(ios);
    if (ios) {
      setVisible(true);
    } else {
      // Android: only show when the browser actually offers installation
      const onPrompt = (e: Event) => {
        e.preventDefault();
        setInstallEvent(e as BeforeInstallPromptEvent);
        setVisible(true);
      };
      window.addEventListener('beforeinstallprompt', onPrompt);
      return () => window.removeEventListener('beforeinstallprompt', onPrompt);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
  };

  const install = async () => {
    if (installEvent) {
      await installEvent.prompt();
      dismiss();
    }
  };

  if (!visible) return null;

  return (
    <div
      data-testid="pwa-install-hint"
      className="fixed inset-x-3 bottom-3 z-[90] flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl sm:hidden"
    >
      <img src="/icons/icon-192.png" alt="" className="h-10 w-10 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1 text-left">
        <p className="text-sm font-bold text-white">
          {isDe ? 'DriveDE als App installieren' : 'Install DriveDE as an app'}
        </p>
        {isIos ? (
          <p className="mt-0.5 flex flex-wrap items-center gap-1 text-xs text-slate-400">
            <Share className="h-3.5 w-3.5 shrink-0 text-blue-400" />
            {isDe ? 'Teilen antippen, dann' : 'Tap Share, then'}
            <PlusSquare className="h-3.5 w-3.5 shrink-0 text-blue-400" />
            {isDe ? '„Zum Home-Bildschirm"' : '"Add to Home Screen"'}
          </p>
        ) : (
          <p className="mt-0.5 text-xs text-slate-400">
            {isDe ? 'Schneller Zugriff, offline nutzbar' : 'Quick access, works offline'}
          </p>
        )}
      </div>
      {!isIos && installEvent && (
        <button
          onClick={install}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white active:scale-95"
        >
          <Download className="h-3.5 w-3.5" />
          {isDe ? 'Installieren' : 'Install'}
        </button>
      )}
      <button
        onClick={dismiss}
        aria-label={isDe ? 'Hinweis schließen' : 'Dismiss'}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
