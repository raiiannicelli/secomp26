# 🏛️ EPICO3.0.md — ESTRUTURAÇÃO DOS ÉPICOS ESTRATÉGICOS (SECOMP 2026 v3.0)
**Projeto:** Hub Digital, Plataforma Oficial & Cockpit Administrativo da SECOMP 2026 (*Construindo Conexões*)  
**Elaborado por:** Rosita (*Product Owner & Especialista em BDD/Especificação Ágil*)  
**Status:** Consolidado e Alinhado com Engenharia | **Versão:** 3.0.0  
**Design System Vinculado:** [designBINANCE.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/designBINANCE.md) (High-Voltage Dark `#0b0e11` + `#fcd535`)  
**Tese de Origem:** [PRD3.0.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/PRD3.0.md) & [GROWTH3.0.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/GROWTH3.0.md)  
**Arquitetura Técnica:** [ADR2.0.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/ADR2.0.md) & [SDD-SPEC2.0.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/SDD-SPEC2.0.md)

---

## 1. Visão de Decomposição Tática & Matriz AARRR v3.0

Para sustentar a evolução do sistema para a versão 3.0 — integrando autenticação obrigatória de perfil único no Supabase, votação de Shark Tank auditada por banco de dados e o **Cockpit Administrativo Não-Padrão (`/chameguinho`)** —, a plataforma passa a ser estruturada em **10 Épicos Estratégicos**.

O foco absoluto de cada épico é impulsionar a **North Star Metric (NSM)** e assegurar conformidade rigorosa com os Quality Gates da @judith e com o padrão OWASP Top 10:

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   SECOMP 2026 — MATRIZ DE ÉPICOS v3.0                                  │
├─────────────────────┬─────────────────────┬─────────────────────┬─────────────────────┬────────────────┤
│      AQUISIÇÃO      │      ATIVAÇÃO       │      RETENÇÃO       │       RECEITA       │  RECOMENDAÇÃO  │
│   (Top-of-Funnel)   │  (Identidade & D1)  │  (3 Turnos / NSM)   │   (Parcerias B2B)   │  (Viral Loops) │
├─────────────────────┼─────────────────────┼─────────────────────┼─────────────────────┼────────────────┤
│ [EP-01] Core Shell  │ [EP-09] Identidade, │ [EP-04] Motor de    │ [EP-07] Arena de    │ [EP-06] Shark  │
│   & Nav High-Volt   │   Autenticação RBAC │   Gamificação 3.0   │   Talentos RH &     │   Tank Votação │
│                     │   & Sessões Seguras │   (Magic Link 15m)  │   Mídia Kit 3D      │   Auditada DB  │
│ [EP-03] Catálogo    │                     │                     │                     │                │
│   Minicursos        │ [EP-02] Grade       │ [EP-05] Anti-Churn  │ [EP-10] Cockpit     │ [EP-08] Ideath.│
│   Warmup (Set/Out)  │   Narrativa e       │   Câmpus, Gamer &   │   /chameguinho:     │   Express &    │
│                     │   Inscrição Autentic│   Feira da Lua      │   MÉTRICAS + CMS    │   Badges Linke.│
└─────────────────────┴─────────────────────┴─────────────────────┴─────────────────────┴────────────────┘
```

---

## 2. Detalhamento dos 10 Épicos Estratégicos

---

### [EP-01] Core Shell, Posicionamento High-Voltage & Aquisição Top-of-Funnel
* **Objetivo de Negócio:** Causar impacto visual imediato com autoridade internacional de tecnologia. Transmitir o lema *"Construindo Conexões"*, datas oficiais (09 a 13 de Nov) e contadores dinâmicos de autoridade, canalizando o visitante frio para a descoberta e credenciamento.
* **Alavanca Growth (AARRR):** **Aquisição (Top-of-Funnel)**. Reduz o bounce rate para $< 25\%$ e orienta a navegação para o cadastro em `/auth`.
* **Componentes Envolvidos:** `top-nav-dark`, `hero-band-dark`, `stat-callout-card`, `trust-badge`, `button-primary`.
* **Entregáveis de Interface:**
  * Barra de navegação fixa com indicador de progresso e âncoras para seções estratégicas;
  * Hero Section com headline técnica, botões de ação e contadores `BinancePlex` (5 Dias, 3 Turnos, 15+ Horas, 8+ Carimbos);
  * Grid de autoridade acadêmica e institucional (UTFPR, DACOM, Incubadora Sprint, Sebrae).

---

### [EP-02] Grade Narrativa 3 Turnos, Filtros Multidimensionais & Pré-Inscrição Autenticada
* **Objetivo de Negócio:** Apresentar de maneira fluida a programação dos 5 Arcos Narrativos diários (*Segunda: O Mundo* ➔ *Terça: O Mercado* ➔ *Quarta: Os Projetos* ➔ *Quinta: O Humano* ➔ *Sexta: O Futuro*) nos 3 turnos (Manhã, Tarde, Noite).
* **Alavanca Growth (AARRR):** **Ativação & Retenção de Turno**. Promove a previsibilidade de assentos e combate a evasão de alunos.
* **Componentes Envolvidos:** `surface-card-dark`, `markets-table-card`, badges `trading-up` (#0ecb81), `trading-down` (#f6465d), tipografia tabular `BinancePlex`.
* **Entregáveis de Interface & Regras:**
  * Abas diárias (Segunda a Sexta) com tempo de resposta $< 100ms$;
  * Filtro por turno [Manhã | Tarde | Noite] e por tema [Tecnologia | Gestão | Inovação | Carreira];
  * **Pré-inscrição Autenticada:** O clique em *"Inscrever-se"* valida a sessão ativa. Se logado, grava o registro atrelado ao `user_id` em `pre_enrollments`; se anônimo, redireciona amigavelmente para `/auth`.

---

### [EP-03] Funil de Warm-up: Minicursos Pré-Evento (Set/Out) & Ativação Antecipada
* **Objetivo de Negócio:** Capturar a comunidade acadêmica antes do início da semana oficial através das 4 datas imersivas: 14 e 29 de Setembro / 14 e 29 de Outubro.
* **Alavanca Growth (AARRR):** **Aquisição Antecipada (Pre-Event Activation Loop)**.
* **Componentes Envolvidos:** Cards de trilha técnica, modal de credenciamento rápido, chips categorizados.
* **Entregáveis de Interface:**
  * 4 Trilhas de laboratório: *Inteligência & Dados*, *Infra & Segurança*, *Hardware & Sistemas*, *Desenvolvimento & UI*;
  * Formulário de inscrição rápida que já ativa a conta e concede o primeiro carimbo de aquisição no passaporte.

---

### [EP-04] Motor de Gamificação 3.0: Passaporte, Progressão de Níveis & Validação via Magic Link 15m
* **Objetivo de Negócio:** Materializar na interface a North Star Metric da SECOMP 2026. Permitir que o aluno acompanhe em tempo real o acúmulo de carimbos, avance nos 6 Níveis de Maestria e valide presença física de forma rápida e segura.
* **Alavanca Growth (AARRR):** **Retenção Extrema (The Core NSM Engine — Meta: $\ge 50\%$ Nível Mestre)**.
* **Componentes Envolvidos:** Régua de carimbos com gradiente `#fcd535`, badges de nível, página guiada `/validate`.
* **Entregáveis de Interface & Regras:**
  * **Régua de Carimbos:** 8 slots principais + slots bônus com estados visuais dinâmicos;
  * **6 Níveis de Maestria:** *Novato* (1-2), *Aprendiz* (3-4), *Graduado* (5-6), *Adepto* (7-8 — Desbloqueia Sorteio Gamer), *Iniciado* (9-10) e *Mestre* (11+);
  * **Validação por Magic Link QR Code (`/validate?t=...`):** O aluno escaneia o QR Code no auditório. A rota `/validate` consome o token de 15 minutos, valida a sessão e computa o carimbo automaticamente com animação de feedback;
  * **Emissor de Certificado:** Emissão dinâmica em PDF com carga horária oficial e hash SHA-256 único atrelado ao `ra_hash`.

