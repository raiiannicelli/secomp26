import { describe, it, expect } from 'vitest';

export function calculateMastery(stamps: number) {
  if (stamps >= 10) return { code: 'MESTRE', name: 'Mestre da SECOMP', color: '#fcd535', eligibleForDraw: true };
  if (stamps >= 8) return { code: 'INICIADO', name: 'Iniciado', color: '#8a3ffc', eligibleForDraw: true };
  if (stamps >= 7) return { code: 'ADEPTO', name: 'Adepto (Elegível ao Sorteio)', color: '#0ecb81', eligibleForDraw: true };
  if (stamps >= 5) return { code: 'GRADUADO', name: 'Graduado', color: '#2dbdb6', eligibleForDraw: false };
  if (stamps >= 3) return { code: 'APRENDIZ', name: 'Aprendiz', color: '#3b82f6', eligibleForDraw: false };
  return { code: 'NOVATO', name: 'Novato', color: '#707a8a', eligibleForDraw: false };
}

export function anonymizeName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1][0]?.toUpperCase() || '';
  return `${firstName} ${lastInitial}.`;
}

describe('Gamification — Passaporte 2.0 & Níveis de Maestria', () => {
  describe('Cálculo de Níveis de Maestria da SECOMP', () => {
    it('deve classificar 0 a 2 carimbos como Novato e inelegível para o sorteio', () => {
      const level0 = calculateMastery(0);
      expect(level0.code).toBe('NOVATO');
      expect(level0.eligibleForDraw).toBe(false);

      const level2 = calculateMastery(2);
      expect(level2.code).toBe('NOVATO');
      expect(level2.eligibleForDraw).toBe(false);
    });

    it('deve classificar 3 a 4 carimbos como Aprendiz', () => {
      const level3 = calculateMastery(3);
      expect(level3.code).toBe('APRENDIZ');
      expect(level3.eligibleForDraw).toBe(false);

      const level4 = calculateMastery(4);
      expect(level4.code).toBe('APRENDIZ');
    });

    it('deve classificar 5 a 6 carimbos como Graduado', () => {
      const level5 = calculateMastery(5);
      expect(level5.code).toBe('GRADUADO');
      expect(level5.eligibleForDraw).toBe(false);
    });

    it('deve ativar o badge "Adepto" e a flag eligible_for_draw ao atingir 7 carimbos (Meta do Sorteio)', () => {
      const level7 = calculateMastery(7);
      expect(level7.code).toBe('ADEPTO');
      expect(level7.eligibleForDraw).toBe(true);
    });

    it('deve classificar 8 a 9 carimbos como Iniciado', () => {
      const level8 = calculateMastery(8);
      expect(level8.code).toBe('INICIADO');
      expect(level8.eligibleForDraw).toBe(true);
    });

    it('deve classificar 10 ou mais carimbos como Mestre da SECOMP', () => {
      const level10 = calculateMastery(10);
      expect(level10.code).toBe('MESTRE');
      expect(level10.eligibleForDraw).toBe(true);

      const level15 = calculateMastery(15);
      expect(level15.code).toBe('MESTRE');
      expect(level15.eligibleForDraw).toBe(true);
    });
  });

  describe('Privacidade LGPD no Ranking (Leaderboard)', () => {
    it('deve anonimizar nomes completos com o padrão "PrimeiroNome U."', () => {
      expect(anonymizeName('Rai Moratto')).toBe('Rai M.');
      expect(anonymizeName('Carlos Eduardo da Silva')).toBe('Carlos S.');
      expect(anonymizeName('Eloah Bueno')).toBe('Eloah B.');
      expect(anonymizeName('Gustavo')).toBe('Gustavo');
    });
  });
});
