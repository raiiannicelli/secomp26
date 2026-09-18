import { StateCreator } from 'zustand';

export interface UserProfile {
  name: string;
  email?: string;
  ra?: string;
}

export interface UISlice {
  // Usuário / Perfil
  user: UserProfile;
  setUser: (user: UserProfile) => void;

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

const DEFAULT_USER: UserProfile = {
  name: 'Rai Moratto',
  email: 'rai***@utfpr.edu.br',
  ra: 'a2489120',
};

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
