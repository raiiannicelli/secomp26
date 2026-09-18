import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '../../src/stores/useUIStore';

describe('Navegação em Abas Separadas — Evento, Passaporte e Programação', () => {
  beforeEach(() => {
    useUIStore.getState().setActiveTab('EVENTO');
  });

  it('deve inicializar na aba EVENTO por padrão', () => {
    expect(useUIStore.getState().activeTab).toBe('EVENTO');
  });

  it('deve alternar para a aba PASSAPORTE ao chamar setActiveTab', () => {
    useUIStore.getState().setActiveTab('PASSAPORTE');
    expect(useUIStore.getState().activeTab).toBe('PASSAPORTE');
  });

  it('deve alternar para a aba PROGRAMACAO ao chamar setActiveTab', () => {
    useUIStore.getState().setActiveTab('PROGRAMACAO');
    expect(useUIStore.getState().activeTab).toBe('PROGRAMACAO');
  });

  it('deve conseguir retornar para a aba EVENTO a partir de qualquer aba', () => {
    useUIStore.getState().setActiveTab('PROGRAMACAO');
    expect(useUIStore.getState().activeTab).toBe('PROGRAMACAO');

    useUIStore.getState().setActiveTab('EVENTO');
    expect(useUIStore.getState().activeTab).toBe('EVENTO');

    useUIStore.getState().setActiveTab('PASSAPORTE');
    expect(useUIStore.getState().activeTab).toBe('PASSAPORTE');

    useUIStore.getState().setActiveTab('EVENTO');
    expect(useUIStore.getState().activeTab).toBe('EVENTO');
  });
});
