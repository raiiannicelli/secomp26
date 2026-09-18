# 📑 BACKLOG3.0.md — HISTÓRIAS DE USUÁRIO & BACKLOG PRIORIZADO (SECOMP 2026 v3.0)
**Projeto:** Hub Digital, Plataforma Oficial & Cockpit Administrativo da SECOMP 2026 (*Construindo Conexões*)  
**Elaborado por:** Rosita (*Product Owner & Especialista em BDD/Especificação Ágil*)  
**Status:** Consolidado para Handoff Técnico | **Versão:** 3.0.0  
**Design System Vinculado:** [designBINANCE.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/designBINANCE.md) (High-Voltage Dark `#0b0e11` + `#fcd535`)  
**Épicos Vinculados:** [EPICO3.0.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/EPICO3.0.md) | **Diretrizes de Qualidade:** [TASK-PR3.0.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/TASK-PR3.0.md)

---

## 1. Priorização Geral do Backlog (Sprint Roadmap v3.0)

| ID | Título Resumido | Épico | Prioridade | SP | Alavanca AARRR | Métrica Impactada |
|---|---|---|---|---|---|---|
| **US-01** | Top Navigation Fixa & Hero High-Voltage com Contadores | EP-01 | Must Have | 5 pts | Aquisição | Bounce Rate & CTR no Hero |
| **US-02** | Grade Narrativa dos 5 Dias & Seletor de Turnos com Filtros | EP-02 | Must Have | 8 pts | Ativação | Ocupação de Auditório (Manhã $\ge 85\%$, Noite $\ge 70\%$) |
| **US-03** | Pré-Inscrição Autenticada em Atividades & Badges de Vagas | EP-02 | Must Have | 5 pts | Ativação / Retenção | Previsibilidade de Lotação e Bloqueio 401 |
| **US-04** | Catálogo das 4 Trilhas de Warm-up & Pré-Credenciamento | EP-03 | Must Have | 5 pts | Aquisição Antecipada | Conversão de Calouros e Primeiro Carimbo |
| **US-05** | Painel do Passaporte 3.0 com Régua de Carimbos e 6 Níveis | EP-04 | Must Have | 8 pts | Retenção (NSM Core) | **Passaporte Concluído ($\ge 50\%$ dos cadastros)** |
| **US-06** | Validador de Presença via Magic Link QR Code de 15m (`/validate`) | EP-04 | Must Have | 8 pts | Retenção / Auditoria | Validação Física Guiada e Zero Fricção |
| **US-07** | Leaderboard / Ranking em Tempo Real & Sorteio Gamer | EP-04 | Should Have | 5 pts | Retenção / Gamificação | Engajamento Competitivo Multiturno |
| **US-08** | Emissão de Certificado com Hash Criptográfico e Nível | EP-04 | Should Have | 5 pts | Retenção / Recompensa | Comprovação de Horas Complementares UTFPR |
| **US-09** | Vitrine da Arena Gamer, Pipoca Grátis & Guia Feira da Lua | EP-05 | Must Have | 5 pts | Retenção Inter-Turno | **Anti-Churn das 17h às 19h ($\ge 70\%$ permanência)** |
| **US-10** | Votação Popular Auditada no Shark Tank UTFPR (`user_id` + `ra_hash`) | EP-06 | Must Have | 8 pts | Recomendação / Viral | Votos Únicos Auditados no Banco ($\ge 300$ votos) |
| **US-11** | Vitrine de Patrocinadores no Túnel 3D & Mídia Kit Digital | EP-07 | Must Have | 3 pts | Receita / Parcerias | Captação de Cotas Diamante e Ouro |
| **US-12** | Agendamento de Speed Interviews na Roda de Talentos (15 min) | EP-07 | Should Have | 5 pts | Receita / Retenção | $\ge 80$ entrevistas realizadas (+2 carimbos) |
| **US-13** | Mural do Ideathon Express & Gerador de Badges para LinkedIn | EP-08 | Should Have | 5 pts | Recomendação Social | Viralidade Orgânica e Engajamento da Sexta |
| **US-14** | Registro & Login com Dropdown de 7 Domínios, PIN 6 e Máscara RA | EP-09 | Must Have | 8 pts | Ativação / Segurança | Base Qualificada e Rastreabilidade de CAC |
| **US-15** | Redirecionamento por Papel & Sessão em Cookies HttpOnly | EP-09 | Must Have | 5 pts | Segurança / OWASP | Proteção contra XSS e CSRF |
| **US-16** | Cockpit `/chameguinho` — Painel "LOGS & MÉTRICAS" | EP-10 | Must Have | 8 pts | Governança / Analítica | Telemetria CAC/LTV, Sessões Ativas e QR 15m |
| **US-17** | Cockpit `/chameguinho` — Aba "CMS" em Tempo Real (Supabase) | EP-10 | Must Have | 8 pts | Governança / Operação | Gestão de Pitches, Fotos do Evento e Mentores |

