# 📐 SPEC-DRIVEN DEVELOPMENT SPECIFICATION (SDD-SPEC 2.0)
## Plataforma & Hub Digital da SECOMP 2026 (*Construindo Conexões*)
**Elaborado por:** Rick (*Tech Lead & Chief Architect*)  
**Status:** Single Source of Truth (SSoT) Blindada para Engenharia | **Versão:** 2.1.0  
**Stack Homologada:** [.agents/stack/web.yaml](file:///home/rai-moratto/Documents/projetos/software-house/software-house/.agents/stack/web.yaml)  
* **Runtime & Backend:** Node.js (v20 LTS) com Fastify Framework em TypeScript Estrito  
* **Frontend:** React 18+ (Vite SPA) com **TanStack Query (v5)** + **Zustand**  
* **Banco de Dados & ORM:** PostgreSQL 16+ com **Prisma ORM** (snake_case)  
* **Cache & Queues:** **Redis 7+** + **BullMQ** (Background Jobs & Workers)  
**Design System Vinculado:** [design.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/design.md) (Binance High-Voltage Dark)  
**ADRs Vinculadas:** [docs/ADR2.0.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/ADR2.0.md)  
**Backlog Vinculado:** [docs/BACKLOG2.0.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/BACKLOG2.0.md)

---

## 1. Visão Geral da Arquitetura do Sistema & Classificação de Execução

Conforme preconizado em `web.yaml`, o ecossistema opera sob uma arquitetura de camadas estritamente segregadas:

```text
                               ┌────────────────────────────────────────────────────────┐
                               │                    CLIENT BROWSER                      │
                               │  React 18+ SPA (Vite) + Lenis Smooth Scroll            │
                               │  State: Zustand (UI) | Fetching: TanStack Query (v5)   │
                               │  Parallel: Web Workers (Scrollytelling 3D Vectors)     │
                               │  Design System: Binance Dark (#0b0e11 / #fcd535)       │
                               └───────────────────────────┬────────────────────────────┘
                                                           │ HTTPS / REST / SSE
                                                           ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               DOCKER CONTAINER ÚNICO (secomp-monolith)                                   │
│                                                                                                          │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                         NODE.JS APPLICATION SERVER (Fastify / Event Loop)                        │   │
│   │                                                                                                  │   │
│   │   [Static Assets Middleware] ────────► Serve HTML5/JS/CSS do React (/dist/client)                │   │
│   │   [Security Guardrails]     ────────► Helmet, Rate Limiter (Redis-backed), CORS, Cookie Parser   │   │
│   │   [Validation Layer]        ────────► Zod Schemas (Entrada e Saída Estritamente Tipadas)         │   │
│   │   [API Router (/api/v1)]    ────────► Activities, Attendance OTT, Gamification, Shark Tank SSE   │   │
│   │   [Crypto Service]          ────────► AES-256-GCM para PII & HMAC-SHA256 para Certificados       │   │
│   │   [Prisma ORM Client]       ────────► Connection Pool & Async libuv threadpool                   │   │
│   └──────────────────────┬───────────────────────────────────────────┬───────────────────────────────┘   │
│                          │ Enqueue Jobs                              │ Pub/Sub & Cache Key-Value         │
│                          ▼                                           ▼                                   │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                    BULLMQ DISTRIBUTED WORKERS (Processamento em Background)                      │   │
│   │   • Fila 'certificate-generation': Renderização de PDFs e cálculo de HMAC-SHA256                │   │
│   │   • Fila 'notification-dispatch': Disparo assíncrono de e-mails transacionais                    │   │
│   │   • Fila 'shark-vote-persist': Flush assíncrono em lote dos votos para o PostgreSQL              │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────┬──────────────────────────┬───────────────────────────┘
                                                    │ TCP 5432                 │ TCP 6379
                                                    ▼                          ▼
                               ┌────────────────────────────────┐ ┌────────────────────────────────┐
                               │       POSTGRESQL (v16+)        │ │        REDIS (v7+ CLUSTER)     │
                               │  Schemas em snake_case         │ │  • One-Time Token Hash Cache   │
                               │  Constraints UNIQUE relacional │ │  • Leaderboard Cache (TTL 30s) │
                               │  PostgreSQL Query Parallelism  │ │  • Shark Tank Live Aggregator  │
                               └────────────────────────────────┘ └────────────────────────────────┘
```

### 1.1 Matriz de Classificação de Execução (web.yaml)

| Camada | Mecanismo | Papel na Plataforma SECOMP 2026 |
|---|---|---|
| **Asynchronous Layer** | Node.js Event Loop (I/O não-bloqueante) | Recepção de requests HTTP, stream de eventos SSE do Shark Tank. |
| | Prisma Client Queries (libuv) | Consultas assíncronas ao banco de dados sem travar a thread principal. |
| | React Concurrent Features | Suspense boundaries e transições fluidas entre os 5 Dias Narrativos. |
| | TanStack Query v5 | Cache no cliente, revalidação em background e deduplicação de requisições. |
| **Parallel Layer** | Node.js Worker Threads | Renderização pesada de templates de certificados (CPU-bound). |
| | Node.js Cluster Mode | Múltiplos processos Fastify balanceados por núcleos da CPU em produção. |
| | PostgreSQL Query Parallelism | Scans paralelos na apuração analítica de presenças e relatórios da organização. |
| | Web Workers no Browser | Descompressão de frames WebP e cálculo vetorial de perspectiva CSS 3D. |
| **Distributed Layer** | BullMQ Background Queues | Workers autônomos para emissão de certificados, envio de e-mails e flush de votos. |
| | Redis Cache Cluster | Armazenamento temporário dos One-Time Tokens de 15 min e rate-limiting por IP. |
| | Edge / CDN Caching | Distribuição global de assets estáticos compilados (Vite bundle e WebP frames). |

---

## 2. Camada Frontend: Gerenciamento de Estado & Data Fetching

### 2.1 Configuração Global do TanStack Query v5 (Server State)

```typescript
// frontend/src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutos para dados estáveis (Grade de Atividades)
      gcTime: 1000 * 60 * 15,    // 15 minutos em memória
      refetchOnWindowFocus: true, // Revalida status de carimbos ao voltar para a aba
      retry: (failureCount, error: any) => {
        if (error?.status === 404 || error?.status === 401) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false, // Mutação de voto ou token não repete automaticamente
    },
  },
});

// Chaves de Consulta Homologadas (Query Keys)
export const queryKeys = {
  activities: (dayIndex?: number, turn?: string, theme?: string) => 
    ['activities', { dayIndex, turn, theme }] as const,
  passportMe: () => ['passport', 'me'] as const,
  leaderboard: () => ['passport', 'leaderboard'] as const,
  sharkPitches: () => ['shark-tank', 'pitches'] as const,
  talentSlots: () => ['talent-arena', 'slots'] as const,
};
```

### 2.2 Gerenciamento de Estado Global da UI com Zustand (Client State)

```typescript
// frontend/src/stores/useUIStore.ts
import { create } from 'zustand';

interface UIState {
  activeDayIndex: number;
  selectedTurn: 'ALL' | 'MORNING' | 'AFTERNOON' | 'NIGHT';
  selectedTheme: 'ALL' | 'TECHNOLOGY' | 'MANAGEMENT' | 'INNOVATION' | 'CAREER';
  isTokenModalOpen: boolean;
  isVoteModalOpen: boolean;
  activePitchId: string | null;
  setActiveDayIndex: (day: number) => void;
  setSelectedTurn: (turn: 'ALL' | 'MORNING' | 'AFTERNOON' | 'NIGHT') => void;
  setSelectedTheme: (theme: 'ALL' | 'TECHNOLOGY' | 'MANAGEMENT' | 'INNOVATION' | 'CAREER') => void;
  openTokenModal: () => void;
  closeTokenModal: () => void;
  openVoteModal: (pitchId: string) => void;
  closeVoteModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeDayIndex: 1, // Começa na Segunda (O Mundo)
  selectedTurn: 'ALL',
  selectedTheme: 'ALL',
  isTokenModalOpen: false,
  isVoteModalOpen: false,
  activePitchId: null,
  setActiveDayIndex: (day) => set({ activeDayIndex: day }),
  setSelectedTurn: (turn) => set({ selectedTurn: turn }),
  setSelectedTheme: (theme) => set({ selectedTheme: theme }),
  openTokenModal: () => set({ isTokenModalOpen: true }),
  closeTokenModal: () => set({ isTokenModalOpen: false }),
  openVoteModal: (pitchId) => set({ isVoteModalOpen: true, activePitchId: pitchId }),
  closeVoteModal: () => set({ isVoteModalOpen: false, activePitchId: null }),
}));
```

---

## 3. Schemas Relacionais Completos em snake_case (PostgreSQL + Prisma)

Todas as entidades obedecem rigorosamente à convenção **`snake_case`** via anotações `@map` e `@@map`.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// 1. USUÁRIOS (PII CIFRADO COM AES-256-GCM)
enum UserRole {
  STUDENT
  STAFF
  ADMIN
  RECRUITER
}

model User {
  id              String       @id @default(uuid()) @db.Uuid
  email           String       @unique @db.VarChar(255)
  passwordHash    String       @map("password_hash") @db.VarChar(255)
  fullName        String       @map("full_name") @db.VarChar(255)
  raEncrypted     String?      @map("ra_encrypted") @db.Text       // PII: Criptografado AES-256-GCM
  raHash          String?      @map("ra_hash") @db.VarChar(64)     // SHA-256 para busca exata e indexação
  phoneEncrypted  String?      @map("phone_encrypted") @db.Text    // PII: Criptografado AES-256-GCM
  role            UserRole     @default(STUDENT)
  createdAt       DateTime     @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt       DateTime     @updatedAt @map("updated_at") @db.Timestamptz(6)

  preEnrollments   PreEnrollment[]
  attendanceRecords AttendanceRecord[]
  talentBookings   TalentArenaBooking[]
  certificate      Certificate?

  @@index([raHash], name: "idx_users_ra_hash")
  @@map("users")
}

// 2. ATIVIDADES DA GRADE NARRATIVA DE 5 DIAS & MINICURSOS WARM-UP
enum ActivityTurn {
  MORNING
  AFTERNOON
  NIGHT
}

enum ActivityTheme {
  TECHNOLOGY
  MANAGEMENT
  INNOVATION
  CAREER
}

enum ActivityTrack {
  DATA_AI
  INFRA_SECURITY
  HARDWARE_IOT
  DEV_UI
  GENERAL
}

model Activity {
  id             String         @id @default(uuid()) @db.Uuid
  title          String         @db.VarChar(255)
  description    String         @db.Text
  speakerName    String         @map("speaker_name") @db.VarChar(255)
  speakerBio     String?        @map("speaker_bio") @db.Text
  speakerCompany String?        @map("speaker_company") @db.VarChar(255)
  turn           ActivityTurn
  theme          ActivityTheme  @default(TECHNOLOGY)
  track          ActivityTrack  @default(GENERAL)
  dayIndex       Int            @map("day_index")
  isWarmup       Boolean        @default(false) @map("is_warmup")
  startsAt       DateTime       @map("starts_at") @db.Timestamptz(6)
  endsAt         DateTime       @map("ends_at") @db.Timestamptz(6)
  location       String         @db.VarChar(255)
  maxSeats       Int            @default(100) @map("max_seats")
  allocatedSeats Int            @default(0) @map("allocated_seats")
  createdAt      DateTime       @default(now()) @map("created_at") @db.Timestamptz(6)

  preEnrollments      PreEnrollment[]
  attendanceSessions  AttendanceSession[]
  attendanceRecords   AttendanceRecord[]

  @@index([dayIndex, turn], name: "idx_activities_day_turn")
  @@index([theme], name: "idx_activities_theme")
  @@map("activities")
}

// 3. PRÉ-INSCRIÇÃO COM LOCK RELACIONAL
model PreEnrollment {
  id          String    @id @default(uuid()) @db.Uuid
  userId      String    @map("user_id") @db.Uuid
  activityId  String    @map("activity_id") @db.Uuid
  createdAt   DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)

  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  activity    Activity  @relation(fields: [activityId], references: [id], onDelete: Cascade)

  @@unique([userId, activityId], name: "uq_user_pre_enrollment")
  @@map("pre_enrollments")
}

