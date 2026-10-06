import { StateCreator } from 'zustand';

export type CotaType = 'OURO' | 'PRATA' | 'BRONZE' | 'PARCEIRO' | 'EXPOSITOR';

export interface CMSMentorItem {
  id: string;
  name: string;
  role: string;
  organization: string;
  tag: string;
  topic: string;
  accentColor: string;
  avatarUrl: string;
  orderIndex: number;
}

export interface CMSPartnerItem {
  id: string;
  name: string;
  category: string;
  cota: CotaType;
  cotaLabel: string;
  cotaIcon: string;
  cotaColor: string;
  badgeColor: string;
  tagline: string;
  description: string;
  benefits: string[];
  tags: string[];
  websiteUrl: string;
  logoUrl?: string;
  orderIndex: number;
}

export interface CMSPhotoItem {
  id: string;
  url: string;
  caption: string;
  category?: string;
  orderIndex: number;
}

export type LectureShift = 'MORNING' | 'AFTERNOON' | 'NIGHT';
export type LectureTheme = 'TECHNOLOGY' | 'MANAGEMENT' | 'INNOVATION' | 'CAREER';

export interface CMSLectureItem {
  id: string;
  dayIndex: number; // 0=Segunda, 1=Terça, 2=Quarta, 3=Quinta, 4=Sexta
  shift: LectureShift;
  shiftLabel: string;
  time: string;
  title: string;
  description: string;
  speaker: string;
  speakerRole: string;
  speakerImage?: string;
  location: string;
  theme: LectureTheme;
  themeLabel: string;
  availableSeats: number;
  totalSeats: number;
  orderIndex: number;
}

export type WorkshopMonth = 'SETEMBRO' | 'OUTUBRO';
export type WorkshopTrack = 'DADOS' | 'INFRA' | 'HARDWARE' | 'DEV';

export interface CMSWorkshopItem {
  id: string;
  title: string;
  month: WorkshopMonth;
  day: string;
  track: WorkshopTrack;
  trackLabel: string;
  trackColor: string;
  partner: string;
  instructor: string;
  location: string;
  activeSlots: number;
  totalSlots: number;
  description: string;
  orderIndex: number;
}

export interface CMSTalentSlot {
  slotNum: number; // 1 a 7
  timeLabel: string; // Ex: '09h00 - 09h45'
  maxCapacity: number;
  bookedCount: number;
  status: 'OPEN' | 'FULL' | 'BLOCKED';
  meetingUrl?: string;
}

export interface CMSTalentPlatformItem {
  id: string;
  title: string;
  partnerId?: string; // Vinculação opcional a parceiro cadastrado no CMS
  companyName: string; // Preenchido automaticamente ou informado manualmente
  mentorId?: string; // Vinculação opcional a mentor cadastrado no CMS
  hostName: string; // Preenchido automaticamente ou informado manualmente
  location: string;
  slots: CMSTalentSlot[];
  orderIndex: number;
}

export type IdeathonTeamStatus = 'PENDENTE' | 'APROVADO' | 'FINALISTA' | 'REJEITADO';

export interface CMSIdeathonTeam {
  id: string;
  teamName: string;
  leaderName: string;
  leaderEmail: string;
  members: string;
  track: string;
  proposal: string;
  status: IdeathonTeamStatus;
  votingOpen: boolean;
  votesCount: number;
  createdAt: string;
}

export interface CMSSessionStatus {
  shark_tank_voting_active?: boolean;
  ideathon_registration_open?: boolean;
  ott_scanner_active?: boolean;
}

export interface CMSSlice {
  mentors: CMSMentorItem[];
  partners: CMSPartnerItem[];
  eventPhotos: CMSPhotoItem[];
  lectures: CMSLectureItem[];
  workshops: CMSWorkshopItem[];
  ideathonTeams: CMSIdeathonTeam[];
  cmsContent: {
    session_status?: CMSSessionStatus;
    [key: string]: any;
  };
  setSessionStatus: (status: CMSSessionStatus) => void;

  // Ideathon / Shark Tank unified actions
  addIdeathonTeam: (team: Omit<CMSIdeathonTeam, 'id' | 'createdAt' | 'votesCount' | 'votingOpen' | 'status'>) => void;
  updateIdeathonTeamStatus: (id: string, status: IdeathonTeamStatus) => void;
  toggleIdeathonTeamVoting: (id: string) => void;
  removeIdeathonTeam: (id: string) => void;
  castIdeathonTeamVote: (id: string) => void;
  setIdeathonTeams: (teams: CMSIdeathonTeam[]) => void;
  resetIdeathonTeams: () => void;
  resetSharkTankVotes: () => void;

