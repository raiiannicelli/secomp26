# 📐 SPEC-DRIVEN DEVELOPMENT SPECIFICATION (SDD-SPEC 4.0)
## Plataforma, Hub Digital & Cockpit Administrativo da SECOMP 2026 (*Construindo Conexões*)
**Elaborado por:** Rick (*Tech Lead & Chief Architect*)  
**Status:** Single Source of Truth (SSoT) Blindada contra Mocks & Dados Falsos | **Versão:** 4.0.0  
**Stack Homologada:** [.agents/stack/web.yaml](file:///home/rai-moratto/Documents/projetos/software-house/software-house/.agents/stack/web.yaml)  
* **Backend:** Fastify Framework (Node.js LTS) + TypeScript em Modo Estrito  
* **Frontend:** React 18+ (Vite SPA) + Zustand (UI & CMS Reativo) + Supabase Realtime  
* **Banco de Dados:** Supabase PostgreSQL Cloud (`snake_case` absoluto, zero mocks)  
* **Segurança:** OWASP Top 10, Cookies HttpOnly/SameSite=Strict, CSRF Tokens e AES-256-GCM para PII  

---

## 1. Topologia de Dados & Arquitetura Unificada (Zero Split-Brain)

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT BROWSER (Vite SPA)                               │
│  • Zustand Stores: useUIStore (Auth, Gamificação, CMS reativo)                         │
│  • Supabase Client: Channel 'secomp-chameguinho' (Broadcast Realtime)                  │
│  • Zero Mock: Todos os estados vazios aguardam resposta da API ou exibem Skeletons     │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ HTTPS / REST (Cookies HttpOnly + CSRF)
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              FASTIFY APPLICATION BACKEND                               │
│  • Guardiões de Segurança: authGuard, roleGuard, adminSecurityGuard, csrfGuard         │
│  • Validação de Contratos: Zod Schemas estritos para todas as rotas                    │
│  • Service de Criptografia: AES-256-GCM (RA e Telefone) + SHA-256 (Buscas seguras)     │
│  • Realtime Emitter: publishAdminEvent() despacha payloads para o canal Supabase       │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ Supabase Service Role Key / Direct SQL
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                             SUPABASE POSTGRESQL (NUVEM)                                │
│  • SSoT Única: Tabelas em snake_case com constraints relacionais estritas              │
│  • users | activities | pre_enrollments | attendance_sessions | attendance_records     │
│  • shark_pitches | shark_votes | talent_arena_slots | talent_arena_bookings | cms_data │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Schemas do Banco de Dados Relacional (PostgreSQL Supabase)

### 2.1 Tabela `users`
```sql
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    ra_encrypted TEXT,
    ra_hash VARCHAR(64) UNIQUE,
    phone_encrypted TEXT,
    role VARCHAR(50) DEFAULT 'STUDENT' NOT NULL, -- STUDENT, VISITOR, STAFF, ADMIN
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

### 2.2 Tabela `activities`
```sql
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    speaker_name VARCHAR(255) NOT NULL,
    speaker_bio TEXT,
    speaker_company VARCHAR(255),
    turn VARCHAR(50) NOT NULL, -- MORNING, AFTERNOON, NIGHT
    theme VARCHAR(50) NOT NULL, -- TECHNOLOGY, MANAGEMENT, INNOVATION, CAREER
    track VARCHAR(50),          -- DADOS, INFRA, HARDWARE, DEV
    day_index INTEGER NOT NULL, -- 0 a 4 (Segunda a Sexta)
    is_warmup BOOLEAN DEFAULT FALSE NOT NULL,
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(255) NOT NULL,
    max_seats INTEGER DEFAULT 100 NOT NULL,
    allocated_seats INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

### 2.3 Tabela `pre_enrollments`
```sql
CREATE TABLE IF NOT EXISTS public.pre_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_user_activity_enrollment UNIQUE (user_id, activity_id)
);
```

### 2.4 Tabela `attendance_sessions` (OTT de 15 Minutos)
```sql
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE NOT NULL,
    token_hash VARCHAR(64) UNIQUE NOT NULL,
    duration_minutes INTEGER DEFAULT 15 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID REFERENCES public.users(id) NOT NULL
);
```

### 2.5 Tabela `attendance_records` (Carimbos & Presenças)
```sql
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE NOT NULL,
    session_id UUID REFERENCES public.attendance_sessions(id) ON DELETE SET NULL,
    points_awarded INTEGER DEFAULT 1 NOT NULL,
    stamp_type VARCHAR(50) DEFAULT 'STANDARD' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_user_activity_attendance UNIQUE (user_id, activity_id)
);
```

### 2.6 Tabela `shark_pitches` & `shark_votes`
```sql
CREATE TABLE IF NOT EXISTS public.shark_pitches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_name VARCHAR(255) NOT NULL,
    one_liner TEXT NOT NULL,
    team_members TEXT NOT NULL,
    pitch_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.shark_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pitch_id UUID REFERENCES public.shark_pitches(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    ra_hash VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_user_shark_vote UNIQUE (user_id) -- Voto Único por Conta
);
```

### 2.7 Tabela `talent_arena_slots` & `talent_arena_bookings`
```sql
CREATE TABLE IF NOT EXISTS public.talent_arena_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    interviewer_name VARCHAR(255) NOT NULL,
    slot_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'AVAILABLE' NOT NULL, -- AVAILABLE, BOOKED, COMPLETED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.talent_arena_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_id UUID REFERENCES public.talent_arena_slots(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    linkedin_url TEXT NOT NULL,
    field_interest VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_user_talent_booking UNIQUE (user_id),
    CONSTRAINT unique_slot_talent_booking UNIQUE (slot_id)
);
```

### 2.8 Tabela `cms_contents` (Mini-CMS Centralizado)
```sql
CREATE TABLE IF NOT EXISTS public.cms_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL, -- lectures, workshops, mentors, partners, event_photos
    value JSONB NOT NULL,
    updated_by UUID REFERENCES public.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

---

## 3. Contratos de API REST & Telemetria (`/api/v1`)

| Endpoint | Método | Autenticação / RBAC | Descrição & Papel |
|---|---|---|---|
| `/api/v1/auth/register` | `POST` | Pública | Registro com 7 domínios institucionais, validação RA e PIN 6 |
| `/api/v1/auth/login` | `POST` | Pública | Emissão de cookie `secomp_session` HttpOnly e `__csrf` |
| `/api/v1/auth/me` | `GET` | `authGuard` | Retorna o perfil ativo do usuário |
| `/api/v1/activities` | `GET` | Opcional | Lista grade de palestras e minicursos com contagem real de vagas |
| `/api/v1/activities/:id/enroll` | `POST` | `authGuard` | Pré-inscrição atômica com validação de limite |
| `/api/v1/attendance/validate-token`| `POST` | `authGuard` | Validação de presença com token OTT de 15 min |
| `/api/v1/passport/me` | `GET` | `authGuard` | Retorna os carimbos acumulados e o nível de maestria (6 níveis) |
| `/api/v1/shark-tank/pitches` | `GET` | Pública | Lista startups e apuração de votos |
| `/api/v1/shark-tank/vote` | `POST` | `authGuard` | Registro de voto único com constraint no banco |
| `/api/v1/talent-arena/slots` | `GET` | Pública | Horários disponíveis para entrevista de 15 min |
| `/api/v1/talent-arena/slots/:id/book`| `POST`| `authGuard` | Reserva de slot com concessão automática de +2 carimbos |
| `/api/v1/admin/users` | `GET` | `adminSecurityGuard` | Lista paginada de usuários para auditoria |
| `/api/v1/admin/stamps` | `GET` | `adminSecurityGuard` | Histórico completo de carimbos validados |
| `/api/v1/admin/votes` | `GET` | `adminSecurityGuard` | Apuração auditável de votos do Shark Tank |
| `/api/v1/admin/enrollments` | `GET` | `adminSecurityGuard` | Lista de pré-inscrições em workshops |
| `/api/v1/admin/sessions/open` | `POST` | `adminSecurityGuard` | Geração de One-Time Token (OTT) e QR Code de 15 min |
| `/api/v1/admin/cms/:key` | `PUT` | `adminSecurityGuard` | Atualização atômica do CMS e disparo de Realtime Broadcast |

---

## 4. Quality Gates & Validação Contínua da Squad

1. **Zero Mocks:** Qualquer submissão de código que introduza objetos mockados estáticos no frontend será reprovada pela @judith.
2. **Cobertura de Testes:** A suite de testes de integração (`npm run test:all`) deve cobrir todos os contratos Zod e Fastify com aprovação de 100%.
3. **Latência de Telemetria:** Tempo de resposta dos endpoints administrativos $< 250\text{ms}$ e atualização instantânea via Realtime.

---

## 5. Arquitetura do Protocolo Sentry MCP & Observabilidade End-to-End

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              AGENT / IDE TOOLING (MCP)                                 │
│  • Configuração: .mcp.json -> sentry ("url": "https://mcp.sentry.dev/mcp")             │
│  • Autenticação: /mcp auth sentry                                                       │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ Protocolo Remote Model Context Protocol
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                            SENTRY OBSERVABILITY SERVICE                                │
│  • Rastreamento de Exceções & Craches em Tempo Real (Backend Fastify & SPA Vite)       │
│  • Sanitização de PII: Redação estrita de PII (ra_encrypted, phone_encrypted, secret)   │
│  • APM Transaction Tracking: Alertas automáticos para latências > 300ms nas rotas CMS  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 5.1 Regras de Sanitização de Logs & Breadcrumbs Sentry (Anti-Leak Protocol)
* **Headers Omitidos:** `Authorization`, `Cookie`, `X-CSRF-Token` são despojados de qualquer payload enviado ao Sentry.
* **Payload Redaction:** Qualquer chave contendo `password`, `ra`, `phone`, `token`, `secret` é obrigatoriamente mascarada como `[REDACTED]`.
* **Zero PII Leakage:** Em conformidade com a LGPD e a política OWASP A07, nenhum dado de aluno (RA/Telefone) é enviado em texto claro.

---

## 6. Regra Infalível de Validação do Passaporte & Matriz de Perfis

```text
               ┌──────────────────────────────────────────────┐
               │    PARTICIPANTE (Aluno / Visitante)          │
               └──────────────────────┬───────────────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │  Existe Pré-inscrição?    │
                        └─────────────┬─────────────┘
                                      │
                     ┌────────────────┴────────────────┐
                     │ SIM                             │ NÃO
                     ▼                                 ▼
        ┌─────────────────────────┐      ┌──────────────────────────┐
        │ Escanear QR Code (OTT)  │      │  ERRO: Pre-enrollment   │
        └────────────┬────────────┘      │        Required (403)     │
                     │                   └──────────────────────────┘
                     ▼
        ┌─────────────────────────┐
        │ Valida OTT (Timer 15m)  │
        └────────────┬────────────┘
                     │
                     ▼
        ┌─────────────────────────┐
        │ Transação Criptográfica │ ──> Registra `attendance_records` + Concede Carimbo
        └─────────────────────────┘
```

### 6.1 Matriz de Validação Transacional de Perfis

| Ação / Evento | Perfis Permitidos | Pré-inscrição Exigida? | Regra de Carimbo / Recompensa |
| :--- | :--- | :--- | :--- |
| **Palestras do Auditório** | `STUDENT`, `VISITOR` | SIM (`pre_enrollments`) | +1 Carimbo por palestra via QR Code (Max 1 por horário) |
| **Minicursos Warm-up** | `STUDENT` | SIM (`pre_enrollments`) | +1 Carimbo por minicurso presencial/online |
| **Shark Tank UTFPR (Voto)** | `STUDENT`, `VISITOR` | NÃO | +1 Carimbo bônus ao registrar voto único por `user_id` |
| **Arena de Talentos (Simulação RH)**| `STUDENT` | SIM (`talent_arena_bookings`) | +2 Carimbos bônus no passaporte |
| **Ideathon Express (Equipe)** | `STUDENT` | SIM | Elegibilidade à premiação final e badge LinkedIn |
| **Feira da Lua / Interação Pátio** | Todos | NÃO | Acesso livre à comunidade externa |

### 6.2 Governança de Transação no Banco de Dados
Toda tentativa de gerar carimbo passa pela seguinte validação atômica em SQL/Fastify:
1. `SELECT id FROM pre_enrollments WHERE user_id = $1 AND activity_id = $2;` -> Caso inexistente, aborta com HTTP 403 (*Pre-enrollment required*).
2. `SELECT id FROM attendance_sessions WHERE token_hash = $3 AND is_active = TRUE AND expires_at > NOW();` -> Caso expirado, aborta com HTTP 410 (*Token expired*).
3. `INSERT INTO attendance_records (user_id, activity_id, session_id, points_awarded) VALUES ($1, $2, $3, 1);` -> Sucesso com trava `UNIQUE(user_id, activity_id)`.

---

## 7. Arquitetura de Cookies Stateless & Telemetria sem Injeção de Dados

```text
 ┌─────────────────────────────────────────────────────────────────────────────────────────┐
 │                                CLIENT BROWSER (Vite SPA)                                │
 │  • ZERO payload de negócio em localStorage/cookies                                      │
 │  • Recebe via WebSocket apenas eventos desidentificados: { type: 'CMS_UPDATED' }       │
 │  • Dispara requisição REST assinada com HttpOnly Cookie para obter visão agregada      │
 └───────────────────────────────────────────┬─────────────────────────────────────────────┘
                                             │ WebSocket Event (Zero PII) / REST HTTP
                                             ▼
 ┌─────────────────────────────────────────────────────────────────────────────────────────┐
 │                             FASTIFY APPLICATION BACKEND                                 │
 │  • Valida Cookie Stateless `secomp_session` (JWT Criptografado no Header/Cookie)        │
 │  • Executa Queries Atômicas no PostgreSQL Supabase (Única Fonte da Verdade)              │
 │  • Retorna DTO Sanitizado (Redação de senhas, RAs e telefones em texto claro)           │
 └─────────────────────────────────────────────────────────────────────────────────────────┘
```

### 7.1 Regras de Sanitização de Cookies & Sessão Stateless
1. **Atributos de Segurança do Cookie `secomp_session`:**
   - `HttpOnly: true` -> Impede leitura via script JavaScript no navegador (`document.cookie`).
   - `SameSite: 'Strict'` -> Previne ataques de Cross-Site Request Forgery (CSRF).
   - `Secure: true` -> Força tráfego exclusivo sob HTTPS em produção.
2. **Proibição de Persistência em Cookie:**
   - **Veto:** Guardar arrays de carimbos, listas de inscritos, roles brutas ou payloads de CMS no cookie.
   - **Permitido:** Apenas o token assinado de sessão JWT contendo `userId`, `role` e `exp`.
3. **Telemetria Desidentificada:**
   - Os canais de WebSocket (`secomp-chameguinho`) enviam exclusivamente notificações de tipo (ex: `STAMP_ADDED`, `CMS_UPDATED`) sem anexar dados pessoais dos alunos.
