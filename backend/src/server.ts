import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';
import { redis } from './lib/redis.js';
import { authRoutes } from './routes/authRoutes.js';
import { activityRoutes } from './routes/activityRoutes.js';
import { passportRoutes } from './routes/passportRoutes.js';
import { sharkTankRoutes } from './routes/sharkTankRoutes.js';
import { talentArenaRoutes } from './routes/talentArenaRoutes.js';
import { certificateRoutes } from './routes/certificateRoutes.js';
import { adminRoutes } from './routes/adminRoutes.js';
import { seedDatabase } from './services/seed.js';

export { prisma, redis };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function buildServer(): Promise<FastifyInstance> {
  const isTest = process.env.NODE_ENV === 'test' || Boolean(process.env.VITEST);
  const app = Fastify({
    logger: isTest ? false : {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
  });

  // 1. Guardrails de Segurança (OWASP Top 10)
  await app.register(helmet, {
    contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false,
  });

  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  await app.register(cookie, {
    secret: env.COOKIE_SECRET,
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // 2. Endpoints de Observabilidade (Health & Metrics)
  app.get('/api/v1/health', async (_request, reply) => {
    let dbStatus = 'disconnected';
    let redisStatus = 'disconnected';

    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch {
      dbStatus = 'error';
    }

    try {
      if (redis.status !== 'ready' && redis.status !== 'connecting') {
        await redis.connect().catch(() => {});
      }
      const pingRes = await redis.ping();
      if (pingRes === 'PONG') redisStatus = 'connected';
    } catch {
      redisStatus = 'offline_fallback';
    }

    const isHealthy = dbStatus === 'connected';

    return reply.status(isHealthy ? 200 : 503).send({
      status: isHealthy ? 'healthy' : 'degraded',
      service: 'secomp2026-monolith',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      dependencies: {
        database: dbStatus,
        redis: redisStatus,
      },
      uptime: process.uptime(),
    });
  });

  app.get('/api/v1/metrics', async (_request, reply) => {
    const mem = process.memoryUsage();
    return reply.send({
      timestamp: Date.now(),
      uptime_seconds: process.uptime(),
      memory: {
        rss_mb: Math.round(mem.rss / 1024 / 1024),
        heap_total_mb: Math.round(mem.heapTotal / 1024 / 1024),
        heap_used_mb: Math.round(mem.heapUsed / 1024 / 1024),
      },
      node_version: process.version,
    });
  });

  // 3. Registro dos Módulos Funcionais e Endpoints da Squad
  await app.register(authRoutes, { prefix: '/api/v1/auth' });
  await app.register(activityRoutes, { prefix: '/api/v1/activities' });
  await app.register(passportRoutes, { prefix: '/api/v1/passport' });
  await app.register(passportRoutes, { prefix: '/api/v1/attendance' });
  await app.register(passportRoutes, { prefix: '/api/v1/staff' });
  await app.register(sharkTankRoutes, { prefix: '/api/v1/shark-tank' });
  await app.register(talentArenaRoutes, { prefix: '/api/v1/talent-arena' });
  await app.register(certificateRoutes, { prefix: '/api/v1/certificates' });
  await app.register(adminRoutes, { prefix: '/api/v1/admin' });

  // 4. Servir arquivos estáticos do Frontend (Vite SPA) em Produção
  const candidateClientPath = path.resolve(process.cwd(), 'dist/client');
  const fallbackDistPath = path.resolve(process.cwd(), 'dist');
  const clientDistPath = fs.existsSync(candidateClientPath) ? candidateClientPath : fallbackDistPath;

  if (fs.existsSync(clientDistPath) && fs.existsSync(path.join(clientDistPath, 'index.html'))) {
    await app.register(fastifyStatic, {
      root: clientDistPath,
      prefix: '/',
    });

    app.setNotFoundHandler((request, reply) => {
      if (request.raw.url && request.raw.url.startsWith('/api/')) {
        return reply.status(404).send({ error: 'Endpoint não encontrado', path: request.raw.url });
      }
      return reply.sendFile('index.html');
    });
  } else {
    app.setNotFoundHandler((request, reply) => {
      if (request.raw.url && request.raw.url.startsWith('/api/')) {
        return reply.status(404).send({ error: 'Endpoint não encontrado', path: request.raw.url });
      }
      return reply.status(404).send({
        error: 'Página estática não encontrada (execute npm run build para gerar a pasta dist/client/)',
      });
    });
  }

  return app;
}

async function start() {
  try {
    // Roda o seed inicial se necessário
    await seedDatabase().catch((err) => {
      console.warn('⚠️ Seed inicial avisou:', err.message);
    });

    const server = await buildServer();
    const port = env.PORT || 3000;
    const host = env.HOST || '0.0.0.0';

    await server.listen({ port, host });
    console.log(`🚀 [SECOMP 2026] Servidor rodando em http://${host}:${port}`);
    console.log(`🩺 Health check disponível em http://${host}:${port}/api/v1/health`);
  } catch (err) {
    console.error('❌ Erro fatal ao iniciar o servidor:', err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  start();
}
