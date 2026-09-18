import { Queue, Worker, Job } from 'bullmq';
import { redis } from '../lib/redis.js';
import { prisma } from '../lib/prisma.js';
import { generateCertificateHash, decryptPII } from '../services/cryptoService.js';

export const CERTIFICATE_QUEUE_NAME = 'certificate-generation';

// Fila BullMQ com reutilização de conexão Redis
let certificateQueue: Queue | null = null;
let certificateWorker: Worker | null = null;

try {
  certificateQueue = new Queue(CERTIFICATE_QUEUE_NAME, {
    connection: redis as any,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 100,
    },
  });

  certificateWorker = new Worker(
    CERTIFICATE_QUEUE_NAME,
    async (job: Job<{ userId: string }>) => {
      const { userId } = job.data;
      return await processCertificateGeneration(userId);
    },
    {
      connection: redis as any,
      concurrency: 4,
    }
  );

  certificateWorker.on('error', () => {
    // Graceful offline fallback
  });
} catch {
  // Ignora se o Redis estiver offline no ambiente de desenvolvimento local/testes
}

/**
 * Função central de processamento e emissão de certificado
 */
export async function processCertificateGeneration(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      attendanceRecords: true,
      certificate: true,
    },
  });

  if (!user) throw new Error('USER_NOT_FOUND');

  const totalPoints = user.attendanceRecords.reduce((acc, r) => acc + r.pointsAwarded, 0);
  const stampCount = user.attendanceRecords.length;
  const effectiveCount = Math.max(totalPoints, stampCount);
  const totalHours = Math.max(effectiveCount * 3, 3);

  let levelReached = 'Novato';
  if (effectiveCount >= 10) levelReached = 'Mestre da SECOMP';
  else if (effectiveCount >= 8) levelReached = 'Iniciado';
  else if (effectiveCount >= 7) levelReached = 'Adepto';
  else if (effectiveCount >= 5) levelReached = 'Graduado';
  else if (effectiveCount >= 3) levelReached = 'Aprendiz';

  let plainRA = '0000000';
  if (user.raEncrypted) {
    try {
      plainRA = decryptPII(user.raEncrypted);
    } catch {
      plainRA = user.raHash ? user.raHash.slice(0, 7) : '0000000';
    }
  }

  const validationHash = generateCertificateHash(
    user.id,
    plainRA,
    totalHours,
    levelReached
  );

  const raMasked = `RA: ***${plainRA.slice(-4)}`;

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

  return certificate;
}

/**
 * Despacha o job para a fila BullMQ ou processa diretamente se o Redis estiver offline
 */
export async function enqueueCertificateGeneration(userId: string) {
  try {
    if (certificateQueue && redis.status === 'ready') {
      const job = await certificateQueue.add('generate', { userId });
      return { queued: true, jobId: job.id };
    }
  } catch {
    // Fallback para síncrono
  }

  const certificate = await processCertificateGeneration(userId);
  return { queued: false, certificate };
}