// 4. SESSÕES DE PRESENÇA (ONE-TIME TOKEN)
model AttendanceSession {
  id              String    @id @default(uuid()) @db.Uuid
  activityId      String    @map("activity_id") @db.Uuid
  tokenHash       String    @map("token_hash") @db.VarChar(64) // SHA-256 do token (ex: SEC-942)
  durationMinutes Int       @default(15) @map("duration_minutes")
  isActive        Boolean   @default(true) @map("is_active")
  openedAt        DateTime  @default(now()) @map("opened_at") @db.Timestamptz(6)
  expiresAt       DateTime  @map("expires_at") @db.Timestamptz(6)
  createdBy       String    @map("created_by") @db.Uuid

  activity        Activity  @relation(fields: [activityId], references: [id], onDelete: Cascade)
  records         AttendanceRecord[]

  @@index([tokenHash, isActive], name: "idx_sessions_token_active")
  @@map("attendance_sessions")
}

// 5. CARIMBOS DO PASSAPORTE (REGISTROS DE PRESENÇA)
enum StampType {
  LECTURE           // 1 Carimbo
  WARMUP_WORKSHOP   // 1 Carimbo
  TALENT_ARENA      // 2 Carimbos
  ARENA_GAMER       // 1 Carimbo
  IDEATHON          // 2 Carimbos
}

