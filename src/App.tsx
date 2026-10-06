import React, { Suspense, useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Motion3DHero } from './components/Motion3DHero';
import { SchedulePage } from './components/SchedulePage';
import { SharkTankSection } from './components/SharkTankSection';
import { PassportPage } from './components/PassportPage';
import { TalentArenaSection } from './components/TalentArenaSection';
import { ScrollVelocityMentors } from './components/ScrollVelocityMentors';
import { CardStackGallery } from './components/CardStackGallery';
import { IdeathonBadgesSection } from './components/IdeathonBadgesSection';
import { SponsorsMediaKitSection } from './components/SponsorsMediaKitSection';
import { FeiraDaLuaSection } from './components/FeiraDaLuaSection';
import { Footer } from './components/Footer';
import { EnrollModal } from './components/EnrollModal';
import { useUIStore } from './stores/useUIStore';
import { subscribeToAdminChannel } from './lib/supabase';

// Lazy-loaded routes for code isolation and bundle splitting
const AuthPage = React.lazy(() => import('./components/AuthPage'));
const ValidatePage = React.lazy(() => import('./components/ValidatePage'));
const AdminPage = React.lazy(() => import('./components/AdminPage'));
const ArenaLivePage = React.lazy(() =>
  import('./components/ArenaLivePage').then((m) => ({ default: m.ArenaLivePage }))
);
const VotePage = React.lazy(() =>
  import('./components/VotePage').then((m) => ({ default: m.VotePage }))
);

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

    handlePopState();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Pure Backend Session Check (No client-side fake auth or local storage profile debt)
  useEffect(() => {
    let isMounted = true;
    fetch('/api/v1/auth/me', {
      credentials: 'include',
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        if (data?.user) {
          useUIStore.getState().setUser({
            name: data.user.fullName || data.user.name || data.user.email.split('@')[0],
            email: data.user.email,
            ra: data.user.raMasked,
            role: data.user.role,
          });
        } else {
          useUIStore.getState().setUser(null);
          useUIStore.getState().clearVotedPitch();
        }
      })
      .catch(() => {
        if (isMounted) {
          useUIStore.getState().setUser(null);
          useUIStore.getState().clearVotedPitch();
        }
      });

    // Hydrate CMS content & Session Status directly from Supabase PostgreSQL
    fetch('/api/v1/activities/cms/all')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data?.cms) return;
        const store = useUIStore.getState();
        // Não sobrescreve se a resposta do banco retornar nula/vazia mantendo a persistência local
        if (data.cms.talent_platforms && data.cms.talent_platforms.length > 0) {
          store.setTalentPlatforms(data.cms.talent_platforms);
        }
        delete data.cms.talent_platforms;
        store.setCmsAll(data.cms);
        if (data.cms.session_status) {
          store.setSessionStatus(data.cms.session_status);
        }
      })
      .catch(() => {});

    // Live Realtime listener for CMS & Session Status updates on public portal
    let channel: any = null;
    try {
      channel = subscribeToAdminChannel((event) => {
        if (!isMounted) return;
        if (event.type === 'CMS_UPDATED' || event.type === 'SESSION_STATUS_CHANGED') {
          const { key, value } = event.payload;
          const store = useUIStore.getState();
          if (key === 'session_status') {
            store.setSessionStatus(value);
          } else if (key === 'lectures') {
            store.setLectures(value);
          } else if (key === 'workshops') {
            store.setWorkshops(value);
          } else if (key === 'mentors') {
            store.setMentors(value);
          } else if (key === 'partners') {
            store.setPartners(value);
          } else if (key === 'event_photos') {
            store.setEventPhotos(value);
          } else if (key === 'ideathon_teams') {
            store.setIdeathonTeams(value);
          } else if (key === 'talent_platforms') {
            store.setTalentPlatforms(value);
          }
        } else if (event.type === 'VOTES_RESET') {
          // Quando o admin clica em ZERAR VOTOS, reseta o estado local e libera nova votação para todos os usuários em tempo real
          useUIStore.getState().resetSharkTankVotes();
        } else if (event.type === 'VOTE_CAST') {
          // Re-fetch em tempo real das contagens de votos para manter todos os navegadores sincronizados
          fetch('/api/v1/activities/cms/all')
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (data?.cms?.ideathon_teams) {
                useUIStore.getState().setIdeathonTeams(data.cms.ideathon_teams);
              }
            })
            .catch(() => {});
        }
      });
    } catch {}

    return () => {
      isMounted = false;
      if (channel) channel.unsubscribe();
    };
  }, []);

  // Se o participante retornou autenticado do /auth, redireciona diretamente para o Passaporte Digital
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('enroll=true')) {
      const state = useUIStore.getState();
      if (state.user) {
        state.setActiveTab('PASSAPORTE');
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
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

  // Isolated Route: /chameguinho (Cockpit Admin Secreto - Anti-Enumeração)
  if (currentPath === '/chameguinho') {
    return (
      <Suspense fallback={<PageFallback />}>
        <AdminPage />
      </Suspense>
    );
  }

  // Isolated Route: /arena-live (Telão Ao Vivo Shark Tank 60fps)
  if (currentPath === '/arena-live') {
    return (
      <Suspense fallback={<PageFallback />}>
        <ArenaLivePage />
      </Suspense>
    );
  }

  // Isolated Route: /votar (Redirecionamento de Voto via QR Code)
  if (currentPath === '/votar') {
    return (
      <Suspense fallback={<PageFallback />}>
        <VotePage />
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

            {/* 3.1 Ideathon Express */}
            <IdeathonBadgesSection />

            {/* 4. Sponsors Showcase (Parceiros & Contato) */}
            <SponsorsMediaKitSection />

            {/* 5. Roda de Talentos & Speed Interviews */}
            <TalentArenaSection />

            {/* 6.1 Ticker Cinético de Mentores, Palestrantes & Organização */}
            <ScrollVelocityMentors />

            {/* 6.2 Mural Fotográfico Card Stack 3D */}
            <CardStackGallery />

            {/* 7. Feira da Lua & Grand Finale Encerramento */}
            <FeiraDaLuaSection />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modais Globais Interativas */}
      <EnrollModal />
    </div>
  );
};

export default App;
