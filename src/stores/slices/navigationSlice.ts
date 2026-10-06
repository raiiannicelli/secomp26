import { StateCreator } from 'zustand';

export type TabType = 'EVENTO' | 'PASSAPORTE' | 'PROGRAMACAO' | 'SHARK_TANK' | 'TALENT_ARENA';

export interface NavigationSlice {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  activeDayIndex: number;
  selectedTurn: 'ALL' | 'MORNING' | 'AFTERNOON' | 'NIGHT';
  selectedTheme: 'ALL' | 'TECHNOLOGY' | 'MANAGEMENT' | 'INNOVATION' | 'CAREER';
  setActiveDayIndex: (day: number) => void;
  setSelectedTurn: (turn: 'ALL' | 'MORNING' | 'AFTERNOON' | 'NIGHT') => void;
  setSelectedTheme: (theme: 'ALL' | 'TECHNOLOGY' | 'MANAGEMENT' | 'INNOVATION' | 'CAREER') => void;
}

export const getInitialTab = (): TabType => {
  if (typeof window !== 'undefined') {
    if (window.location.hash === '#passaporte') return 'PASSAPORTE';
    if (window.location.hash === '#programacao' || window.location.hash === '#minicursos') return 'PROGRAMACAO';
    if (window.location.hash === '#shark-tank') return 'SHARK_TANK';
    if (window.location.hash === '#talent-arena') return 'TALENT_ARENA';
  }
  return 'EVENTO';
};

export const createNavigationSlice: StateCreator<NavigationSlice, [], [], NavigationSlice> = (set) => ({
  activeTab: getInitialTab(),
  setActiveTab: (tab) => {
    if (typeof window !== 'undefined') {
      if (tab === 'PASSAPORTE') {
        window.location.hash = '#passaporte';
      } else if (tab === 'PROGRAMACAO') {
        window.location.hash = '#programacao';
      } else if (
        window.location.hash === '#passaporte' ||
        window.location.hash === '#programacao' ||
        window.location.hash === '#minicursos'
      ) {
        history.replaceState(null, '', window.location.pathname);
      }
    }
    set({ activeTab: tab });
  },
  activeDayIndex: 0,
  selectedTurn: 'ALL',
  selectedTheme: 'ALL',
  setActiveDayIndex: (day) => set({ activeDayIndex: day }),
  setSelectedTurn: (turn) => set({ selectedTurn: turn }),
  setSelectedTheme: (theme) => set({ selectedTheme: theme }),
});
