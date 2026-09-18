import dotenv from 'dotenv';
import { z } from 'zod';
dotenv.config();
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().default(3000),
    HOST: z.string().default('0.0.0.0'),
    DATABASE_URL: z.string().default('postgresql://secomp_admin:secomp_pass@localhost:5432/secomp2026_db?schema=public'),
    REDIS_URL: z.string().default('redis://localhost:6379'),
    ENCRYPTION_KEY: z
        .string()
        .length(64, 'ENCRYPTION_KEY deve ter 64 caracteres hexadecimais (32 bytes)'),
    JWT_SECRET: z.string().min(16, 'JWT_SECRET deve ter no mínimo 16 caracteres'),
    COOKIE_SECRET: z.string().min(16, 'COOKIE_SECRET deve ter no mínimo 16 caracteres'),
    CERTIFICATE_SIGN_SECRET: z
        .string()
        .min(16, 'CERTIFICATE_SIGN_SECRET deve ter no mínimo 16 caracteres'),
    SENTRY_DSN: z.string().optional().default(''),
    SUPABASE_URL: z.string().optional().default('https://xypxdnvlwlthjvuljuff.supabase.co'),
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(''),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('❌ Configuração inválida das variáveis de ambiente:', parsed.error.format());
    throw new Error('Falha na validação das variáveis de ambiente do SECOMP 2026.');
}
export const env = parsed.data;
//# sourceMappingURL=env.js.map