# 📋 PRODUCT REQUIREMENTS DOCUMENT (PRD) — SECOMP 2026 (v3.0)
**Produto:** Plataforma Digital, Hub Web & Cockpit Administrativo da SECOMP 2026 (*Construindo Conexões*)  
**Elaborado por:** Morgan (*Product Manager, Requirements Analyst & Growth Strategist*)  
**Status:** Consolidado e Blindado para Handoff da Product Owner (@rosita) | **Versão:** 3.0.0  
**Design System Base:** [designBINANCE.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/designBINANCE.md) (High-Voltage Dark `#0b0e11` + `#fcd535`)  
**Fundamentação Arquitetural:** [ADR2.0.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/ADR2.0.md) (ADR-012, ADR-013) & [SDD-SPEC2.0.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/SDD-SPEC2.0.md)

---

## 1. Visão Executiva do Produto (v3.0)

A plataforma da **SECOMP 2026** é o hub digital oficial e auditável do evento universitário da UTFPR, projetado para unificar informação em tempo real, combater o churn inter-turnos e criar pontes de alta conversão entre acadêmicos, parceiros corporativos e a coordenação.

Na versão 3.0, a plataforma adota o paradigma **Identity-First**: a navegação pública de descoberta permanece fluida, porém todas as interações de valor — **pré-inscrição em atividades, validação de carimbos no passaporte e votação no Shark Tank** — exigem autenticação obrigatória de perfil único.

Para governança interna, o sistema incorpora o **Cockpit Administrativo Não-Padrão (`/chameguinho`)**, uma interface restrita e isolada do bundle público contendo os módulos **"LOGS & MÉTRICAS"** e **"CMS"**, operando sobre infraestrutura **Supabase (PostgreSQL gerenciado, Realtime e Storage)**.

A interface gráfica opera em **Dark Canvas de alto contraste (`#0b0e11`)**, impulsionada pelo **Amarelo Binance (`#fcd535`)**, tipografia técnica **BinancePlex**, blocos de layout com física fluida e conformidade estrita com padrões OWASP Top 10.

---

## 2. ICP (Ideal Customer Profile) & Personas Centrais

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. O Aluno Explorador (Calouros / 1º ao 3º período)                                                │
│    • Dor: Insegurança sobre qual trilha seguir; receio de matérias teóricas isoladas.              │
│    • Necessidade: Grade clara dos minicursos de warm-up (Set/Out), Arena Gamer e passaporte.       │
│    • Regra de Acesso: Login obrigatório com domínio institucional @alunos.utfpr.edu.br e RA.       │
├────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. O Aluno Protagonista (Veteranos / 4º ao último período)                                         │
│    • Dor: Pressão por estágio, currículo sem diferencial e TCC desconectado do mercado.           │
│    • Necessidade: Roda de Talentos (speed interviews de 15m), Shark Tank UTFPR e Ideathon.         │
│    • Regra de Acesso: 1 voto único auditado no Shark Tank, histórico de carimbos e certificado.    │
├────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3. A Empresa Parceira / Recrutador (TO Brasil, TCS, ForLogic, CyberGuard, Startups)                │
│    • Dor: Alto custo de aquisição de talentos (CAC RH); dificuldade de triagem técnica.            │
│    • Necessidade: Mídia Kit, estande imersivo no Túnel 3D, acesso a dados de candidatos e banca.   │
│    • Métrica: ROI comprovado de patrocínio com leads qualificados registrados na plataforma.        │
├────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 4. A Coordenação & Organizadores (DACOM, Incubadora Sprint, Sebrae Paraná)                         │
│    • Dor: Falta de dados em tempo real sobre público nos 3 turnos, risco de fraudes em carimbos.   │
│    • Necessidade: Painel restrito /chameguinho com LOGS & MÉTRICAS (CAC/LTV/presença),              │
│      emissão de Magic Links QR Code de 15 minutos e CMS dinâmico para fotos, mentores e pitches.   │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Jornada Macro de Valor (The Value Journey v3.0)

A jornada é contínua e protegida por barreira de identidade:

