# 📋 TASK-PR3.0.md — ROTEAMENTO DE TAREFAS & QUALITY GATES (SECOMP 2026 v3.0)
**Projeto:** Hub Digital & Plataforma Oficial da SECOMP 2026  
**Elaborado por:** Judith (*Router & Quality Guardian*)  
**Status:** Sprint 4 — Pronto para Execução | **Versão:** 3.0.0  
**ADRs Vinculadas:** [ADR-012](docs/ADR2.0.md) (Supabase) | [ADR-013](docs/ADR2.0.md) (Auth + RBAC + CSRF)  
**Contratos Técnicos:** [SDD-SPEC2.0.md §9-10](docs/SDD-SPEC2.0.md)  
**Base:** Dívidas técnicas mapeadas pelo @rick | User Stories US-14 a US-17 da @rosita

---

## 🛡️ Quality Gates v3.0 (Regras de Ouro Atualizadas)

1. **Zero Push Direto na Main:** Todo código entra via Pull Request auditado.
2. **Score ≥ 9.0/10** nas 6 dimensões — elevado de 8.5 para 9.0 por ser sprint de segurança:
   * **Aderência ao SDD-SPEC §9-10 (25%):** Supabase client com escopos corretos, RBAC matrix respeitada, token OTT no formato exato;
   * **OWASP Top 10 (25%):** CSRF headers obrigatórios, 404 para anônimos em /chameguinho, service role key nunca no bundle cliente, rate limit ativo;
   * **Qualidade de Código (20%):** TypeScript `strict: true`, zero any implícito, slices Zustand sem God Store;
   * **Testes ≥ 85% (15%):** Novos módulos com cobertura completa, 64 testes existentes sem regressão;
   * **Documentação (10%):** ADRs e SDD-SPEC atualizados antes do merge;
   * **Performance (5%):** Bundle /chameguinho lazy não contamina o main chunk.
3. **Limite de PR:** Máximo 350 linhas de diff por PR.
4. **Checklist de Segurança Obrigatório:** Todo PR deve passar na checklist de segurança da seção abaixo.

---

## 🔒 Checklist de Segurança Universal (Todo PR v3.0)

```
[ ] SUPABASE_SERVICE_ROLE_KEY não aparece em nenhum arquivo do src/
[ ] /chameguinho não é linkado em nenhum componente do Navbar ou App.tsx público
[ ] Acesso a /chameguinho sem cookie → 404 genérico (não 401/403)
[ ] Rate limit de login: 5 tentativas/IP/min → 429 Too Many Requests
[ ] CSRF header X-CSRF-Token presente em todos os POST/PUT/DELETE admin
[ ] Token bruto SEC-XXX nunca em nenhum log, console.log ou banco (apenas SHA-256)
[ ] RA não aparece em texto claro em nenhuma resposta de API (apenas mascarado)
[ ] npx tsc --noEmit → zero erros
[ ] npm run test:all → todos os 64+ testes verdes
```

---

