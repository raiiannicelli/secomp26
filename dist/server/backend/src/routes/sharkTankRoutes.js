import { prisma } from '../lib/prisma.js';
import { optionalAuthGuard } from '../middlewares/authGuard.js';
import { SharkTankVoteSchema } from '../schemas/contracts.schema.js';
import { publishAdminEvent } from '../lib/supabaseAdmin.js';
export const sharkTankRoutes = async (app) => {
    /**
     * GET /api/v1/shark-tank/pitches
     * Lista todas as startups finalistas com contagem e percentual de votos.
     */
    app.get('/pitches', async (_request, reply) => {
        const pitches = await prisma.sharkPitch.findMany({
            orderBy: { pitchOrder: 'asc' },
        });
        const totalVotes = pitches.reduce((acc, p) => acc + p.voteCount, 0);
        const formatted = pitches.map((p) => {
            const percentage = totalVotes > 0 ? Math.round((p.voteCount / totalVotes) * 100) : 0;
            return {
                id: p.id,
                startupName: p.startupName,
                oneLiner: p.oneLiner,
                teamMembers: p.teamMembers,
                pitchOrder: p.pitchOrder,
                voteCount: p.voteCount,
                percentage,
            };
        });
        return reply.status(200).send({
            totalVotes,
            pitches: formatted,
        });
    });
    /**
     * GET /api/v1/shark-tank/live-results
     * Endpoint leve de consulta em tempo real do placar consolidado.
     */
    app.get('/live-results', async (_request, reply) => {
        const pitches = await prisma.sharkPitch.findMany({
            orderBy: { voteCount: 'desc' },
            select: {
                id: true,
                startupName: true,
                voteCount: true,
            },
        });
        const totalVotes = pitches.reduce((acc, p) => acc + p.voteCount, 0);
        return reply.status(200).send({
            timestamp: Date.now(),
            totalVotes,
            results: pitches.map((p) => ({
                id: p.id,
                startupName: p.startupName,
                votes: p.voteCount,
                percentage: totalVotes > 0 ? Number(((p.voteCount / totalVotes) * 100).toFixed(1)) : 0,
            })),
        });
    });
    /**
     * GET /api/v1/shark-tank/live-sse
     * Transmissão do placar ao vivo via Server-Sent Events (SSE) a cada 1.000ms.
     */
    app.get('/live-sse', async (request, reply) => {
        reply.raw.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
        });
        const sendScore = async () => {
            try {
                const pitches = await prisma.sharkPitch.findMany({
                    orderBy: { voteCount: 'desc' },
                    select: {
                        id: true,
                        startupName: true,
                        voteCount: true,
                    },
                });
                const totalVotes = pitches.reduce((acc, p) => acc + p.voteCount, 0);
                const payload = JSON.stringify({
                    timestamp: Date.now(),
                    totalVotes,
                    results: pitches.map((p) => ({
                        id: p.id,
                        startupName: p.startupName,
                        votes: p.voteCount,
                        percentage: totalVotes > 0 ? Number(((p.voteCount / totalVotes) * 100).toFixed(1)) : 0,
                    })),
                });
                reply.raw.write(`data: ${payload}\n\n`);
            }
            catch {
                // Conexão encerrada
            }
        };
        await sendScore();
        const intervalId = setInterval(sendScore, 1000);
        request.raw.on('close', () => {
            clearInterval(intervalId);
        });
    });
    /**
     * POST /api/v1/shark-tank/vote
     * Votação popular auditada com trava anti-sybil por fingerprint do dispositivo.
     */
    app.post('/vote', { preHandler: [optionalAuthGuard] }, async (request, reply) => {
        const parseResult = SharkTankVoteSchema.safeParse(request.body);
        if (!parseResult.success) {
            return reply.status(400).send({
                error: 'VALIDATION_ERROR',
                details: parseResult.error.format(),
            });
        }
        const { pitchId, clientFingerprint } = parseResult.data;
        try {
            const result = await prisma.$transaction(async (tx) => {
                // 1. Verifica se esta conta de usuário ou fingerprint já votou
                if (request.user?.userId) {
                    const existingUserVote = await tx.sharkVote.findUnique({
                        where: { userId: request.user.userId },
                    });
                    if (existingUserVote) {
                        throw new Error('VOTE_ALREADY_SUBMITTED');
                    }
                }
                if (clientFingerprint) {
                    const existingFingerprintVote = await tx.sharkVote.findFirst({
                        where: { sessionFingerprint: clientFingerprint },
                    });
                    if (existingFingerprintVote) {
                        throw new Error('VOTE_ALREADY_SUBMITTED');
                    }
                }
                // 2. Verifica se o pitch existe
                const pitch = await tx.sharkPitch.findUnique({
                    where: { id: pitchId },
                });
                if (!pitch) {
                    throw new Error('PITCH_NOT_FOUND');
                }
                // 3. Registra o voto com userId e fingerprint
                const vote = await tx.sharkVote.create({
                    data: {
                        pitchId,
                        userId: request.user?.userId || null,
                        sessionFingerprint: clientFingerprint,
                    },
                });
                // 4. Incrementa o contador de votos
                const updatedPitch = await tx.sharkPitch.update({
                    where: { id: pitchId },
                    data: {
                        voteCount: { increment: 1 },
                    },
                });
                // 5. Se o usuário estiver autenticado, concede carimbo bônus da SECOMP
                if (request.user) {
                    let sharkActivity = await tx.activity.findFirst({
                        where: { title: { contains: 'Shark Tank' } },
                    });
                    if (sharkActivity) {
                        await tx.attendanceRecord.upsert({
                            where: {
                                uq_user_activity_attendance: {
                                    userId: request.user.userId,
                                    activityId: sharkActivity.id,
                                },
                            },
                            update: {},
                            create: {
                                userId: request.user.userId,
                                activityId: sharkActivity.id,
                                stampType: 'LECTURE',
                                pointsAwarded: 1,
                            },
                        });
                    }
                }
                return { vote, updatedPitch };
            });
            // Notifica Cockpit /chameguinho em tempo real
            await publishAdminEvent({
                type: 'VOTE_CAST',
                payload: {
                    userId: request.user?.userId || 'ANONYMOUS',
                    pitchId: result.updatedPitch.id,
                },
            });
            return reply.status(201).send({
                success: true,
                message: 'Voto computado com sucesso!',
                pitchId: result.updatedPitch.id,
                startupName: result.updatedPitch.startupName,
                totalVotesForPitch: result.updatedPitch.voteCount,
            });
        }
        catch (err) {
            if (err.message === 'VOTE_ALREADY_SUBMITTED') {
                return reply.status(409).send({
                    error: 'ALREADY_VOTED',
                    message: 'Este dispositivo já computou um voto no Shark Tank UTFPR.',
                });
            }
            if (err.message === 'PITCH_NOT_FOUND') {
                return reply.status(404).send({
                    error: 'PITCH_NOT_FOUND',
                    message: 'Startup não encontrada.',
                });
            }
            request.log.error(err);
            return reply.status(500).send({
                error: 'INTERNAL_ERROR',
                message: 'Falha ao processar voto.',
            });
        }
    });
};
//# sourceMappingURL=sharkTankRoutes.js.map