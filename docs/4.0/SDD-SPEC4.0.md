# 📐 SPEC-DRIVEN DEVELOPMENT SPECIFICATION (SDD-SPEC 4.0)
## Plataforma, Hub Digital & Cockpit Administrativo da SECOMP 2026 (*Construindo Conexões*)
**Elaborado por:** Rick (*Tech Lead & Chief Architect*)  
**Status:** Single Source of Truth (SSoT) Blindada | **Versão:** 4.3.0  
**Stack Homologada:** [.agents/stack/web.yaml](file:///home/rai-moratto/Documents/projetos/software-house/software-house/.agents/stack/web.yaml)  
* **Backend:** Fastify Framework (Node.js LTS) + TypeScript em Modo Estrito  
* **Frontend:** React 18+ (Vite SPA) + Zustand (UI & CMS Reativo) + Supabase Realtime  
* **Banco de Dados:** Supabase PostgreSQL Cloud (`snake_case` absoluto, zero mocks)  
* **Segurança:** OWASP Top 10, Cookies HttpOnly/SameSite=Strict, CSRF Tokens e AES-256-GCM para PII  

---

## 1. Topologia de Dados & Matriz de Perfis Únicos

### 1.1 Matriz de 3 Perfis Únicos no Sistema
O sistema opera exclusivamente com **3 perfis de usuário**:

| Papel (`role`) | Descrição | Requisito de Identificação | Permissões no Sistema |
|---|---|---|---|
| **`STUDENT`** | Aluno da UTFPR | E-mail + RA (`aXXXXXXX` / `raXXXXXXX`) | Visualiza vitrine de eventos, lê QR Code OTT de presenças/palestras, lê QR Code de Cursos (+1 Carimbo), inscreve time no Ideathon, vota no Shark Tank e acumula carimbos oficiais. |
| **`VISITOR`** | Comunidade Externa / Visitante | E-mail válido | Visualiza vitrine de eventos, lê QR Code em eventos abertos/cursos, inscreve time no Ideathon, vota no Shark Tank. |
| **`ADMIN`** | Organizador / Administrador | Credencial Administrativa | Acesso exclusivo ao Cockpit `/admin`, emissão de QR Codes OTT por atividade/curso, ativação/bloqueio manual das sessões ao vivo (Admin Switch). |

*Nota: O papel `STAFF` foi formalmente descontinuado e unificado no perfil `ADMIN`.*

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
    role VARCHAR(50) DEFAULT 'STUDENT' NOT NULL, -- STUDENT, VISITOR, ADMIN
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

### 2.2 Tabela `activities` & `attendance_records` (Cursos, Palestras & Validação por QR Code)
```sql
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- 'PALESTRA', 'MINICURSO', 'RODA_DE_CONVERSA', 'WORKSHOP'
    speaker VARCHAR(255),
    location VARCHAR(255),
    starts_at TIMESTAMP WITH TIME ZONE,
    ends_at TIMESTAMP WITH TIME ZONE,
    enrolled_count INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE NOT NULL,
    stamp_granted INT DEFAULT 1 NOT NULL, -- +1 carimbo concedido por presença
    validated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_user_activity_attendance UNIQUE (user_id, activity_id)
);
```

### 2.3 Tabela `ideathon_teams` (Inscrição de Equipes v4.2)
```sql
CREATE TABLE IF NOT EXISTS public.ideathon_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_name VARCHAR(255) NOT NULL,
    leader_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    track VARCHAR(50) NOT NULL, -- DEV_UI, DATA_AI, HARDWARE_IOT, SOCIAL_INNOVATION
    members_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

### 2.4 Tabela `shark_pitches` & `shark_votes` (Votação em Tempo Real v4.2 & Placar Arena Live)
```sql
CREATE TABLE IF NOT EXISTS public.shark_pitches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_name VARCHAR(255) NOT NULL,
    pitch_deck_url VARCHAR(500),
    is_active BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.shark_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pitch_id UUID REFERENCES public.shark_pitches(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    client_fingerprint VARCHAR(128) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_user_pitch_vote UNIQUE (user_id, pitch_id)
);
```

---

## 3. Contratos de API REST & Telemetria (`/api/v1`)

| Endpoint | Método | Autenticação / RBAC | Descrição & Papel |
|---|---|---|---|
| `/api/v1/auth/register` | `POST` | Pública | Registro com domínios autorizados, validação de RA (para alunos) e PIN 6 |
| `/api/v1/auth/login` | `POST` | Pública | Emissão de cookie `secomp_session` HttpOnly e `__csrf` |
| `/api/v1/auth/me` | `GET` | `authGuard` | Retorna o perfil ativo do usuário (`STUDENT`, `VISITOR`, `ADMIN`) |
| `/api/v1/activities` | `GET` | Pública | Vitrine pública de cursos, palestras e minicursos (retorna `enrolled_count` atualizado estilo Arena Live) |
| `/api/v1/activities/:id/validate` | `POST` | `authGuard` | Leitura de QR Code dinâmico do Curso/Palestra/Roda de Conversa. Concede +1 carimbo no Passaporte e incrementa `enrolled_count` em tempo real. |
| `/api/v1/passport/validate` | `POST` | `authGuard` | Validação direta de presença via leitor de câmera (QR Code OTT 15 min) |
| `/api/v1/ideathon/teams` | `POST` | `authGuard` | Cadastro de equipe para a maratona Ideathon (se `ideathon_registration_open: true`) |
| `/api/v1/shark-tank/vote` | `POST` | `authGuard` | Registro de voto no pitch ativo com barramento realtime 60fps no Arena Live |
| `/api/v1/admin/cms/:key` | `PUT` | `roleGuard('ADMIN')` | Atualização do CMS e alternância das chaves manuais (Admin Master Switch) |

---

## 4. Arquitetura do Sistema de QR Code & Contagem Dinâmica (Arena Live Pattern)

1. **Remoção de QR Code Estático Pós-Login na Navbar:**
   - A Navbar mantém apenas o leitor de câmera acionável (`📷 QR Code Scanner`) para leitura de QR Codes no evento.
   - O QR Code estático genérico do usuário é removido da Navbar para evitar confusão de atribuição.
2. **QR Code Dinâmico por Curso / Palestra / Roda de Conversa:**
   - No Cockpit Admin e nas sessões ao vivo de atividades, é gerado um QR Code único e dinâmico apontando para `/validar-presenca?activityId={ID}`.
3. **Mecânica +1 Carimbo e Contagem em Tempo Real:**
   - Ao escanear o QR Code da atividade, o sistema executa `POST /api/v1/activities/:id/validate`.
   - Se for o primeiro acesso àquela atividade: concede **+1 carimbo** no `Passaporte` do participante e incrementa o `enrolled_count` (contagem de presenças/inscrições) da atividade.
   - A contagem de presenças é sincronizada instantaneamente via WebSocket (`Supabase Realtime`), replicando o padrão visual do `ArenaLivePage` para exibir números de inscritos/presentes em tempo real na vitrine.