model AttendanceRecord {
  id            String             @id @default(uuid()) @db.Uuid
  userId        String             @map("user_id") @db.Uuid
  activityId    String             @map("activity_id") @db.Uuid
  sessionId     String?            @map("session_id") @db.Uuid
  stampType     StampType          @default(LECTURE) @map("stamp_type")
  pointsAwarded Int                @default(1) @map("points_awarded")
  createdAt     DateTime           @default(now()) @map("created_at") @db.Timestamptz(6)

  user          User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  activity      Activity           @relation(fields: [activityId], references: [id], onDelete: Cascade)
  session       AttendanceSession? @relation(fields: [sessionId], references: [id], onDelete: SetNull)

  @@unique([userId, activityId], name: "uq_user_activity_attendance")
  @@index([userId, createdAt], name: "idx_attendance_user_date")
  @@map("attendance_records")
}

// 6. SHARK TANK UTFPR: PITCHES E VOTOS
model SharkPitch {
  id          String       @id @default(uuid()) @db.Uuid
  startupName String       @map("startup_name") @db.VarChar(255)
  oneLiner    String       @map("one_liner") @db.VarChar(255)
  teamMembers String       @map("team_members") @db.Text
  pitchOrder  Int          @map("pitch_order")
  voteCount   Int          @default(0) @map("vote_count")
  createdAt   DateTime     @default(now()) @map("created_at") @db.Timestamptz(6)

  votes       SharkVote[]

  @@map("shark_pitches")
}