```mermaid
graph TD
    subgraph FASE 1: DESCOBERTA, CADASTRO & ATIVAÇÃO
        A[Visitante acessa Landing Page Oficial] --> B[Navega na Grade dos 5 Dias e Minicursos]
        B --> C{Deseja interagir?}
        C -->|Sim| D[Acesso à Rota /auth: Cadastro com Domínio Restrito + RA + PIN 6]
        D --> E[Cookie HttpOnly secomp_session emitido]
        E --> F[Passaporte Digital 3.0 ativado com UID persistente]
    end

    subgraph FASE 2: ENGAJAMENTO NOS 3 TURNOS & AUDITORIA
        F --> G[Manhã: Telão exibe QR Code dinâmico com Magic Link 15m]
        G --> H[Aluno abre /validate?t=SEC-CAT-XXX: Auto-validação em 3s]
        H --> I[Tarde: Mentoria Alumni + Pipoca + Arena Gamer]
        I --> J[Noite: Shark Tank UTFPR — 1 Voto Único por user_id no Supabase]
    end

    subgraph FASE 3: GOVERNANÇA & RETENÇÃO
        J --> K[Coordenação monitora em /chameguinho na aba LOGS & MÉTRICAS]
        K --> L[Admin atualiza pitches e fotos do evento na aba CMS]
        L --> M[Sexta-feira: Emissão de Certificado com Hash Criptográfico]
    end
```

---

## 4. Matriz MoSCoW de Alto Nível (Escopo Macro do Sistema v3.0)

### 4.1 Must Have (Crítico para a Operação da SECOMP)

1. **Hero Band High-Voltage & Vitrine de Posicionamento:**
   * Apresentação oficial do tema *"Construindo Conexões"*, datas (09 a 13 de Nov) e contadores dinâmicos `BinancePlex`.
   * Fundo contínuo `#0b0e11` e destaque amarelo `#fcd535` sem ofuscamento ou gradientes genéricos.

2. **Sistema de Identidade & Autenticação Obrigatória (`/auth`):**
   * Interface dedicada e isolada para cadastro e login de participantes.
   * **Dropdown Obrigatório de 7 Domínios:**
     1. `@alunos.utfpr.edu.br` (requer validação estrita de RA)
     2. `@utfpr.edu.br` (docentes/servidores)
     3. `@gmail.com`
     4. `@hotmail.com`
     5. `@tuta.com`
     6. `@mailbox.org`
     7. `@proton.me`
   * **Validação de RA:** Obrigatório para alunos, com formato estrito `aXXXXXXX` (ex: `a2489120`).
   * **Senha Segura Numérica:** Exatamente 6 dígitos numéricos (PIN).
   * **Sessão por Cookies HttpOnly:** Cookie `secomp_session` com flags `HttpOnly`, `SameSite=Strict` e `Secure`.

3. **Grade Narrativa Interativa dos 5 Dias & 3 Turnos:**
   * Navegação fluida entre os 5 arcos narrativos diários e 3 turnos (Manhã, Tarde, Noite).
   * Botão de pré-inscrição em atividades com checagem de sessão ativa (bloqueio 401 amigável direcionando para `/auth`).

4. **Motor de Presença por Magic Link QR Code (`/validate`):**
   * Geração de tokens de presença pelo staff com formato `SEC-[CATEGORIA]-[XXX]` e assinatura HMAC.
   * **TTL Estrito de 15 Minutos:** Tokens expiram automaticamente no Redis/Supabase.
   * **Página Guiada `/validate`:** Detecta automaticamente a sessão do participante, valida o token e adiciona o carimbo ao Passaporte com feedback animado. Caso o aluno não esteja logado, redireciona para `/auth?next=...` e completa a validação após o login.

5. **Shark Tank UTFPR com Votação Única Auditada:**
   * Interface mobile-first para a plateia votar no melhor pitch durante a noite de quarta-feira.
   * **Trava no Banco de Dados:** Exatamente 1 voto por `user_id` e verificação de integridade por `ra_hash`. Eliminação de qualquer vulnerabilidade baseada em IP ou limpeza de cookies.

