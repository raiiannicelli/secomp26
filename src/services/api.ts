/**
 * SECOMP 2026 — API Client & Contract Isolation Layer
 * Permite que o Frontend funcione de forma 100% autônoma com fallbacks mock
 * e se conecte imediatamente aos endpoints reais do backend quando disponíveis.
 */

export interface ActivityDTO {
  id: string;
  title: string;
  description: string;
  speakerName: string;
  speakerBio?: string;
  speakerCompany?: string;
  turn: 'MORNING' | 'AFTERNOON' | 'NIGHT';
  theme: 'TECHNOLOGY' | 'MANAGEMENT' | 'INNOVATION' | 'CAREER';
  track: 'DATA_AI' | 'INFRA_SECURITY' | 'HARDWARE_IOT' | 'DEV_UI' | 'GENERAL';
  dayIndex: number;
  isWarmup: boolean;
  startsAt: string;
  endsAt: string;
  location: string;
  maxSeats: number;
  allocatedSeats: number;
  isEnrolled?: boolean;
}

export interface MasteryLevel {
  code: 'NOVATO' | 'APRENDIZ' | 'GRADUADO' | 'ADEPTO' | 'INICIADO' | 'MESTRE';
  name: string;
  color: string;
  minStamps: number;
}

export const MASTERY_LEVELS: MasteryLevel[] = [
  { code: 'NOVATO', name: 'Novato', color: '#707a8a', minStamps: 1 },
  { code: 'APRENDIZ', name: 'Aprendiz', color: '#b7bdc6', minStamps: 3 },
  { code: 'GRADUADO', name: 'Graduado', color: '#eaecef', minStamps: 5 },
  { code: 'ADEPTO', name: 'Adepto (Certificação Plena)', color: '#0ecb81', minStamps: 7 },
  { code: 'INICIADO', name: 'Iniciado', color: '#f0b90b', minStamps: 8 },
  { code: 'MESTRE', name: 'Mestre da SECOMP', color: '#fcd535', minStamps: 10 },
];

export function getMasteryLevel(stamps: number): MasteryLevel {
  if (stamps >= 10) return MASTERY_LEVELS[5];
  if (stamps >= 8) return MASTERY_LEVELS[4];
  if (stamps >= 7) return MASTERY_LEVELS[3];
  if (stamps >= 5) return MASTERY_LEVELS[2];
  if (stamps >= 3) return MASTERY_LEVELS[1];
  return MASTERY_LEVELS[0];
}

// Client Storage Helper para persistência mock offline
const STORAGE_PREFIX = 'secomp2026_';

export function getLocalData<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

export function setLocalData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {}
}
