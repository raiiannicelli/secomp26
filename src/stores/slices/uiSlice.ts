import { StateCreator } from 'zustand';

export interface UserProfile {
  id?: string;
  name: string;
  email?: string;
  ra?: string;
  role?: string;
}

export const isUserAuthenticated = (user: UserProfile | null | undefined): boolean => {
  if (!user) return false;
  if (!user.email || user.email === '' || user.email === 'rai***@utfpr.edu.br') return false;
  return Boolean(user.name && user.name.trim() !== '');
};

export const isUserAdmin = (user: UserProfile | null | undefined): boolean => {
  if (!isUserAuthenticated(user)) return false;
  return Boolean(
    user?.role === 'ADMIN' &&
    user?.email === 'raimorato@alunos.utfpr.edu.br'
  );
};

export interface UISlice {
  // Usuário / Perfil
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;

  // Modais de Controle
  isEnrollModalOpen: boolean;
  selectedWorkshopForEnroll: string | null;
  openEnrollModal: (workshopTitle?: string) => void;
  closeEnrollModal: () => void;

  isTokenModalOpen: boolean;
  openTokenModal: () => void;
  closeTokenModal: () => void;

  isCertificateModalOpen: boolean;
  openCertificateModal: () => void;
  closeCertificateModal: () => void;

  isLeaderboardModalOpen: boolean;
  openLeaderboardModal: () => void;
  closeLeaderboardModal: () => void;

  isSharkModalOpen: boolean;
  openSharkModal: () => void;
  closeSharkModal: () => void;
}

const DEFAULT_USER: UserProfile | null = null;

export const createUISlice: StateCreator<UISlice, [], [], UISlice> = (set) => ({
  user: DEFAULT_USER,
  setUser: (user) => set({ user }),

  isEnrollModalOpen: false,
  selectedWorkshopForEnroll: null,
  openEnrollModal: (workshopTitle) =>
    set({ isEnrollModalOpen: true, selectedWorkshopForEnroll: workshopTitle || null }),
  closeEnrollModal: () =>
    set({ isEnrollModalOpen: false, selectedWorkshopForEnroll: null }),

  isTokenModalOpen: false,
  openTokenModal: () => set({ isTokenModalOpen: true }),
  closeTokenModal: () => set({ isTokenModalOpen: false }),

  isCertificateModalOpen: false,
  openCertificateModal: () => set({ isCertificateModalOpen: true }),
  closeCertificateModal: () => set({ isCertificateModalOpen: false }),

  isLeaderboardModalOpen: false,
  openLeaderboardModal: () => set({ isLeaderboardModalOpen: true }),
  closeLeaderboardModal: () => set({ isLeaderboardModalOpen: false }),

  isSharkModalOpen: false,
  openSharkModal: () => set({ isSharkModalOpen: true }),
  closeSharkModal: () => set({ isSharkModalOpen: false }),
});