* **Total de Story Points:** 101 pts (distribuídos em 4 Sprints com Quality Gates rígidos).

---

## 2. Detalhamento das User Stories & Cenários BDD (Gherkin)

---

### [EP-09] Sistema de Identidade, Autenticação RBAC & Sessões Seguras

#### 🟢 US-14: Registro com Dropdown de 7 Domínios, PIN 6 e Validação de RA
* **Como** participante da SECOMP 2026,
* **Quero** realizar meu cadastro informando minha parte local de e-mail com seleção obrigatória do provedor em dropdown, definir senha numérica de 6 dígitos e validar meu RA institucional,
* **Para que** eu tenha uma identidade auditável e possa concorrer aos prêmios, votar no Shark Tank e validar carimbos de presença.
* **Componentes:** `AuthPage.tsx`, input numérico estrito, dropdown institucional customizado.
* **Regras de Negócio:**
  1. Dropdown restrito com exatamente 7 opções:
     * `@alunos.utfpr.edu.br`
     * `@utfpr.edu.br`
     * `@gmail.com`
     * `@hotmail.com`
     * `@tuta.com`
     * `@mailbox.org`
     * `@proton.me`
  2. RA obrigatório caso o domínio seja `@alunos.utfpr.edu.br`, seguindo a máscara `/^a\d{7}$/`.
  3. Senha deve ser exatamente um PIN numérico de 6 dígitos (`/^\d{6}$/`).
  4. Duplicidade de e-mail ou RA gera erro amigável na interface.

```gherkin
Feature: Registro de Participante com Domínio Restrito

  Scenario: Cadastro bem-sucedido de aluno da UTFPR
    Given que o usuário está na rota "/auth" na aba "Cadastrar"
    And preenche a parte local do e-mail com "rai.moratto"
    And seleciona o domínio "@alunos.utfpr.edu.br" no dropdown
    And preenche o RA com "a2489120"
    And preenche a senha numérica com "123456"
    When clica no botão "Criar Conta"
    Then a conta é persistida no PostgreSQL (Supabase)
    And o cookie "secomp_session" é emitido com flags HttpOnly e SameSite=Strict
    And o usuário é redirecionado para "/" com o nome exibido na barra de navegação

  Scenario: Tentativa de cadastro com RA inválido para domínio de aluno
    Given que o usuário selecionou o domínio "@alunos.utfpr.edu.br"
    And preenche o RA com "2489120" sem o prefixo "a"
    When clica no botão "Criar Conta"
    Then o formulário bloqueia o envio
    And exibe a mensagem de erro "O RA deve seguir o formato aXXXXXXX"

  Scenario: Cadastro bem-sucedido de participante externo sem exigência de RA
    Given que o usuário seleciona o domínio "@proton.me"
    And preenche a parte local "marcos.seg"
    And preenche a senha com "987654"
    When clica no botão "Criar Conta"
    Then o campo de RA permanece desabilitado ou opcional
    And a conta é criada com perfil "VISITOR"
```

---

#### 🟢 US-15: Redirecionamento Inteligente por Papel & Sessão Segura HttpOnly
* **Como** participante ou membro da organização,
* **Quero** efetuar login e ser redirecionado para a área correspondente ao meu papel,
* **Para que** eu acerte de primeira o meu painel de trabalho ou de atividades sem navegar por caminhos desnecessários.
* **Regras de Negócio:**
  1. Alunos e Visitantes (`role=STUDENT` ou `role=VISITOR`) são redirecionados para `/` ou para o endereço contido em `?next=`.
  2. Administradores e Staff (`role=ADMIN` ou `role=STAFF`) são redirecionados automaticamente para a rota isolada `/chameguinho`.
  3. Proteção contra brute force: bloqueio temporário (429 Too Many Requests) após 5 tentativas incorretas consecutivas.

```gherkin
Feature: Login e Roteamento por Papel

  Scenario: Login de administrador com redirecionamento para o cockpit
    Given que o usuário possui conta com papel "ADMIN"
    When submete credenciais válidas na tela "/auth"
    Then recebe o cookie de sessão seguro
    And o roteador redireciona imediatamente para "/chameguinho"
    And carrega o bundle administrativo via lazy loading

  Scenario: Login de aluno com redirecionamento de continuidade
    Given que o aluno tentou acessar "/validate?t=SEC-IA-A3K" sem estar logado
    And foi redirecionado para "/auth?next=/validate?t=SEC-IA-A3K"
    When realiza o login com sucesso
    Then o sistema consome o parâmetro "next"
    And redireciona o aluno diretamente de volta para "/validate?t=SEC-IA-A3K"
```