model SharkVote {
  id                 String      @id @default(uuid()) @db.Uuid
  pitchId            String      @map("pitch_id") @db.Uuid
  sessionFingerprint String      @map("session_fingerprint") @db.VarChar(64)
  createdAt          DateTime    @default(now()) @map("created_at") @db.Timestamptz(6)

  pitch              SharkPitch  @relation(fields: [pitchId], references: [id], onDelete: Cascade)

  @@unique([sessionFingerprint], name: "uq_shark_vote_fingerprint")
  @@index([pitchId], name: "idx_shark_votes_pitch")
  @@map("shark_votes")
}

// 7. RODA DE TALENTOS (SPEED INTERVIEWS 15 MIN)
enum SlotStatus {
  AVAILABLE
  BOOKED
  COMPLETED
}

model TalentArenaSlot {
  id               String       @id @default(uuid()) @db.Uuid
  companyName      String       @map("company_name") @db.VarChar(255)
  interviewerName  String       @map("interviewer_name") @db.VarChar(255)
  slotTime         DateTime     @map("slot_time") @db.Timestamptz(6)
  status           SlotStatus   @default(AVAILABLE)
  createdAt        DateTime     @default(now()) @map("created_at") @db.Timestamptz(6)

  booking          TalentArenaBooking?

  @@map("talent_arena_slots")
}