  // Mentor actions
  addMentor: (mentor: Omit<CMSMentorItem, 'id' | 'orderIndex'>) => void;
  updateMentor: (id: string, updates: Partial<CMSMentorItem>) => void;
  removeMentor: (id: string) => void;
  moveMentor: (id: string, direction: 'up' | 'down') => void;

  // Partner actions
  addPartner: (partner: Omit<CMSPartnerItem, 'id' | 'orderIndex'>) => void;
  updatePartner: (id: string, updates: Partial<CMSPartnerItem>) => void;
  removePartner: (id: string) => void;
  movePartner: (id: string, direction: 'up' | 'down') => void;

  // Photo actions
  addEventPhoto: (photo: Omit<CMSPhotoItem, 'id' | 'orderIndex'>) => void;
  updateEventPhoto: (id: string, updates: Partial<CMSPhotoItem>) => void;
  removeEventPhoto: (id: string) => void;
  moveEventPhoto: (id: string, direction: 'up' | 'down') => void;

  // Lecture actions (Palestras / Grade dos 5 Dias)
  addLecture: (lecture: Omit<CMSLectureItem, 'id' | 'orderIndex'>) => void;
  updateLecture: (id: string, updates: Partial<CMSLectureItem>) => void;
  removeLecture: (id: string) => void;
  moveLecture: (id: string, direction: 'up' | 'down') => void;

  // Workshop actions (Minicursos Setembro/Outubro)
  addWorkshop: (workshop: Omit<CMSWorkshopItem, 'id' | 'orderIndex'>) => void;
  updateWorkshop: (id: string, updates: Partial<CMSWorkshopItem>) => void;
  removeWorkshop: (id: string) => void;
  moveWorkshop: (id: string, direction: 'up' | 'down') => void;

  // Talent Platform actions (Roda de Talentos & Empresas)
  talentPlatforms: CMSTalentPlatformItem[];
  addTalentPlatform: (platform: Omit<CMSTalentPlatformItem, 'id' | 'orderIndex'>) => void;
  updateTalentPlatform: (id: string, updates: Partial<CMSTalentPlatformItem>) => void;
  removeTalentPlatform: (id: string) => void;
  updatePlatformSlot: (platformId: string, slotNum: number, slotUpdates: Partial<CMSTalentSlot>) => void;

  // Bulk Setters (Sincronização com Supabase / PostgreSQL)
  setLectures: (lectures: CMSLectureItem[]) => void;
  setWorkshops: (workshops: CMSWorkshopItem[]) => void;
  setMentors: (mentors: CMSMentorItem[]) => void;
  setPartners: (partners: CMSPartnerItem[]) => void;
  setEventPhotos: (photos: CMSPhotoItem[]) => void;
  setTalentPlatforms: (platforms: CMSTalentPlatformItem[]) => void;
  setCmsAll: (data: {
    lectures?: CMSLectureItem[];
    workshops?: CMSWorkshopItem[];
    mentors?: CMSMentorItem[];
    partners?: CMSPartnerItem[];
    event_photos?: CMSPhotoItem[];
    ideathon_teams?: CMSIdeathonTeam[];
    talent_platforms?: CMSTalentPlatformItem[];
  }) => void;
}

const DEFAULT_MENTORS: CMSMentorItem[] = [];
const DEFAULT_PARTNERS: CMSPartnerItem[] = [];
const DEFAULT_PHOTOS: CMSPhotoItem[] = [];
const DEFAULT_LECTURES: CMSLectureItem[] = [];
const DEFAULT_WORKSHOPS: CMSWorkshopItem[] = [];
const DEFAULT_IDEATHON_TEAMS: CMSIdeathonTeam[] = [];