---

### [EP-05] Experiência Anti-Churn no Câmpus: Arena Gamer, Gastronomia Sensorial & Feira da Lua
* **Objetivo de Negócio:** Combater o abandono do câmpus no intervalo das 17h00 às 19h00, provendo entretenimento, descanso e alimentação.
* **Alavanca Growth (AARRR):** **Retenção Inter-Turno (Meta: $\ge 70\%$ de permanência)**.
* **Componentes Envolvidos:** `feature-photo-card`, banners com `#2dbdb6` e `#fcd535`, cardápio digital responsivo.
* **Entregáveis de Interface:**
  * Programação da Arena Gamer com foco nos torneios relâmpago das 17h00 às 18h45;
  * Alertas visuais de Pipoca Gratuita contínua (15h30 às 18h30);
  * Cardápio da Grande Feira da Lua de encerramento com Food Trucks parceiros.

---

### [EP-06] Clímax Coletivo: Shark Tank com Voto Único Auditado (`user_id` + `ra_hash`)
* **Objetivo de Negócio:** Transformar a noite de quarta-feira no ápice de engajamento do evento, permitindo que a plateia vote no melhor pitch de startup com lisura auditável.
* **Alavanca Growth (AARRR):** **Recomendação & Efeito Torcida (Viral Loops)**.
* **Componentes Envolvidos:** Cards de pitches em `surface-card-dark`, placar dinâmico, modal de confirmação de voto.
* **Regras de Negócio & Segurança:**
  * **Fim do Voto Anônimo:** A votação exige login prévio obrigatório;
  * **Trava Criptográfica no PostgreSQL:** Restrição de unicidade `UNIQUE(user_id)` na tabela `shark_votes` e conferência cruzada com `ra_hash`. Tentativas de burlar por múltiplos navegadores ou containers são sumariamente bloqueadas;
  * **Abertura/Fechamento ao Vivo:** A sessão de votos é controlada pelo moderador na aba CMS da rota `/chameguinho`.

