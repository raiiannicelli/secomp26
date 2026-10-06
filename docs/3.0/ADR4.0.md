# 📜 ARCHITECTURAL DECISION RECORDS (ADR 4.0) — SECOMP 2026
**Projeto:** Hub Digital, Plataforma Oficial & Cockpit Administrativo da SECOMP 2026 (*Construindo Conexões*)  
**Elaborado por:** Rick (*Tech Lead & Chief Architect*)  
**Status:** Consolidado e Blindado contra Mocks & Débito Técnico | **Versão:** 4.2.0  
**Stack Homologada:** [.agents/stack/web.yaml](file:///home/rai-moratto/Documents/projetos/software-house/software-house/.agents/stack/web.yaml)  
**Design System Vinculado:** [designBINANCE.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/designBINANCE.md) (High-Voltage Dark `#0b0e11` + `#fcd535`)  

---

## 🛡️ Parecer Técnico do Tech Lead (Auditoria & Eliminação de Débitos)

Como **Tech Lead & Chief Architect**, estabeleço a erradicação de qualquer mock, fallback em memória, dado simulado ou duplicidade de estado no frontend.

---

## Índice das Decisões Arquiteturais v4.2

* [ADR-012](#adr-012): Migração Integral da Camada de Persistência para PostgreSQL Nativo no Supabase Cloud
* [ADR-013](#adr-013): Política Strict Zero-Mock & Erradicação de Fallbacks no Frontend
* [ADR-014](#adr-014): Sincronização e Telemetria Reativa Bi-direcional (PostgreSQL + Supabase Realtime Channels)
* [ADR-015](#adr-015): Centralização do Mini-CMS no PostgreSQL (`cms_contents`) com Broadcast Instantâneo
* [ADR-016](#adr-016): Protocolo de Observabilidade, Telemetria de Erros & Autenticação Sentry via MCP
* [ADR-017](#adr-017): Regra Estrita de Passaporte, Validação Exclusiva por QR Code e Matriz de Perfis (`STUDENT`, `VISITOR`, `ADMIN`)
* [ADR-018](#adr-018): Isolamento Estrito de Registros (Zero Frontend Payload Injection) e Telemetria via Cookies Stateless
* [ADR-019](#adr-019): Arquitetura de Liberação Manual (Admin Master Switch) para Módulos Interativos (Ideathon, Shark Tank, QR Code, Startup Day)

---

### ADR-012: Migração Integral da Camada de Persistência para PostgreSQL Nativo no Supabase Cloud

* **Status:** Aprovado
* **Contexto:**
  O sistema necessita de integridade relacional estrita, transações ACID e persistência em nuvem gerenciada, eliminando bancos locais efêmeros que perdem sincronia.
* **Decisão:**
  1. O **Supabase PostgreSQL** (`xypxdnvlwlthjvuljuff.supabase.co`) é a Única Fonte da Verdade (SSoT).
  2. Todas as tabelas seguem o padrão **`snake_case`** estrito:
     - `users`, `activities`, `pre_enrollments`, `attendance_sessions`, `attendance_records`, `shark_pitches`, `shark_votes`, `talent_arena_slots`, `talent_arena_bookings`, `certificates`, `cms_contents`, `ideathon_teams`.
  3. Todas as escritas são mediadas pelo Fastify Backend via Service Role Key com validação Zod e geração determinística de `id` UUID v4 e timestamps ISO.

---

### ADR-013: Política Strict Zero-Mock & Erradicação de Fallbacks no Frontend

* **Status:** Aprovado
* **Contexto:**
  A presença de arrays mockados comprometia a confiabilidade da telemetria e da controladoria.
* **Decisão:**
  1. Fica **estritamente proibido** criar ou manter fallbacks estáticos de dados em componentes (`.tsx`) ou stores (`useUIStore.ts`).
  2. Se a API retornar vazio ou falhar, a UI exibe o estado vazio real (*Empty State*) ou *Skeleton Loader* de carregamento.
  3. Todos os contadores de métricas iniciam em 0 e são hidratados exclusivamente pelas queries `/api/v1/admin/*`.

---

### ADR-014: Sincronização e Telemetria Reativa Bi-direcional (PostgreSQL + Supabase Realtime Channels)

* **Status:** Aprovado
* **Contexto:**
  O Cockpit Administrativo e os participantes no auditório precisam receber atualizações instantâneas de presenças, votos e novos participantes sem polling excessivo.
* **Decisão:**
  1. Implementar arquitetura híbrida:
     - **Initial Hydration:** Fetch HTTP via Fastify com cookie HttpOnly e verificação de CSRF.
     - **Realtime Stream:** Canal `secomp-events` do Supabase Realtime ouvindo `STAMP_ADDED`, `USER_REGISTERED`, `VOTE_CAST`, `CMS_UPDATED` e `SESSION_STATUS_CHANGED`.

---

### ADR-015: Centralização do Mini-CMS no PostgreSQL (`cms_contents`) com Broadcast Instantâneo

* **Status:** Aprovado
* **Contexto:**
  Alterações de palestras, minicursos, mentores, parceiros e estados das sessões devem refletir em todo o site em tempo real.
* **Decisão:**
  1. A tabela `cms_contents` armazena o JSON estruturado de cada seção (`lectures`, `workshops`, `mentors`, `partners`, `session_status`).
  2. Atualizações são enviadas via `PUT /api/v1/admin/cms/:key` com autorização estrita de `role=ADMIN`.
  3. O backend persiste no banco e dispara o evento `CMS_UPDATED` / `SESSION_STATUS_CHANGED`.

---

### ADR-016: Protocolo de Observabilidade, Telemetria de Erros & Autenticação Sentry via MCP

* **Status:** Aprovado
* **Contexto:**
  Falhas de payload, tentativas de bypass de rotas admin e estouros de quota de concorrência precisam ser monitorados preventivamente.
* **Decisão:**
  1. Integração do **Sentry MCP Server** via URL HTTPS (`https://mcp.sentry.dev/mcp`).
  2. Sanitização obrigatória de PII (*Personally Identifiable Information*) antes do envio ao Sentry.

---

### ADR-017: Regra Estrita de Passaporte, Validação Exclusiva por QR Code e Matriz de Perfis (`STUDENT`, `VISITOR`, `ADMIN`)

* **Status:** Aprovado
* **Contexto:**
  Para evitar duplicidades de carimbo e contaminação de estatísticas, é necessário impor regras inflexíveis.
* **Decisão:**
  1. **Vitrine Pública:** Palestras e cursos atuam como vitrine pública de atrações (zero botões de pré-inscrição obrigatória).
  2. **Validação Exclusiva por QR Code OTT:** Tokens de presença expiram em 15 minutos e possuem trava de leitura única por `user_id`.
  3. **Matriz de Perfis:**
     - **`STUDENT` (Aluno UTFPR):** Acumula carimbos oficiais, qualifica-se aos 6 níveis de maestria e elegibilidade a certificados e sorteios.
     - **`VISITOR` (Comunidade Externa):** Registra presença em eventos abertos e participa dos módulos interativos (Ideathon, Shark Tank, Startup Day).
     - **`ADMIN` (Organizador):** Emite tokens OTT, gerencia o Admin Master Switch e controla as sessões ao vivo.

---

### ADR-018: Isolamento Estrito de Registros e Telemetria via Cookies Stateless

* **Status:** Aprovado
* **Contexto:**
  Carregar ou transmitir registros transacionais completos nos payloads do cliente introduz sérios riscos de vazamento de dados (OWASP A01 / LGPD).
* **Decisão:**
  1. **Zero Data Pass-through no Frontend:** Registros de banco de dados jamás são trafegados no estado local sem sanitização.
  2. **Cookies Stateless:** O cookie `secomp_session` é estritamente `HttpOnly`, `SameSite=Strict` e `Secure`.

---

### ADR-019: Arquitetura de Liberação Manual (Admin Master Switch) para Módulos Interativos

* **Status:** Aprovado
* **Contexto:**
  Módulos como a Votação do Shark Tank, Inscrições de Equipes no Ideathon e Validação por QR Code não devem ficar permanentemente abertos, exigindo liberação pontual e controlada pela comissão organizadora durante a execução do evento.
* **Decisão:**
  1. O Cockpit do Administrador (`/admin`) possui chaves manuais de controle salvas em `cms_contents` (chave: `session_status`):
     - `shark_tank_voting_active`: `boolean`
     - `ideathon_registration_open`: `boolean`
     - `ott_scanner_active`: `boolean`
  2. Quando o Admin altera qualquer chave via `PUT /api/v1/admin/cms/session_status`, o backend revalida os privilégios do administrador, grava no banco e emite o sinal via WebSocket (`SESSION_STATUS_CHANGED`).
  3. Os componentes no cliente (`SharkTankLivePanel`, `IdeathonFormModal`, `ValidateScannerModal`) reagem ao evento e alternam a interface entre o estado "Bloqueado / Aguarde Liberação" e "Habilitado".
