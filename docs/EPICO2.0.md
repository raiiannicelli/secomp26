# 🏛️ EPICO2.0.md — ESTRUTURAÇÃO DOS ÉPICOS ESTRATÉGICOS (SECOMP 2026)
**Projeto:** Hub Digital & Plataforma Oficial da SECOMP 2026 (*Construindo Conexões*)  
**Elaborado por:** Rosita (*Product Owner & Especialista em BDD/Especificação Ágil*)  
**Status:** Consolidado e Alinhado com Engenharia | **Versão:** 2.0.0  
**Design System Vinculado:** [design.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/design.md) (Binance High-Voltage Dark)  
**Tese de Origem:** [docs/PRD2.0.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/PRD2.0.md) & [docs/GROWTH2.0.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/GROWTH2.0.md)

---

## 1. Visão de Decomposição Tática & Framework Growth AARRR

Para converter a tese de produto do **PRD 2.0** e as alavancas de retenção do **GROWTH 2.0** em um sistema web de altíssima tração, a plataforma foi decomposta sob a ótica do **Funil AARRR (Aquisição, Ativação, Retenção, Receita e Recomendação)**.

O objetivo absoluto da arquitetura funcional é alavancar a **North Star Metric (NSM)**:
> **★ NSM:** Taxa de Participação Ativa Qualificada (Passaporte SECOMP Concluído) — Meta: $\ge 50\%$ dos inscritos presenciais acumulando $\ge 8$ carimbos oficiais e avançando nos níveis de maestria.

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 SECOMP 2026 — MATRIZ DE ÉPICOS 2.0                               │
├───────────────────┬───────────────────┬───────────────────┬───────────────────┬──────────────────┤
│   AQUISIÇÃO       │    ATIVAÇÃO       │    RETENÇÃO       │     RECEITA       │  RECOMENDAÇÃO    │
│   (Top-of-Funnel) │ (Engajamento D1)  │ (3 Turnos / NSM)  │   (Parcerias B2B) │  (Viral Loops)   │
├───────────────────┼───────────────────┼───────────────────┼───────────────────┼──────────────────┤
│ [EP-01] Core Shell│ [EP-02] Grade     │ [EP-04] Motor de  │ [EP-07] Arena de  │ [EP-06] Shark    │
│   & Nav High-Volt │   Narrativa e     │   Gamificação 2.0 │   Talentos RH &   │   Tank Votação   │
│                   │   Filtros 3T      │   (Passaporte/Nív)│   Mídia Kit       │   Auditada       │
│ [EP-03] Catálogo  │                   │                   │                   │                  │
│   Minicursos      │                   │ [EP-05] Anti-Churn│                   │ [EP-08] Ideathon │
│   Warmup (Set/Out)│                   │   Campus, Gamer & │                   │   Express & Badges│
│                   │                   │   Feira da Lua    │                   │   LinkedIn       │
└───────────────────┴───────────────────┴───────────────────┴───────────────────┴──────────────────┘
```

---

## 2. Detalhamento dos 8 Épicos Estratégicos

---

### [EP-01] Core Shell, Posicionamento High-Voltage & Aquisição Top-of-Funnel
* **Objetivo de Negócio:** Causar impacto visual instantâneo e transmitir a imponência de um evento internacional de tecnologia. Capturar a atenção imediata do visitante (aluno e empresa) através da identidade Binance High-Voltage (`#0b0e11` Dark Canvas + `#fcd535` Yellow Voltage), apresentando a promessa de valor *"Construindo Conexões"*, datas oficiais (09 a 13 de Nov) e contadores dinâmicos de autoridade.
* **Alavanca Growth (AARRR):** **Aquisição (Top-of-Funnel Conversion)**. Reduz o bounce rate inicial e canaliza o tráfego frio direto para a pré-inscrição em menos de 10 segundos.
* **Componentes Envolvidos:** `top-nav-dark`, `hero-band-dark`, `stat-callout-card`, `trust-badge`, `button-primary`, `button-secondary-on-dark`.
* **Entregáveis de Interface:**
  * Barra de navegação superior fixa com indicador visual de scroll e âncoras para seções estratégicas;
  * Hero Section com headline técnica, chamada primária de alto contraste e contadores em tipografia `BinancePlex` (5 Dias, 3 Turnos, 15+ Horas, 8+ Carimbos);
  * Grid de selos de credibilidade acadêmica e institucional (UTFPR, DACOM, Incubadora Sprint, Sebrae).

---

