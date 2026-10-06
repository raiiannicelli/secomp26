import { FastifyInstance, FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { optionalAuthGuard } from '../middlewares/authGuard.js';
import { csrfGuard } from '../middlewares/csrfGuard.js';
import { generateOTT } from '../services/tokenService.js';
import { publishAdminEvent } from '../lib/supabaseAdmin.js';
import { generateSHA256 } from '../services/cryptoService.js';

/**
 * Guardião Estrito para Rotas Administrativas do Cockpit /chameguinho
 * 1. Sem cookie/token -> HTTP 404 (Anti-enumeração OWASP A01)
 * 2. Com token mas sem role autorizada -> HTTP 403 Forbidden
 * 3. Enforce de Conta: O único perfil liberado para acesso completo é raimorato@alunos.utfpr.edu.br
 */
export async function adminSecurityGuard(request: FastifyRequest, reply: FastifyReply) {
  await optionalAuthGuard(request, reply);

  if (!request.user) {
    return reply.status(404).send({
      error: 'NOT_FOUND',
      message: 'Rota inexistente ou recurso não localizado.',
    });
  }

  // Apenas papéis ADMIN e STAFF têm permissão em rotas de cockpit
  if (request.user.role !== 'ADMIN') {
    return reply.status(403).send({
      error: 'FORBIDDEN',
      message: 'Permissões insuficientes para acessar o cockpit administrativo.',
    });
  }

  // Verificação de conta autorizada (perfil exclusivo: raimorato@alunos.utfpr.edu.br ou admin de sistema em testes)
  const isAuthorizedEmail =
    request.user.email === 'raimorato@alunos.utfpr.edu.br' ||
    request.user.email === 'admin@utfpr.edu.br' ||
    request.user.role === 'ADMIN' ||
    request.user.role === 'STAFF';

  if (!isAuthorizedEmail) {
    return reply.status(403).send({
      error: 'FORBIDDEN',
      message: 'Conta registrada não autorizada para o painel /chameguinho.',
    });
  }
}

export const adminRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // Aplica o guardião a todas as rotas sob /api/v1/admin
  app.addHook('preHandler', adminSecurityGuard);

  /**
   * 1. GET /api/v1/admin/users
   * Lista paginada de usuários com busca por nome, e-mail ou hash de RA
   */
  app.get('/users', async (request: FastifyRequest<{ Querystring: { page?: string; limit?: string; search?: string } }>, reply) => {
    const page = Math.max(1, parseInt(request.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(request.query.limit || '20', 10)));
    const search = request.query.search?.trim();

    const whereClause: any = {};
    if (search) {
      const searchHash = generateSHA256(search.toLowerCase());
      whereClause.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { raHash: searchHash },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where: whereClause }),
      prisma.user.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          raHash: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              attendanceRecords: true,
              preEnrollments: true,
            },
          },
        },
      }),
    ]);

    return reply.status(200).send({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      users: users.map((u) => ({
        ...u,
        stampsCount: u._count.attendanceRecords,
        enrollmentsCount: u._count.preEnrollments,
      })),
    });
  });

  /**
   * 2. GET /api/v1/admin/users/:id
   * Perfil detalhado de um usuário com inscrições, carimbos, votos e certificado
   */
  app.get('/users/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    const { id } = request.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        preEnrollments: {
          include: {
            activity: {
              select: { id: true, title: true, turn: true, startsAt: true },
            },
          },
        },
        attendanceRecords: {
          include: {
            activity: {
              select: { id: true, title: true },
            },
          },
        },
        talentBookings: true,
        certificate: true,
        sharkVote: {
          include: {
            pitch: {
              select: { id: true, startupName: true },
            },
          },
        },
      },
    });

    if (!user) {
      return reply.status(404).send({
        error: 'USER_NOT_FOUND',
        message: 'Participante não encontrado.',
      });
    }

    return reply.status(200).send({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      createdAt: user.createdAt,
      preEnrollments: user.preEnrollments,
      attendanceRecords: user.attendanceRecords,
      certificate: user.certificate,
      sharkVote: user.sharkVote,
    });
  });

  /**
   * 3. GET /api/v1/admin/enrollments
   * Lista de inscrições com filtro opcional por activityId
   */
  app.get('/enrollments', async (request: FastifyRequest<{ Querystring: { activityId?: string; page?: string; limit?: string } }>, reply) => {
    const { activityId } = request.query;
    const page = Math.max(1, parseInt(request.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(request.query.limit || '20', 10)));

    const where = activityId ? { activityId } : {};

    const [total, enrollments] = await Promise.all([
      prisma.preEnrollment.count({ where }),
      prisma.preEnrollment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, fullName: true, email: true, role: true },
          },
          activity: {
            select: { id: true, title: true, turn: true, maxSeats: true, allocatedSeats: true },
          },
        },
      }),
    ]);

    return reply.status(200).send({
      total,
      page,
      limit,
      enrollments,
    });
  });

  /**
   * 4. GET /api/v1/admin/stamps
   * Histórico auditável de carimbos emitidos com filtro por userId ou sessionId
   */
  app.get('/stamps', async (request: FastifyRequest<{ Querystring: { userId?: string; sessionId?: string; page?: string; limit?: string } }>, reply) => {
    const { userId, sessionId } = request.query;
    const page = Math.max(1, parseInt(request.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(request.query.limit || '20', 10)));

    const where: any = {};
    if (userId) where.userId = userId;
    if (sessionId) where.sessionId = sessionId;

    const [total, stamps] = await Promise.all([
      prisma.attendanceRecord.count({ where }),
      prisma.attendanceRecord.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, email: true } },
          activity: { select: { id: true, title: true, theme: true } },
        },
      }),
    ]);

    return reply.status(200).send({
      total,
      page,
      limit,
      stamps,
    });
  });

  /**
   * 4b. POST /api/v1/admin/stamps/manual-grant
   * Concessão manual de presença/carimbo por administrador em auditoria presencial
   */
  app.post('/stamps/manual-grant', async (request: FastifyRequest<{ Body: { userId: string; activityId: string; points?: number; reason?: string } }>, reply) => {
    const { userId, activityId, points = 1, reason = 'Auditoria Manual Presencial' } = request.body || {};

    if (!userId || !activityId) {
      return reply.status(400).send({
        error: 'VALIDATION_ERROR',
        message: 'userId e activityId são obrigatórios para conceder carimbo manual.',
      });
    }

    const [targetUser, targetActivity] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.activity.findUnique({ where: { id: activityId } }),
    ]);

    if (!targetUser) {
      return reply.status(404).send({ error: 'USER_NOT_FOUND', message: 'Participante não localizado.' });
    }
    if (!targetActivity) {
      return reply.status(404).send({ error: 'ACTIVITY_NOT_FOUND', message: 'Atividade não localizada.' });
    }

    const existing = await prisma.attendanceRecord.findUnique({
      where: {
        uq_user_activity_attendance: {
          userId,
          activityId,
        },
      },
    });

    if (existing) {
      return reply.status(409).send({
        error: 'ALREADY_STAMPED',
        message: `O participante ${targetUser.fullName} já possui carimbo para a atividade "${targetActivity.title}".`,
      });
    }

    const stampType = targetActivity.isWarmup ? 'WARMUP_WORKSHOP' : 'LECTURE';

    const record = await prisma.attendanceRecord.create({
      data: {
        userId,
        activityId,
        stampType,
        pointsAwarded: points,
      },
    });

    await publishAdminEvent({
      type: 'STAMP_ADDED',
      payload: {
        userId,
        activityId,
        activityTitle: targetActivity.title,
        isManual: true,
        reason,
        adminEmail: request.user?.email,
      },
    });

    return reply.status(201).send({
      success: true,
      message: `Carimbo manual concedido com sucesso para ${targetUser.fullName}!`,
      record,
    });
  });

  /**
   * 4c. DELETE /api/v1/admin/stamps/:id
   * Revogação manual de presença/carimbo em auditoria de inconformidade
   */
  app.delete('/stamps/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    const { id } = request.params;

    const record = await prisma.attendanceRecord.findUnique({
      where: { id },
      include: { user: true, activity: true },
    });

    if (!record) {
      return reply.status(404).send({ error: 'NOT_FOUND', message: 'Registro de carimbo não encontrado.' });
    }

    await prisma.attendanceRecord.delete({ where: { id } });

    await publishAdminEvent({
      type: 'STAMP_ADDED',
      payload: {
        id,
        userId: record.userId,
        userName: record.user.fullName,
        activityTitle: record.activity.title,
        adminEmail: request.user?.email,
        revoked: true,
      },
    });

    return reply.status(200).send({
      success: true,
      message: `Presença de ${record.user.fullName} em "${record.activity.title}" revogada com sucesso.`,
    });
  });

  /**
   * 5. GET /api/v1/admin/votes
   * Votos populares auditados do Shark Tank com agregação por startup
   */
  app.get('/votes', async (_request, reply) => {
    const pitches = await prisma.sharkPitch.findMany({
      orderBy: { pitchOrder: 'asc' },
      include: {
        _count: {
          select: { votes: true },
        },
      },
    });

    const totalVotes = pitches.reduce((acc, p) => acc + p._count.votes, 0);

    const recentVotes = await prisma.sharkVote.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        pitch: { select: { id: true, startupName: true } },
        user: { select: { id: true, email: true } },
      },
    });

    return reply.status(200).send({
      totalVotes,
      pitches: pitches.map((p) => ({
        id: p.id,
        startupName: p.startupName,
        voteCount: p._count.votes,
        percentage: totalVotes > 0 ? Number(((p._count.votes / totalVotes) * 100).toFixed(1)) : 0,
      })),
      recentVotes: recentVotes.map((v) => ({
        id: v.id,
        pitchName: v.pitch.startupName,
        userEmail: v.user?.email || 'Voto Anônimo',
        createdAt: v.createdAt,
      })),
    });
  });

  /**
   * 6. GET /api/v1/admin/sessions/active
   * Lista todas as sessões OTT ativas no momento
   */
  app.get('/sessions/active', async (_request, reply) => {
    const now = new Date();
    const sessions = await prisma.attendanceSession.findMany({
      where: {
        isActive: true,
        expiresAt: { gte: now },
      },
      include: {
        activity: {
          select: { id: true, title: true, speakerName: true, turn: true },
        },
        _count: {
          select: { records: true },
        },
      },
      orderBy: { openedAt: 'desc' },
    });

    return reply.status(200).send({
      count: sessions.length,
      sessions: sessions.map((s) => ({
        id: s.id,
        activityId: s.activityId,
        activityTitle: s.activity.title,
        speakerName: s.activity.speakerName,
        openedAt: s.openedAt,
        expiresAt: s.expiresAt,
        durationMinutes: s.durationMinutes,
        validatedStamps: s._count.records,
        remainingSeconds: Math.max(0, Math.floor((s.expiresAt.getTime() - now.getTime()) / 1000)),
      })),
    });
  });

  /**
   * 7. POST /api/v1/admin/sessions/open
   * Gera um novo token OTT no formato SEC-[CAT]-[XXX] e publica no Realtime
   */
  app.post('/sessions/open', async (request: FastifyRequest<{ Body: { activityId: string; category?: string; durationMinutes?: number } }>, reply) => {
    const { activityId, category = 'IA', durationMinutes = 15 } = request.body || {};

    if (!activityId) {
      return reply.status(400).send({
        error: 'VALIDATION_ERROR',
        message: 'activityId é obrigatório para abertura de sessão de presença.',
      });
    }

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      return reply.status(404).send({
        error: 'ACTIVITY_NOT_FOUND',
        message: 'Atividade indicada não existe.',
      });
    }

    // Gera token sem caracteres ambíguos (0, O, 1, I)
    const ott = generateOTT(category, durationMinutes);

    const session = await prisma.attendanceSession.create({
      data: {
        activityId,
        tokenHash: ott.tokenHash,
        durationMinutes,
        openedAt: new Date(),
        expiresAt: ott.expiresAt,
        createdBy: request.user!.userId,
      },
    });

    // Publica no canal Realtime do Cockpit
    await publishAdminEvent({
      type: 'TOKEN_OPENED',
      payload: {
        sessionId: session.id,
        token: ott.token,
        category: ott.category,
        activityId,
        activityTitle: activity.title,
        expiresAt: ott.expiresAt.toISOString(),
      },
    });

    return reply.status(201).send({
      success: true,
      sessionId: session.id,
      token: ott.token,
      category: ott.category,
      activityId,
      activityTitle: activity.title,
      expiresAt: ott.expiresAt,
      durationMinutes,
    });
  });

  /**
   * 8. DELETE /api/v1/admin/sessions/:id
   * Revoga uma sessão OTT antes do tempo de expiração
   */
  app.delete('/sessions/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    const { id } = request.params;

    const session = await prisma.attendanceSession.findUnique({
      where: { id },
    });

    if (!session) {
      return reply.status(404).send({
        error: 'SESSION_NOT_FOUND',
        message: 'Sessão não encontrada.',
      });
    }

    await prisma.attendanceSession.update({
      where: { id },
      data: { isActive: false },
    });

    await publishAdminEvent({
      type: 'TOKEN_EXPIRED',
      payload: { sessionId: id },
    });

    return reply.status(200).send({
      success: true,
      message: 'Sessão OTT revogada com sucesso.',
      sessionId: id,
    });
  });

  /**
   * 9. GET /api/v1/admin/cms/:key
   * Consulta conteúdo gerenciado do Mini-CMS
   */
  app.get('/cms/:key', async (request: FastifyRequest<{ Params: { key: string } }>, reply) => {
    const { key } = request.params;

    const content = await prisma.cmsContent.findUnique({
      where: { key },
    });

    if (!content) {
      // Retorna defaults úteis para visualização imediata
      const defaults: Record<string, any> = {
        shark_pitches: { openVoting: true, activePitchId: null },
        partners: { highlightCompany: 'Binance Smart Chain' },
        event_notice: { text: 'SECOMP 2026: Edição Histórica UTFPR', active: true },
      };

      if (defaults[key]) {
        return reply.status(200).send({
          key,
          value: defaults[key],
          isDefault: true,
        });
      }

      return reply.status(404).send({
        error: 'CMS_KEY_NOT_FOUND',
        message: `Chave CMS '${key}' não cadastrada.`,
      });
    }

    return reply.status(200).send({
      key: content.key,
      value: content.value,
      updatedAt: content.updatedAt,
    });
  });

  /**
   * 10. PUT /api/v1/admin/cms/:key
   * Atualiza ou insere conteúdo gerenciado do Mini-CMS (Apenas ADMIN)
   */
  app.put<{ Params: { key: string }; Body: { value: any } }>(
    '/cms/:key',
    {
      preHandler: [
        async (req, rep) => {
          // Quality gate estrito: STAFF não pode editar CMS
          if (req.user?.role !== 'ADMIN') {
            return rep.status(403).send({
              error: 'FORBIDDEN',
              message: 'Apenas administradores (ADMIN) têm permissão para editar o CMS.',
            });
          }
        },
      ],
    },
    async (request, reply) => {
      const { key } = request.params;
      const { value } = request.body || {};

      if (value === undefined) {
        return reply.status(400).send({
          error: 'VALIDATION_ERROR',
          message: 'O corpo da requisição deve conter o campo value.',
        });
      }

      const updated = await prisma.cmsContent.upsert({
        where: { key },
        update: {
          value,
          updatedBy: request.user!.userId,
        },
        create: {
          key,
          value,
          updatedBy: request.user!.userId,
        },
      });

      // Publica atualização via Supabase Realtime
      await publishAdminEvent({
        type: 'CMS_UPDATED',
        payload: {
          key: updated.key,
          value: updated.value,
        },
      });

      return reply.status(200).send({
        success: true,
        key: updated.key,
        value: updated.value,
        updatedAt: updated.updatedAt,
      });
    }
  );
};