model TalentArenaBooking {
  id             String           @id @default(uuid()) @db.Uuid
  slotId         String           @unique @map("slot_id") @db.Uuid
  userId         String           @map("user_id") @db.Uuid
  linkedinUrl    String           @map("linkedin_url") @db.VarChar(500)
  fieldInterest  String           @map("field_interest") @db.VarChar(100)
  createdAt      DateTime         @default(now()) @map("created_at") @db.Timestamptz(6)

  slot           TalentArenaSlot  @relation(fields: [slotId], references: [id], onDelete: Cascade)
  user           User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId], name: "uq_user_talent_booking")
  @@map("talent_arena_bookings")
}

// 8. CERTIFICADOS EMITIDOS COM HASH AUDITÁVEL
model Certificate {
  id             String    @id @default(uuid()) @db.Uuid
  userId         String    @unique @map("user_id") @db.Uuid
  validationHash String    @unique @map("validation_hash") @db.VarChar(64)
  fullName       String    @map("full_name") @db.VarChar(255)
  raMasked       String    @map("ra_masked") @db.VarChar(20)
  totalHours     Int       @map("total_hours")
  levelReached   String    @map("level_reached") @db.VarChar(50)
  issuedAt       DateTime  @default(now()) @map("issued_at") @db.Timestamptz(6)

  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([validationHash], name: "idx_cert_hash")
  @@map("certificates")
}
```

---

## 4. Camada de Cache & Background Queues (Redis + BullMQ)

### 4.1 Definição das Filas BullMQ

```typescript
// backend/src/queues/queueManager.ts
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';

export const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

// 1. Fila de Geração de Certificados em PDF (Offloaded CPU-bound)
export const certificateQueue = new Queue('certificate-generation', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
  },
});

// 2. Fila de Disparo de E-mails Transacionais
export const notificationQueue = new Queue('notification-dispatch', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 3000 },
  },
});

// 3. Fila de Persistência em Lote de Votos (Flush Assíncrono)
export const sharkVoteBatchQueue = new Queue('shark-vote-persist', {
  connection: redisConnection,
});
```

### 4.2 Worker de Geração Assíncrona de Certificados

```typescript
// backend/src/workers/certificate.worker.ts
import { Worker } from 'bullmq';
import { redisConnection } from '../queues/queueManager';
import { prisma } from '../lib/prisma';
import crypto from 'crypto';

