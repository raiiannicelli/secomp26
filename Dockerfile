# ==============================================================================
# Dockerfile — Monólito SECOMP 2026 Multi-Stage
# Stack: Node.js (v20 LTS) + Fastify + React 18 (Vite SPA) + Prisma + Redis + BullMQ
# Autor: Daryl (DevOps & SRE)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Dependências de Build
# ------------------------------------------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# ------------------------------------------------------------------------------
# Stage 2: Compilação de Frontend e Backend
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npx prisma generate
RUN npm run build
RUN npm run build:server

# ------------------------------------------------------------------------------
# Stage 3: Runner de Produção (Segurança Non-Root & Minimalista)
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Criar usuário e grupo sem privilégios de root (OWASP Security Guardrail)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser && \
    apk add --no-cache curl wget

# Copiar apenas os artefatos compilados e dependências essenciais
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/docker/entrypoint.sh ./entrypoint.sh

RUN chmod +x ./entrypoint.sh && chown -R appuser:nodejs /app

USER appuser

EXPOSE 3000

# Healthcheck nativo
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/v1/health || exit 1

ENTRYPOINT ["./entrypoint.sh"]