---

### [EP-07] Arena de Talentos RH, Mídia Kit & Túnel 3D de Patrocinadores
* **Objetivo de Negócio:** Maximizar o valor entregue aos patrocinadores das Cotas Diamante, Ouro e Prata através de conexão direta com estudantes qualificados.
* **Alavanca Growth (AARRR):** **Receita & Prova de Valor B2B (Partner ROI $\ge 80\%$)**.
* **Componentes Envolvidos:** Túnel 3D com física inercial de profundidade Z, modal flutuante de cotas, agendador de horários.
* **Entregáveis de Interface:**
  * Túnel 3D com progressão 1 a 1 de marcas e ampliação até 2.0x;
  * Agendamento de entrevistas rápidas de 15 minutos na Roda de Talentos (concedendo +2 carimbos no Passaporte);
  * Download do Mídia Kit Oficial da SECOMP 2026.

---

### [EP-08] Ideathon Express & Badges LinkedIn de Autoridade
* **Objetivo de Negócio:** Estimular a criação de soluções reais na sexta-feira e gerar efeito de rede orgânico para a marca do evento.
* **Alavanca Growth (AARRR):** **Recomendação Social (Viralidade Orgânica)**.
* **Componentes Envolvidos:** Mural de desafios, gerador de cards sociais dinâmicos em Canvas/SVG.
* **Entregáveis de Interface:**
  * Mural interativo dos desafios de inovação propostos por empresas parceiras;
  * Gerador de insígnias para LinkedIn no padrão 1200x630px estampando o nível alcançado (*"Nível Mestre — SECOMP 2026"*).

---

### [EP-09] Sistema de Identidade, Autenticação RBAC & Sessões Seguras (`/auth`)
* **Objetivo de Negócio:** Prover a camada de segurança fundamental que blinda todo o ecossistema, eliminando cadastros falsos e garantindo conformidade com OWASP Top 10.
* **Alavanca Growth (AARRR):** **Ativação Segura & Segmentação de Base**.
* **Componentes Envolvidos:** `AuthPage.tsx` (lazy loaded), dropdown de domínios institucional, input de PIN com 6 dígitos, input de RA com máscara.
* **Regras de Negócio & Segurança:**
  * **Dropdown Obrigatório de 7 Domínios:**
    `@alunos.utfpr.edu.br` | `@utfpr.edu.br` | `@gmail.com` | `@hotmail.com` | `@tuta.com` | `@mailbox.org` | `@proton.me`
  * **Formato de RA:** Validação por regex `/^a\d{7}$/` para alunos da instituição;
  * **Senha PIN:** Exatamente 6 dígitos numéricos;
  * **Controle de Sessão:** Cookie `secomp_session` HttpOnly emitido pelo backend com token JWT assinado;
  * **Redirecionamento Inteligente:** Alunos/Visitantes são direcionados para `/` ou para o parâmetro `?next=`; administradores/staff são direcionados para `/chameguinho`.

---

### [EP-10] Cockpit Administrativo `/chameguinho` & Mini-CMS Realtime
* **Objetivo de Negócio:** Oferecer à comissão organizadora (DACOM/Sprint/Sebrae) controle total, governança e visibilidade analítica em tempo real sem expor rotas vulneráveis.
* **Alavanca Growth (AARRR):** **Governança do Evento & Maximização de LTV/ROI**.
* **Componentes Envolvidos:** `AdminPage.tsx` (chunk lazy isolado), canais Supabase Realtime, gerador de QR Code com timer.
* **Regras de Negócio & Telas Internas:**
  1. **Segurança & Anti-Enumeração:** A rota `/chameguinho` é estritamente isolada e não consta em nenhum link ou menu público. Acessos anônimos recebem resposta **HTTP 404 Not Found** genérica.
  2. **Sub-visão "LOGS & MÉTRICAS":**
     * Monitoramento de audiência e logins ativos em tempo real;
     * Painel de telemetria econômica: CAC calculado por domínio de e-mail, LTV médio e projeção de ROI das cotas de patrocínio;
     * Gerador de tokens de presença com projeção de QR Code em tela cheia e contador regressivo de 15 minutos;
     * Tabela de auditoria de votos e histórico de carimbos.
  3. **Sub-visão "CMS":**
     * Gestão de equipes do Shark Tank (ativação/pausa de votação popular);
     * Mural de fotos do evento com upload no Supabase Storage e atualização instantânea;
     * Gestão de dados dos mentores da Roda de Talentos e parceiros das cotas oficiais via Supabase Realtime.
