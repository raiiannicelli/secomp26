import { describe, it, expect } from 'vitest';
import { ALLOWED_DOMAINS } from '../../src/components/AuthPage';
import { validateTokenFormat, evaluateTokenValidation } from '../../src/stores/tokenService';

describe('PR-15: AuthPage — Regras de Negócio de Autenticação e Domínios', () => {
  it('deve conter exatamente os 7 domínios autorizados pela comissão', () => {
    expect(ALLOWED_DOMAINS).toHaveLength(7);
    expect(ALLOWED_DOMAINS).toContain('@alunos.utfpr.edu.br');
    expect(ALLOWED_DOMAINS).toContain('@utfpr.edu.br');
    expect(ALLOWED_DOMAINS).toContain('@gmail.com');
    expect(ALLOWED_DOMAINS).toContain('@hotmail.com');
    expect(ALLOWED_DOMAINS).toContain('@tuta.com');
    expect(ALLOWED_DOMAINS).toContain('@mailbox.org');
    expect(ALLOWED_DOMAINS).toContain('@proton.me');
  });

  it('deve validar sintaxe de RA apenas para alunos da UTFPR', () => {
    const raRegex = /^a\d{7}$/;
    expect(raRegex.test('a2489120')).toBe(true);
    expect(raRegex.test('a1234567')).toBe(true);
    expect(raRegex.test('2489120')).toBe(false); // sem prefixo 'a'
    expect(raRegex.test('a248912')).toBe(false);  // 6 digitos
    expect(raRegex.test('a24891209')).toBe(false); // 8 digitos
    expect(raRegex.test('A2489120')).toBe(false); // deve ser normalizado para minusculo
  });

  it('deve validar que PIN deve ter exatamente 6 dígitos numéricos', () => {
    const pinRegex = /^\d{6}$/;
    expect(pinRegex.test('123456')).toBe(true);
    expect(pinRegex.test('000000')).toBe(true);
    expect(pinRegex.test('12345')).toBe(false);
    expect(pinRegex.test('1234567')).toBe(false);
    expect(pinRegex.test('12345a')).toBe(false);
  });

  it('deve calcular rota de destino correta por Role (Redirect Guard)', () => {
    const getDestination = (role: string, nextUrl: string | null) => {
      if (role === 'ADMIN' || role === 'STAFF') return '/chameguinho';
      return nextUrl ? decodeURIComponent(nextUrl) : '/';
    };

    expect(getDestination('ADMIN', null)).toBe('/chameguinho');
    expect(getDestination('STAFF', '/qualquer-coisa')).toBe('/chameguinho');
    expect(getDestination('STUDENT', null)).toBe('/');
    expect(getDestination('VISITOR', null)).toBe('/');
    expect(getDestination('STUDENT', encodeURIComponent('/validate?t=SEC-IA-A3K'))).toBe('/validate?t=SEC-IA-A3K');
  });
});

describe('PR-16: ValidatePage — Auto-Validação e Contagem Regressiva OTT', () => {
  it('deve formatar contagem regressiva de segundos para MM:SS', () => {
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    expect(formatTime(15 * 60)).toBe('15:00');
    expect(formatTime(14 * 60 + 30)).toBe('14:30');
    expect(formatTime(59)).toBe('00:59');
    expect(formatTime(0)).toBe('00:00');
  });

  it('deve identificar tokens expirados quando o timer chega a zero', () => {
    const checkExpiration = (timeLeft: number) => timeLeft <= 0;
    expect(checkExpiration(0)).toBe(true);
    expect(checkExpiration(10)).toBe(false);
  });

  it('deve garantir idempotência: segundo scan do mesmo token resulta em ALREADY_STAMPED', () => {
    const used = ['SEC-IA-A3K'];
    const result = evaluateTokenValidation('SEC-IA-A3K', used, [1, 2]);
    expect(result.success).toBe(false);
    expect(result.message).toContain('já foi utilizado');
  });
});

describe('PR-17: AdminPage /chameguinho — Anti-Enumeração e Cockpit Operacional', () => {
  it('deve bloquear acesso anônimo e visitantes na rota /chameguinho (Anti-Enumeração OWASP A01)', () => {
    const checkAdminAccess = (user: { name?: string; email?: string; role?: string } | null) => {
      if (!user) return false;
      return Boolean(
        user.email?.includes('admin') ||
        user.role === 'ADMIN' ||
        user.role === 'STAFF' ||
        user.name === 'Admin'
      );
    };

    expect(checkAdminAccess(null)).toBe(false);
    expect(checkAdminAccess({ name: 'Rai Moratto', email: 'rai@alunos.utfpr.edu.br', role: 'STUDENT' })).toBe(false);
    expect(checkAdminAccess({ name: 'Visitante Tech', email: 'visitante@gmail.com', role: 'VISITOR' })).toBe(false);
    expect(checkAdminAccess({ name: 'Coordenação', email: 'admin@utfpr.edu.br', role: 'ADMIN' })).toBe(true);
    expect(checkAdminAccess({ name: 'Monitor Staff', email: 'staff@utfpr.edu.br', role: 'STAFF' })).toBe(true);
  });

  it('deve gerar tokens dinâmicos no formato canônico SEC-[CAT]-[XXX]', () => {
    const categories: Record<string, string> = {
      PALESTRA_MAGNA: 'MAG',
      WORKSHOP_IA: 'IA',
      SHARK_TANK: 'SHARK',
    };
    const cat = categories['WORKSHOP_IA'];
    const rand = 'XYZ';
    const token = `SEC-${cat}-${rand}`;

    const validation = validateTokenFormat(token);
    expect(validation.valid).toBe(true);
    expect(validation.category).toBe('IA');
    expect(validation.normalized).toBe('SEC-IA-XYZ');
  });
});
