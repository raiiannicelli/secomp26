# 📜 ARCHITECTURAL DECISION RECORDS (ADR 2.0) — SECOMP 2026
**Projeto:** Hub Digital & Plataforma Oficial da SECOMP 2026 (*Construindo Conexões*)  
**Elaborado por:** Rick (*Tech Lead & Chief Architect*)  
**Status:** Aprovado e Blindado para Implementação | **Versão:** 2.1.0  
**Stack Homologada:** [.agents/stack/web.yaml](file:///home/rai-moratto/Documents/projetos/software-house/software-house/.agents/stack/web.yaml)  
**Design System Vinculado:** [design.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/design.md) (Binance High-Voltage Dark)  
**Entradas de Produto & Growth:** [docs/PRD2.0.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/PRD2.0.md), [docs/GROWTH2.0.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/GROWTH2.0.md), [docs/EPICO2.0.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/EPICO2.0.md), [docs/BACKLOG2.0.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/BACKLOG2.0.md)

---

## 🛡️ Parecer Técnico do Tech Lead (Garantia de Viabilidade Arquitetural)

Como **Tech Lead & Chief Architect**, incorporei integralmente a especificação da stack corporativa definida em `web.yaml`:
* **Runtime & Linguagem:** Node.js (v20 LTS) + TypeScript em Modo Estrito (`strict: true`).
* **Frontend:** React 18+ (Vite SPA) com **TanStack Query** (Data Fetching / Cache no cliente) + **Zustand** (Estado Global da UI).
* **Banco de Dados & ORM:** PostgreSQL 16+ com **Prisma ORM** (schemas relacionais estritamente em `snake_case`).
* **Cache & Filas Assíncronas:** **Redis 7+** + **BullMQ** para processamento offloaded de background workers (emissão de certificados em PDF, agregação de votos em lote e e-mails transacionais).
* **Classificação de Execução:** Segregação explícita entre Camada Assíncrona (Event Loop + TanStack Query), Camada Paralela (Worker Threads / Cluster Mode / Web Workers) e Camada Distribuída (Workers BullMQ isolados + Redis Cache).

---

## Índice das Decisões Arquiteturais (ADRs)

* [ADR-001](#adr-001): Homologação da Stack Corporativa web.yaml (Node.js LTS + TypeScript + React 18 SPA)
* [ADR-002](#adr-002): Camada de Persistência Relacional em snake_case (PostgreSQL 16 + Prisma ORM)
* [ADR-003](#adr-003): Arquitetura de Cache e Background Queues Distribuídas (Redis 7+ + BullMQ)
* [ADR-004](#adr-004): Gerenciamento de Estado Reativo e Data Fetching (TanStack Query + Zustand)
* [ADR-005](#adr-005): Motor de Gamificação 2.0 e Validação de Presença por Token Descartável Anti-Fraude
* [ADR-006](#adr-006): Infraestrutura de Votação em Tempo Real do Shark Tank UTFPR (SSE + In-Memory Redis Aggregator)
* [ADR-007](#adr-007): Arquitetura de Segurança em Camadas, Mitigação OWASP Top 10 e Criptografia AES-256-GCM para PII
* [ADR-008](#adr-008): Engine de Scrollytelling 3D (Canvas Frame Scrubber + Lenis + Web Workers)
* [ADR-009](#adr-009): Emissão Descentralizada de Certificados com SHA-256 processada via BullMQ
* [ADR-010](#adr-010): Empacotamento em Container Docker Multi-Stage com Auto-Migrations
* [ADR-011](#adr-011): Engine de Scrollytelling em Túnel 3D dos Patrocinadores e Interatividade Reativa Client-Side

---

### ADR-001: Homologação da Stack Corporativa web.yaml (Node.js LTS + TypeScript + React 18 SPA)

* **Status:** Aceito (Alinhado com `.agents/stack/web.yaml`)
* **Contexto:**
  A SECOMP 2026 exige robustez técnica, latência $p95 < 250\text{ms}$, votação ao vivo concorrente no auditório e compatibilidade com o stack profile padrão da Software House.
* **Decisão:**
  Adotar a composição homologada em `web.yaml`:
  1. **Runtime & Linguagem:** Node.js (LTS v20) com TypeScript em Strict Mode absoluto.
  2. **Frontend Framework:** React 18+ via Vite SPA, com Tailwind CSS configurado com os tokens do `design.md`.
  3. **Backend Framework:** Fastify framework (Node.js LTS), garantindo alto throughput de I/O não-bloqueante via Event Loop e plugins tipados.
* **Consequências:**
  * *Positivas:* Tipagem estrita ponta a ponta (Zod compartilhado); performance de processamento assíncrono superior; tempo de inicialização ágil.
  * *Trade-offs:* Exige compilação multi-stage no Docker para segregar devDependencies de produção.

---

### ADR-002: Camada de Persistência Relacional em snake_case (PostgreSQL 16 + Prisma ORM)

* **Status:** Aceito
* **Contexto:**
  O sistema gerencia relacionamentos estritos entre alunos, atividades, sessões de presença, votos e agendamentos corporativos.
* **Decisão:**
  1. **SGBD:** PostgreSQL 16+.
  2. **ORM & Migrations:** Prisma ORM com schema mapeado em **`snake_case`** (`@map` e `@@map`), garantindo interoperabilidade total com backups SQL e queries analíticas do DACOM.
  3. **Isolamento Transacional:** Transações atômicas com `prisma.$transaction` com isolamento `ReadCommitted` / `Serializable` em pontos críticos (reserva de vagas em minicursos e validação de tokens).
* **Consequências:**
  * *Positivas:* Integridade referencial garantida pelo SGBD; migrações determinísticas e versionadas (`prisma/migrations`).
  * *Trade-offs:* Pequeno overhead de abstração do Prisma, mitigado por connection pooling integrado.

---

### ADR-003: Arquitetura de Cache e Background Queues Distribuídas (Redis 7+ + BullMQ)

* **Status:** Aceito (Alinhado com `.agents/stack/web.yaml`)
* **Contexto:**
  Operações pesadas (renderização de certificados em PDF, disparo assíncrono de notificações de agendamento e agregação de picos de votos no Shark Tank) não podem travar o Event Loop da API principal.
* **Decisão:**
  Implementar a camada distribuída com **Redis 7+** e **BullMQ**:
  1. **Redis Cache:**
     * Armazenamento temporário dos One-Time Tokens de presença ativa com expiração TTL (15 minutos);
     * Cache do Leaderboard/Ranking geral (TTL 30s) com invalidação orientada a eventos;
     * Rate limiting de alta performance em memória via `@fastify/rate-limit` com backend Redis.
  2. **BullMQ Background Workers:**
     * Fila `certificate-generation`: Renderização de PDFs em background através de worker isolado;
     * Fila `notification-dispatch`: Envio assíncrono de comprovantes de pré-inscrição e lembretes de slots de RH;
     * Fila `shark-vote-persist`: Flush em lote dos votos registrados na memória para o banco PostgreSQL a cada 2 segundos.
* **Consequências:**
  * *Positivas:* Desacoplamento de tarefas CPU-bound do Event Loop; resiliência com retry automático de jobs e dead-letter queues; zero degradação de latência na API pública.
  * *Trade-offs:* Requer instância de Redis dedicada na infraestrutura de deploy.

---

### ADR-004: Gerenciamento de Estado Reativo e Data Fetching (TanStack Query + Zustand)

* **Status:** Aceito (Alinhado com `.agents/stack/web.yaml`)
* **Contexto:**
  O frontend precisa sincronizar dados de presença em tempo real, gerenciar o estado da grade de programação dos 5 Dias e alternar estados visuais do Scrollytelling sem re-renderizações desnecessárias.
* **Decisão:**
  Adotar a dupla **TanStack Query (v5)** + **Zustand**:
  1. **TanStack Query (Server State):**
     * Gerencia todo o fetching, caching e revalidação de dados remotos (`/api/v1/activities`, `/api/v1/passport/me`, `/api/v1/passport/leaderboard`);
     * Cache com `staleTime: 60_000` para a grade de programação e `refetchOnWindowFocus: true` para o passaporte;
     * Updates otimistas (Optimistic Updates) para a pré-inscrição em minicursos e validação de tokens.
  2. **Zustand (Client UI State):**
     * Gerencia estados locais e transições de interface leves: dia temático ativo, turno selecionado, modal de voto aberto, preferências de motion e dados temporários de navegação.
* **Consequências:**
  * *Positivas:* Elimina "prop drilling" e re-renders globais; sincronização transparente com o backend; código limpo e reativo.
  * *Trade-offs:* Necessidade de convenção estrita de Query Keys (`['activities', dayIndex, turn]`).

---

### ADR-005: Motor de Gamificação 2.0 e Validação de Presença por Token Descartável Anti-Fraude

* **Status:** Aceito
* **Contexto:**
  A North Star Metric (NSM) exige que $\ge 50\%$ dos inscritos concluam o Passaporte ($\ge 8$ carimbos). Links compartilhados à distância gerariam dados falsos.
* **Decisão:**
  1. O staff gera no painel administrativo o token temporário de 6 caracteres (ex: `SEC-942`).
  2. O backend armazena o hash no Redis com TTL de 15 minutos e na tabela `attendance_sessions`.
  3. A validação executa transação no banco PostgreSQL com constraint `UNIQUE(user_id, activity_id)`.
  4. Após o registro, o TanStack Query no cliente invalida a chave `['passport', 'me']`, atualizando a barra de progresso e o nível de maestria na hora.
* **Consequências:**
  * *Positivas:* Impossibilita fraudes remotas; presença validada em $< 80\text{ms}$; integridade da NSM.
  * *Trade-offs:* Requer conexão com a internet no encerramento da atividade.

---

### ADR-006: Infraestrutura de Votação em Tempo Real do Shark Tank UTFPR (SSE + Redis Aggregator)

* **Status:** Aceito
* **Contexto:**
  Centenas de votos simultâneos no auditório na quarta-feira demandam atualização instantânea do telão sem sobrecarregar a base de dados.
* **Decisão:**
  1. Votação submetida via `POST /api/v1/shark-tank/vote`.
  2. O voto é validado contra a trava anti-sybil (`UNIQUE(session_fingerprint)`) e incrementado atômico em chave do Redis (`HINCRBY shark_votes pitch_id 1`).
  3. O endpoint SSE (`/api/v1/shark-tank/live-results`) lê o agregado do Redis a cada 1.000ms e transmite o payload consolidado via broadcasting aos clientes conectados.
  4. Um job BullMQ persiste os votos definitivos no PostgreSQL de forma assíncrona.
* **Consequências:**
  * *Positivas:* Suporta mais de 1.500 conexões ativas no auditório com uso mínimo de CPU; latência perceptível zero.
  * *Trade-offs:* Necessidade de manter conexões SSE ativas com heartbeat de 20s.

---

### ADR-007: Arquitetura de Segurança em Camadas, Mitigação OWASP Top 10 e Criptografia AES-256-GCM para PII

* **Status:** Aceito
* **Contexto:**
  Dados pessoais dos estudantes (RA universitário, telefone, links de currículo) devem cumprir a LGPD e estar protegidos contra vazamentos e exploração.
* **Decisão:**
  1. **A01/A07:** Autenticação via tokens JWT assinados com chave de 512 bits, armazenados em cookies `HttpOnly`, `SameSite=Strict` e `Secure`.
  2. **A02:** Dados PII (RA e telefone) cifrados com **AES-256-GCM** em repouso no PostgreSQL; busca exata por RA viabilizada via hash SHA-256 determinístico indexado (`ra_hash`).
  3. **A03:** Prevenção contra injeções SQL através de prepared statements nativos do Prisma ORM e validação de todos os payloads via Zod v3.
  4. **A05:** Proteção de cabeçalhos via `@fastify/helmet` e rate limiter com backend Redis.
* **Consequências:**
  * *Positivas:* Segurança militar para os dados acadêmicos; conformidade legal com a LGPD.
  * *Trade-offs:* Custo computacional marginal de criptografia e decodificação AES-256.

---

### ADR-008: Engine de Scrollytelling 3D (Canvas Frame Scrubber + Lenis + Web Workers)

* **Status:** Aceito
* **Contexto:**
  O Hero e a narrativa dos 5 Dias necessitam de scrollytelling tridimensional inspirado em `creative-design-24.aura.build`, mantendo 60 FPS estáveis no mobile.
* **Decisão:**
  1. **Scroll Smoothing:** `@studio-freight/lenis` normalizando deltas de trackpad e toque.
  2. **Canvas Scrubber:** Renderização de frames WebP pré-carregados desenhados no canvas via `requestAnimationFrame`.
  3. **Processamento Paralelo (Web Workers):** Descompressão de frames e cálculos de vetores de perspectiva 3D offloaded para Web Workers no cliente, garantindo a thread principal livre para animações.
  4. **Fallback:** Detecção de conexões lentas ou `prefers-reduced-motion` ativando imagem estática com cross-fade CSS.
* **Consequências:**
  * *Positivas:* 60 FPS constantes; visual futurista e voltagem estética Binance High-Voltage.
  * *Trade-offs:* Pipeline de assets deve compactar os frames para peso total $\le 2.5\text{MB}$.

---

### ADR-009: Emissão Descentralizada de Certificados com SHA-256 processada via BullMQ

* **Status:** Aceito
* **Contexto:**
  A geração de PDFs de certificados para milhares de alunos pode gerar picos de CPU se executada sincronamente no backend.
* **Decisão:**
  1. A solicitação de certificado enfileira um job na fila BullMQ `certificate-generation`.
  2. O worker gera o hash HMAC-SHA256:
     $$\text{Hash} = \text{HMAC-SHA256}(\text{RA} + \text{Nome} + \text{Horas} + \text{Nível}, \text{SECRET\_KEY})$$
  3. Renderiza o PDF com o QR Code de validação pública e disponibiliza o download ao usuário via TanStack Query polling ou link estático temporário.
* **Consequências:**
  * *Positivas:* Zero travamento na API; certificados imunes a fraude e auditáveis publicamente pela UTFPR.
  * *Trade-offs:* Delay assíncrono de 1 a 3 segundos para emissão do arquivo.

---

### ADR-010: Empacotamento em Container Docker Multi-Stage com Auto-Migrations

* **Status:** Aceito
* **Contexto:**
  A entrega para infraestrutura da universidade ou VPS exige um container autônomo com auto-sincronização do banco.
* **Decisão:**
  1. Build multi-stage: `dependencies` $\rightarrow$ `builder` (Vite + Fastify + Prisma Client) $\rightarrow$ `runner` (Node 20 Alpine).
  2. `entrypoint.sh` executa `prisma migrate deploy` antes de subir o servidor Fastify.
  3. Healthcheck em `/api/v1/health` para monitoramento do orquestrador Docker/K8s.
* **Consequências:**
  * *Positivas:* Imagem leve (< 180MB); deploy zero-touch com migrações idempotentes.
  * *Trade-offs:* Build inicial de ~2 minutos no pipeline de CI/CD.

---

### ADR-011: Engine de Scrollytelling em Túnel 3D dos Patrocinadores e Interatividade Reativa Client-Side

* **Status:** Aceito
* **Contexto:**
  A apresentação das empresas parceiras e do Sistema de Cotas Oficiais (Ouro, Prata, Bronze, Parceiros, Expositores) exige uma experiência imersiva de alto impacto estético (*Binance High-Voltage*), com progressão 1 a 1 atrelada ao scroll, sem degradar a performance de renderização em dispositivos móveis e mantendo conformidade com as diretrizes de acessibilidade e conforto visual (eliminação de ofuscamento e cansaço visual).
* **Decisão:**
  1. **Projeção em Profundidade 3D no Eixo Z:**
     * Utilização de `transformStyle: 'preserve-3d'` e `perspective: 1000px` em conjunto com a interpolação `translate3d(0, y, z)` via `useTransform` do Framer Motion.
     * Mapeamento do progresso vertical em container estendido de `520vh`, com física inercial de mola amortecida (`useSpring` com `stiffness: 75`, `damping: 24`), garantindo transições suaves entre logos.
     * Foco óptico frontal no logo ativo com ampliação de exatamente **2.0x** (`scale`), névoa volumétrica suave (`opacity`) e desfoque dinâmico de profundidade de campo (`blur`).
  2. **Renderizador Canvas 2D Reativo sob Demanda (`WarpTunnelCanvas`):**
     * Execução efêmera a 60 FPS com loop `requestAnimationFrame` que detecta atividade de rolagem direta (`scroll`, `wheel`, `touchmove`).
     * Desaceleração exponencial do cálculo de atividade (`scrollActivity * 0.88`); se `scrollActivity < 0.008`, o loop entra em hibernação e limpa o canvas (`ctx.clearRect`), poupando ciclos de GPU/CPU e bateria em smartphones.
  3. **Conforto Visual & Prevenção de Fadiga:**
     * Teto máximo estrito de opacidade nos feixes e partículas em $\le 0.08$ (eliminando clarões e ofuscamento).
     * Remoção completa de anéis ovais estáticos com bordas sólidas no plano de fundo para manter foco desobstruído nas logomarcas.
     * Sombra de piso difusa puramente escura em gradiente elíptico.
  4. **Acessibilidade WAI-ARIA & Modal Flutuante:**
     * Implementação de `role="button"` e `tabIndex={0}` no logo ativo.
     * Suporte completo a navegação por teclado: tecla `Enter` ou barra de `Espaço` acionam o modal flutuante de detalhes da cota; tecla `Escape` encerra o modal e devolve o foco ao palco.
     * Modal desacoplado com backdrop blur e formulário de contato integrado.
* **Consequências:**
  * *Positivas:* 60 FPS garantidos com zero gargalo de main-thread; experiência premium que eleva o ROI de marca dos parceiros; zero custo computacional no servidor Fastify (processamento 100% client-side); total aderência a acessibilidade.
  * *Trade-offs:* O container estendido exige `520vh` de rolagem para cobrir integralmente a narrativa dos 6 parceiros.
---

### ADR-012: Migração do Banco de Dados para Supabase (PostgreSQL Gerenciado + Realtime + Storage)

* **Status:** Aceito
* **Contexto:**
  O projeto utilizava PostgreSQL local via `docker-compose` como banco de dados principal, gerenciado pelo Prisma ORM. Para a fase de produção do evento (novembro/2026), é necessária uma solução gerenciada com: (1) zero manutenção de infraestrutura pelo time DACOMP, (2) Realtime nativo para o painel `/admin` sem implementação manual de SSE/Redis Pub-Sub, (3) Storage gerenciado para as fotos do Mini-CMS, e (4) compatibilidade total com o Prisma ORM existente (sem reescrita de queries).
* **Decisão:**
  1. **Banco de Dados:** Migrar `DATABASE_URL` do PostgreSQL local para o Transaction Pooler do Supabase (PgBouncer, porta 6543) — compatível com serverless e conexões concorrentes. Manter `DIRECT_URL` apontando para a porta 5432 para uso exclusivo do `prisma migrate deploy`.
  2. **Prisma Schema:** Adicionar campo `directUrl = env("DIRECT_URL")` ao bloco `datasource db`, conforme recomendação oficial do Supabase para Prisma v5+.
  3. **SDK Supabase:** Instalar `@supabase/supabase-js` e `@supabase/ssr`. Criar `src/lib/supabase.ts` com três clientes segregados por escopo:
     * `supabasePublic` — publishable key, seguro no frontend, submetido às políticas RLS.
     * `supabaseAdmin` — service role key, **exclusivo do backend Fastify**, bypassa RLS. Nunca exposto no bundle do cliente.
     * `subscribeToAdminChannel()` — canal Realtime `secomp-admin` para o dashboard `/admin`.
  4. **Realtime:** Substituir a implementação manual de SSE (EventSource + Redis Pub/Sub) pelo canal Realtime do Supabase (`supabase.channel('secomp-admin').on('broadcast', ...)`). O backend publica eventos via `supabaseAdmin.channel(...).send()` após cada mutation crítica (registro, carimbo, voto, token gerado/expirado).
  5. **Storage:** Usar o bucket `event-photos` no Supabase Storage para o Mini-CMS de fotos do evento (upload via `supabasePublic.storage.from('event-photos').upload(...)`).
  6. **RLS (Row Level Security):** Ativar RLS em todas as tabelas via Supabase Dashboard. Políticas padrão: `SELECT` público em `activities`; `INSERT/UPDATE` apenas para usuários autenticados nas suas próprias linhas; `ALL` para service role.
* **Consequências:**
  * *Positivas:* Elimina completamente o `docker-compose` para o banco de dados em produção; Realtime nativo com 0 linhas extras de código de SSE; Storage gerenciado com CDN global para fotos; backups automáticos e point-in-time recovery via Supabase Dashboard; painel de monitoramento de queries (Supabase Studio).
  * *Trade-offs:* O limite do plano gratuito do Supabase é de 500MB de banco + 1GB de Storage + 2 projetos. Dependência de serviço externo (SLA Supabase: 99.9%). Credenciais `DATABASE_URL` e `DIRECT_URL` requerem substituição manual da senha nos arquivos `.env` e `.env.example`.

---

### ADR-013: Arquitetura de Autenticação, RBAC, CSRF e Cockpit Não-Padrão /chameguinho (v3.0)

* **Status:** Aceito
* **Contexto:**
  A versão 2.0 da plataforma operava com usuários anônimos — qualquer pessoa podia votar, carimbar e se inscrever sem identidade. Isso impossibilitava auditoria de votos, emissão de certificados reais e métricas de CAC/LTV. Além disso, a ausência de CSRF protection em rotas de mutation e o uso de rotas administrativas previsíveis (`/admin`) representavam riscos de OWASP A01 (Broken Access Control e Enumeração de Rotas) e A08 (Integrity Failures).
* **Decisão:**
  1. **Login Obrigatório:** Toda ação de mutation (voto, carimbo, inscrição) requer sessão autenticada. Registro com domínio de e-mail controlado via dropdown obrigatório: `@alunos.utfpr.edu.br | @utfpr.edu.br | @gmail.com | @hotmail.com | @tuta.com | @mailbox.org | @proton.me`. Senha de 6 dígitos numéricos (PIN). RA no formato `/^a\d{7}$/` obrigatório para domínio `@alunos.utfpr.edu.br`.
  2. **CSRF Protection (Double Submit Cookie Pattern):** Cookie `__csrf` (não HttpOnly, lido por JS) + Header `X-CSRF-Token` obrigatório em todo `POST/PUT/DELETE` autenticado. Middleware `csrfGuard` valida igualdade entre cookie e header antes de qualquer mutation admin.
  3. **Cockpit Não-Padrão (`/chameguinho`):** A rota administrativa é deliberadamente nomeada `/chameguinho` em vez de `/admin`, blindando contra bots de varredura automatizada e ataques de dicionário. Acessos não autenticados retornam **404 Not Found** genérico (não 401/403).
  4. **Estrutura Interna do `/chameguinho`:** Composto por duas sub-visões especializadas:
     * **LOGS & MÉTRICAS:** Telemetria ao vivo de CAC por domínio, LTV, taxa de conclusão de passaportes, auditoria de sessões ativas, histórico de carimbos/votos e emissor de tokens de presença com QR Code e timer de 15 minutos.
     * **CMS:** Gestão em tempo real de pitches do Shark Tank (abertura/pausa de votação), fotos do evento via Supabase Storage, e sincronização de parceiros e mentores via Supabase Realtime.
  5. **Isolamento de Bundles:** Rota `/chameguinho` carregada via `React.lazy()` em chunk JS separado — ausente do bundle principal. Nenhum link público em `Navbar.tsx` ou rodapés.
  6. **Token OTT Semântico:** Formato atualizado para `SEC-[CATEGORIA]-[XXX]` onde `CATEGORIA ∈ {IA, BD, CLEANCODE, STARTUP}` e `XXX` são 3 caracteres alfanuméricos gerados via `crypto.randomBytes(3)` sem ambíguos (sem `0, O, I, 1`). Hash SHA-256 do token persiste no banco — token bruto nunca é armazenado.
  7. **Magic Link QR Code:** O link `/validate?t=SEC-IA-A3K&sig=HMAC-SHA256(token+timestamp)` tem TTL de 15 minutos no Redis. A página `/validate` detecta sessão ativa → auto-valida via `POST /api/v1/attendance/validate-token` → exibe resultado animado. Sem sessão → redireciona para `/auth?next=...`.
  8. **SharkVote.userId:** Adição de FK `user_id` na tabela `shark_votes` com constraint `UNIQUE(user_id)` — garante 1 voto por participante identificado, auditável para o sorteio.
* **Consequências:**
  * *Positivas:* CAC e LTV mensuráveis por segmento de domínio; certificados emitidos com nome e RA real; votos auditáveis com identidade; endpoint administrativo protegido contra varreduras por obscuridade e retorno 404; cockpit em tempo real com sub-visões LOGS & MÉTRICAS e CMS via Supabase Realtime.
  * *Trade-offs:* Fricção adicional no onboarding (registro obrigatório antes de qualquer ação); usuários casuais podem abandonar antes de registrar (mitigado com modal não-bloqueante e formulário mínimo de 3 campos).

