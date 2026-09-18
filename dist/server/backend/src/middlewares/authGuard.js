import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
export const COOKIE_SESSION_NAME = 'secomp_session';
/**
 * Gera um JWT criptograficamente assinado com expiração de 7 dias.
 */
export function generateAuthToken(payload) {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
}
/**
 * Extrai o token da requisição priorizando Cookies HttpOnly assinados.
 * Fallback para Header Authorization: Bearer <token>.
 */
export function extractTokenFromRequest(request) {
    const cookieValue = request.cookies[COOKIE_SESSION_NAME];
    if (cookieValue) {
        const unsigned = request.unsignCookie(cookieValue);
        if (unsigned.valid && unsigned.value) {
            return unsigned.value;
        }
    }
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7).trim();
    }
    return null;
}
/**
 * Middleware Guardião de Autenticação (OWASP A01: Broken Access Control).
 * Interrompe a requisição se o usuário não possuir sessão válida.
 */
export async function authGuard(request, reply) {
    const token = extractTokenFromRequest(request);
    if (!token) {
        return reply.status(401).send({
            error: 'UNAUTHORIZED',
            message: 'Sessão não encontrada ou expirada. Faça login para continuar.',
        });
    }
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        request.user = decoded;
    }
    catch (err) {
        return reply.status(401).send({
            error: 'INVALID_TOKEN',
            message: 'Token de autenticação inválido ou corrompido.',
        });
    }
}
/**
 * Middleware Opcional: injeta request.user se houver sessão ativa,
 * mas não bloqueia a requisição caso seja anônima.
 */
export async function optionalAuthGuard(request, _reply) {
    const token = extractTokenFromRequest(request);
    if (!token)
        return;
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        request.user = decoded;
    }
    catch {
        // Ignora silenciosamente em rota pública
    }
}
/**
 * Guardião de Autorização por Papel (RBAC).
 */
export function roleGuard(...allowedRoles) {
    return async (request, reply) => {
        if (!request.user) {
            return reply.status(401).send({
                error: 'UNAUTHORIZED',
                message: 'Autenticação necessária para esta operação.',
            });
        }
        if (!allowedRoles.includes(request.user.role)) {
            return reply.status(403).send({
                error: 'FORBIDDEN',
                message: 'Você não possui privilégios suficientes para acessar este recurso.',
            });
        }
    };
}
//# sourceMappingURL=authGuard.js.map