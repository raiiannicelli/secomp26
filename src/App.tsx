import React, { Suspense, useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Motion3DHero } from './components/Motion3DHero';
import { SchedulePage } from './components/SchedulePage';
import { SharkTankSection } from './components/SharkTankSection';
import { PassportPage } from './components/PassportPage';
import { TalentArenaSection } from './components/TalentArenaSection';
import { IdeathonBadgesSection } from './components/IdeathonBadgesSection';
import { SponsorsMediaKitSection } from './components/SponsorsMediaKitSection';
import { FeiraDaLuaSection } from './components/FeiraDaLuaSection';
import { Footer } from './components/Footer';
import { EnrollModal } from './components/EnrollModal';
import { useUIStore } from './stores/useUIStore';

// Lazy-loaded routes for code isolation and bundle splitting
const AuthPage = React.lazy(() => import('./components/AuthPage'));
const ValidatePage = React.lazy(() => import('./components/ValidatePage'));
const AdminPage = React.lazy(() => import('./components/AdminPage'));

const PageFallback: React.FC = () => (
  <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-2 border-[#fcd535] border-t-transparent animate-spin" />
  </div>
);

export const App: React.FC = () => {
  const { activeTab } = useUIStore();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Isolated Route: /auth
  if (currentPath === '/auth') {
    return (
      <Suspense fallback={<PageFallback />}>
        <AuthPage />
      </Suspense>
    );
  }

  // Isolated Route: /validate
  if (currentPath === '/validate') {
    return (
      <Suspense fallback={<PageFallback />}>
        <ValidatePage />
      </Suspense>
    );
  }

  // Isolated Route: /chameguinho (Admin Cockpit)
  if (currentPath === '/chameguinho') {
    return (
      <Suspense fallback={<PageFallback />}>
        <AdminPage />
      </Suspense>
    );
  }

  // Standard Public Portal
  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] flex flex-col font-sans selection:bg-[#fcd535] selection:text-[#181a20]">
      {/* 1. Header & Navigation (Fixed Top Shell) */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-grow">
        {activeTab === 'PASSAPORTE' ? (
          <PassportPage />
        ) : activeTab === 'PROGRAMACAO' ? (
          <SchedulePage />
        ) : (
          <>
            {/* 2. Motion 3D Hero Section */}
            <Motion3DHero />

            {/* 3. Ideathon Express */}
            <IdeathonBadgesSection />

            {/* 4. Sponsors Showcase (Parceiros & Contato) */}
            <SponsorsMediaKitSection />

            {/* 5. Shark Tank UTFPR */}
            <SharkTankSection />

            {/* 6. Roda de Talentos & Speed Interviews */}
            <TalentArenaSection />

            {/* 7. Feira da Lua & Grand Finale Encerramento */}
            <FeiraDaLuaSection />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modal de Inscrição Unificada e Credenciamento */}
      <EnrollModal />
    </div>
  );
};

export default App;
