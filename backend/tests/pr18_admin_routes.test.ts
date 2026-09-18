import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildServer } from '../src/server.js';
import { generateAuthToken } from '../src/middlewares/authGuard.js';
import { generateOTT, validateTokenFormat, SAFE_CHARSET } from '../src/services/tokenService.js';
import { publishAdminEvent, onAdminEvent, AdminRealtimeEvent } from '../src/lib/supabaseAdmin.js';
import { prisma } from '../src/lib/prisma.js';

describe('PR-18: Admin Routes, Mini-CMS, Token OTT v2 & Supabase Realtime Publisher', () => {
  let app: FastifyInstance;
  let adminToken: string;
  let studentToken: string;
  let staffToken: string;
  let unauthorizedAdminToken: string;
  const testActivityId = 'activity-test-uuid';

  beforeAll(async () => {
    // Configura mocks herméticos do Prisma para testes sem dependência de BD externo
    vi.spyOn(prisma.activity, 'findUnique').mockResolvedValue({
      id: testActivityId,
      title: 'Palestra Teste Automatizado',
      description: 'Descricao teste',
      speakerName: 'Dr. Teste',
      turn: 'NIGHT',
      theme: 'TECHNOLOGY',
      dayIndex: 1,
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 3600000),
      location: 'Auditório Principal',
      maxSeats: 100,
      allocatedSeats: 10,
    } as any);

    vi.spyOn(prisma.user, 'count').mockResolvedValue(1);
    vi.spyOn(prisma.user, 'findMany').mockResolvedValue([
      {
        id: 'rai-admin-uuid',
        email: 'raimorato@alunos.utfpr.edu.br',
        fullName: 'Rai Moratto',
        role: 'ADMIN',
        raHash: 'somehash',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: {
          attendanceRecords: 8,
          preEnrollments: 3,
        },
      },
    ] as any);

    vi.spyOn(prisma.attendanceSession, 'create').mockImplementation(async (args: any) => ({
      id: 'session-created-123',
      ...args.data,
      openedAt: new Date(),
      expiresAt: args.data.expiresAt,
    } as any));

    vi.spyOn(prisma.attendanceSession, 'findMany').mockResolvedValue([
      {
        id: 'session-created-123',
        activityId: testActivityId,
        tokenHash: 'hash',
        durationMinutes: 15,
        isActive: true,
        openedAt: new Date(),
        expiresAt: new Date(Date.now() + 900000),
        createdBy: 'rai-admin-uuid',
        activity: {
          id: testActivityId,
          title: 'Palestra Teste Automatizado',
          speakerName: 'Dr. Teste',
          turn: 'NIGHT',
        },
        _count: { records: 4 },
      },
    ] as any);

    vi.spyOn(prisma.attendanceSession, 'findUnique').mockResolvedValue({
      id: 'session-created-123',
      activityId: testActivityId,
      isActive: true,
    } as any);

    vi.spyOn(prisma.attendanceSession, 'update').mockResolvedValue({
      id: 'session-created-123',
      isActive: false,
    } as any);

    vi.spyOn(prisma.cmsContent, 'upsert').mockImplementation(async (args: any) => ({
      id: 'cms-123',
      key: args.where.key,
      value: args.update.value,
      updatedBy: args.update.updatedBy,
      updatedAt: new Date(),
    } as any));

    vi.spyOn(prisma.cmsContent, 'findUnique').mockImplementation(async (args: any) => {
      if (args.where.key === 'shark_pitches') {
        return {
          id: 'cms-123',
          key: 'shark_pitches',
          value: { activeRound: 'ROUND_1', votingEnabled: true },
          updatedBy: 'rai-admin-uuid',
          updatedAt: new Date(),
        } as any;
      }
      return null;
    });

    vi.spyOn(prisma.preEnrollment, 'count').mockResolvedValue(1);
    vi.spyOn(prisma.preEnrollment, 'findMany').mockResolvedValue([
      {
        id: 'enroll-1',
        activityId: testActivityId,
        userId: 'rai-admin-uuid',
        createdAt: new Date(),
        user: { id: 'rai-admin-uuid', fullName: 'Rai Moratto', email: 'raimorato@alunos.utfpr.edu.br', role: 'ADMIN' },
        activity: { id: testActivityId, title: 'Palestra Teste', turn: 'NIGHT', maxSeats: 100, allocatedSeats: 1 },
      },
    ] as any);

    vi.spyOn(prisma.attendanceRecord, 'count').mockResolvedValue(1);
    vi.spyOn(prisma.attendanceRecord, 'findMany').mockResolvedValue([
      {
        id: 'rec-1',
        userId: 'rai-admin-uuid',
        activityId: testActivityId,
        sessionId: 'session-created-123',
        createdAt: new Date(),
        user: { id: 'rai-admin-uuid', fullName: 'Rai Moratto', email: 'raimorato@alunos.utfpr.edu.br' },
        activity: { id: testActivityId, title: 'Palestra Teste', theme: 'TECHNOLOGY' },
      },
    ] as any);

    vi.spyOn(prisma.sharkPitch, 'findMany').mockResolvedValue([
      {
        id: 'pitch-1',
        startupName: 'SafeVault AI',
        pitchOrder: 1,
        voteCount: 42,
        _count: { votes: 42 },
      },
    ] as any);

    vi.spyOn(prisma.sharkVote, 'findMany').mockResolvedValue([
      {
        id: 'vote-1',
        createdAt: new Date(),
        pitch: { id: 'pitch-1', startupName: 'SafeVault AI' },
        user: { id: 'rai-admin-uuid', email: 'raimorato@alunos.utfpr.edu.br' },
      },
    ] as any);

    app = await buildServer();
    await app.ready();

    // Cria tokens JWT para testes de autorização
    adminToken = generateAuthToken({
      userId: 'rai-admin-uuid',
      role: 'ADMIN',
      email: 'raimorato@alunos.utfpr.edu.br',
    });

    studentToken = generateAuthToken({
      userId: 'student-uuid',
      role: 'STUDENT',
      email: 'aluno@alunos.utfpr.edu.br',
    });

    staffToken = generateAuthToken({
      userId: 'staff-uuid',
      role: 'STAFF',
      email: 'staff@utfpr.edu.br',
    });

    unauthorizedAdminToken = generateAuthToken({
      userId: 'other-user-uuid',
      role: 'ADMIN',
      email: 'outro.admin@empresa.com',
    });
  });

  afterAll(async () => {
    vi.restoreAllMocks();
    await app.close();
  });

  describe('1. Token OTT v2 Generator & Safe Charset (Anti-Ambiguidade)', () => {
    it('deve conter 32 caracteres seguros no SAFE_CHARSET sem 0, O, 1, I', () => {
      expect(SAFE_CHARSET).not.toContain('0');
      expect(SAFE_CHARSET).not.toContain('O');
      expect(SAFE_CHARSET).not.toContain('1');
      expect(SAFE_CHARSET).not.toContain('I');
      expect(SAFE_CHARSET.length).toBe(32);
    });

    it('deve gerar token no formato canônico SEC-[CAT]-[XXX] sem caracteres 0, O, 1, I', () => {
      for (let i = 0; i < 50; i++) {
        const ott = generateOTT('IA');
        expect(ott.token).toMatch(/^SEC-IA-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{3}$/);
        const code = ott.token.split('-')[2];
        expect(code).not.toMatch(/[01OI]/);
        expect(ott.expiresAt.getTime()).toBeGreaterThan(Date.now());
      }
    });

    it('deve validar tokens canônicos corretamente e rejeitar caracteres ambíguos', () => {
      const valid = validateTokenFormat('SEC-IA-A3K');
      expect(valid.valid).toBe(true);
      expect(valid.category).toBe('IA');
      expect(valid.code).toBe('A3K');

      const invalidWithZero = validateTokenFormat('SEC-IA-A0K');
      expect(invalidWithZero.valid).toBe(false);

      const invalidWithO = validateTokenFormat('SEC-IA-AOK');
      expect(invalidWithO.valid).toBe(false);

      const invalidWithOne = validateTokenFormat('SEC-IA-A1K');
      expect(invalidWithOne.valid).toBe(false);

      const invalidWithI = validateTokenFormat('SEC-IA-AIK');
      expect(invalidWithI.valid).toBe(false);
    });
  });

  describe('2. Anti-Enumeração OWASP A01 & RBAC nos Endpoints Admin', () => {
    it('GET /api/v1/admin/users sem cookie/token deve retornar 404 Not Found (não 401)', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/users',
      });

      expect(res.statusCode).toBe(404);
      const json = JSON.parse(res.payload);
      expect(json.error).toBe('NOT_FOUND');
    });

    it('GET /api/v1/admin/users com role STUDENT deve retornar 403 Forbidden', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/users',
        headers: { authorization: `Bearer ${studentToken}` },
      });

      expect(res.statusCode).toBe(403);
      const json = JSON.parse(res.payload);
      expect(json.error).toBe('FORBIDDEN');
    });

    it('GET /api/v1/admin/users com raimorato@alunos.utfpr.edu.br deve responder 200 OK', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/users',
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(Array.isArray(json.users)).toBe(true);
      expect(typeof json.total).toBe('number');
    });
  });

  describe('3. Ciclo de Vida de Sessão OTT (POST /sessions/open & DELETE /sessions/:id)', () => {
    let createdSessionId: string;

    it('POST /api/v1/admin/sessions/open deve abrir sessão com token no formato SEC-IA-XXX', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/sessions/open',
        headers: { authorization: `Bearer ${adminToken}` },
        payload: {
          activityId: testActivityId,
          category: 'IA',
          durationMinutes: 15,
        },
      });

      expect(res.statusCode).toBe(201);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);
      expect(json.sessionId).toBeDefined();
      expect(json.token).toMatch(/^SEC-IA-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{3}$/);
      const tokenCode = json.token.split('-')[2];
      expect(tokenCode).not.toMatch(/[01OI]/);

      createdSessionId = json.sessionId;
    });

    it('GET /api/v1/admin/sessions/active deve listar sessões ativas', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/sessions/active',
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.count).toBeGreaterThanOrEqual(1);
      const found = json.sessions.find((s: any) => s.id === 'session-created-123');
      expect(found).toBeDefined();
    });

    it('DELETE /api/v1/admin/sessions/:id deve revogar a sessão antes do TTL', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: `/api/v1/admin/sessions/${createdSessionId || 'session-created-123'}`,
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);
    });
  });

  describe('4. Mini-CMS Endpoints (GET & PUT /cms/:key)', () => {
    it('PUT /api/v1/admin/cms/shark_pitches com role STAFF deve retornar 403 Forbidden', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: '/api/v1/admin/cms/shark_pitches',
        headers: { authorization: `Bearer ${staffToken}` },
        payload: {
          value: { votingEnabled: false },
        },
      });

      expect(res.statusCode).toBe(403);
      const json = JSON.parse(res.payload);
      expect(json.error).toBe('FORBIDDEN');
    });

    it('PUT /api/v1/admin/cms/shark_pitches com role ADMIN deve atualizar com sucesso', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: '/api/v1/admin/cms/shark_pitches',
        headers: { authorization: `Bearer ${adminToken}` },
        payload: {
          value: { votingEnabled: true, activeRound: 'ROUND_1' },
        },
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);
      expect(json.key).toBe('shark_pitches');
      expect(json.value.votingEnabled).toBe(true);
    });

    it('GET /api/v1/admin/cms/shark_pitches deve retornar o valor configurado', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/cms/shark_pitches',
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.key).toBe('shark_pitches');
      expect(json.value.activeRound).toBe('ROUND_1');
    });
  });

  describe('5. Telemetria e Consultas de Gestão (/enrollments, /stamps, /votes)', () => {
    it('GET /api/v1/admin/enrollments deve retornar listagem estruturada', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/enrollments',
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(Array.isArray(json.enrollments)).toBe(true);
      expect(typeof json.total).toBe('number');
    });

    it('GET /api/v1/admin/stamps deve retornar histórico auditável de presenças', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/stamps',
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(Array.isArray(json.stamps)).toBe(true);
      expect(typeof json.total).toBe('number');
    });

    it('GET /api/v1/admin/votes deve retornar consolidação de votos do Shark Tank', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/votes',
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(typeof json.totalVotes).toBe('number');
      expect(Array.isArray(json.pitches)).toBe(true);
      expect(Array.isArray(json.recentVotes)).toBe(true);
    });
  });

  describe('6. Supabase Realtime Event Bus & Despacho em ≤ 500ms', () => {
    it('deve despachar evento STAMP_ADDED aos ouvintes em menos de 500ms', async () => {
      let receivedEvent: AdminRealtimeEvent | null = null;

      const unsubscribe = onAdminEvent((event) => {
        if (event.type === 'STAMP_ADDED') {
          receivedEvent = event;
        }
      });

      const startTime = Date.now();
      await publishAdminEvent({
        type: 'STAMP_ADDED',
        payload: {
          userId: 'test-user-id',
          activityId: testActivityId,
          newLevel: 'Adepto',
        },
      });
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThanOrEqual(500);
      expect(receivedEvent).not.toBeNull();
      expect(receivedEvent?.payload.newLevel).toBe('Adepto');

      unsubscribe();
    });
  });
});
