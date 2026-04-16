import { useState, useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { hydrateFromSupabase } from './services/supabaseSync';
import { getCurrentSession, signOut, subscribeToAuthChanges } from './services/auth';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { Curriculum } from './components/Curriculum';
import { Maneuvers } from './components/Maneuvers';
import { Tracker } from './components/Tracker';
import { LessonDetail } from './components/LessonDetail';
import { LicenseSelector } from './components/LicenseSelector';
import { Paywall } from './components/Paywall';
import { InstructorReview } from './components/InstructorReview';
import { LegalHub } from './components/LegalHub';
import { LegalPage } from './components/LegalPage';
import { AuthModal } from './components/AuthModal';
import { Account } from './components/Account';
import type { TabType, Lesson, LegalPageType } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedLegalPage, setSelectedLegalPage] = useState<LegalPageType | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const {
    darkMode,
    licenseType,
    isPremium,
    setLicenseType,
    setLearningPath,
    setTransmissionType,
    setAuthState,
  } = useAppStore();

  useEffect(() => {
    const initAuth = async () => {
      const session = await getCurrentSession();
      if (session?.user?.email) {
        setAuthState(session.user.email, 'signed_in');
        void hydrateFromSupabase();
      } else {
        setAuthState(null, 'guest');
      }
    };

    void initAuth();

    const unsubscribe = subscribeToAuthChanges((session) => {
      if (session?.user?.email) {
        setAuthState(session.user.email, 'signed_in');
        void hydrateFromSupabase();
      } else {
        setAuthState(null, 'guest');
      }
    });

    return unsubscribe;
  }, [setAuthState]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (!isPremium && licenseType) {
      const timer = setTimeout(() => {
        setShowPaywall(true);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [isPremium, licenseType]);

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
  };

  const handleLessonBack = () => {
    setSelectedLesson(null);
  };

  const handleNavigate = (tab: TabType) => {
    setActiveTab(tab);
    setSelectedLesson(null);
    setSelectedLegalPage(null);
  };

  const handleOpenLegalPage = (page: LegalPageType) => {
    setActiveTab('legal');
    setSelectedLesson(null);
    setSelectedLegalPage(page);
  };

  const handleBackToLegalHub = () => {
    setActiveTab('legal');
    setSelectedLegalPage(null);
  };

  const handleChangePath = () => {
    setSelectedLesson(null);
    setActiveTab('home');
    setLearningPath(null);
    setTransmissionType(null);
    setLicenseType(null);
  };

  const handleOpenAuth = () => {
    setShowAuthModal(true);
  };

  const handleSignOut = async () => {
    await signOut();
    setAuthState(null, 'guest');
  };

  const hasCompleteSelection =
    licenseType === 'manual' ||
    licenseType === 'automatic' ||
    licenseType === 'umschreibung-manual' ||
    licenseType === 'umschreibung-automatic';

  if (!hasCompleteSelection) {
    return <LicenseSelector />;
  }

  const renderContent = () => {
    if (selectedLesson) {
      return <LessonDetail lesson={selectedLesson} onBack={handleLessonBack} />;
    }

    if (activeTab === 'legal') {
      if (selectedLegalPage) {
        return <LegalPage page={selectedLegalPage} onBack={handleBackToLegalHub} />;
      }

      return <LegalHub onOpenPage={handleOpenLegalPage} />;
    }

    switch (activeTab) {
      case 'home':
        return (
          <Dashboard
            onNavigate={handleNavigate}
            onChangePath={handleChangePath}
            onOpenPaywall={() => setShowPaywall(true)}
            onOpenAuth={handleOpenAuth}
          />
        );
      case 'curriculum':
        return <Curriculum onLessonSelect={handleLessonSelect} />;
      case 'maneuvers':
        return <Maneuvers onLessonSelect={handleLessonSelect} />;
      case 'tracker':
        return <Tracker />;
      case 'review':
        return <InstructorReview onBack={() => setActiveTab('home')} />;
      case 'account':
        return (
          <Account
            onOpenAuth={handleOpenAuth}
            onSignOut={handleSignOut}
            onChangePath={handleChangePath}
            onOpenLegal={() => setActiveTab('legal')}
            onOpenReview={() => setActiveTab('review')}
          />
        );
      default:
        return (
          <Dashboard
            onNavigate={handleNavigate}
            onChangePath={handleChangePath}
            onOpenPaywall={() => setShowPaywall(true)}
            onOpenAuth={handleOpenAuth}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header onOpenAuth={handleOpenAuth} onSignOut={handleSignOut} />
      <main className="mx-auto max-w-lg px-4 py-4 pb-24 print:max-w-none print:px-0 print:py-0 print:pb-0">
        {renderContent()}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={handleNavigate} />

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {showPaywall && !isPremium && (
        <Paywall onClose={() => setShowPaywall(false)} />
      )}
    </div>
  );
}
