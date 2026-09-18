import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getMasteryLevel } from '../services/api';
import { NavigationSlice, createNavigationSlice } from './slices/navigationSlice';
import { GamificationSlice, createGamificationSlice } from './slices/gamificationSlice';
import { EnrollmentSlice, createEnrollmentSlice } from './slices/enrollmentSlice';
import { UISlice, createUISlice, UserProfile } from './slices/uiSlice';

export type UIStore = NavigationSlice & GamificationSlice & EnrollmentSlice & UISlice;

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
    }),
    {
      name: 'secomp2026-ui-state',
      storage: createJSONStorage(getSafeStorage),
      partialize: (state) => ({
        earnedStampIds: state.earnedStampIds,
        enrolledActivities: state.enrolledActivities,
        votedPitchId: state.votedPitchId,
        user: state.user,
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

export type { UserProfile, NavigationSlice, GamificationSlice, EnrollmentSlice, UISlice };