export const certificateWorker = new Worker(
  'certificate-generation',
  async (job) => {
    const { userId } = job.data;

    // 1. Busca dados do participante e calcula carimbos
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('USER_NOT_FOUND');

    const totalStamps = await prisma.attendanceRecord.count({ where: { userId } });
    const totalHours = totalStamps * 3; // 3h por carimbo acadêmico
    const level = totalStamps >= 11 ? 'Mestre da SECOMP' : totalStamps >= 7 ? 'Adepto' : 'Graduado';

    // 2. Gera hash criptográfico HMAC-SHA256
    const secret = process.env.CERTIFICATE_SIGN_SECRET || 'fallback-secret-2026';
    const validationHash = crypto
      .createHmac('sha256', secret)
      .update(`${user.id}:${user.fullName}:${totalHours}:${level}:2026`)
      .digest('hex');

    // 3. Persiste no PostgreSQL
    const certificate = await prisma.certificate.upsert({
      where: { userId },
      update: { validationHash, totalHours, levelReached: level },
      create: {
        userId,
        validationHash,
        fullName: user.fullName,
        raMasked: 'RA: ***' + (user.raHash ? user.raHash.slice(0, 4) : '0000'),
        totalHours,
        levelReached: level,
      },
    });

    return { certificateId: certificate.id, validationHash };
  },
  { connection: redisConnection, concurrency: 4 }
);
```

---

## 5. Schemas de Validação de Entrada e Saída (Zod v3)

```typescript
// backend/src/schemas/contracts.schema.ts
import { z } from 'zod';

export const ValidateAttendanceTokenSchema = z.object({
  token: z
    .string()
    .min(5)
    .max(10)
    .regex(/^SEC-[A-Z0-9]{3,6}$/i, 'Formato de token inválido. Esperado: SEC-XXX'),
});

export const SharkTankVoteSchema = z.object({
  pitchId: z.string().uuid('ID de pitch inválido'),
  clientFingerprint: z.string().min(16).max(128),
});

export const PreEnrollmentSchema = z.object({
  activityId: z.string().uuid('ID de atividade inválido'),
});

export const TalentBookingSchema = z.object({
  slotId: z.string().uuid('ID de slot inválido'),
  linkedinUrl: z.string().url('URL do LinkedIn inválida').includes('linkedin.com/'),
  fieldInterest: z.enum(['DEV_SOFTWARE', 'DATA_AI', 'CYBERSECURITY', 'CLOUD_DEVOPS', 'PRODUCT_DESIGN']),
});
```

---

## 6. Algoritmo Anti-Fraude de Token com Cache Redis & Transação Prisma

```typescript
// backend/src/services/attendance.service.ts
import { prisma } from '../lib/prisma';
import { redisConnection } from '../queues/queueManager';
import crypto from 'crypto';

