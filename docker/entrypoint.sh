#!/bin/sh
set -e

echo "🚀 [SECOMP 2026] Inicializando container monólito..."

# 1. Aguarda disponibilidade do PostgreSQL
echo "⏳ Aguardando banco de dados PostgreSQL..."
until npx prisma db push --skip-generate 2>/dev/null || npx prisma migrate deploy 2>/dev/null; do
  echo "⚠️ Banco indisponível ou migrando... aguardando 2s"
  sleep 2
done

echo "✅ Migrações do banco de dados aplicadas com sucesso!"

# 2. Inicia o servidor Node.js
echo "🔥 Iniciando servidor Fastify na porta ${PORT:-3000}..."
exec node dist/server/backend/src/server.js
