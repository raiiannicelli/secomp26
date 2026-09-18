import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authGuard } from '../middlewares/authGuard.js';
import { TalentBookingSchema } from '../schemas/contracts.schema.js';
import { CacheService } from '../lib/redis.js';

export const talentArenaRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  /**
   * GET /api/v1/talent-arena/slots
   * Lista todos os horários da Roda de Talentos com status em tempo real.
   */
  app.get('/slots', async (_request, reply) => {
    const slots = await prisma.talentArenaSlot.findMany({
      orderBy: { slotTime: 'asc' },
      include: {
        booking: {
          select: {
            id: true,
            userId: true,
            fieldInterest: true,
            createdAt: true,
          },
        },
      },
    });

    return reply.status(200).send({
      totalSlots: slots.length,
      availableSlots: slots.filter((s) => s.status === 'AVAILABLE').length,
      slots: slots.map((s) => ({
        id: s.id,
        companyName: s.companyName,
        interviewerName: s.interviewerName,
        slotTime: s.slotTime,
        status: s.status,
        isBooked: s.status !== 'AVAILABLE',
      })),
    });
  });

  /**
   * POST /api/v1/talent-arena/slots/:id/book
   * Reserva atômica de slot de 15 min na Roda de Talentos com concessão
   * automática de +2 carimbos bônus no Passaporte do aluno.
   */
  app.post(
    '/slots/:id/book',
    { preHandler: [authGuard] },
    async (request, reply) => {
      const { id: slotId } = request.params as { id: string };
      const userId = request.user!.userId;

      const parseResult = TalentBookingSchema.safeParse({
        slotId,
        ...(request.body as object),
      });

      if (!parseResult.success) {
        return reply.status(400).send({
          error: 'VALIDATION_ERROR',
          details: parseResult.error.format(),
        });
      }

      const { linkedinUrl, fieldInterest } = parseResult.data;

      try {
        const result = await prisma.$transaction(async (tx) => {
          // 1. Verifica se o participante já possui agendamento prévio
          const existingUserBooking = await tx.talentArenaBooking.findUnique({
            where: { userId },
          });

          if (existingUserBooking) {
            throw new Error('USER_ALREADY_HAS_BOOKING');
          }

          // 2. Busca e valida disponibilidade do slot
          const slot = await tx.talentArenaSlot.findUnique({
            where: { id: slotId },
          });

          if (!slot) {
            throw new Error('SLOT_NOT_FOUND');
          }

          if (slot.status !== 'AVAILABLE') {
            throw new Error('SLOT_ALREADY_BOOKED');
          }

          // 3. Atualiza slot e cria o booking
          const booking = await tx.talentArenaBooking.create({
            data: {
              slotId,
              userId,
              linkedinUrl,
              fieldInterest,
            },
          });

          await tx.talentArenaSlot.update({
            where: { id: slotId },
            data: { status: 'BOOKED' },
          });

          // 4. Localiza ou cria a atividade global de Roda de Talentos para vincular o carimbo
          let arenaActivity = await tx.activity.findFirst({
            where: {
              OR: [
                { title: { contains: 'Roda de Talentos' } },
                { title: { contains: 'Arena de Talentos' } },
              ],
            },
          });

          if (!arenaActivity) {
            arenaActivity = await tx.activity.create({
              data: {
                title: 'Roda de Talentos: Speed Interviews',
                description: 'Entrevistas de 15 minutos com RHs de empresas parceiras',
                speakerName: 'Comitê de Talentos SECOMP 2026',
                turn: 'AFTERNOON',
                theme: 'CAREER',
                track: 'GENERAL',
                dayIndex: 4, // Quinta-feira
                startsAt: new Date('2026-10-22T14:00:00Z'),
                endsAt: new Date('2026-10-22T18:00:00Z'),
                location: 'Câmpus Principal — Bloco B (Térreo)',
                maxSeats: 100,
              },
            });
          }

          // 5. Atribuição de +2 Carimbos bônus no Passaporte
          const stamp = await tx.attendanceRecord.upsert({
            where: {
              uq_user_activity_attendance: {
                userId,
                activityId: arenaActivity.id,
              },
            },
            update: {
              pointsAwarded: 2,
              stampType: 'TALENT_ARENA',
            },
            create: {
              userId,
              activityId: arenaActivity.id,
              stampType: 'TALENT_ARENA',
              pointsAwarded: 2,
            },
          });

          return { booking, slot, stamp };
        });

        // Invalida cache de leaderboard
        await CacheService.del('cache:leaderboard');

        return reply.status(201).send({
          success: true,
          message: 'Atividade confirmada! Você recebeu 2 Carimbos extras no seu Passaporte.',
          booking: {
            id: result.booking.id,
            companyName: result.slot.companyName,
            interviewerName: result.slot.interviewerName,
            slotTime: result.slot.slotTime,
            fieldInterest: result.booking.fieldInterest,
            stampsAwarded: 2,
          },
        });
      } catch (err: any) {
        if (err.message === 'USER_ALREADY_HAS_BOOKING') {
          return reply.status(409).send({
            error: 'DUPLICATE_BOOKING',
            message: 'Você já possui um agendamento na Roda de Talentos. Limite de 1 por aluno.',
          });
        }
        if (err.message === 'SLOT_NOT_FOUND') {
          return reply.status(404).send({
            error: 'SLOT_NOT_FOUND',
            message: 'O slot selecionado não foi encontrado.',
          });
        }
        if (err.message === 'SLOT_ALREADY_BOOKED') {
          return reply.status(409).send({
            error: 'SLOT_UNAVAILABLE',
            message: 'Este horário acabou de ser reservado por outro participante.',
          });
        }

        request.log.error(err);
        return reply.status(500).send({
          error: 'INTERNAL_ERROR',
          message: 'Falha ao processar reserva do slot.',
        });
      }
    }
  );
};