export async function validateOneTimeToken(userId: string, rawToken: string) {
  const tokenFormatted = rawToken.toUpperCase().trim();
  const tokenHash = crypto.createHash('sha256').update(tokenFormatted).digest('hex');

  // 1. Verificação rápida em Cache Redis (TTL)
  const cachedSessionId = await redisConnection.get(`token:${tokenHash}`);
  const now = new Date();

  return await prisma.$transaction(async (tx) => {
    // 2. Localiza sessão de presença ativa e válida
    const session = await tx.attendanceSession.findFirst({
      where: {
        tokenHash,
        isActive: true,
        expiresAt: { gte: now },
      },
      include: { activity: true },
    });

    if (!session) {
      throw new Error('TOKEN_EXPIRED_OR_INVALID');
    }

    // 3. Verifica duplicidade (A constraint de banco impede, mas fail-fast reduz lock)
    const existing = await tx.attendanceRecord.findUnique({
      where: {
        uq_user_activity_attendance: {
          userId,
          activityId: session.activityId,
        },
      },
    });

    if (existing) {
      throw new Error('ATTENDANCE_ALREADY_RECORDED');
    }

    // 4. Cria o carimbo
    await tx.attendanceRecord.create({
      data: {
        userId,
        activityId: session.activityId,
        sessionId: session.id,
        stampType: session.activity.isWarmup ? 'WARMUP_WORKSHOP' : 'LECTURE',
        pointsAwarded: 1,
      },
    });

    // 5. Invalida cache de leaderboard no Redis para o próximo request
    await redisConnection.del('cache:leaderboard');

    const totalStamps = await tx.attendanceRecord.count({ where: { userId } });
    return { totalStamps, isEligible: totalStamps >= 8 };
  });
}
```

---

## 7. Matriz de Segurança e Mitigação OWASP Top 10

| Vulnerabilidade OWASP | Camada de Mitigação Implementada |
|---|---|
| **A01: Broken Access Control** | Roles (`STUDENT`, `STAFF`, `ADMIN`) validadas via middleware Fastify em JWT assinado. |
| **A02: Cryptographic Failures** | Dados PII (RA acadêmico e telefones) cifrados com **AES-256-GCM**; HMAC-SHA256 em certificados. |
| **A03: Injection (SQL / XSS)** | Prepared Statements do Prisma ORM e tipagem estrita com Zod v3 (`stripUnknown: true`). |
| **A04: Insecure Design** | Rate-limit por IP via Redis e One-Time Tokens de expiração estrita (15 min). |
| **A05: Security Misconfiguration** | Headers HTTP rígidos via `@fastify/helmet` (CSP restritiva, HSTS, X-Frame-Options: DENY). |
| **A07: Identification Failures** | Trava anti-sybil no Shark Tank (`UNIQUE(session_fingerprint)`) e cookies `HttpOnly`/`SameSite=Strict`. |

---

## 8. Contrato do Sistema de Parceiros, Cotas & Túnel 3D Client-Side

Conforme homologado na [ADR-011](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/ADR2.0.md#adr-011), o catálogo de patrocinadores e o sistema de cotas é executado no client-side com tipagem estrita em TypeScript:

### 8.1 Modelos de Dados e Tipos TypeScript

```typescript
export type CotaTier =
  | 'OURO'
  | 'PRATA'
  | 'BRONZE'
  | 'PARCEIRO'
  | 'INSTITUCIONAL'
  | 'EXPOSITOR';

export interface Partner {
  id: string;
  name: string;
  category: string;
  cota: CotaTier;
  cotaLabel: string;
  cotaIcon: string;
  cotaColor: string;
  badgeColor: string;
  tagline: string;
  description: string;
  benefits: string[];
  tags: string[];
  websiteUrl: string;
}

export interface PartnerInquiryInput {
  name: string;
  email: string;
  subject: string;
  message: string;
  partnerId?: string;
}
```

### 8.2 Especificação dos Componentes & Engine 3D

| Componente | Responsabilidade | Contratos & Constraints |
|---|---|---|
| `SponsorsMediaKitSection` | Container orquestrador do scrollytelling de 520vh | Ancorado no topo (`sticky top-16`), gerencia `scrollYProgress` e interpola `smoothStep` via `useSpring(stiffness: 75, damping: 24)`. |
| `WarpTunnelCanvas` | Canvas 2D efêmero para feixes de luz do túnel | Executa a 60 FPS sob demanda via `requestAnimationFrame`; hiberna quando `scrollActivity < 0.008`; opacidade máxima atenuada em $\le 0.08$. |
| `TunnelLogo3D` | Projeção em profundidade Z de cada logo | Utiliza `translate3d(0, y, z)` e atinge escala de 2.0x no delta focal; gerencia foco acessível por teclado (`tabIndex={0}`, `Enter`/`Espaço`). |
| `CotaDetailModal` | Modal flutuante de contrapartidas e formulário | Backdrop blur com fecho via clique externo ou tecla `Escape`; formulário B2B com feedback instantâneo. |

### 8.3 Diretrizes de Conforto Visual & Performance Budget
* **Zero Clarão Ofuscante:** Teto de opacidade das partículas em 0.07-0.08 e brilho central limitado a 0.04.
* **Eliminação de Bordas Pesadas:** Remoção de todos os aros concêntricos ovais com bordas sólidas no fundo.
* **Consumo de Memória:** Estrutura 100% livre de vazamento de listeners (cleanup em `useEffect`).

