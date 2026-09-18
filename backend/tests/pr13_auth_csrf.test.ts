import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildServer } from '../src/server.js';
import { RegisterUserSchema, ALLOWED_EMAIL_DOMAINS } from '../src/schemas/contracts.schema.js';
import { generateCsrfToken, CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from '../src/middlewares/csrfGuard.js';
import { roleGuard } from '../src/middlewares/roleGuard.js';

describe('PR-13: Auth Gate v3.0, Zod Domínios, PIN, RA, CSRF Guard & Anti-Enumeração', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildServer();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Validação Zod RegisterUserSchema v3.0', () => {
    it('deve aprovar cadastro de aluno com nomeLocal, domínio @alunos e RA aXXXXXXX', () => {
      const payload = {
        nameLocal: 'rai.moratto',
        domain: '@alunos.utfpr.edu.br',
        pin: '123456',
        fullName: 'Rai Moratto',
        ra: 'a2489120',
      };

      const result = RegisterUserSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar cadastro com domínio fora da lista de 7 autorizados', () => {
      const payload = {
        nameLocal: 'usuario.hacker',
        domain: '@malicious.com' as any,
        pin: '123456',
        fullName: 'Hacker da Silva',
      };

      const result = RegisterUserSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar cadastro de aluno @alunos.utfpr.edu.br com RA sem prefixo "a"', () => {
      const payload = {
        nameLocal: 'joao.silva',
        domain: '@alunos.utfpr.edu.br',
        pin: '654321',
        fullName: 'João Silva',
        ra: '2489120', // Sem o 'a'
      };

      const result = RegisterUserSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it('deve aprovar visitante com @proton.me sem necessidade de preencher RA', () => {
      const payload = {
        nameLocal: 'security.dev',
        domain: '@proton.me',
        pin: '112233',
        fullName: 'Security Researcher',
      };

      const result = RegisterUserSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar senha PIN que não possua exatamente 6 dígitos numéricos', () => {
      const payload = {
        nameLocal: 'aluno.teste',
        domain: '@gmail.com',
        pin: '12345', // Apenas 5 dígitos
        fullName: 'Aluno Teste',
      };

      const result = RegisterUserSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe('Anti-Enumeração OWASP A01 no /chameguinho', () => {
    it('deve retornar HTTP 404 Not Found para requisição anônima (sem cookie admin)', async () => {
      const fastify = (await import('fastify')).default();
      fastify.get('/api/v1/chameguinho/test-protected', {
        preHandler: [roleGuard('ADMIN', 'STAFF')],
      }, async () => ({ ok: true }));

      const res = await fastify.inject({
        method: 'GET',
        url: '/api/v1/chameguinho/test-protected',
      });

      expect(res.statusCode).toBe(404);
      expect(JSON.parse(res.payload).error).toBe('NOT_FOUND');
      await fastify.close();
    });
  });

  describe('CSRF Guard — Double Submit Cookie Pattern', () => {
    it('deve gerar token CSRF válido com 64 caracteres hexadecimais', () => {
      const token = generateCsrfToken();
      expect(token).toBeTypeOf('string');
      expect(token.length).toBe(64);
    });

    it('deve emitir cookie __csrf no endpoint GET /api/v1/auth/csrf-token', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/auth/csrf-token',
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.csrfToken).toBeDefined();

      const setCookie = res.headers['set-cookie'];
      expect(setCookie).toBeDefined();
      expect(String(setCookie)).toContain(CSRF_COOKIE_NAME);
    });
  });
});
