# 📋 TASK-PR.md — ROTEAMENTO DE TAREFAS & QUALITY GATES (SECOMP 2026)
**Projeto:** Hub Digital & Plataforma Oficial da SECOMP 2026 (*Construindo Conexões*)  
**Elaborado por:** Judith (*Router & Quality Guardian*)  
**Status:** Consolidado e Pronto para Execução da Squad | **Versão:** 2.0.0  
**Stack Homologada:** [.agents/stack/web.yaml](file:///home/rai-moratto/Documents/projetos/software-house/software-house/.agents/stack/web.yaml)  
**Contratos Técnicos Base:** [docs/SDD-SPEC2.0.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/SDD-SPEC2.0.md) & [docs/ADR2.0.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/ADR2.0.md)  
**Contratos Funcionais:** [docs/BACKLOG2.0.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/BACKLOG2.0.md) & [docs/ACCEPTANCE-CRITERIA2.0.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/ACCEPTANCE-CRITERIA2.0.md)

---

## 🛡️ Governança de Qualidade da @judith (Regras de Ouro)

1. **Zero Push Direto na Main:** Todo código entra exclusivamente via Pull Request auditado.
2. **Critério Binário de Aprovação (Score $\ge 8.5/10$):** Nenhum PR será aprovado sem cumprir as 6 dimensões:
   * **Aderência Estrita ao SDD-SPEC (25%):** Nomes de colunas no PostgreSQL estritamente em `snake_case`, tipos e endpoints idênticos aos contratos;
   * **Qualidade de Código & Clean Code (20%):** Modularidade, ausência de code smells, TypeScript em `strict: true`;
   * **Segurança OWASP Top 10 (15%):** AES-256-GCM em dados PII, cookies `HttpOnly`/`SameSite=Strict`, zero LocalStorage para JWT, rate limiting;
   * **Testes Automatizados $\ge 85\%$ (15%):** Validação dos cenários Gherkin de `ACCEPTANCE-CRITERIA2.0.md`;
   * **Documentação & Rastreabilidade (15%):** PR com descrição clara das mudanças e linkage à US;
   * **Performance & Latência (10%):** Resposta da API $< 250\text{ms}$ e Scrollytelling a 60 FPS.
3. **Limite de Tamanho de PR:** Máximo de 350 linhas de diff por PR para garantir revisão atômica e minuciosa.

---

## 🚀 Estrutura de Sprints para Entrega Contínua (Trunk-Based CI/CD)

A entrega contínua é viabilizada pelo **Desenvolvimento Orientado a Contratos (Contract-First)**:
* O Backend (**@rj**) e o Frontend (**@carol**) operam em paralelo desde o Dia 1 utilizando os schemas Zod e rotas OpenAPI do `SDD-SPEC2.0.md` como Mock Server inicial;
* O DevOps (**@daryl**) fornece o scaffold da infraestrutura (Docker, PostgreSQL, Redis e CI/CD) no PR-00.

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   ROADMAP DE SPRINTS CONTÍNUAS                                   │
├──────────────────────────────────┬─────────────────────────────────┬─────────────────────────────┤
│ SPRINT 1: FUNDAÇÃO & ATIVAÇÃO    │ SPRINT 2: RETENTION ENGINE      │ SPRINT 3: CLÍMAX & B2B      │
│ (Dias 1 a 5)                     │ (Dias 6 a 10)                   │ (Dias 11 a 15)              │
├──────────────────────────────────┼─────────────────────────────────┼─────────────────────────────┤
│ • PR-00: Scaffold & Docker Infra │ • PR-05: Passaporte 2.0 & Níveis│ • PR-08: Shark Tank SSE     │
│ • PR-01: Auth & User Security    │ • PR-06: Validador OTT Anti-Fraud│ • PR-09: Roda de Talentos   │
│ • PR-02: Core Shell & Hero Motion│ • PR-07: Anti-Churn & Feira Lua │ • PR-10: Certificados BullMQ│
│ • PR-03: Grade Narrativa 5 Dias  │                                 │ • PR-11: Ideathon & Badges  │
│ • PR-04: Catálogo Warmup Set/Out │                                 │ • PR-12: End-to-End QA Gate │
└──────────────────────────────────┴─────────────────────────────────┴─────────────────────────────┘
```

---

## 📋 Lista Atômica de Tarefas com Checklist por Pull Request

---

### SPRINT 1: Fundação, Infraestrutura & Aquisição Antecipada

#### [PR-00] Scaffold de Repositório, Container Docker, PostgreSQL & Redis
* **Branch:** `infra/scaffold-docker-postgres-redis`
* **Responsável:** `@daryl` (DevOps & Infra)
* **Objetivo:** Estabelecer o ambiente monólito com PostgreSQL 16, Redis 7, Fastify e Vite SPA configurados com auto-migrations.
* **Checklist de Implementação:**
  - [x] Criar estrutura de diretórios (`frontend/`, `backend/`, `docker/`);
  - [x] Configurar `docker-compose.yml` com serviços `app`, `postgres` e `redis`;
  - [x] Configurar TypeScript `tsconfig.json` com `"strict": true` em todo o workspace;
  - [x] Configurar Prisma ORM inicial com string de conexão em `.env.example`;
  - [x] Configurar pipeline de CI no GitHub Actions com jobs de lint, typecheck e testes.
* **Quality Gate Checklist da @judith:**
  - [x] Sem credenciais ou segredos em texto claro no repositório;
  - [x] Imagem Docker multi-stage gerando container funcional $< 180\text{MB}$;
  - [x] Healthcheck respondendo em `GET /api/v1/health`.

---

#### [PR-01] Módulo de Autenticação Segura, Gestão de Usuários & Criptografia PII
* **Branch:** `feat/auth-users-aes-crypto`
* **Responsável:** `@rj` (Backend)
* **User Stories Vinculadas:** [docs/BACKLOG2.0.md#us-01](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/BACKLOG2.0.md) (Suporte)
* **Contratos SDD:** Schema `User`, AES-256-GCM Crypto Service, Cookies `HttpOnly`.
* **Checklist de Implementação:**
  - [x] Criar migration Prisma para a tabela `users` com colunas em `snake_case`;
  - [x] Implementar `CryptoService` com AES-256-GCM para cifrar campos `ra_encrypted` e `phone_encrypted`;
  - [x] Implementar geração de `ra_hash` com SHA-256 para indexação determinística;
  - [x] Criar rotas Fastify: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`;
  - [x] Injetar cookies de sessão assinados com flags `HttpOnly; SameSite=Strict; Secure`;
  - [x] Testes unitários com cobertura de 100% para o `CryptoService`.
* **Quality Gate Checklist da @judith:**
  - [x] Zero dados sensíveis de RA armazenados em texto claro;
  - [x] Tokens JWT ausentes do corpo da resposta e de qualquer header acessível por JS (proteção contra XSS);
  - [x] Cobertura de testes $\ge 90\%$.

---

#### [PR-02] Core Shell, Top Navigation Fixa & Hero Scrollytelling High-Voltage
* **Branch:** `feat/core-shell-hero-motion`
* **Responsável:** `@carol` (Frontend)
* **User Stories Vinculadas:** `US-01`
* **Contratos SDD / Design:** `top-nav-dark`, `hero-band-dark`, `stat-callout-card`, `useScrollFrameScrubber`.
* **Checklist de Implementação:**
  - [x] Configurar Tailwind CSS com os tokens exatos do `design.md` (`#0b0e11`, `#fcd535`, `#1e2329`, etc.);
  - [x] Desenvolver componente `TopNavigation` fixo com backdrop-blur e links âncora;
  - [x] Desenvolver `HeroSection` com tipografia técnica BinanceNova e BinancePlex 40px bold nos contadores;
  - [x] Integrar animação com canvas 3D reativo a partículas e movimento;
  - [x] Implementar motion scrubber com renderização em `<canvas>` interativo;
  - [x] Implementar fallback gracioso para `prefers-reduced-motion` e conexões móveis lentas;
  - [x] Testes de componentes validando renderização de seletores e CTAs.
* **Quality Gate Checklist da @judith:**
  - [x] Cenários BDD 1.1 e 1.2 do `ACCEPTANCE-CRITERIA2.0.md` 100% aprovados;
  - [x] Frame rate estável a 60 FPS medido via Chrome DevTools;
  - [x] Total de assets WebP do scrubber $\le 2.5\text{MB}$.

---

#### [PR-03] Grade Narrativa dos 5 Dias, Seletor de Turnos & Pré-Inscrição Ativa
* **Branch:** `feat/schedule-5days-filter-enrollment`
* **Responsáveis:** `@carol` (Frontend) & `@rj` (Backend)
* **User Stories Vinculadas:** `US-02`, `US-03`
* **Contratos SDD:** Schema `Activity`, Schema `PreEnrollment`, Zod `PreEnrollmentSchema`, Rotas `GET /api/v1/activities` e `POST /api/v1/activities/:id/pre-enroll`.
* **Checklist de Implementação:**
  - [x] **Backend (@rj):**
    - [x] Criar migrations Prisma para `activities` e `pre_enrollments` com constraint `uq_user_pre_enrollment`;
    - [x] Implementar endpoint `GET /api/v1/activities` com filtros de query (`dayIndex`, `turn`, `theme`, `track`);
    - [x] Implementar endpoint `POST /api/v1/activities/:id/pre-enroll` com transação atômica e decremento de vagas;
    - [x] Popular seed com as palestras oficiais dos 5 Dias (Gustavo Meirelles, Cesar Dias, Eloah Bueno, CyberGuard);
  - [x] **Frontend (@carol):**
    - [x] Configurar TanStack Query com query key `['activities', dayIndex, turn, theme]` e fallback autônomo;
    - [x] Conectar abas narrativas e filtros de turno com a store Zustand `useUIStore`;
    - [x] Criar cards de atividade em `surface-card-dark` com badges `trading-up` (#0ecb81) e `trading-down` (#f6465d);
    - [x] Implementar botão de pré-inscrição em 1 clique com feedback visual imediato;
  - [x] Testes de integração e alternância de abas em $< 100\text{ms}$.
* **Quality Gate Checklist da @judith:**
  - [x] Cenários BDD 2.1, 2.2 e 3.1 do `ACCEPTANCE-CRITERIA2.0.md` aprovados;
  - [x] Constraint no banco impedindo pré-inscrição duplicada no mesmo evento;
  - [x] Tempo de resposta do endpoint de listagem $< 120\text{ms}$.

---

#### [PR-04] Catálogo das 4 Trilhas de Warm-up & Pré-Credenciamento (Set/Out)
* **Branch:** `feat/warmup-workshops-tracks`
* **Responsáveis:** `@carol` (Frontend) & `@rj` (Backend)
* **User Stories Vinculadas:** `US-04`
* **Contratos SDD:** Flag `is_warmup` em `Activity`, Trilhas temáticas (IA, Infra, Hardware, UI).
* **Checklist de Implementação:**
  - [x] **Backend (@rj):**
    - [x] Seed com os minicursos de Setembro (14 e 29) e Outubro (14 e 29);
    - [x] Endpoint de listagem filtrada por minicursos pré-evento (`GET /api/v1/activities?isWarmup=true`);
  - [x] **Frontend (@carol):**
    - [x] Seção de catálogo com 4 cards de trilhas estilizados com borda `hairline-on-dark` (#2b3139);
    - [x] Modal de credenciamento antecipado integrado com useUIStore e formulário completo;
    - [x] Exibição visual do Passaporte pré-ativado com o primeiro carimbo de aquisição;
  - [x] Testes de preenchimento e confirmação de inscrição no minicurso.
* **Quality Gate Checklist da @judith:**
  - [x] Cenários BDD da US-04 aprovados com sucesso;
  - [x] Validação estrita de e-mail institucional UTFPR no payload de inscrição.

---

### SPRINT 2: Motor de Gamificação, Validação Anti-Fraude & Anti-Churn

#### [PR-05] Painel do Passaporte 2.0 com Régua de Carimbos e 6 Níveis de Maestria
* **Branch:** `feat/passport-gamification-levels`
* **Responsáveis:** `@carol` (Frontend) & `@rj` (Backend)
* **User Stories Vinculadas:** `US-05`, `US-07`
* **Contratos SDD:** Schema `AttendanceRecord`, Endpoint `GET /api/v1/passport/me`, `GET /api/v1/passport/leaderboard`.
* **Checklist de Implementação:**
  - [x] **Backend (@rj):**
    - [x] Implementar serviço de agregação de carimbos e cálculo de nível (*Novato* a *Mestre*);
    - [x] Implementar endpoint `GET /api/v1/passport/me` com histórico detalhado e status de elegibilidade ao sorteio;
    - [x] Implementar endpoint `GET /api/v1/passport/leaderboard` com cache Redis (TTL 30s) e anonimização de nomes;
  - [x] **Frontend (@carol):**
    - [x] Desenvolver infográfico da régua com 8 slots visuais + slots bônus com gradiente Binance;
    - [x] Desenvolver cabeçalho simples e direto de gamificação (nível, selos, ranking) com barra checkpoint puramente visual sem texto;
    - [x] Desenvolver tabela de ranking (Leaderboard) com destaques para o Top 3;
    - [x] Configurar integração Zustand `useUIStore` com persistência e feedback;
  - [x] Testes unitários para a função de cálculo de maestria com 100% de cobertura.
* **Quality Gate Checklist da @judith:**
  - [x] Cenários BDD 5.1 e 7.1 aprovados;
  - [x] Atingimento de 7 carimbos ativando o badge "Adepto" e a flag `eligible_for_draw: true`.

---

#### [PR-06] Validador de Presença por Token Descartável Anti-Fraude (OTT)
* **Branch:** `feat/attendance-onetime-token-validation`
* **Responsáveis:** `@rj` (Backend) & `@carol` (Frontend)
* **User Stories Vinculadas:** `US-06`
* **Contratos SDD:** Schema `AttendanceSession`, `ValidateAttendanceTokenSchema`, Transação Atômica Prisma, Cache Redis.
* **Checklist de Implementação:**
  - [x] **Backend (@rj):**
    - [x] Migrations para `attendance_sessions` e `attendance_records` com constraint `UNIQUE(user_id, activity_id)`;
    - [x] Painel do Staff (`POST /api/v1/staff/sessions/open`): gera token alfanumérico (ex: `SEC-942`), salva hash SHA-256 no banco e no Redis com TTL de 15 minutos;
    - [x] Rota do Aluno (`POST /api/v1/attendance/validate-token`): validação em transação isolada e criação do carimbo;
    - [x] Rate limit estrito de 5 tentativas por minuto para impedir brute-force de tokens;
  - [x] **Frontend (@carol):**
    - [x] Modal de inserção de código com input estilizado em `BinancePlex` e tecla Enter vinculada;
    - [x] Feedback de erro detalhado (formato inválido vs token duplicado vs sucesso);
    - [x] Atualização reativa e confetti no Passaporte;
  - [x] Testes de validação anti-fraude e duplicidade (Zod, SHA-256 e rate limit).
* **Quality Gate Checklist da @judith:**
  - [x] Cenários BDD 6.1 e 6.2 aprovados;
  - [x] Latência $p95 < 80\text{ms}$ no endpoint de validação;
  - [x] Zero possibilidade de computar dois carimbos para a mesma atividade pelo mesmo usuário.

---

#### [PR-07] Hub de Retenção Inter-Turno: Arena Gamer, Gastronomia & Guia Feira da Lua
* **Branch:** `feat/campus-anti-churn-gamer-feiradalua`
* **Responsável:** `@carol` (Frontend)
* **User Stories Vinculadas:** `US-09`
* **Contratos SDD / Design:** `feature-photo-card`, banners de retenção em `accent-turquoise` (#2dbdb6) e `primary` (#fcd535).
* **Checklist de Implementação:**
  - [x] Criar seção visual da Arena Gamer com a grade de campeonatos relâmpago das 17h00 às 18h45 (FIFA, Rocket League e Street Fighter);
  - [x] Desenvolver banners de alerta sensorial: Pipoca Grátis (14h00 às 17h00) e Coffee-Breaks às 17h30;
  - [x] Criar guia interativo da Grande Feira da Lua de Sexta-feira com localização e atrações gastronômicas;
  - [x] Testes de layout responsivo (mobile, tablet, desktop).
* **Quality Gate Checklist da @judith:**
  - [x] Cenário BDD 9.1 aprovado;
  - [x] Total conformidade com as diretrizes do `design.md`.

---

### SPRINT 3: Votação em Tempo Real, Arena B2B, Certificação & Encerramento

#### [PR-08] Módulo de Votação Popular do Shark Tank UTFPR em Tempo Real (SSE)
* **Branch:** `feat/shark-tank-live-voting-sse`
* **Responsáveis:** `@rj` (Backend) & `@carol` (Frontend)
* **User Stories Vinculadas:** `US-10`
* **Contratos SDD:** Schema `SharkPitch`, Schema `SharkVote`, Endpoint SSE `GET /api/v1/shark-tank/live-results`, Redis Hash Counter.
* **Checklist de Implementação:**
  - [x] **Backend (@rj):**
    - [x] Criar migrations para `shark_pitches` e `shark_votes` com constraint `UNIQUE(session_fingerprint)`;
    - [x] Endpoint de voto (`POST /api/v1/shark-tank/vote`) com incremento atômico no Redis (`HINCRBY`);
    - [x] Endpoint SSE com transmissão do placar consolidado a cada 1.000ms com compressão habilitada;
    - [x] Worker BullMQ / batch update para persistência assíncrona dos votos no PostgreSQL;
  - [x] **Frontend (@carol):**
    - [x] Interface mobile-first ultra-leve acionada por QR Code;
    - [x] Renderização de barras de porcentagem animadas e total de votos ao vivo;
    - [x] Trava visual e persistência local indicando "Voto Computado" com atribuição de carimbo;
  - [x] Testes de validação de voto e trava anti-sybil por fingerprint.
* **Quality Gate Checklist da @judith:**
  - [x] Cenário BDD 10.1 aprovado;
  - [x] Impossibilidade de votar mais de uma vez a partir da mesma sessão/fingerprint na UI;
  - [x] Consumo de CPU no servidor Fastify inferior a 15% durante transmissão SSE contínua.

---

#### [PR-09] Hub Imersivo de Patrocinadores (Túnel 3D), Sistema de Cotas Oficiais & Roda de Talentos
* **Branch:** `feat/sponsors-3d-tunnel-cotas-and-talent-arena`
* **Responsáveis:** `@rj` (Backend) & `@carol` (Frontend)
* **User Stories Vinculadas:** `US-11`, `US-12`
* **Contratos SDD:** SDD-SPEC Seção 8 (`Partner`, `CotaTier`, `PartnerInquiryInput`), `ADR-011`, Schemas `TalentArenaSlot`/`TalentArenaBooking`.
* **Checklist de Implementação:**
  - [x] **Backend (@rj):**
    - [x] Migrations para `talent_arena_slots` e `talent_arena_bookings` com lock transacional;
    - [x] Endpoint para reserva de horários (`POST /api/v1/talent-arena/slots/:id/book`);
    - [x] Atribuição automática de 2 carimbos no Passaporte do aluno após confirmação da entrevista;
  - [x] **Frontend (@carol):**
    - [x] **Túnel 3D Scrollytelling:** Palco com projeção em profundidade Z (`translate3d(0, y, z)`), física inercial amortecida (`useSpring`), progressão 1 a 1 controlada por degrau de scroll e sticky hold estendido em `520vh` até o Sebrae Paraná;
    - [x] **Sistema de 6 Cotas Oficiais:** Integração das marcas e insígnias dedicadas (*Cota Ouro, Cota Prata, Cota Bronze, Parceiro Estratégico, Parceiro Institucional e Expositor Ecossistema*);
    - [x] **Destaque Dinâmico:** Escala de até 2.0x no logo em foco e blur progressivo de profundidade de campo;
    - [x] **Modal Flutuante de Cotas Acessível:** Detalhes de contrapartidas, tags, link oficial e formulário B2B direto; navegação completa por teclado (`tabIndex={0}`, `Enter`/`Espaço` para abrir, `Escape` para fechar);
    - [x] **Conforto Visual:** Opacidade atenuada dos feixes de luz ($\le 0.08$), canvas efêmero sob demanda com auto-shutdown e eliminação total de anéis ovais com borda no background;
    - [x] Grid de seleção de horários de 15 min da Roda de Talentos com estados [Disponível | Reservado].
  - [x] **Testes Automatizados (@judith):**
    - [x] Testes de validação de slot e 2 carimbos bônus no Passaporte;
    - [x] Teste BDD em `bdd_acceptance.test.ts` validando a hierarquia das 6 cotas e escala de 2.0x no foco do túnel.
* **Quality Gate Checklist da @judith:**
  - [x] Cenários BDD 11.1 a 11.4 e 12.1 aprovados com 100% de sucesso;
  - [x] Limite estrito de 1 agendamento de entrevista por aluno;
  - [x] Garantia de taxa estável de 60 FPS no Scrollytelling 3D.

---

#### [PR-10] Emissor de Certificados Descentralizados com HMAC-SHA256 via BullMQ
* **Branch:** `feat/certificate-issuer-bullmq-crypto`
* **Responsáveis:** `@rj` (Backend) & `@daryl` (Worker BullMQ)
* **User Stories Vinculadas:** `US-08`
* **Contratos SDD:** Schema `Certificate`, Fila `certificate-generation`, HMAC-SHA256 Secret Signer.
* **Checklist de Implementação:**
  - [x] Criar fila BullMQ e worker de processamento de certificados;
  - [x] Implementar gerador de hash: `HMAC-SHA256(user_id + ra + hours + level, SECRET)`;
  - [x] Rota de solicitação (`POST /api/v1/certificates/issue`) e rota pública de verificação (`GET /api/v1/certificates/verify/:hash`);
  - [x] Renderização de PDF oficial com chancelas da UTFPR e DACOM;
  - [x] Testes unitários validando integridade criptográfica do hash contra adulterações de dados.
* **Quality Gate Checklist da @judith:**
  - [x] Cenário BDD 8.1 aprovado;
  - [x] Rota pública de validação sem necessidade de autenticação respondendo em $< 50\text{ms}$.

---

#### [PR-11] Mural do Ideathon Express & Gerador de Badges comemorativos para LinkedIn
* **Branch:** `feat/ideathon-badges-linkedin-generator`
* **Responsável:** `@carol` (Frontend)
* **User Stories Vinculadas:** `US-13`
* **Contratos SDD:** Renderizador de canvas social 1200x630.
* **Checklist de Implementação:**
  - [x] Criar acordeão com o regulamento e desafios do Ideathon Express;
  - [x] Desenvolver gerador de imagem em `<canvas>` formatado para o feed do LinkedIn (1200x630px) com estética Binance High-Voltage;
  - [x] Botão de download direto do arquivo PNG gerado;
  - [x] Botão de cópia de texto padrão com hashtags oficiais do evento;
  - [x] Testes de renderização gráfica no cliente.
* **Quality Gate Checklist da @judith:**
  - [x] Cenário BDD 13.1 aprovado;
  - [x] Imagem gerada respeita as dimensões e pesos exigidos pelo LinkedIn.

---

#### [PR-12] Auditoria Final de Quality Gate, Testes E2E & Preparação para Produção
* **Branch:** `qa/final-quality-gate-audit`
* **Responsável:** `@judith` (Quality Guardian)
* **Objetivo:** Execução da suite completa de testes ponta a ponta e auditoria das 6 dimensões antes do merge na release `v2.0.0`.
* **Checklist de Auditoria:**
  - [x] Rodar suíte completa de testes unitários e de integração (`npm run test:all`);
  - [x] Rodar validação dos cenários de `ACCEPTANCE-CRITERIA2.0.md`;
  - [x] Rodar auditoria de segurança (Semgrep, verificação OWASP Top 10);
  - [x] Verificar latência média das rotas da API sob carga de 200 req/s ($< 250\text{ms}$);
  - [x] Emissão do `QUALITY_REPORT.md` final com nota $\ge 9.0/10$;
  - [x] Liberação da tag de release `v2.0.0-rc1`.

---

## 🎯 Definição de Concluído (Definition of Done - DoD da Squad)

Todo PR submetido só será liberado para merge se satisfazer:
1. **Passar no CI:** Linter (sem warnings), Typecheck (`tsc --noEmit`), Build do Vite e Servidor sem erros;
2. **Conformidade BDD:** Cenários correspondentes do [docs/ACCEPTANCE-CRITERIA2.0.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/ACCEPTANCE-CRITERIA2.0.md) 100% verdes;
3. **Revisão da Judith:** Score $\ge 8.5/10$ emitido no `QUALITY_REPORT.md`;
4. **Deploy de Preview:** Container Docker inicializado com sucesso e conectado ao PostgreSQL e Redis.