---

### [EP-04] Motor de Gamificação 3.0 & Passaporte

#### 🟢 US-06: Validador de Presença via Magic Link QR Code de 15m (`/validate`)
* **Como** participante presente em uma atividade da SECOMP,
* **Quero** apontar a câmera do meu celular para o QR Code projetado no auditório e ter meu carimbo validado automaticamente na página `/validate`,
* **Para que** minha presença seja computada em menos de 3 segundos sem digitação cansativa de códigos.
* **Componentes:** `ValidatePage.tsx`, animação de carimbo SVG, chamada `POST /api/v1/attendance/validate-token`.
* **Regras de Negócio:**
  1. O Magic Link tem formato `https://secomp.utfpr.edu.br/validate?t=SEC-[CAT]-[XXX]&sig=[HMAC]`.
  2. O token possui validade máxima e estrita de **15 minutos** a partir da sua abertura pelo staff.
  3. Se o participante já tiver sessão ativa, a página valida o token imediatamente ao carregar.
  4. Idempotência: Caso o aluno já tenha recebido este carimbo, o sistema exibe feedback informativo sem duplicar o registro no banco.

```gherkin
Feature: Auto-validação de Presença via Magic Link

  Scenario: Aluno autenticado escaneia QR Code válido dentro do prazo
    Given que o aluno possui sessão ativa
    And o token "SEC-IA-992" foi gerado há 4 minutos pelo staff
    When o aluno acessa "/validate?t=SEC-IA-992&sig=..."
    Then a página exibe animação de verificação
    And a API retorna status 200 com carimbo computado
    And o nível do passaporte é recalculado
    And a tela exibe "✅ Presença Confirmada! Carimbo adicionado ao seu Passaporte."

  Scenario: Aluno acessa Magic Link expirado após 15 minutos
    Given que o token "SEC-BD-104" foi aberto há 16 minutos
    When o aluno acessa a URL do Magic Link
    Then a API recusa a validação retornando erro 410 "TOKEN_EXPIRED"
    And a tela exibe feedback em vermelho "⏱ Este QR Code expirou após 15 minutos. Solicite auxílio ao staff."
    And nenhum carimbo é adicionado
```

---

### [EP-06] Clímax Coletivo: Shark Tank UTFPR com Voto Único Auditado

#### 🟢 US-10: Votação Popular no Shark Tank com Trava no Banco de Dados (`user_id` + `ra_hash`)
* **Como** espectador do Shark Tank UTFPR no auditório,
* **Quero** votar no melhor pitch apresentado diretamente pelo meu celular através de minha conta autenticada,
* **Para que** meu voto ajude a definir a startup vencedora do troféu da galera de maneira transparente e sem manipulações.
* **Componentes:** `SharkTankSection.tsx`, modal de confirmação, placar ao vivo.
* **Regras de Negócio:**
  1. Votação exige login prévio obrigatório; usuários deslogados visualizam botão *"Faça login para votar"*.
  2. A votação precisa estar aberta no painel `/chameguinho` pelo moderador.
  3. Trava de integridade: tabela `shark_votes` possui constraint `UNIQUE(user_id)`. É tecnicamente impossível computar 2 votos para a mesma conta, mesmo limpando cookies ou utilizando navegadores diferentes.
  4. Auditabilidade: o registro de voto armazena `user_id`, `pitch_id`, `ra_hash` e timestamp.

```gherkin
Feature: Votação Popular Auditada no Shark Tank

  Scenario: Voto registrado com sucesso por aluno autenticado
    Given que o aluno está logado com perfil ativo
    And o moderador abriu a votação para o pitch "EcoByte"
    When o aluno clica em "Votar neste Projeto" e confirma no modal
    Then o voto é persistido no PostgreSQL com seu user_id
    And a interface exibe feedback de voto confirmado com selo de auditoria
    And os botões de votação dos outros projetos são desabilitados

  Scenario: Tentativa de segundo voto pelo mesmo usuário em outro navegador
    Given que o aluno já votou no projeto "EcoByte"
    When abre uma aba anônima, faz login com a mesma conta e tenta votar no projeto "HealthTech"
    Then o backend recusa a requisição com erro 409 "VOTE_ALREADY_CAST"
    And a interface informa "Você já registrou seu voto único nesta edição do Shark Tank"
```

---

### [EP-10] Cockpit Administrativo `/chameguinho` & Mini-CMS Realtime

