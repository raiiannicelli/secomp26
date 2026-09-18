# 📖 RUNBOOK OPERACIONAL — SECOMP 2026
**Sistema:** Hub Digital & Plataforma Oficial da SECOMP 2026 (*Construindo Conexões*)  
**Elaborado por:** Daryl (*DevOps, CI/CD & SRE*)  
**Status:** Homologado para Operação | **Versão:** 2.0.0  
**Stack Homologada:** [.agents/stack/web.yaml](file:///home/rai-moratto/Documents/projetos/software-house/software-house/.agents/stack/web.yaml)

---

## 1. Topologia Operacional & Portas de Rede

O sistema é executado em arquitetura de container monólito, conectado ao PostgreSQL e Redis:

| Serviço | Container Name | Imagem Base | Porta Exposta | Propósito |
|---|---|---|---|---|
| **App Monolith** | `secomp-app-2026` | `node:20-alpine` (multi-stage) | `3000:3000` | Fastify API + Vite SPA Assets + BullMQ Workers |
| **PostgreSQL** | `secomp-postgres-2026` | `postgres:16-alpine` | `5432:5432` | Banco de dados relacional principal |
| **Redis** | `secomp-redis-2026` | `redis:7-alpine` | `6379:6379` | Cache de tokens, rate limiting e filas BullMQ |

---

## 2. Inicialização do Ambiente Local de Desenvolvimento

### 2.1 Pré-requisitos
* Node.js v20 LTS instalado;
* Docker e Docker Compose instalados;
* Git.

### 2.2 Passo a Passo de Boot
```bash
# 1. Clonar e entrar no diretório
cd projects/SECOMP2026

# 2. Configurar variáveis de ambiente a partir do template
cp .env.example .env

# 3. Subir os serviços de infraestrutura (PostgreSQL e Redis)
docker compose up -d postgres redis

# 4. Instalar dependências da aplicação
npm ci --legacy-peer-deps

# 5. Gerar o cliente Prisma e aplicar o schema no banco
npx prisma generate
npx prisma db push

# 6. Iniciar os servidores em modo desenvolvimento
# Terminal 1 (Frontend Vite):
npm run dev

# Terminal 2 (Backend Fastify com hot-reload):
npm run dev:server
```

---

## 3. Deploy em Produção (Docker Multi-Stage)

### 3.1 Build e Execução com Docker Compose
```bash
# Build e inicialização em background
docker compose up -d --build

# Verificar logs em tempo real
docker compose logs -f app
```

### 3.2 Validação de Saúde do Container
```bash
# Healthcheck HTTP
curl -s http://localhost:3000/api/v1/health | jq .

# Resposta Esperada (HTTP 200):
# {
#   "status": "healthy",
#   "service": "secomp2026-monolith",
#   "version": "2.0.0",
#   "dependencies": {
#     "database": "connected",
#     "redis": "connected"
#   }
# }
```

---

## 4. Procedimentos de Banco de Dados & Migrações

### 4.1 Aplicar Migrações em Produção
O script `docker/entrypoint.sh` executa `prisma migrate deploy` automaticamente antes de subir o servidor Fastify. Caso seja necessário executar manualmente:
```bash
docker compose exec app npx prisma migrate deploy
```

### 4.2 Backup a Quente do PostgreSQL (Disaster Recovery)
```bash
# Criar dump compactado
docker compose exec postgres pg_dump -U secomp_admin -d secomp2026_db -F c -b -v -f /var/lib/postgresql/data/backup_$(date +%Y%m%d_%H%M%S).dump

# Copiar para máquina host/storage externo
docker cp secomp-postgres-2026:/var/lib/postgresql/data/backup_*.dump ./backups/
```

### 4.3 Restauração do Banco
```bash
docker compose exec -T postgres pg_restore -U secomp_admin -d secomp2026_db -v -c < ./backups/backup_arquivo.dump
```

---

## 5. Observabilidade, Métricas & Alertas

1. **Endpoint de Métricas:** `GET /api/v1/metrics`
   * Retorna uso de memória RSS, Heap e uptime do processo Node.js.
2. **Sentry Error Tracking:**
   * Configure `SENTRY_DSN` no arquivo `.env` para captura automática de exceções e unhandled rejections no Fastify.
3. **Logs Estruturados:**
   * O Fastify utiliza logger em formato JSON em ambiente de produção para fácil ingestão em Loki, Datadog ou CloudWatch.

---

## 6. Troubleshooting e Resolução de Incidentes

| Sintoma | Causa Provável | Ação de Recuperação |
|---|---|---|
| Healthcheck retorna `degraded` | PostgreSQL ou Redis desconectado | Executar `docker compose ps` e inspecionar logs com `docker compose logs postgres` ou `docker compose logs redis`. |
| Erro `P1001: Can't reach database server` | Conexão recusada no Postgres | Verificar se o container do PostgreSQL completou o healthcheck antes do app subir. |
| Erro `ECONNREFUSED` no Redis | Redis fora do ar | Reiniciar o serviço: `docker compose restart redis`. |
| Esgotamento de conexões no Prisma | Conexões abertas sem fechar | Ajustar connection pool na URL: `DATABASE_URL="...&connection_limit=20&pool_timeout=10"`. |
