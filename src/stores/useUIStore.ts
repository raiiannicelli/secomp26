import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getMasteryLevel } from '../services/api';
import { NavigationSlice, createNavigationSlice } from './slices/navigationSlice';
import { GamificationSlice, createGamificationSlice } from './slices/gamificationSlice';
import { EnrollmentSlice, createEnrollmentSlice } from './slices/enrollmentSlice';
import {
  UISlice,
  createUISlice,
  UserProfile,
  isUserAuthenticated,
  isUserAdmin,
} from './slices/uiSlice';
import {
  CMSSlice,
  createCMSSlice,
  CMSMentorItem,
  CMSPartnerItem,
  CMSPhotoItem,
  CMSLectureItem,
  CMSWorkshopItem,
} from './slices/cmsSlice';

export type UIStore = NavigationSlice &
  GamificationSlice &
  EnrollmentSlice &
  UISlice &
  CMSSlice;

const getSafeStorage = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
};

export const useUIStore = create<UIStore>()(
  persist(
    (...a) => ({
      ...createNavigationSlice(...a),
      ...createGamificationSlice(...a),
      ...createEnrollmentSlice(...a),
      ...createUISlice(...a),
      ...createCMSSlice(...a),
    }),
    {
      name: 'secomp2026-ui-state',
      storage: createJSONStorage(getSafeStorage),
      partialize: (state) => ({
        votedPitchId: state.votedPitchId,
        mentors: state.mentors,
        partners: state.partners,
        eventPhotos: state.eventPhotos,
        lectures: state.lectures,
        workshops: state.workshops,
        talentPlatforms: state.talentPlatforms,
        ideathonTeams: state.ideathonTeams,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.earnedStampIds)) {
          state.stampsCount = state.earnedStampIds.length;
          state.currentLevel = getMasteryLevel(state.stampsCount);
        }
      },
    }
  )
);

export { isUserAuthenticated, isUserAdmin };
export type {
  UserProfile,
  NavigationSlice,
  GamificationSlice,
  EnrollmentSlice,
  UISlice,
  CMSSlice,
  CMSMentorItem,
  CMSPartnerItem,
  CMSPhotoItem,
};