## 🚀 Roadmap Sprint 4 (PRs 13–18)

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                     SPRINT 4: AUTH, ADMIN & SUPABASE                        │
├─────────────────────────────────┬────────────────────────────────────────────┤
│ SEMANA 1 (Set 18-22)            │ SEMANA 2 (Set 23-28)                       │
├─────────────────────────────────┼────────────────────────────────────────────┤
│ • PR-13: Auth Gate + CSRF       │ • PR-16: /validate Magic Link Page         │
│ • PR-14: Store Slices Refactor  │ • PR-17: /chameguinho Cockpit + Realtime    │
│ • PR-15: /auth Frontend Page    │ • PR-18: Backend adminRoutes + Mini-CMS    │
└─────────────────────────────────┴────────────────────────────────────────────┘
```

---

## 📋 Pull Requests — Checklist Atômico

---

### [PR-13] Auth Gate v3.0: Domínio Controlado, PIN, RA & CSRF Protection

* **Branch:** `feat/auth-gate-v3-domain-pin-csrf`
* **Responsáveis:** `@rj` (Backend) + `@carol` (Schema Zod)
* **User Stories:** US-14, US-15
* **ADRs:** ADR-013

#### Checklist Backend (@rj)
- [x] Atualizar `RegisterUserSchema` (Zod): `nameLocal` + `domain` (enum 7 valores) + `pin` `/^\d{6}$/` + `ra?` `/^a\d{7}$/`
- [x] Validação condicional: `ra` obrigatório se `domain === '@alunos.utfpr.edu.br'`
- [x] Derivar e-mail completo no servidor: `email = nameLocal + domain` (nunca confiar no frontend)
- [x] Adicionar migration Prisma: `SharkVote.user_id UUID FK → users.id` + constraint `UNIQUE(user_id)`
- [x] Adicionar migration Prisma: tabela `cms_contents` (`id, key, value JSON, updated_by, updated_at`)
- [x] Implementar middleware `csrfGuard`: lê `request.cookies['__csrf']` e compara com `request.headers['x-csrf-token']`
- [x] Aplicar `csrfGuard` em todo POST/PUT/DELETE das rotas admin
- [x] Rota `/chameguinho/*` anônima → 404 genérico (não 401/403)
- [x] Rate limit de login: plugin `@fastify/rate-limit` — 5 req/min por IP na rota `/api/v1/auth/login`
- [x] Rotas `/auth/login` e `/auth/register` com rate limit 5 req/min
- [x] Cookie `secomp_session` com `HttpOnly`, `SameSite=Strict`, `Secure` (em prod)
- [x] Tabela `shark_votes` com constraint `UNIQUE(user_id)` no banco
- [x] Middleware CSRF: Double Submit Cookie no header `X-CSRF-Token`

#### Quality Gate (@judith)
- [x] US-14 BDD: registro com domínio não listado → 400 com `DOMAIN_NOT_ALLOWED`
- [x] US-14 BDD: registro com domínio inválido rejeitado com 400
- [x] US-14 BDD: RA inválido para @alunos rejeitado com mensagem inline
- [x] US-14 BDD: registro com RA inválido para @alunos.utfpr.edu.br → 400
- [x] US-15 BDD: após login ADMIN → cookie contém `role=ADMIN`
- [x] Teste: 6ª tentativa de login → 429 com `Retry-After` header
- [x] Teste: POST /chameguinho sem CSRF header → 403 com `CSRF_MISMATCH`
- [x] Verificação: `diff prisma/schema.prisma` contém `user_id` em `shark_votes` e `cms_contents`

---

### [PR-14] Store Slices + tokenService Isolado

* **Branch:** `refactor/store-slices-persist-immer`
* **Responsável:** `@carol` (Frontend)
* **Dívida Técnica:** DT-02, DT-03

#### Checklist Frontend (@carol)
- [x] Instalar `immer`: `npm install immer`
- [x] Criar `src/stores/slices/navigationSlice.ts` — `activeTab`, `activeDayIndex`, `selectedTurn`, `selectedTheme`
- [x] Criar `src/stores/slices/gamificationSlice.ts` — `stampsCount`, `currentLevel`, `earnedStampIds`
- [x] Criar `src/stores/slices/enrollmentSlice.ts` — `enrolledActivities`, `votedPitchId`
- [x] Criar `src/stores/slices/uiSlice.ts` — todos os modais booleanos + `user` profile
- [x] Criar `src/stores/tokenService.ts` — lógica pura de validação OTT (sem import do store)
- [x] Reescrever `src/stores/useUIStore.ts` como combinador com `persist` middleware
- [x] `partialize`: persistir apenas `earnedStampIds`, `enrolledActivities`, `votedPitchId`, `user`
- [x] Verificar que os 64 testes existentes continuam verdes (total 83 testes verdes)

#### Quality Gate (@judith)
- [x] `npx tsc --noEmit` → zero erros
- [x] Cada slice importado isoladamente sem importar os demais slices
- [x] `tokenService.ts` não importa `useUIStore` — testável de forma pura
- [x] Passaporte persiste entre reloads (localStorage key: `secomp2026-ui-state`)
- [x] Navbar não re-renderiza quando stamp é adicionado (verificar via React DevTools Profiler)

---

### [PR-15] Página /auth — Registro & Login Isolados

* **Branch:** `feat/auth-page-domain-dropdown`
* **Responsável:** `@carol` (Frontend)
* **User Stories:** US-14, US-15

#### Checklist Frontend (@carol)
- [x] Criar `src/components/AuthPage.tsx` como rota lazy isolada (`React.lazy`)
- [x] Formulário de registro: input `nameLocal` + dropdown `domain` (7 opções) + input PIN 6 dígitos + input RA condicional
- [x] PIN: input `type="password"` + `maxLength={6}` + `inputMode="numeric"` + regex validation
- [x] RA: mostrar/esconder campo dinamicamente baseado no domain selecionado
- [x] Formulário de login: campo e-mail completo (ou nameLocal + domain) + PIN
- [x] Após login `STUDENT/VISITOR` → se tem `?next=` navega para ele; senão `navigate('/')`
- [x] Após login `ADMIN/STAFF` → `navigate('/chameguinho')`
- [x] CSRF: ler `<meta name="csrf-token">` e adicionar header `X-CSRF-Token` em todo fetch de auth
- [x] Nenhum link para `/auth` no `Navbar.tsx` público (acessada por URL direta)
- [x] Mensagens de erro da API exibidas inline (não alert/toast) com acessibilidade `aria-live`

#### Quality Gate (@judith)
- [x] US-14 BDD: formulário rejeita RA inválido antes de fazer fetch
- [x] US-15 BDD: redirect por role funciona corretamente
- [x] AuthPage não aparece no bundle `main.js` (verificar `npm run build` + `dist/` chunks)
- [x] Lighthouse Accessibility Score ≥ 90 na página /auth

---

### [PR-16] Página /validate — Magic Link QR Code Auto-Validação

* **Branch:** `feat/validate-magic-link-page`
* **Responsável:** `@carol` (Frontend)
* **User Stories:** US-16

#### Checklist Frontend (@carol)
- [x] Criar `src/components/ValidatePage.tsx`
- [x] Ler parâmetro `?t=` da URL + `?sig=` para verificação
- [x] Verificar sessão: se logado → `POST /api/v1/attendance/validate-token` automaticamente
- [x] Se não logado → `navigate('/auth?next=' + encodeURIComponent(window.location.href))`
- [x] Estado da página: `LOADING → SUCCESS | EXPIRED | ALREADY_STAMPED | ERROR`
- [x] Timer visual decrescente: calcular `expiresAt` a partir do parâmetro no token e exibir MM:SS
- [x] Animação de sucesso: confetti leve (sem brilho excessivo)
- [x] Mensagem de expirado com CTA "Peça ao staff um novo código"
- [x] Rota adicionada ao React Router: `<Route path="/validate" element={<ValidatePage />} />`

#### Quality Gate (@judith)
- [x] US-16 BDD: token expirado → exibe mensagem correta, zero carimbo no banco
- [x] US-16 BDD: aluno não logado → redirect preserva `?next=` na URL
- [x] US-16 BDD: segundo scan → idempotente, mensagem "já carimbado"
- [x] Verificar que `sig` HMAC é validado no backend (não apenas o token bruto)

---

### [PR-17] Cockpit /chameguinho — Sub-visões LOGS & MÉTRICAS e CMS, Realtime & QR Generator

* **Branch:** `feat/chameguinho-cockpit-realtime-qr`
* **Responsável:** `@carol` (Frontend)
* **User Stories:** US-16, US-17
* **ADR:** ADR-013

#### Checklist Frontend (@carol)
- [x] Criar `src/components/AdminPage.tsx` com lazy import em `App.tsx` na rota `/chameguinho`
- [x] Verificar role no client: se `user.role !== 'ADMIN' && !== 'STAFF'` → `navigate('/', { replace: true })` (404 anti-enumeração)
- [x] Sub-visão **LOGS & MÉTRICAS**:
  - Tabela paginada de usuários/logins com busca por RA e domínio
  - Painel de telemetria CAC, LTV e taxa de conclusão do Passaporte
  - Histórico auditável de inscrições, carimbos e votos do Shark Tank
  - Emissor de Magic Link QR Code com seletor de atividade e countdown regressivo de 15:00 a 00:00
- [x] Sub-visão **CMS**:
  - Gestão de pitches do Shark Tank (ativação/bloqueio de votação em tempo real)
  - Mural de fotos do evento com upload no Supabase Storage (`event-photos`)
  - Gestão de mentores e parceiros com propagação via Supabase Realtime
- [x] Realtime: `subscribeToAdminChannel()` → atualizar tabelas e estatísticas sem reload da página
- [x] CSRF: interceptar todos os fetch administrativos e adicionar header `X-CSRF-Token`
- [x] Nenhum link para `/chameguinho` no bundle público ou menus

#### Quality Gate (@judith)
- [x] US-16/US-17 BDD: acesso anônimo sem cookie ADMIN → 404 genérico
- [x] Realtime: novo carimbo ou voto aparece na visão LOGS & MÉTRICAS em ≤ 2s via Realtime
- [x] `dist/` após build: chunk `AdminPage` isolado do `main.js`
- [x] `npm install qrcode @types/qrcode` incluído no PR
- [x] SUPABASE_SERVICE_ROLE_KEY não aparece em nenhum arquivo em `src/`

---

### [PR-18] Backend: adminRoutes, Mini-CMS, Token OTT v2 & Supabase Realtime Publisher

* **Branch:** `feat/admin-routes-cms-ott-supabase-realtime`
* **Responsável:** `@rj` (Backend)
* **ADRs:** ADR-012, ADR-013

#### Checklist Backend (@rj)
- [x] Criar `backend/src/routes/adminRoutes.ts` com 10 endpoints:
  - `GET /api/v1/admin/users` (paginado, busca por RA hash)
  - `GET /api/v1/admin/users/:id` (perfil completo + inscrições + carimbos)
  - `GET /api/v1/admin/enrollments` (filtro por activityId)
  - `GET /api/v1/admin/stamps` (filtro por userId/sessionId)
  - `GET /api/v1/admin/votes` (Shark Tank auditado)
  - `GET /api/v1/admin/sessions/active` (tokens OTT ativos agora)
  - `POST /api/v1/admin/sessions/open` (gera SEC-[CAT]-XXX + publica TOKEN_OPENED no Realtime)
  - `DELETE /api/v1/admin/sessions/:id` (revoga antes do TTL)
  - `GET /api/v1/admin/cms/:key` (busca conteúdo)
  - `PUT /api/v1/admin/cms/:key` (atualiza conteúdo — apenas ADMIN)
- [x] Criar `backend/src/lib/supabaseAdmin.ts` (service role key — exclusivo do servidor)
- [x] Publicar eventos Realtime via `supabaseAdmin.channel('secomp-admin').send()` após:
  - `POST /api/v1/auth/register` → `USER_REGISTERED`
  - `POST /api/v1/attendance/validate-token` → `STAMP_ADDED`
  - `POST /api/v1/shark-tank/vote` → `VOTE_CAST`
  - `POST /api/v1/activities/:id/pre-enroll` → `ENROLLMENT_ADDED`
  - `POST /api/v1/admin/sessions/open` → `TOKEN_OPENED`
- [x] Refatorar `generateOTT()`: categorias `{IA, BD, CLEANCODE, STARTUP}` + `crypto.randomBytes(3)` sem ambíguos
- [x] Registrar `adminRoutes` no `server.ts` com prefix `/api/v1/admin`
- [x] Validar SUPABASE_SERVICE_ROLE_KEY no `backend/src/config/env.ts`

#### Quality Gate (@judith)
- [x] `GET /api/v1/admin/users` com cookie STUDENT → 403 Forbidden
- [x] `GET /api/v1/admin/users` sem cookie → 404 Not Found (não 401)
- [x] Token `SEC-IA-A3K` gerado não contém caracteres `0, O, I, 1`
- [x] Evento `STAMP_ADDED` publicado no canal Realtime em ≤ 500ms após validação
- [x] `PUT /api/v1/admin/cms/shark_pitches` com role STAFF → 403 (apenas ADMIN pode editar CMS)
- [x] Cobertura de testes ≥ 85% em `adminRoutes.ts`

---

## 🎯 Definição de Concluído — Sprint 4 (DoD v3.0)

Todo PR de segurança nesta sprint só é liberado se:

1. **CI Verde:** lint + typecheck + build + test:all passam sem warnings
2. **Checklist de Segurança Universal:** todos os 9 itens marcados ✅
3. **Score Judith ≥ 9.0/10** emitido no `QUALITY_REPORT.md`
4. **Supabase Realtime testado:** admin recebe evento em ≤ 2s após mutation
5. **Bundle auditado:** `/admin` chunk separado verificado em `dist/assets/`
6. **Senha de DB substituída:** `[SUA_DB_PASSWORD]` em `.env` substituída pela senha real antes do deploy

---

## 📌 Dívidas Técnicas Resolvidas nesta Sprint

| ID | Dívida | Resolvida em |
|---|---|---|
| DT-01 | `SharkVote` sem `userId` | PR-13 (migration) |
| DT-02 | God Store 194 linhas | PR-14 (slices) |
| DT-03 | `validateOneTimeToken` no store | PR-14 (tokenService) |
| DT-04 | Token OTT aceita qualquer `SEC-*` | PR-18 (categorias + crypto) |
| DT-07 | Sem CSRF protection | PR-13 (csrfGuard) |

**Dívidas que permanecem para Sprint 5:**
| DT-06 | Dead link `/# sobre-secomp` | PR futura (seção DACOMP) |
| DT-08 | SDD-SPEC seção 2.2 desatualizada | ✅ Resolvida (Seções 9-10 adicionadas) |