export const createCMSSlice: StateCreator<CMSSlice, [], [], CMSSlice> = (set) => ({
  mentors: [],
  partners: [],
  eventPhotos: [],
  lectures: [],
  workshops: [],
  ideathonTeams: [],

  addIdeathonTeam: (teamData) =>
    set((state) => ({
      ideathonTeams: [
        ...state.ideathonTeams,
        {
          ...teamData,
          id: 'team-' + Date.now(),
          status: 'PENDENTE',
          votingOpen: false,
          votesCount: 0,
          createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        },
      ],
    })),

  updateIdeathonTeamStatus: (id, status) =>
    set((state) => ({
      ideathonTeams: state.ideathonTeams.map((t) =>
        t.id === id
          ? {
              ...t,
              status,
              // Se for aprovado ou finalista, libera a votação por padrão
              votingOpen: status === 'APROVADO' || status === 'FINALISTA' ? true : false,
            }
          : t
      ),
    })),

  toggleIdeathonTeamVoting: (id) =>
    set((state) => ({
      ideathonTeams: state.ideathonTeams.map((t) =>
        t.id === id ? { ...t, votingOpen: !t.votingOpen } : t
      ),
    })),

  removeIdeathonTeam: (id) =>
    set((state) => ({
      ideathonTeams: state.ideathonTeams.filter((t) => t.id !== id),
    })),

  castIdeathonTeamVote: (id) =>
    set((state) => ({
      ideathonTeams: state.ideathonTeams.map((t) =>
        t.id === id ? { ...t, votesCount: (t.votesCount || 0) + 1 } : t
      ),
    })),

  setIdeathonTeams: (ideathonTeams) => set({ ideathonTeams }),

  resetIdeathonTeams: () => set({ ideathonTeams: [] }),

  resetSharkTankVotes: () =>
    set((state) => ({
      ideathonTeams: state.ideathonTeams.map((t) => ({ ...t, votesCount: 0 })),
      votedPitchId: null,
    })),

  // Mentores
  addMentor: (mentorData) =>
    set((state) => {
      const newId = `m-${Date.now()}`;
      const newMentor: CMSMentorItem = {
        ...mentorData,
        id: newId,
        orderIndex: state.mentors.length,
      };
      return { mentors: [...state.mentors, newMentor] };
    }),

  updateMentor: (id, updates) =>
    set((state) => ({
      mentors: state.mentors.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    })),

  removeMentor: (id) =>
    set((state) => ({
      mentors: state.mentors
        .filter((m) => m.id !== id)
        .map((m, idx) => ({ ...m, orderIndex: idx })),
    })),

  moveMentor: (id, direction) =>
    set((state) => {
      const index = state.mentors.findIndex((m) => m.id === id);
      if (index === -1) return state;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= state.mentors.length) return state;

      const newMentors = [...state.mentors];
      const temp = newMentors[index];
      newMentors[index] = newMentors[targetIndex];
      newMentors[targetIndex] = temp;

      return {
        mentors: newMentors.map((m, idx) => ({ ...m, orderIndex: idx })),
      };
    }),

  // Parceiros
  addPartner: (partnerData) =>
    set((state) => {
      const newId = `partner-${Date.now()}`;
      const newPartner: CMSPartnerItem = {
        ...partnerData,
        id: newId,
        orderIndex: state.partners.length,
      };
      return { partners: [...state.partners, newPartner] };
    }),

  updatePartner: (id, updates) =>
    set((state) => ({
      partners: state.partners.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),

  removePartner: (id) =>
    set((state) => ({
      partners: state.partners
        .filter((p) => p.id !== id)
        .map((p, idx) => ({ ...p, orderIndex: idx })),
    })),

  movePartner: (id, direction) =>
    set((state) => {
      const index = state.partners.findIndex((p) => p.id === id);
      if (index === -1) return state;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= state.partners.length) return state;

      const newPartners = [...state.partners];
      const temp = newPartners[index];
      newPartners[index] = newPartners[targetIndex];
      newPartners[targetIndex] = temp;

      return {
        partners: newPartners.map((p, idx) => ({ ...p, orderIndex: idx })),
      };
    }),

  // Fotos do Evento
  addEventPhoto: (photoData) =>
    set((state) => {
      const newId = `ph-${Date.now()}`;
      const newPhoto: CMSPhotoItem = {
        ...photoData,
        id: newId,
        orderIndex: state.eventPhotos.length,
      };
      return { eventPhotos: [...state.eventPhotos, newPhoto] };
    }),

  updateEventPhoto: (id, updates) =>
    set((state) => ({
      eventPhotos: state.eventPhotos.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),

  removeEventPhoto: (id) =>
    set((state) => ({
      eventPhotos: state.eventPhotos
        .filter((p) => p.id !== id)
        .map((p, idx) => ({ ...p, orderIndex: idx })),
    })),

  moveEventPhoto: (id, direction) =>
    set((state) => {
      const index = state.eventPhotos.findIndex((p) => p.id === id);
      if (index === -1) return state;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= state.eventPhotos.length) return state;

      const newPhotos = [...state.eventPhotos];
      const temp = newPhotos[index];
      newPhotos[index] = newPhotos[targetIndex];
      newPhotos[targetIndex] = temp;

      return {
        eventPhotos: newPhotos.map((p, idx) => ({ ...p, orderIndex: idx })),
      };
    }),

  // Palestras / Grade dos 5 Dias
  addLecture: (lectureData) =>
    set((state) => {
      const newId = `lec-${Date.now()}`;
      const newLecture: CMSLectureItem = {
        ...lectureData,
        id: newId,
        orderIndex: state.lectures.length,
      };
      return { lectures: [...state.lectures, newLecture] };
    }),

  updateLecture: (id, updates) =>
    set((state) => ({
      lectures: state.lectures.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    })),

  removeLecture: (id) =>
    set((state) => ({
      lectures: state.lectures
        .filter((l) => l.id !== id)
        .map((l, idx) => ({ ...l, orderIndex: idx })),
    })),

  moveLecture: (id, direction) =>
    set((state) => {
      const index = state.lectures.findIndex((l) => l.id === id);
      if (index === -1) return state;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= state.lectures.length) return state;

      const newLectures = [...state.lectures];
      const temp = newLectures[index];
      newLectures[index] = newLectures[targetIndex];
      newLectures[targetIndex] = temp;

      return {
        lectures: newLectures.map((l, idx) => ({ ...l, orderIndex: idx })),
      };
    }),

  // Minicursos Setembro/Outubro
  addWorkshop: (workshopData) =>
    set((state) => {
      const newId = `ws-${Date.now()}`;
      const newWorkshop: CMSWorkshopItem = {
        ...workshopData,
        id: newId,
        orderIndex: state.workshops.length,
      };
      return { workshops: [...state.workshops, newWorkshop] };
    }),

  updateWorkshop: (id, updates) =>
    set((state) => ({
      workshops: state.workshops.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    })),

  removeWorkshop: (id) =>
    set((state) => ({
      workshops: state.workshops
        .filter((w) => w.id !== id)
        .map((w, idx) => ({ ...w, orderIndex: idx })),
    })),

  moveWorkshop: (id, direction) =>
    set((state) => {
      const index = state.workshops.findIndex((w) => w.id === id);
      if (index === -1) return state;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= state.workshops.length) return state;

      const newWorkshops = [...state.workshops];
      const temp = newWorkshops[index];
      newWorkshops[index] = newWorkshops[targetIndex];
      newWorkshops[targetIndex] = temp;

      return {
        workshops: newWorkshops.map((w, idx) => ({ ...w, orderIndex: idx })),
      };
    }),

  // Talent Platforms (Roda de Talentos & Empresas)
  talentPlatforms: [],

  addTalentPlatform: (platformData) =>
    set((state) => {
      const newId = `plat-${Date.now()}`;
      const defaultSlots: CMSTalentSlot[] = Array.from({ length: 7 }, (_, i) => ({
        slotNum: i + 1,
        timeLabel: `Slot ${i + 1}`,
        maxCapacity: 5,
        bookedCount: 0,
        status: 'OPEN',
      }));

      const newPlatform: CMSTalentPlatformItem = {
        ...platformData,
        id: newId,
        slots: platformData.slots || defaultSlots,
        orderIndex: state.talentPlatforms.length,
      };
      return { talentPlatforms: [...state.talentPlatforms, newPlatform] };
    }),

  updateTalentPlatform: (id, updates) =>
    set((state) => ({
      talentPlatforms: state.talentPlatforms.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),

  removeTalentPlatform: (id) =>
    set((state) => ({
      talentPlatforms: state.talentPlatforms
        .filter((p) => p.id !== id)
        .map((p, idx) => ({ ...p, orderIndex: idx })),
    })),

  updatePlatformSlot: (platformId, slotNum, slotUpdates) =>
    set((state) => ({
      talentPlatforms: state.talentPlatforms.map((p) => {
        if (p.id !== platformId) return p;
        const updatedSlots = p.slots.map((s) => (s.slotNum === slotNum ? { ...s, ...slotUpdates } : s));
        return { ...p, slots: updatedSlots };
      }),
    })),

  // Sincronização em Massa com Backend (Supabase)
  cmsContent: {
    session_status: {
      shark_tank_voting_active: true,
      ideathon_registration_open: true,
      ott_scanner_active: true,
    },
  },
  setSessionStatus: (session_status) =>
    set((state) => ({
      cmsContent: { ...state.cmsContent, session_status },
    })),
  setLectures: (lectures) => set({ lectures }),
  setWorkshops: (workshops) => set({ workshops }),
  setMentors: (mentors) => set({ mentors }),
  setPartners: (partners) => set({ partners }),
  setEventPhotos: (eventPhotos) => set({ eventPhotos }),
  setTalentPlatforms: (talentPlatforms) => set({ talentPlatforms }),
  setCmsAll: (data) =>
    set((state) => ({
      lectures: data.lectures ?? state.lectures,
      workshops: data.workshops ?? state.workshops,
      mentors: data.mentors ?? state.mentors,
      partners: data.partners ?? state.partners,
      eventPhotos: data.event_photos ?? state.eventPhotos,
      ideathonTeams: data.ideathon_teams ?? state.ideathonTeams,
      talentPlatforms: data.talent_platforms ?? state.talentPlatforms,
    })),
});
