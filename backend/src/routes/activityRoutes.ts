import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { authGuard, optionalAuthGuard } from '../middlewares/authGuard.js';
import { QueryActivitiesSchema, PreEnrollmentSchema } from '../schemas/contracts.schema.js';
import { publishAdminEvent, getSupabaseAdmin } from '../lib/supabaseAdmin.js';

export const activityRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  /**
   * GET /api/v1/activities
   * Lista atividades da Grade Narrativa dos 5 Dias e Minicursos Warmup
   * com suporte a filtros multidimensionais (dia, turno, tema, trilha, warmup).
   */
  app.get('/', { preHandler: [optionalAuthGuard] }, async (request, reply) => {
    const parseResult = QueryActivitiesSchema.safeParse(request.query);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'INVALID_QUERY_PARAMS',
        details: parseResult.error.format(),
      });
    }

    const { dayIndex, turn, theme, track, isWarmup } = parseResult.data;

    const whereClause: any = {};
    if (dayIndex !== undefined) whereClause.dayIndex = dayIndex;
    if (turn !== undefined) whereClause.turn = turn;
    if (theme !== undefined) whereClause.theme = theme;
    if (track !== undefined) whereClause.track = track;
    if (isWarmup !== undefined) whereClause.isWarmup = isWarmup;

    const activities = await prisma.activity.findMany({
      where: whereClause,
      orderBy: [{ dayIndex: 'asc' }, { startsAt: 'asc' }],
      include: {
        preEnrollments: request.user
          ? {
              where: { userId: request.user.userId },
              select: { id: true },
            }
          : false,
      },
    });

    const formatted = activities.map((act) => {
      const remainingSeats = Math.max(act.maxSeats - act.allocatedSeats, 0);
      const occupancyPercentage =
        act.maxSeats > 0 ? Math.round((act.allocatedSeats / act.maxSeats) * 100) : 0;
      const isEnrolled =
        request.user && Array.isArray((act as any).preEnrollments)
          ? (act as any).preEnrollments.length > 0
          : false;

      return {
        id: act.id,
        title: act.title,
        description: act.description,
        speakerName: act.speakerName,
        speakerBio: act.speakerBio,
        speakerCompany: act.speakerCompany,
        turn: act.turn,
        theme: act.theme,
        track: act.track,
        dayIndex: act.dayIndex,
        isWarmup: act.isWarmup,
        startsAt: act.startsAt,
        endsAt: act.endsAt,
        location: act.location,
        maxSeats: act.maxSeats,
        allocatedSeats: act.allocatedSeats,
        remainingSeats,
        occupancyPercentage,
        isScarce: remainingSeats <= 15,
        isEnrolled,
      };
    });

    return reply.status(200).send({
      total: formatted.length,
      activities: formatted,
    });
  });

  /**
   * POST /api/v1/activities/:id/pre-enroll
   * Pré-inscrição em atividade com decremento atômico de vagas e prevenção
   * de duplicidade (uq_user_pre_enrollment).
   */
  app.post('/:id/pre-enroll', { preHandler: [authGuard] }, async (request, reply) => {
    const { id: activityId } = request.params as { id: string };
    const userId = request.user!.userId;

    const parseResult = PreEnrollmentSchema.safeParse({ activityId });
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'VALIDATION_ERROR',
        details: parseResult.error.format(),
      });
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        // 1. Busca atividade
        const activity = await tx.activity.findUnique({
          where: { id: activityId },
        });

        if (!activity) {
          throw new Error('ACTIVITY_NOT_FOUND');
        }

        // 2. Verifica vagas disponíveis
        if (activity.allocatedSeats >= activity.maxSeats) {
          throw new Error('ACTIVITY_FULL');
        }

        // 3. Verifica duplicidade
        const existingEnrollment = await tx.preEnrollment.findUnique({
          where: {
            uq_user_pre_enrollment: {
              userId,
              activityId,
            },
          },
        });

        if (existingEnrollment) {
          throw new Error('ALREADY_ENROLLED');
        }

        // 4. Cria pré-inscrição e atualiza vagas
        const preEnrollment = await tx.preEnrollment.create({
          data: {
            userId,
            activityId,
          },
        });

        const updatedActivity = await tx.activity.update({
          where: { id: activityId },
          data: {
            allocatedSeats: { increment: 1 },
          },
        });

        return { preEnrollment, updatedActivity };
      });

      // Notifica Cockpit /chameguinho em tempo real
      await publishAdminEvent({
        type: 'ENROLLMENT_ADDED',
        payload: {
          userId,
          activityId,
        },
      });

      return reply.status(201).send({
        success: true,
        message: 'Pré-inscrição confirmada com sucesso!',
        enrollmentId: result.preEnrollment.id,
        remainingSeats: Math.max(
          result.updatedActivity.maxSeats - result.updatedActivity.allocatedSeats,
          0
        ),
      });
    } catch (err: any) {
      if (err.message === 'ACTIVITY_NOT_FOUND') {
        return reply.status(404).send({
          error: 'ACTIVITY_NOT_FOUND',
          message: 'Atividade não encontrada.',
        });
      }
      if (err.message === 'ACTIVITY_FULL') {
        return reply.status(409).send({
          error: 'ACTIVITY_FULL',
          message: 'As vagas para esta atividade já foram esgotadas.',
        });
      }
      if (err.message === 'ALREADY_ENROLLED') {
        return reply.status(409).send({
          error: 'ALREADY_ENROLLED',
          message: 'Você já está pré-inscrito nesta atividade.',
        });
      }

      request.log.error(err);
      return reply.status(500).send({
        error: 'INTERNAL_ERROR',
        message: 'Falha ao processar pré-inscrição.',
      });
    }
  });

  /**
   * GET /api/v1/activities/cms/all
   * Retorna todo o conteúdo público gerenciado do Mini-CMS (Palestrantes, Workshops, Mentores, Parceiros, Fotos, Plataformas)
   */
  app.get('/cms/all', async (_request, reply) => {
    try {
      if (getSupabaseAdmin()) {
        try {
          const { data, error } = await getSupabaseAdmin()!.from('cms_contents').select('*');
          if (!error && data) {
            const result: Record<string, any> = {};
            for (const item of data) {
              result[item.key] = item.value;
            }
            return reply.status(200).send({ success: true, cms: result });
          }
        } catch (err) {
          console.warn('[activityRoutes] Falha Supabase em /cms/all, fallback Prisma:', err);
        }
      }

      const contents = await prisma.cmsContent.findMany();
      const result: Record<string, any> = {};
      for (const item of contents) {
        result[item.key] = item.value;
      }
      return reply.status(200).send({ success: true, cms: result });
    } catch {
      return reply.status(200).send({ success: true, cms: {} });
    }
  });

  /**
   * POST /api/v1/activities/:id/validate
   * Leitura de QR Code dinâmico do Curso/Palestra/Roda de Conversa (SDD-SPEC 4.0 / PR-30).
   * Concede +1 carimbo no Passaporte do participante e incrementa allocatedSeats.
   */
  app.post(
    '/:id/validate',
    { preHandler: [authGuard] },
    async (request, reply) => {
      const { id: activityId } = request.params as { id: string };
      const userId = request.user!.userId;

      const activity = await prisma.activity.findUnique({
        where: { id: activityId },
      });

      if (!activity) {
        return reply.status(404).send({
          error: 'ACTIVITY_NOT_FOUND',
          message: 'Atividade não encontrada.',
        });
      }

      const existingRecord = await prisma.attendanceRecord.findUnique({
        where: {
          uq_user_activity_attendance: {
            userId,
            activityId,
          },
        },
      });

      if (existingRecord) {
        return reply.status(409).send({
          error: 'ALREADY_STAMPED',
          message: 'Você já recebeu o carimbo desta atividade.',
        });
      }

      const stampType = activity.isWarmup ? 'WARMUP_WORKSHOP' : 'LECTURE';

      const [record, updatedActivity] = await prisma.$transaction([
        prisma.attendanceRecord.create({
          data: {
            userId,
            activityId,
            stampType,
            pointsAwarded: 1,
          },
        }),
        prisma.activity.update({
          where: { id: activityId },
          data: {
            allocatedSeats: { increment: 1 },
          },
        }),
      ]);

      await publishAdminEvent({
        type: 'STAMP_ADDED',
        payload: {
          userId,
          activityId,
          activityTitle: activity.title,
          points: 1,
          stampType,
        },
      });

      return reply.status(200).send({
        success: true,
        message: `Presença confirmada em "${activity.title}"! +1 carimbo adicionado ao seu Passaporte Digital.`,
        recordId: record.id,
        activityTitle: activity.title,
        enrolledCount: updatedActivity.allocatedSeats,
      });
    }
  );
};