6. **Cockpit Administrativo Não-Padrão (`/chameguinho`):**
   * **Segurança por Obscuridade & OWASP:** Endpoint administrativo renomeado para `/chameguinho` para prevenir ataques de força bruta e varreduras automáticas. Acesso anônimo retorna **404 Not Found** genérico.
   * **Sub-visão "LOGS & MÉTRICAS":**
     * Tabela de logins ativos e sessões em tempo real.
     * Painel de telemetria de negócios: CAC por domínio, LTV médio e projeção de ROI.
     * Emissor de tokens de presença com projeção de QR Code em tela cheia e contador regressivo de 15 minutos.
     * Histórico auditável de carimbos e votos.
   * **Sub-visão "CMS":**
     * Gestão em tempo real de equipes e pitches do Shark Tank (ativação/pausa de votação).
     * Gestão de parceiros e cotas ativas no Túnel 3D.
     * Gestão de mentores da Roda de Talentos.
     * Mural de fotos do evento com upload direto para o Supabase Storage e broadcast via Supabase Realtime.

7. **Hub Imersivo de Parceiros (Túnel 3D Scrollytelling):**
   * Apresentação física em profundidade Z com foco 1 a 1 nos logos dos parceiros.
   * Modal flutuante de cotas com benefícios, contatos B2B e integração com captação.

### 4.2 Should Have (Alto Valor para Retenção & Experiência)

1. **Painel do Passaporte 3.0 & 6 Níveis de Maestria:**
   * Visualização da régua de carimbos (8 posições obrigatórias + bônus).
   * Progressão automática de níveis: *Novato*, *Aprendiz*, *Graduado*, *Adepto* (desbloqueia sorteio gamer), *Iniciado* e *Mestre*.
2. **Gerador Automatizado de Certificado:**
   * Emissão instantânea de certificado em PDF/PNG com horas complementares, selo UTFPR e hash criptográfico atrelado ao `user_id` e `ra_hash`.
3. **Agendamento da Roda de Talentos:**
   * Agendamento de slots de 15 minutos com recrutadores de parceiros corporativos.
4. **Vitrine Anti-Churn no Câmpus:**
   * Programação da Arena Gamer (17h00 às 18h45), alerta de Pipoca Gratuita e cardápio da Feira da Lua de encerramento.

---

## 5. Requisitos Não-Funcionais & Padrões de Segurança (OWASP Top 10)

| Requisito | Diretriz de Engenharia | Validação / Métrica |
|---|---|---|
| **Anti-Enumeration** | `/chameguinho` e `/api/v1/admin/*` retornam HTTP 404 para requisições anônimas | Proibido retornar 401 ou 403 para anônimos na área restrita |
| **Proteção de Sessão** | Tokens JWT mantidos estritamente em cookies HttpOnly / SameSite=Strict | Proibido armazenar tokens em `localStorage` ou `sessionStorage` |
| **Proteção CSRF** | Header customizado `X-CSRF-Token` exigido em todas as mutações (`POST`, `PUT`, `DELETE`) | Rejeição imediata com HTTP 403 em caso de mismatch |
| **Rate Limiting** | Máximo de 5 tentativas de login por minuto por IP | Retorno HTTP 429 Too Many Requests com backoff exponencial |
| **Isolamento de Bundles** | Componentes do `/chameguinho` carregados exclusivamente via `React.lazy()` | Zero contaminação do bundle público `index.html` com código admin |
| **Latência de Interface** | Resposta a interações de UI inferior a 100ms; sincronização Realtime < 500ms | Supabase Realtime Channels com listeners limpos em desmontagem |

---

## 6. Handoff para Engenharia e Produto

* **Visão de Produto & Growth:** Consolidada pelo @morgan neste PRD 3.0 e no [GROWTH3.0.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/GROWTH3.0.md).
* **Fatiamento Ágil & BDD:** Delegado para a @rosita em [EPICO3.0.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/EPICO3.0.md) e [BACKLOG3.0.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/BACKLOG3.0.md).
* **Controle de Qualidade:** Supervisionado pela @judith via [TASK-PR3.0.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/TASK-PR3.0.md).
