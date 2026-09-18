import { describe, it, expect, beforeEach } from 'vitest';
import { validateTokenFormat, evaluateTokenValidation } from '../../src/stores/tokenService';
import { createNavigationSlice } from '../../src/stores/slices/navigationSlice';
import { createGamificationSlice } from '../../src/stores/slices/gamificationSlice';
import { createEnrollmentSlice } from '../../src/stores/slices/enrollmentSlice';
import { createUISlice } from '../../src/stores/slices/uiSlice';
import { useUIStore } from '../../src/stores/useUIStore';
import { create } from 'zustand';

describe('PR-14: tokenService — Lógica Pura OTT', () => {
  it('deve aceitar e normalizar token formato v3 (ex: SEC-IA-A3K)', () => {
    const res = validateTokenFormat('sec-ia-a3k');
    expect(res.valid).toBe(true);
    expect(res.normalized).toBe('SEC-IA-A3K');
    expect(res.category).toBe('IA');
  });

  it('deve aceitar token formato legado (ex: SEC-942)', () => {
    const res = validateTokenFormat('sec-942');
    expect(res.valid).toBe(true);
    expect(res.normalized).toBe('SEC-942');
    expect(res.category).toBe('GERAL');
  });

  it('deve rejeitar tokens que não comecem com SEC-', () => {
    const res = validateTokenFormat('TOKEN-123');
    expect(res.valid).toBe(false);
    expect(res.error).toContain('SEC-');
  });

  it('deve rejeitar tokens com caracteres especiais ou formatação inválida', () => {
    const res = validateTokenFormat('SEC-@@@-###');
    expect(res.valid).toBe(false);
  });

  it('deve detectar replay de token já utilizado em evaluateTokenValidation', () => {
    const used = ['SEC-IA-001', 'SEC-942'];
    const res = evaluateTokenValidation('SEC-IA-001', used, [1, 2]);
    expect(res.success).toBe(false);
    expect(res.message).toContain('já foi utilizado');
  });

  it('deve conceder carimbo e retornar lista atualizada para token válido', () => {
    const used = ['SEC-IA-001'];
    const currentStamps = [1, 2, 3];
    const res = evaluateTokenValidation('SEC-DEV-999', used, currentStamps);
    expect(res.success).toBe(true);
    expect(res.nextStampId).toBe(4);
    expect(res.updatedUsedTokens).toEqual(['SEC-IA-001', 'SEC-DEV-999']);
  });
});

describe('PR-14: Isolamento de Slices (Independent Stores)', () => {
  it('NavigationSlice deve operar de forma isolada', () => {
    const useNav = create(createNavigationSlice);
    expect(useNav.getState().activeTab).toBeDefined();
    useNav.getState().setActiveTab('PASSAPORTE');
    expect(useNav.getState().activeTab).toBe('PASSAPORTE');
    useNav.getState().setSelectedTurn('MORNING');
    expect(useNav.getState().selectedTurn).toBe('MORNING');
  });

  it('GamificationSlice deve operar de forma isolada e computar níveis', () => {
    const useGam = create(createGamificationSlice);
    const initialCount = useGam.getState().stampsCount;
    expect(initialCount).toBe(4);
    useGam.getState().addStamp(99);
    expect(useGam.getState().earnedStampIds).toContain(99);
    expect(useGam.getState().stampsCount).toBe(5);
    expect(useGam.getState().currentLevel.code).toBe('GRADUADO');
  });

  it('EnrollmentSlice deve operar de forma isolada e prevenir duplicatas', () => {
    const useEnroll = create(createEnrollmentSlice);
    expect(useEnroll.getState().enrolledActivities).toEqual([]);
    useEnroll.getState().enrollInActivity('workshop-ia');
    useEnroll.getState().enrollInActivity('workshop-ia'); // duplicata ignorada
    expect(useEnroll.getState().enrolledActivities).toEqual(['workshop-ia']);

    // Voto Shark Tank
    expect(useEnroll.getState().votedPitchId).toBeNull();
    useEnroll.getState().castSharkVote('pitch-01');
    useEnroll.getState().castSharkVote('pitch-02'); // segundo voto ignorado
    expect(useEnroll.getState().votedPitchId).toBe('pitch-01');
  });

  it('UISlice deve operar de forma isolada e gerenciar modais e profile', () => {
    const useUI = create(createUISlice);
    expect(useUI.getState().isEnrollModalOpen).toBe(false);
    useUI.getState().openEnrollModal('Oficina Docker');
    expect(useUI.getState().isEnrollModalOpen).toBe(true);
    expect(useUI.getState().selectedWorkshopForEnroll).toBe('Oficina Docker');
    useUI.getState().closeEnrollModal();
    expect(useUI.getState().isEnrollModalOpen).toBe(false);
    expect(useUI.getState().selectedWorkshopForEnroll).toBeNull();

    useUI.getState().setUser({ name: 'Maria Silva', email: 'maria@gmail.com' });
    expect(useUI.getState().user.name).toBe('Maria Silva');
  });
});

describe('PR-14: Combined useUIStore Integrado', () => {
  it('deve exportar todos os seletores e métodos combinados', () => {
    const state = useUIStore.getState();
    expect(typeof state.setActiveTab).toBe('function');
    expect(typeof state.addStamp).toBe('function');
    expect(typeof state.enrollInActivity).toBe('function');
    expect(typeof state.openEnrollModal).toBe('function');
    expect(typeof state.validateOneTimeToken).toBe('function');
    expect(state.user).toBeDefined();
  });
});
