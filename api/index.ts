import type { FastifyInstance } from 'fastify';
import { buildServer } from '../backend/src/server.js';

let appInstance: FastifyInstance | null = null;

export default async function handler(req: any, res: any) {
  if (!appInstance) {
    appInstance = await buildServer();
    await appInstance.ready();
  }

  appInstance.server.emit('request', req, res);
}
