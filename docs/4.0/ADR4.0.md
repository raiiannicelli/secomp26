# 📜 ARCHITECTURAL DECISION RECORDS (ADR 4.0) — SECOMP 2026
**Projeto:** Hub Digital, Plataforma Oficial & Cockpit Administrativo da SECOMP 2026 (*Construindo Conexões*)  
**Elaborado por:** Rick (*Tech Lead & Chief Architect*)  
**Status:** Consolidado e Blindado contra Mocks & Débito Técnico | **Versão:** 4.0.0  
**Stack Homologada:** [.agents/stack/web.yaml](file:///home/rai-moratto/Documents/projetos/software-house/software-house/.agents/stack/web.yaml)  
**Design System Vinculado:** [designBINANCE.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/designBINANCE.md) (High-Voltage Dark `#0b0e11` + `#fcd535`)  

---

## 🛡️ Parecer Técnico do Tech Lead (Auditoria & Eliminação de Débitos)

Como **Tech Lead & Chief Architect**, estabeleço a erradicação de qualquer mock, fallback em memória, dado simulado ou duplicidade de estado no frontend.

---

## Índice das Decisões Arquiteturais v4.0

* [ADR-012](#adr-012): Migração Integral da Camada de Persistência para PostgreSQL Nativo no Supabase Cloud
* [ADR-013](#adr-013): Política Strict Zero-Mock & Erradicação de Fallbacks no Frontend
* [ADR-014](#adr-014): Sincronização e Telemetria Reativa Bi-direcional (PostgreSQL + Supabase Realtime Channels)
* [ADR-015](#adr-015): Centralização do Mini-CMS no PostgreSQL (`cms_contents`) com Broadcast Instantâneo
* [ADR-016](#adr-016): Protocolo de Observabilidade, Telemetria de Erros & Autenticação Sentry via MCP
* [ADR-017](#adr-017): Vitrine de Conteúdo, Presença por QR Code sem Inscrição Prévia e Matriz de Perfis (STUDENT, VISITOR, ADMIN)

---

### ADR-012: Migração Integral da Camada de Persistência para PostgreSQL Nativo no Supabase Cloud

* **Status:** Aprovado
* **Contexto:**
  O sistema necessita de integridade relacional estrita, transações ACID e persistência em nuvem gerenciada, eliminando bancos locais efêmeros que perdem sincronia.
* **Decisão:**
  1. O **Supabase PostgreSQL** (`xypxdnvlwlthjvuljuff.supabase.co`) é a Única Fonte da Verdade (SSoT).
  2. Todas as tabelas seguem o padrão **`snake_case`** estrito:
     - `users`, `activities`, `attendance_sessions`, `attendance_records`, `shark_pitches`, `shark_votes`, `talent_arena_slots`, `talent_arena_bookings`, `certificates`, `cms_contents`.
  3. Todas as escritas são mediadas pelo Fastify Backend via Service Role Key com validação Zod e geração determinística de `id` UUID v4 e timestamps ISO.

---

### ADR-013: Política Strict Zero-Mock & Erradicação de Fallbacks no Frontend

* **Status:** Aprovado
* **Decisão:**
  1. Fica **estritamente proibido** criar ou manter fallbacks estáticos de dados em componentes (`.tsx`) ou stores (`useUIStore.ts`).
  2. Se a API retornar vazio ou falhar, a UI exibe o estado vazio real (*Empty State*) ou *Skeleton Loader* de carregamento.

---

### ADR-017: Vitrine de Conteúdo, Presença por QR Code sem Inscrição Prévia e Matriz de Perfis (STUDENT, VISITOR, ADMIN)

* **Status:** Aprovado (Atualizado v4.0)
* **Contexto:**
  Para transformar a plataforma em uma **vitrine pública de atrações (palestras e minicursos)** em fase de pré-construção, os botões de inscrição prévia por atividade foram removidos. A validação de presenças e concedimento de carimbos ocorre via leitura direta do QR Code de 15 minutos projetado nas sessões, vinculado ao RA do aluno ou e-mail de visitante.
* **Decisão:**
  1. **Remoção de Pré-Inscrição em Atividades:** O fluxo de `pre_enrollments` foi desativado/removido. Todas as palestras e minicursos atuam como **vitrine aberta**.
  2. **Validação Direta via QR Code OTT:** O aluno ou visitante realiza a leitura do QR Code (`/validate?t=SEC-XXX`). O servidor valida o token de 15 min, associa ao `user_id` autenticado (com base no RA criptografado ou e-mail) e gera o carimbo instantaneamente na tabela `attendance_records`.
  3. **Matriz Estrita de 3 Perfis Únicos (Sem Papel `STAFF`):**
     - **`STUDENT` (Aluno UTFPR):** Autenticado com RA institucional (`aXXXXXXX` / `raXXXXXXX`). Recebe carimbos oficiais e pontuação completa no Passaporte Digital.
     - **`VISITOR` (Comunidade Externa / Visitante):** Autenticado via e-mail sem obrigatoriedade de RA. Recebe carimbos na categoria visitante.
     - **`ADMIN` (Organizador / Administrador):** Possui acesso exclusivo ao Cockpit `/chameguinho` para emissão de QR Codes OTT e monitoramento de controladoria em tempo real.
  4. **Papel `STAFF` Descontinuado:** Não há papel `STAFF`. Todas as permissões administrativas e operacionais pertencem unicamente ao perfil `ADMIN`.
* **Consequências:**
  * *Positivas:* Interface leve estilo vitrine; zero atrito para inscrição individual prévia em palestras; matriz RBAC simples de 3 papéis (`STUDENT`, `VISITOR`, `ADMIN`).
  * *Trade-offs:* O controle de lotação física do auditório passa a ser gerido presencialmente no ambiente do evento.

---

### ADR-018: Isolamento Estrito de Registros e Cookies Stateless

* **Status:** Aprovado
* **Decisão:**
  O cookie `secomp_session` é estritamente **`HttpOnly`**, **`SameSite=Strict`** e **`Secure`**. Zero PII de alunos é trafegado no client.
