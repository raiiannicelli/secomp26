import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { authGuard, roleGuard } from '../middlewares/authGuard.js';
import { ValidateAttendanceTokenSchema, OpenAttendanceSessionSchema, } from '../schemas/contracts.schema.js';
import { CacheService } from '../lib/redis.js';
import { publishAdminEvent } from '../lib/supabaseAdmin.js';
export const passportRoutes = async (app) => {
    /**
     * GET /api/v1/passport/me
     * Retorna os carimbos, histórico de presenças e nível de maestria do participante.
     */
    app.get('/me', { preHandler: [authGuard] }, async (request, reply) => {
        const userId = request.user.userId;
        const records = await prisma.attendanceRecord.findMany({
            where: { userId },
            include: {
                activity: {
                    select: {
                        id: true,
                        title: true,
                        speakerName: true,
                        turn: true,
                        theme: true,
                        track: true,
                        dayIndex: true,
                        isWarmup: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const totalPoints = records.reduce((acc, r) => acc + r.pointsAwarded, 0);
        const stampCount = records.length;
        const effectiveStamps = Math.max(totalPoints, stampCount);
        let level = 'Novato';
        let levelCode = 'NOVATO';
        let levelColor = '#707a8a';
        if (effectiveStamps >= 10) {
            level = 'Mestre da SECOMP';
            levelCode = 'MESTRE';
            levelColor = '#fcd535';
        }
        else if (effectiveStamps >= 8) {
            level = 'Iniciado';
            levelCode = 'INICIADO';
            levelColor = '#8a3ffc';
        }
        else if (effectiveStamps >= 7) {
            level = 'Adepto (Elegível ao Sorteio)';
            levelCode = 'ADEPTO';
            levelColor = '#0ecb81';
        }
        else if (effectiveStamps >= 5) {
            level = 'Graduado';
            levelCode = 'GRADUADO';
            levelColor = '#2dbdb6';
        }
        else if (effectiveStamps >= 3) {
            level = 'Aprendiz';
            levelCode = 'APRENDIZ';
            levelColor = '#3b82f6';
        }
        const eligibleForDraw = effectiveStamps >= 7;
        return reply.status(200).send({
            totalStamps: effectiveStamps,
            targetGoal: 8,
            eligibleForDraw,
            level: {
                code: levelCode,
                name: level,
                color: levelColor,
            },
            records: records.map((r) => ({
                id: r.id,
                activityId: r.activityId,
                activityTitle: r.activity.title,
                speakerName: r.activity.speakerName,
                stampType: r.stampType,
                pointsAwarded: r.pointsAwarded,
                dayIndex: r.activity.dayIndex,
                isWarmup: r.activity.isWarmup,
                createdAt: r.createdAt,
            })),
        });
    });
    /**
     * GET /api/v1/passport/leaderboard
     * Ranking gamificado em tempo real com anonimização LGPD e cache Redis (TTL 30s).
     */
    app.get('/leaderboard', async (_request, reply) => {
        const cacheKey = 'cache:leaderboard';
        const cached = await CacheService.get(cacheKey);
        if (cached) {
            return reply.status(200).send(JSON.parse(cached));
        }
        // Agregação dos maiores pontuadores no PostgreSQL
        const topUsers = await prisma.user.findMany({
            where: {
                attendanceRecords: { some: {} },
            },
            select: {
                id: true,
                fullName: true,
                attendanceRecords: {
                    select: {
                        pointsAwarded: true,
                    },
                },
            },
            take: 50,
        });
        const ranked = topUsers
            .map((u) => {
            const points = u.attendanceRecords.reduce((acc, r) => acc + r.pointsAwarded, 0);
            // Anonimização LGPD: "Rai Moratto" -> "Rai M.***"
            const nameParts = u.fullName.trim().split(' ');
            let maskedName = u.fullName;
            if (nameParts.length > 1) {
                maskedName = `${nameParts[0]} ${nameParts[1][0]}.***`;
            }
            else {
                maskedName = `${nameParts[0].slice(0, 3)}***`;
            }
            let levelName = 'Novato';
            if (points >= 10)
                levelName = 'Mestre';
            else if (points >= 8)
                levelName = 'Iniciado';
            else if (points >= 7)
                levelName = 'Adepto';
            else if (points >= 5)
                levelName = 'Graduado';
            else if (points >= 3)
                levelName = 'Aprendiz';
            return {
                id: u.id,
                name: maskedName,
                stamps: points,
                level: levelName,
                eligibleForDraw: points >= 7,
            };
        })
            .sort((a, b) => b.stamps - a.stamps)
            .map((item, index) => ({
            position: index + 1,
            ...item,
            isTop3: index < 3,
        }));
        const responsePayload = {
            updatedAt: new Date().toISOString(),
            totalRanked: ranked.length,
            leaderboard: ranked,
        };
        // Cacheia por 30 segundos
        await CacheService.set(cacheKey, JSON.stringify(responsePayload), 30);
        return reply.status(200).send(responsePayload);
    });
    /**
     * POST /api/v1/attendance/validate-token
     * Validador de Presença com Token Descartável Anti-Fraude (OTT).
     */
    app.post('/validate-token', {
        preHandler: [authGuard],
        config: {
            rateLimit: {
                max: 5,
                timeWindow: '1 minute',
            },
        },
    }, async (request, reply) => {
        const userId = request.user.userId;
        const parseResult = ValidateAttendanceTokenSchema.safeParse(request.body);
        if (!parseResult.success) {
            return reply.status(400).send({
                error: 'VALIDATION_ERROR',
                message: 'Formato de token inválido. O formato deve ser SEC-XXX.',
            });
        }
        const formattedToken = parseResult.data.token.toUpperCase().trim();
        const tokenHash = crypto.createHash('sha256').update(formattedToken).digest('hex');
        const now = new Date();
        try {
            const result = await prisma.$transaction(async (tx) => {
                // 1. Busca sessão de presença ativa e válida
                const session = await tx.attendanceSession.findFirst({
                    where: {
                        tokenHash,
                        isActive: true,
                        expiresAt: { gte: now },
                    },
                    include: { activity: true },
                });
                if (!session) {
                    throw new Error('TOKEN_EXPIRED_OR_INVALID');
                }
                // 2. Prevenção de duplicidade: participante não pode carimbar a mesma atividade duas vezes
                const existing = await tx.attendanceRecord.findUnique({
                    where: {
                        uq_user_activity_attendance: {
                            userId,
                            activityId: session.activityId,
                        },
                    },
                });
                if (existing) {
                    throw new Error('ATTENDANCE_ALREADY_RECORDED');
                }
                // 3. Concede o carimbo
                const stampType = session.activity.isWarmup ? 'WARMUP_WORKSHOP' : 'LECTURE';
                const pointsAwarded = 1;
                const record = await tx.attendanceRecord.create({
                    data: {
                        userId,
                        activityId: session.activityId,
                        sessionId: session.id,
                        stampType,
                        pointsAwarded,
                    },
                });
                const totalPoints = await tx.attendanceRecord.aggregate({
                    where: { userId },
                    _sum: { pointsAwarded: true },
                });
                const totalStamps = totalPoints._sum.pointsAwarded || 1;
                return {
                    record,
                    activity: session.activity,
                    totalStamps,
                    eligibleForDraw: totalStamps >= 7,
                };
            });
            // Invalida cache de leaderboard
            await CacheService.del('cache:leaderboard');
            // Notifica Cockpit /chameguinho em tempo real
            await publishAdminEvent({
                type: 'STAMP_ADDED',
                payload: {
                    userId,
                    activityId: result.activity.id,
                    newLevel: result.totalStamps >= 10 ? 'Mestre da SECOMP' : result.totalStamps >= 7 ? 'Adepto' : 'Aprendiz',
                },
            });
            return reply.status(200).send({
                success: true,
                message: 'Carimbo Computado com Sucesso!',
                stamp: {
                    activityId: result.activity.id,
                    activityTitle: result.activity.title,
                    pointsAwarded: 1,
                    totalStamps: result.totalStamps,
                    eligibleForDraw: result.eligibleForDraw,
                },
            });
        }
        catch (err) {
            if (err.message === 'TOKEN_EXPIRED_OR_INVALID') {
                return reply.status(404).send({
                    error: 'INVALID_TOKEN',
                    message: 'Token expirado ou inválido. Verifique o código exibido na sala.',
                });
            }
            if (err.message === 'ATTENDANCE_ALREADY_RECORDED') {
                return reply.status(409).send({
                    error: 'DUPLICATE_TOKEN',
                    message: 'Token já utilizado por este usuário para esta atividade.',
                });
            }
            request.log.error(err);
            return reply.status(500).send({
                error: 'INTERNAL_ERROR',
                message: 'Falha ao processar validação do carimbo.',
            });
        }
    });
    /**
     * POST /api/v1/staff/sessions/open
     * Rota administrativa para o Staff abrir uma sessão de presença e gerar token OTT.
     */
    app.post('/staff/sessions/open', { preHandler: [authGuard, roleGuard('STAFF', 'ADMIN')] }, async (request, reply) => {
        const parseResult = OpenAttendanceSessionSchema.safeParse(request.body);
        if (!parseResult.success) {
            return reply.status(400).send({
                error: 'VALIDATION_ERROR',
                details: parseResult.error.format(),
            });
        }
        const { activityId, durationMinutes, customToken } = parseResult.data;
        // Gera token alfanumérico se não fornecido (ex: SEC-784)
        const rawToken = customToken?.toUpperCase().trim() ||
            `SEC-${Math.floor(100 + Math.random() * 900)}`;
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const openedAt = new Date();
        const expiresAt = new Date(openedAt.getTime() + durationMinutes * 60 * 1000);
        const session = await prisma.attendanceSession.create({
            data: {
                activityId,
                tokenHash,
                durationMinutes,
                openedAt,
                expiresAt,
                createdBy: request.user.userId,
            },
        });
        return reply.status(201).send({
            success: true,
            sessionId: session.id,
            activityId,
            token: rawToken,
            expiresAt,
            durationMinutes,
        });
    });
};
//# sourceMappingURL=passportRoutes.js.map