### [EP-02] Grade Narrativa 3 Turnos, Filtros Multidimensionais & Pré-Inscrição Ativa
* **Objetivo de Negócio:** Eliminar o atrito de informação e a fadiga de escolha dos estudantes. Disponibilizar uma grade de programação visualmente fluida que percorre os 5 Arcos Narrativos diários (*Segunda: O Mundo* ➔ *Terça: O Mercado* ➔ *Quarta: Os Projetos* ➔ *Quinta: O Humano* ➔ *Sexta: O Futuro*) e os 3 Turnos diários (Manhã: 09h-11h30, Tarde: 14h-17h, Noite: 19h-22h).
* **Alavanca Growth (AARRR):** **Ativação & Retenção de Turno**. Combate a evasão entre turnos ao dar visibilidade antecipada da conexão entre palestras matutinas, oficinas vespertinas e painéis noturnos.
* **Componentes Envolvidos:** `surface-card-dark`, `markets-table-card`, badges `trading-up` (#0ecb81 - Vagas Livres), `trading-down` (#f6465d - Últimas Vagas), tipografia tabular `BinancePlex`.
* **Entregáveis de Interface:**
  * Abas dinâmicas de alternância diária (Segunda a Sexta) com latência imperceptível (<100ms);
  * Seletor rápido de turno [Todos | Manhã | Tarde | Noite];
  * Filtro transversal de palestras por tema: [Tecnologia | Gestão | Inovação | Carreira];
  * Cards de atividade ricos com palestrante, bio resumida, local físico (Auditório/Labs) e botão de pré-inscrição com indicador de vagas em tempo real.

---

### [EP-03] Funil de Warm-up: Minicursos Pré-Evento (Set/Out) & Ativação Antecipada
* **Objetivo de Negócio:** Operar o mecanismo de captação precoce da comunidade acadêmica antes do início da semana oficial de novembro. Promover as 4 datas de minicursos imersivos: Setembro (14 e 29) e Outubro (14 e 29), cobrindo 4 trilhas práticas em laboratórios da universidade.
* **Alavanca Growth (AARRR):** **Aquisição Antecipada (Pre-Event Activation Loop)**. O aluno inscrito no minicurso já recebe o seu Passaporte Digital pré-ativado, gerando compromisso meses antes da semana oficial.
* **Componentes Envolvidos:** Cards de trilha com borda hairline dark (`#2b3139`), modal de detalhes técnicos, chips de status de turma, formulário modal de inscrição rápida.
* **Entregáveis de Interface:**
  * 4 Trilhas visuais com cores temáticas distintas:
    1. *Inteligência & Dados* (IA com Python, Power BI com TO Brasil);
    2. *Infra & Segurança* (CyberSegurança com CyberGuard, Containers Docker);
    3. *Hardware & Sistemas* (Montagem de PC, Arduino/STM32 IoT Maker);
    4. *Desenvolvimento & UI* (Game DEV, UI/UX Design com Figma).
  * Modal de credenciamento em 1 etapa (Nome, E-mail institucional UTFPR, RA e Trilha).

---

### [EP-04] Motor de Gamificação 2.0: Passaporte, Progressão de Níveis & Validação Anti-Fraude
* **Objetivo de Negócio:** Materializar na interface digital a North Star Metric do evento. Permitir que o aluno acompanhe em tempo real o acúmulo de carimbos presenciais, seu avanço nos 6 Níveis de Maestria, sua posição no ranking geral para o sorteio de periféricos gamers e emita seu certificado digital auditável.
* **Alavanca Growth (AARRR):** **Retenção Extrema (The Core NSM Engine)**. Gera motivação intrínseca e extrínseca para comparecimento contínuo aos 3 turnos através de escassez, progresso visível e recompensas tangíveis.
* **Componentes Envolvidos:** `stat-callout-card`, `trust-badge`, `cta-band-dark`, progress bar com gradiente Binance, modal de carimbo com verificação de token.
* **Entregáveis de Interface & Regras:**
  * **Régua Visual de Carimbos:** 8 slots principais + slots bônus com estados *[Bloqueado | Pendente | Conquistado]*;
  * **Sistema de 6 Níveis de Maestria:**
    * *Nível 1 — Novato (1 a 2 carimbos)*
    * *Nível 2 — Aprendiz (3 a 4 carimbos)*
    * *Nível 3 — Graduado (5 a 6 carimbos)*
    * *Nível 4 — Adepto (7 a 8 carimbos — Desbloqueia Sorteio Gamer)*
    * *Nível 5 — Iniciado (9 a 10 carimbos)*
    * *Nível 6 — Mestre da SECOMP (11+ carimbos — Elegível aos Prêmios VIP e Destaque no Banco de Talentos)*
  * **Validador por Token Descartável Anti-Fraude (One-Time Token):** Campo para inserção do token alfanumérico de 6 dígitos projetado no auditório pelo staff. O token fecha 15 minutos após a atividade e só pode ser validado 1 única vez por RA;
  * **Leaderboard / Ranking em Tempo Real:** Tabela pública com os alunos mais engajados da semana;
  * **Emissor de Certificado Dinâmico:** Geração instantânea do certificado em PDF/PNG com horas complementares, selo da UTFPR e hash único de autenticidade atrelado ao nível conquistado.

---

### [EP-05] Experiência Anti-Churn no Câmpus: Arena Gamer, Gastronomia Sensorial & Feira da Lua
* **Objetivo de Negócio:** Solucionar o gargalo mais crítico da jornada acadêmica: o intervalo morto entre as 17h00 (fim da tarde) e as 19h00 (início da noite). Criar âncoras sensoriais, lúdicas e gastronômicas para manter o participante dentro do câmpus com os colegas de turma.
* **Alavanca Growth (AARRR):** **Retenção Inter-Turno (Combate ao Churn Pós-Tarde)**. Garante que a audiência que assistiu às oficinas vespertinas permaneça no local para lotar o auditório noturno.
* **Componentes Envolvidos:** `feature-photo-card`, banners de alerta com `accent-turquoise` (#2dbdb6) e `primary` (#fcd535), cardápio em tabela responsiva.
* **Entregáveis de Interface:**
  * Seção da **Arena Gamer**: Horários dos campeonatos relâmpago (FIFA, Rocket League, Street Fighter) concentrados exatamente na janela 17h00 - 18h45;
  * Banners sensoriais de engajamento: Pipoca Grátis no pátio (15h30 às 18h30) e Coffee-Breaks pontuais;
  * Guia Gastronômico da **Grande Feira da Lua (Sexta-feira)**: Cardápio digital dos Food Trucks parceiros, localização no pátio externo e atrações musicais de encerramento.

---

### [EP-06] Clímax Coletivo: Shark Tank UTFPR, Votação Popular Auditada & Efeito Torcida
* **Objetivo de Negócio:** Transformar a noite de quarta-feira no momento de maior audiência e clímax comunitário do evento. Permitir que a plateia do auditório avalie e vote em tempo real nos pitches dos estudantes e das startups incubadas pela **Incubadora Sprint** e avaliadas pela banca de jurados (Sebrae, Investidores, Big Techs).
* **Alavanca Growth (AARRR):** **Recomendação & Viral Loop de Plateia (Referral)**. As equipes convocam suas turmas inteiras para encher o auditório e votar pelo celular, atraindo novos públicos que passam a engajar no restante do evento.
* **Componentes Envolvidos:** Interface mobile-first ultra-leve com leitura imediata de QR Code, cartões de startups com fotos e tese em 1 linha, botões de votação com feedback visual `#0ecb81`, placar ao vivo.
* **Entregáveis de Interface & Regras:**
  * Liberação sincronizada dos pitches para votação apenas quando o moderador abrir a sessão;
  * Mecanismo anti-fraude: 1 único voto auditado por dispositivo / sessão;
  * Apuração e placar animado com barras percentuais em tempo real na tela do auditório para eleger o troféu *"Destaque da Galera"*.

---

### [EP-07] Hub Imersivo de Patrocinadores (Túnel 3D), Sistema de Cotas Oficiais & Roda de Talentos
* **Objetivo de Negócio:** Conectar a densidade técnica dos alunos com a demanda de contratação e visibilidade das empresas parceiras, gerando alto retorno sobre investimento (*ROI de Recrutamento & Employer Branding*). Oferecer vitrine futurista em Túnel 3D interativo com modal flutuante de cotas e simulações reais de entrevista de 15 minutos com RHs e psicólogos do NUAPE.
* **Alavanca Growth (AARRR):** **Receita & Proposta de Valor B2B (Revenue / Partner ROI)**. Garante atração, conversão inbound e retenção de patrocinadores (Ouro, Prata, Bronze, Parceiros e Expositores) ao entregar leads qualificados e destaque de marca inovador.
* **Componentes Envolvidos:** Palco 3D em perspectiva Z com `WarpTunnelCanvas`, navegação sticky no scroll, badges de cotas (`cotaIcon`, `cotaLabel`), modal flutuante acessível com formulário de contato integrado, e seletor de horários de entrevistas (slots de 15 min).
* **Entregáveis de Interface & Regras:**
  * **Túnel 3D Scrollytelling:** Navegação imersiva 1 a 1 controlada pelo scroll, com ampliação de 2.0x no logo em foco, travada até o último parceiro (Sebrae Paraná);
  * **Hierarquia de 6 Cotas Oficiais:** Cota Ouro (TO Brasil), Cota Prata (ForLogic), Cota Bronze (CyberGuard), Parceiro Estratégico (TCS), Parceiro Institucional (Sprint) e Expositor Ecossistema (Sebrae);
  * **Modal Flutuante Acessível:** Popup com descrição, benefícios/contrapartidas, tags tecnológicas e formulário de contato direto;
  * **Conforto Visual:** Feixes de luz suaves com opacidade $\le 0.08$ e fundo sem anéis ovais com borda, prevenindo fadiga visual;
  * **Grade de Agendamento na Roda de Talentos:** Speed interviews de 15 min (Quinta-feira das 14h às 17h) creditando **2 carimbos extras** no Passaporte.

---

### [EP-08] Maratona Prática & Viral Loop Social: Ideathon Express, GameJam & LinkedIn Badges
* **Objetivo de Negócio:** Fechar a semana com uma imersão prática de prototipação na sexta-feira à tarde (maratona de 4 horas de desafios reais) e municiar os participantes com insumos visuais de autoridade para espalhar a marca da SECOMP 2026 nas redes profissionais.
* **Alavanca Growth (AARRR):** **Recomendação & Viralidade Social (Referral & Retention Loop)**. Gera prova social orgânica com alunos postando suas conquistas e certificados no LinkedIn.
* **Componentes Envolvidos:** Edital de desafios em acordeão expansível, formulário de cadastro de times de 3 a 5 alunos, gerador interativo de badge/card de compartilhamento para redes sociais.
* **Entregáveis de Interface:**
  * Mural do **Ideathon Express & GameJam**: Temas dos desafios propostos pelo Sebrae/Sprint, cronômetro de contagem regressiva e submissão de repositórios/projetos;
  * **Gerador de Badges para LinkedIn:** Moldura visual com estética Binance High-Voltage (*"SECOMP 2026 — EU ESTIVE LÁ"* / *"Nível Mestre Conquistado"*), com botão de cópia de texto pronto e download da imagem formatada para o feed.

---

## 3. Matriz de Rastreabilidade Estratégica

| Épico | Alavanca AARRR | Métrica Impactada | ICP Primário | Componentes Chave do design.md |
|---|---|---|---|---|
| **EP-01** | Aquisição | Taxa de Inscrição Top-of-Funnel | Calouros, Veteranos, Empresas | `top-nav-dark`, `hero-band-dark`, `stat-callout-card` |
| **EP-02** | Ativação | Ocupação por Turno (Manhã/Noite) | Alunos de todos os períodos | `surface-card-dark`, `markets-table-card`, badges trading |
| **EP-03** | Aquisição | Pré-Credenciamento (Set/Out) | Calouros e Exploradores | Cards em `surface-card-dark`, `hairline-on-dark`, modal |
| **EP-04** | Retenção | **North Star Metric (NSM $\ge 50\%$)** | Alunos Protagonistas e Concorrentes | Barra de progresso amarela, slots de carimbos, token modal |
| **EP-05** | Retenção | Retenção Inter-Turno 17h-19h ($\ge 70\%$) | Comunidade acadêmica presente | `feature-photo-card`, banners com `accent-turquoise` |
| **EP-06** | Recomendação | Votos Únicos Auditados ($\ge 300$) | Plateia, Alunos, Jurados | Interface mobile QR, botões trading-up, placar em tempo real |
| **EP-07** | Receita | ROI Patrocinador / Entrevistas ($\ge 80$) | Empresas Parceiras & Veteranos | `markets-table-card`, agenda de slots de 15 min, links PDF |
| **EP-08** | Recomendação | Menções e Badges no LinkedIn | Veteranos e Formandos | Acordeão de desafios, gerador de card social 1200x630 |

---

## 4. Handoff de Governança para Backlog & Engenharia

- [x] **Épicos 2.0 Estruturados com Foco em Growth:** Consolidado por **@rosita**.
- [ ] **Desdobramento em User Stories Detalhadas:** Redigir [docs/BACKLOG2.0.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/BACKLOG2.0.md).
- [ ] **Sincronização dos Contratos BDD Gherkin:** Atualizar [docs/ACCEPTANCE-CRITERIA2.0.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/ACCEPTANCE-CRITERIA2.0.md).
- [ ] **Arquitetura & Engenharia:** Notificação ao Tech Lead (**@rick**) e Quality Guardian (**@judith**).
