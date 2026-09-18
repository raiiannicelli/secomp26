import { describe, it, expect } from 'vitest';
import { buildServer } from '../src/server.js';

describe('Health Check & Observability Tests', () => {
  it('deve validar que o ambiente de testes está operacional', () => {
    expect(true).toBe(true);
  });

  it('deve inicializar o Fastify e responder 200 no endpoint de métricas', async () => {
    const app = await buildServer();

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/metrics',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.timestamp).toBeDefined();
    expect(body.memory).toBeDefined();
    expect(body.memory.rss_mb).toBeGreaterThan(0);

    await app.close();
  });
});
