import { FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';

export const CSRF_COOKIE_NAME = '__csrf';
export const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Gera um token CSRF criptograficamente seguro (32 bytes em hex).
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Middleware Fastify: Double Submit Cookie CSRF Guard.
 * Proteção contra Cross-Site Request Forgery em conformidade com OWASP Top 10 (A01 / A08).
 *
 * Mutações (POST, PUT, DELETE, PATCH) exigem que o valor do header `x-csrf-token`
 * seja estritamente idêntico ao valor presente no cookie `__csrf`.
 */
export async function csrfGuard(request: FastifyRequest, reply: FastifyReply) {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(request.method.toUpperCase())) {
    return;
  }

  // Rotas públicas de autenticação inicial geram seu próprio token
  if (request.url.startsWith('/api/v1/auth/login') || request.url.startsWith('/api/v1/auth/register')) {
    return;
  }

  const cookieToken = request.cookies[CSRF_COOKIE_NAME];
  const headerToken = request.headers[CSRF_HEADER_NAME] as string | undefined;

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return reply.status(403).send({
      error: 'CSRF_MISMATCH',
      message: 'Token CSRF inválido, ausente ou incompatível com a sessão.',
    });
  }
}
