import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { authGuard } from '../middlewares/authGuard.js';
import { generateCertificateHash, decryptPII } from '../services/cryptoService.js';
import { IssueCertificateSchema } from '../schemas/contracts.schema.js';

export const certificateRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  /**
   * POST /api/v1/certificates/issue
   * Emissão segura de certificado digital com hash HMAC-SHA256.
   */
  app.post(
    '/issue',
    { preHandler: [authGuard] },
    async (request, reply) => {
      const userId = request.user!.userId;
      const parseResult = IssueCertificateSchema.safeParse(request.body || {});
      const forceMin = parseResult.success ? parseResult.data.forceMinRequirements : false;

      // 1. Busca dados do participante
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          attendanceRecords: true,
          certificate: true,
        },
      });

      if (!user) {
        return reply.status(404).send({
          error: 'USER_NOT_FOUND',
          message: 'Usuário não encontrado.',
        });
      }

      // Se já possui certificado emitido, retorna o existente
      if (user.certificate && !forceMin) {
        return reply.status(200).send({
          message: 'Certificado já emitido anteriormente.',
          certificate: user.certificate,
        });
      }

      // 2. Calcula carimbos e horas
      const totalPoints = user.attendanceRecords.reduce((acc, rec) => acc + rec.pointsAwarded, 0);
      const stampCount = user.attendanceRecords.length;
      const effectiveCount = Math.max(totalPoints, stampCount);

      if (effectiveCount === 0 && !forceMin) {
        return reply.status(400).send({
          error: 'INSUFFICIENT_ATTENDANCE',
          message: 'Você ainda não possui carimbos validados suficientes para emissão de certificado.',
        });
      }

      const totalHours = Math.max(effectiveCount * 3, 3);

      let levelReached = 'Novato';
      if (effectiveCount >= 10) levelReached = 'Mestre da SECOMP';
      else if (effectiveCount >= 8) levelReached = 'Iniciado';
      else if (effectiveCount >= 7) levelReached = 'Adepto';
      else if (effectiveCount >= 5) levelReached = 'Graduado';
      else if (effectiveCount >= 3) levelReached = 'Aprendiz';

      // 3. Descriptografa RA para compor o hash institucional
      let plainRA = '0000000';
      if (user.raEncrypted) {
        try {
          plainRA = decryptPII(user.raEncrypted);
        } catch {
          plainRA = user.raHash ? user.raHash.slice(0, 7) : '0000000';
        }
      }

      // 4. Gera hash HMAC-SHA256 à prova de fraude
      const validationHash = generateCertificateHash(
        user.id,
        plainRA,
        totalHours,
        levelReached
      );

      const raMasked = `RA: ***${plainRA.slice(-4)}`;

      // 5. Salva ou atualiza no PostgreSQL
      const certificate = await prisma.certificate.upsert({
        where: { userId },
        update: {
          validationHash,
          totalHours,
          levelReached,
          fullName: user.fullName,
          raMasked,
          issuedAt: new Date(),
        },
        create: {
          userId,
          validationHash,
          fullName: user.fullName,
          raMasked,
          totalHours,
          levelReached,
        },
      });

      return reply.status(201).send({
        success: true,
        message: 'Certificado digital emitido com sucesso!',
        certificate: {
          id: certificate.id,
          fullName: certificate.fullName,
          raMasked: certificate.raMasked,
          totalHours: certificate.totalHours,
          levelReached: certificate.levelReached,
          validationHash: certificate.validationHash,
          issuedAt: certificate.issuedAt,
        },
      });
    }
  );

  /**
   * GET /api/v1/certificates/verify/:hash
   * Rota PÚBLICA e instantânea (< 50ms) de verificação criptográfica de autenticidade.
   */
  app.get('/verify/:hash', async (request, reply) => {
    const { hash } = request.params as { hash: string };

    if (!hash || hash.length < 16) {
      return reply.status(400).send({
        valid: false,
        error: 'INVALID_HASH_FORMAT',
        message: 'Formato de hash criptográfico inválido.',
      });
    }

    const cert = await prisma.certificate.findUnique({
      where: { validationHash: hash },
      include: {
        user: {
          select: {
            createdAt: true,
          },
        },
      },
    });

    if (!cert) {
      return reply.status(404).send({
        valid: false,
        error: 'CERTIFICATE_NOT_FOUND',
        message: 'Certificado não encontrado. O código informado não é autêntico ou foi adulterado.',
      });
    }

    return reply.status(200).send({
      valid: true,
      institution: 'UTFPR — Universidade Tecnológica Federal do Paraná / DACOM',
      event: 'SECOMP 2026 — Semana Acadêmica de Computação (Construindo Conexões)',
      certificate: {
        id: cert.id,
        fullName: cert.fullName,
        raMasked: cert.raMasked,
        totalHours: cert.totalHours,
        levelReached: cert.levelReached,
        issuedAt: cert.issuedAt,
        validationHash: cert.validationHash,
      },
    });
  });
};
