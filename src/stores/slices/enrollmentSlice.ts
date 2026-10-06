import { StateCreator } from 'zustand';

export interface EnrollmentSlice {
  enrolledActivities: string[];
  enrollInActivity: (activityId: string) => void;
  votedPitchId: string | null;
  castSharkVote: (pitchId: string) => void;
  clearVotedPitch: () => void;
}

export const createEnrollmentSlice: StateCreator<
  EnrollmentSlice,
  [],
  [],
  EnrollmentSlice
> = (set, get) => ({
  enrolledActivities: [],
  enrollInActivity: (activityId: string) => {
    const current = get().enrolledActivities;
    if (!current.includes(activityId)) {
      set({ enrolledActivities: [...current, activityId] });
      try {
        fetch(`/api/v1/activities/${activityId}/pre-enroll`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }).catch(() => {});
      } catch {}
    }
  },

  votedPitchId: null,
  castSharkVote: (pitchId: string) => {
    if (!get().votedPitchId) {
      set({ votedPitchId: pitchId });
    }
  },
  clearVotedPitch: () => set({ votedPitchId: null }),
});
