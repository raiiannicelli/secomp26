import { FastifyRequest, FastifyReply } from 'fastify';

/**
 * Middleware RBAC: Role-Based Access Control
 * Valida o papel do usuário autenticado no token JWT / cookie de sessão.
 *
 * Para mitigar ataques de enumeração de rotas (OWASP A01), requisições
 * sem autenticação válida a endpoints administrativos recebem HTTP 404 Not Found genérico.
 */
export function roleGuard(...allowedRoles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user;

    // 1. Não autenticado -> 404 genérico para mascarar a rota restrita
    if (!user) {
      return reply.status(404).send({
        error: 'NOT_FOUND',
        message: 'Rota inexistente ou recurso não localizado.',
      });
    }

    // 2. Autenticado mas sem a role requerida -> 403 Forbidden
    if (!allowedRoles.includes(user.role)) {
      return reply.status(403).send({
        error: 'FORBIDDEN',
        message: 'Permissões insuficientes para acessar este recurso.',
      });
    }
  };
}
