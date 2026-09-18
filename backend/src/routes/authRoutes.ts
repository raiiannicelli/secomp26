import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { encryptPII, decryptPII, generateSHA256 } from '../services/cryptoService.js';
import {
  RegisterUserSchema,
  LoginUserSchema,
} from '../schemas/contracts.schema.js';
import {
  authGuard,
  generateAuthToken,
  COOKIE_SESSION_NAME,
} from '../middlewares/authGuard.js';
import { generateCsrfToken, CSRF_COOKIE_NAME } from '../middlewares/csrfGuard.js';
import { publishAdminEvent } from '../lib/supabaseAdmin.js';

export const authRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  /**
   * GET /api/v1/auth/csrf-token
   * Emite token CSRF para o cliente no cookie __csrf e no corpo da resposta.
   */
  app.get('/csrf-token', async (_request, reply) => {
    const csrfToken = generateCsrfToken();
    reply.setCookie(CSRF_COOKIE_NAME, csrfToken, {
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
    });
    return reply.status(200).send({ csrfToken });
  });

  /**
   * POST /api/v1/auth/register
   * Cadastro de novos participantes v3.0 com domínio institucional controlado,
   * criptografia AES-256-GCM de PII, indexação por SHA-256 e emissão de CSRF.
   */
  app.post('/register', async (request, reply) => {
    const parseResult = RegisterUserSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'VALIDATION_ERROR',
        details: parseResult.error.format(),
      });
    }

    const { email: rawEmail, nameLocal, domain, password: rawPassword, pin, fullName, ra, phone, role: explicitRole } = parseResult.data;

    // 1. Deriva e-mail completo no servidor (imune a manipulações do frontend)
    const email = (nameLocal && domain ? `${nameLocal}${domain}` : rawEmail)!.toLowerCase().trim();
    const password = (pin || rawPassword)!;

    // 2. Determinação de role com base no domínio e autorização administrativa
    let role = explicitRole;
    if (email === 'raimorato@alunos.utfpr.edu.br') {
      role = 'ADMIN';
    } else if (email.endsWith('@alunos.utfpr.edu.br')) {
      role = 'STUDENT';
    } else if (email.endsWith('@utfpr.edu.br')) {
      role = explicitRole === 'ADMIN' ? 'ADMIN' : 'STAFF';
    } else if (explicitRole === 'STUDENT') {
      role = 'VISITOR';
    }

    // 3. Valida duplicidade de email
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      return reply.status(409).send({
        error: 'EMAIL_ALREADY_EXISTS',
        message: 'Este endereço de e-mail já está cadastrado no sistema.',
      });
    }

    // 4. Criptografa PII e gera hash determinístico de RA
    let raEncrypted: string | null = null;
    let raHash: string | null = null;
    if (ra) {
      const normalizedRA = ra.trim().toLowerCase();
      raHash = generateSHA256(normalizedRA);

      const existingRA = await prisma.user.findFirst({
        where: { raHash },
      });
      if (existingRA) {
        return reply.status(409).send({
          error: 'RA_ALREADY_EXISTS',
          message: 'Este RA acadêmico já está cadastrado por outro participante.',
        });
      }

      raEncrypted = encryptPII(ra.trim());
    }

    let phoneEncrypted: string | null = null;
    if (phone) {
      phoneEncrypted = encryptPII(phone.trim());
    }

    // 5. Hash da senha com bcrypt (10 rounds)
    const passwordHash = await bcrypt.hash(password, 10);

    const effectiveFullName = (fullName || nameLocal || email.split('@')[0]).trim();

    // 6. Criação do usuário no banco
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: effectiveFullName,
        raEncrypted,
        raHash,
        phoneEncrypted,
        role: role as any,
      },
    });

    // Notifica Cockpit /chameguinho em tempo real
    await publishAdminEvent({
      type: 'USER_REGISTERED',
      payload: {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
    });

    // 7. Geração de JWT e fixação do cookie assinado HttpOnly (Zero JWT no body)
    const token = generateAuthToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    });

    reply.setCookie(COOKIE_SESSION_NAME, token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      signed: true,
      maxAge: 60 * 60 * 24 * 7, // 7 dias em segundos
    });

    // 8. Emissão de cookie CSRF para o cliente
    const csrfToken = generateCsrfToken();
    reply.setCookie(CSRF_COOKIE_NAME, csrfToken, {
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
    });

    return reply.status(201).send({
      message: 'Cadastro realizado com sucesso!',
      csrfToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        raMasked: ra ? `***${ra.slice(-4)}` : null,
        createdAt: user.createdAt,
      },
    });
  });

  /**
   * POST /api/v1/auth/login
   * Autenticação segura com emissão de cookie de sessão assinado.
   */
  app.post('/login', async (request, reply) => {
    const parseResult = LoginUserSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'VALIDATION_ERROR',
        details: parseResult.error.format(),
      });
    }

    const { email, password } = parseResult.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return reply.status(401).send({
        error: 'INVALID_CREDENTIALS',
        message: 'E-mail ou senha incorretos.',
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return reply.status(401).send({
        error: 'INVALID_CREDENTIALS',
        message: 'E-mail ou senha incorretos.',
      });
    }

    const token = generateAuthToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    });

    reply.setCookie(COOKIE_SESSION_NAME, token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      signed: true,
      maxAge: 60 * 60 * 24 * 7,
    });

    const csrfToken = generateCsrfToken();
    reply.setCookie(CSRF_COOKIE_NAME, csrfToken, {
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
    });

    let raMasked: string | null = null;
    if (user.raEncrypted) {
      try {
        const decryptedRA = decryptPII(user.raEncrypted);
        raMasked = `***${decryptedRA.slice(-4)}`;
      } catch {
        raMasked = 'RA: ****';
      }
    }

    return reply.status(200).send({
      message: 'Login realizado com sucesso!',
      csrfToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        raMasked,
        createdAt: user.createdAt,
      },
    });
  });

  /**
   * POST /api/v1/auth/logout
   * Destrói o cookie de sessão HttpOnly e o token CSRF.
   */
  app.post('/logout', async (request, reply) => {
    reply.clearCookie(COOKIE_SESSION_NAME, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      signed: true,
    });

    reply.clearCookie(CSRF_COOKIE_NAME, {
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return reply.status(200).send({
      success: true,
      message: 'Sessão encerrada com sucesso.',
    });
  });

  /**
   * GET /api/v1/auth/me
   * Retorna os dados do participante autenticado.
   */
  app.get('/me', { preHandler: [authGuard] }, async (request, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: request.user!.userId },
      include: {
        certificate: true,
        _count: {
          select: {
            attendanceRecords: true,
            preEnrollments: true,
            talentBookings: true,
          },
        },
      },
    });

    if (!user) {
      return reply.status(404).send({
        error: 'USER_NOT_FOUND',
        message: 'Usuário não encontrado.',
      });
    }

    let raMasked: string | null = null;
    if (user.raEncrypted) {
      try {
        const decryptedRA = decryptPII(user.raEncrypted);
        raMasked = `***${decryptedRA.slice(-4)}`;
      } catch {
        raMasked = 'RA: ****';
      }
    }

    return reply.status(200).send({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        raMasked,
        createdAt: user.createdAt,
        stats: {
          totalStamps: user._count.attendanceRecords,
          preEnrollments: user._count.preEnrollments,
          talentBookings: user._count.talentBookings,
          hasCertificate: !!user.certificate,
        },
      },
    });
  });
};
