import { StateCreator } from 'zustand';
import { getMasteryLevel, MasteryLevel } from '../../services/api';
import { evaluateTokenValidation } from '../tokenService';

export interface GamificationSlice {
  stampsCount: number;
  currentLevel: MasteryLevel;
  earnedStampIds: number[];
  addStamp: (stampId: number, points?: number) => void;
  validateOneTimeToken: (rawToken: string) => { success: boolean; message: string };
}

const DEFAULT_STAMP_IDS: number[] = [];

export const createGamificationSlice: StateCreator<
  GamificationSlice,
  [],
  [],
  GamificationSlice
> = (set, get) => ({
  earnedStampIds: DEFAULT_STAMP_IDS,
  stampsCount: DEFAULT_STAMP_IDS.length,
  currentLevel: getMasteryLevel(DEFAULT_STAMP_IDS.length),

  addStamp: (stampId: number, _points = 1) => {
    const current = get().earnedStampIds;
    if (!current.includes(stampId)) {
      const updated = [...current, stampId];
      const count = updated.length;
      set({
        earnedStampIds: updated,
        stampsCount: count,
        currentLevel: getMasteryLevel(count),
      });
    }
  },

  validateOneTimeToken: (rawToken: string) => {
    let usedTokens: string[] = [];
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const item = window.localStorage.getItem('secomp2026_used_tokens');
        if (item) usedTokens = JSON.parse(item);
      } catch {
        usedTokens = [];
      }
    }

    const currentStamps = get().earnedStampIds;
    const result = evaluateTokenValidation(rawToken, usedTokens, currentStamps);

    if (!result.success) {
      return { success: false, message: result.message };
    }

    if (result.updatedUsedTokens && typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem('secomp2026_used_tokens', JSON.stringify(result.updatedUsedTokens));
      } catch {}
    }

    if (result.nextStampId) {
      const updated = [...currentStamps, result.nextStampId];
      const count = updated.length;
      set({
        earnedStampIds: updated,
        stampsCount: count,
        currentLevel: getMasteryLevel(count),
      });
      return {
        success: true,
        message: `Carimbo computado com sucesso! Nível atual: ${getMasteryLevel(count).name}.`,
      };
    }

    return {
      success: true,
      message: result.message,
    };
  },
});
