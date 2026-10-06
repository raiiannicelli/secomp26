import { z } from 'zod';

export const ALLOWED_EMAIL_DOMAINS = [
  '@alunos.utfpr.edu.br',
  '@utfpr.edu.br',
  '@gmail.com',
  '@hotmail.com',
  '@tuta.com',
  '@mailbox.org',
  '@proton.me',
] as const;

export type AllowedEmailDomain = typeof ALLOWED_EMAIL_DOMAINS[number];

export const RegisterUserSchema = z
  .object({
    email: z.string().email('E-mail inválido').optional(),
    nameLocal: z
      .string()
      .min(2, 'Parte local do e-mail deve ter no mínimo 2 caracteres')
      .regex(/^[a-zA-Z0-9._-]+$/, 'Parte local deve conter apenas letras, números e pontos')
      .optional(),
    domain: z
      .enum(ALLOWED_EMAIL_DOMAINS, {
        errorMap: () => ({ message: 'Domínio de e-mail não autorizado' }),
      })
      .optional(),
    password: z.string().min(6, 'A senha deve conter no mínimo 6 caracteres').optional(),
    pin: z
      .string()
      .regex(/^\d{6}$/, 'A senha PIN deve conter exatamente 6 dígitos numéricos')
      .optional(),
    fullName: z.string().min(2, 'Nome completo deve ter no mínimo 2 caracteres').optional(),
    ra: z
      .string()
      .regex(/^(a|ra)\d{7}$/i, 'Formato de RA inválido (ex: a1234567 ou ra2623420)')
      .optional(),
    phone: z
      .string()
      .regex(/^\+?[0-9]{10,14}$/, 'Formato de telefone inválido (ex: 41999998888)')
      .optional(),
    role: z.enum(['STUDENT', 'VISITOR', 'ADMIN']).default('STUDENT'),
  })
  .superRefine((data, ctx) => {
    let effectiveEmail = data.email;
    let effectiveDomain: string | undefined = data.domain;

    if (!effectiveEmail && data.nameLocal && data.domain) {
      effectiveEmail = `${data.nameLocal}${data.domain}`.toLowerCase();
    }

    if (!effectiveEmail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'E-mail ou nome local com domínio são obrigatórios',
        path: ['email'],
      });
      return;
    }

    if (!effectiveDomain && effectiveEmail.includes('@')) {
      const parts = effectiveEmail.split('@');
      effectiveDomain = `@${parts[1]}`.toLowerCase();
    }

    if (!effectiveDomain || !ALLOWED_EMAIL_DOMAINS.includes(effectiveDomain as AllowedEmailDomain)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Domínio de e-mail não autorizado',
        path: ['domain'],
      });
    }

    if (effectiveDomain === '@alunos.utfpr.edu.br') {
      if (!data.ra || !/^(a|ra)\d{7}$/i.test(data.ra)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'RA institucional é obrigatório no formato aXXXXXXX ou raXXXXXXX para alunos da UTFPR',
          path: ['ra'],
        });
      }
    }

    if (!data.password && !data.pin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Senha ou PIN de 6 dígitos é obrigatório',
        path: ['password'],
      });
    }
  });

export const CmsContentSchema = z.object({
  key: z.string().min(2).max(100),
  value: z.any(),
});

export const LoginUserSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const ValidateAttendanceTokenSchema = z.object({
  token: z
    .string()
    .min(5)
    .max(30)
    .regex(/^SEC(-[A-Z0-9]{2,10})?-[A-Z0-9]{3,6}$/i, 'Formato de token inválido. Esperado: SEC-XXX ou SEC-CAT-XXX'),
});

export const OpenAttendanceSessionSchema = z.object({
  activityId: z.string().uuid('ID de atividade inválido'),
  durationMinutes: z.coerce.number().min(5).max(60).default(15),
  customToken: z.string().optional(),
});

export const PreEnrollmentSchema = z.object({
  activityId: z.string().uuid('ID de atividade inválido'),
});

export const SharkTankVoteSchema = z.object({
  pitchId: z.string().uuid('ID de pitch inválido'),
  clientFingerprint: z.string().min(8).max(128),
});

export const TalentBookingSchema = z.object({
  slotId: z.string().uuid('ID de slot inválido'),
  linkedinUrl: z.string().optional().default(''),
  fieldInterest: z.string().optional().default(''),
});

export const IssueCertificateSchema = z.object({
  forceMinRequirements: z.boolean().optional().default(false),
});

export const QueryActivitiesSchema = z.object({
  dayIndex: z.coerce.number().int().min(1).max(5).optional(),
  turn: z.enum(['MORNING', 'AFTERNOON', 'NIGHT']).optional(),
  theme: z.enum(['TECHNOLOGY', 'MANAGEMENT', 'INNOVATION', 'CAREER']).optional(),
  track: z.enum(['DATA_AI', 'INFRA_SECURITY', 'HARDWARE_IOT', 'DEV_UI', 'GENERAL']).optional(),
  isWarmup: z
    .preprocess((val) => (val === 'true' ? true : val === 'false' ? false : val), z.boolean().optional()),
});