#### 🟢 US-16: Cockpit `/chameguinho` — Painel "LOGS & MÉTRICAS"
* **Como** coordenador da SECOMP (DACOM/Sprint),
* **Quero** acessar o painel restrito `/chameguinho` na visão "LOGS & MÉTRICAS",
* **Para que** eu possa acompanhar a presença dos turnos, gerar Magic Links QR Code com timer de 15 minutos e monitorar CAC, LTV e sessões ativas em tempo real.
* **Componentes:** `AdminPage.tsx`, gerador de QR Code com countdown SVG, tabelas de métricas tabulares `BinancePlex`.
* **Regras de Negócio & Segurança:**
  1. A rota `/chameguinho` é protegida: requisições anônimas recebem **HTTP 404 Not Found** genérico.
  2. Emissor de Tokens: ao selecionar a atividade, o sistema gera o token no formato `SEC-[CAT]-[XXX]` e projeta o QR Code em tela cheia com timer regressivo de 15:00 a 00:00.
  3. Telemetria: cálculo automatizado do CAC segmentado por domínio de e-mail e taxa de conclusão do passaporte (NSM).

```gherkin
Feature: Cockpit Administrativo - LOGS & MÉTRICAS

  Scenario: Tentativa de acesso anônimo à rota não-padrão /chameguinho
    When um usuário não autenticado tenta acessar "/chameguinho" diretamente pela URL
    Then o servidor responde com HTTP 404 Not Found genérico
    And nenhuma pista de que a rota existe é revelada no DOM

  Scenario: Coordenador gera Magic Link de 15 minutos para palestra
    Given que o administrador está logado na página "LOGS & MÉTRICAS" do "/chameguinho"
    When seleciona a palestra "Keynote de Inteligência Artificial" e clica em "Gerar QR Code de Presença"
    Then o sistema cria o token "SEC-IA-992" com expiração exata em 15 minutos
    And projeta o QR Code com a URL "https://secomp.utfpr.edu.br/validate?t=SEC-IA-992&sig=..."
    And inicia o cronômetro regressivo na tela
    And após 15 minutos o QR Code é invalidado automaticamente no servidor
```

---

#### 🟢 US-17: Cockpit `/chameguinho` — Aba "CMS" em Tempo Real (Supabase)
* **Como** comissão organizadora da SECOMP,
* **Quero** gerenciar as equipes do Shark Tank, atualizar o mural de fotos do evento e editar dados de parceiros e mentores na aba "CMS",
* **Para que** as alterações sejam refletidas instantaneamente no portal dos participantes sem necessidade de novos deploys.
* **Componentes:** Aba CMS do `AdminPage.tsx`, formulários dinâmicos de pitches, upload de fotos integrado ao Supabase Storage e broadcast via canais Realtime.
* **Regras de Negócio:**
  1. Apenas usuários com `role=ADMIN` possuem permissão de escrita no CMS.
  2. Ao abrir ou pausar a votação de um pitch do Shark Tank, o evento `VOTING_STATUS_CHANGED` é disparado em broadcast via Supabase Realtime para todos os celulares conectados.
  3. Upload de fotos armazena as mídias no bucket `event-photos` do Supabase Storage e propaga a galeria em tempo real.

```gherkin
Feature: Cockpit Administrativo - Aba CMS em Tempo Real

  Scenario: Administrador libera a votação do Shark Tank em tempo real
    Given que o administrador está na aba "CMS" do "/chameguinho"
    When clica no botão "Abrir Votação Popular" do Shark Tank
    Then a mutação envia requisição PUT para o endpoint do CMS
    And o canal Realtime da SECOMP emite o evento "VOTING_OPEN"
    And todos os participantes na página do Shark Tank veem os botões de votação se habilitarem instantaneamente sem recarregar a tela

  Scenario: Publicação de nova foto no mural do evento
    Given que o staff realizou o upload de uma foto da Arena Gamer na aba CMS
    When confirma o envio
    Then a imagem é armazenada no Supabase Storage
    And a galeria pública no site reflete a nova foto instantaneamente via Realtime
```

---

## 3. Matriz de Rastreabilidade & Quality Gates da @judith

| Story | PR Vinculado no TASK-PR3.0 | Quality Gate Obrigatório |
|---|---|---|
| **US-14 & US-15** | `PR-13` (Auth Gate) & `PR-15` (Frontend `/auth`) | 404 em rota restrita; Rate limit 429; Cookies HttpOnly |
| **US-03 & US-06** | `PR-14` (Store Slices) & `PR-16` (Magic Link `/validate`) | Sessão obrigatória; Expiração 15m; Idempotência de carimbos |
| **US-10** | `PR-13` (Database Migration) | Constraint `UNIQUE(user_id)` no PostgreSQL; 1 voto por conta |
| **US-16 & US-17** | `PR-17` (Dashboard `/chameguinho`) & `PR-18` (Backend Admin) | Bundle lazy isolado; SSE/Realtime cleanup; Zero secrets no cliente |
