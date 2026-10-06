# 📑 BACKLOG2.0.md — HISTÓRIAS DE USUÁRIO & BACKLOG PRIORIZADO (SECOMP 2026)
**Projeto:** Hub Digital & Plataforma Oficial da SECOMP 2026 (*Construindo Conexões*)  
**Elaborado por:** Rosita (*Product Owner & Especialista em BDD/Especificação Ágil*)  
**Status:** Consolidado para Handoff Técnico | **Versão:** 2.0.0  
**Design System Vinculado:** [design.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/design.md) (Binance High-Voltage Dark)  
**Épicos Vinculados:** [docs/EPICO2.0.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/EPICO2.0.md)

---

## 1. Priorização Geral do Backlog (Sprint Roadmap & Growth Funnel)

| ID da Story | Título Resumido | Épico | Prioridade (MoSCoW) | Estimativa (SP) | Alavanca AARRR | Métrica Impactada |
|---|---|---|---|---|---|---|
| **US-01** | Top Navigation Fixa & Hero High-Voltage com Contadores | EP-01 | Must Have | 5 pts | Aquisição | Bounce Rate & Taxa de Inscrição Top-of-Funnel |
| **US-02** | Grade Narrativa dos 5 Dias & Seletor de Turnos com Filtro por Tema | EP-02 | Must Have | 8 pts | Ativação | Ocupação de Auditório (Manhã $\ge 85\%$, Noite $\ge 70\%$) |
| **US-03** | Pré-Inscrição em Atividades & Badges de Lotação em Tempo Real | EP-02 | Should Have | 5 pts | Ativação / Retenção | Previsibilidade de Lotação e Fator Escassez |
| **US-04** | Catálogo das 4 Trilhas de Warm-up & Pré-Credenciamento (Set/Out) | EP-03 | Must Have | 5 pts | Aquisição Antecipada | Conversão Precoce de Calouros e Exploradores |
| **US-05** | Painel do Passaporte 2.0 com Régua de Carimbos e 6 Níveis | EP-04 | Must Have | 8 pts | **Retenção (NSM Core)** | **Passaporte Concluído ($\ge 50\%$ dos inscritos)** |
| **US-06** | Validador de Presença por Token Descartável Anti-Fraude | EP-04 | Must Have | 8 pts | Retenção / Auditoria | Integridade de Presença Física no Auditório |
| **US-07** | Leaderboard / Ranking em Tempo Real & Sorteio Gamer | EP-04 | Should Have | 5 pts | Retenção / Gamificação | Engajamento Competitivo e Presença Multiturno |
| **US-08** | Geração Automatizada de Certificado com Hash e Nível Alcançado | EP-04 | Should Have | 5 pts | Retenção / Recompensa | Emissão de Certificados e Horas Complementares |
| **US-09** | Vitrine da Arena Gamer, Pipoca Grátis & Guia da Feira da Lua | EP-05 | Must Have | 5 pts | Retenção Inter-Turno | **Anti-Churn das 17h às 19h ($\ge 70\%$ permanência)** |
| **US-10** | Votação Popular ao Vivo no Shark Tank UTFPR via QR Code | EP-06 | Must Have | 8 pts | Recomendação / Viral | Votos Únicos Auditados ($\ge 300$ votos) |
| **US-11** | Vitrine de Patrocinadores & Download do Mídia Kit Digital | EP-07 | Must Have | 3 pts | Receita / Parcerias | Captação de Cotas Diamante e Ouro |
| **US-12** | Agendamento de Speed Interviews de 15 min na Roda de Talentos | EP-07 | Should Have | 5 pts | Receita / Retenção | $\ge 80$ entrevistas realizadas (+2 carimbos no Passaporte) |
| **US-13** | Mural do Ideathon Express & Gerador de Badges para LinkedIn | EP-08 | Should Have | 5 pts | Recomendação Social | Viralidade Orgânica e Engajamento da Sexta-feira |

**Total de Story Points:** 75 pts (distribuídos em 3 Sprints equilibradas).

---

## 2. Detalhamento Técnico e de Negócio das User Stories

---

### [EP-01] Core Shell, Posicionamento High-Voltage & Aquisição Top-of-Funnel

#### 🟢 US-01: Top Navigation Fixa & Hero High-Voltage com Contadores Dinâmicos
* **Como** estudante universitário ou visitante corporativo,
* **Quero** visualizar uma barra de navegação superior responsiva e uma Hero Section em Dark Mode de alto impacto com datas oficiais (09 a 13 de Nov), tema *"Construindo Conexões"* e contadores dinâmicos,
* **Para que** eu compreenda instantaneamente a magnitude do evento, valide sua credibilidade institucional e seja direcionado para a inscrição sem atrito.
* **Componentes do design.md:** `top-nav-dark`, `hero-band-dark`, `stat-callout-card`, `trust-badge`, `button-primary`.
* **Alavanca Growth:** *Aquisição (Redução de Bounce Rate e Aumento de CTR no Hero)*.
* **Regras de Negócio & Interface:**
  1. Fundo contínuo em `#0b0e11` (canvas-dark) com barra superior de altura 64px fixa no topo (`position: sticky`), com backdrop-blur suave e borda inferior em `#2b3139` (hairline-on-dark).
  2. Menu horizontal com âncoras para: `Programação`, `Minicursos`, `Passaporte`, `Shark Tank`, `Roda de Talentos`, `Patrocinadores`.
  3. Botão primário CTA no topo e no Hero: *"Garantir Vaga"*, cor de fundo `#fcd535` (primary), texto em `#181a20` (ink), hover `#f0b90b` (primary-active) e raio `rounded.md` (6px).
  4. Quatro contadores numéricos com números em `BinancePlex` 40px bold:
     * `5 Dias Temáticos`
     * `3 Turnos Diários`
     * `15+ Horas de Conteúdo`
     * `8+ Carimbos para Concorrer`
  5. Selos institucionais de alta autoridade no rodapé da Hero: UTFPR, DACOM, Incubadora Sprint e Sebrae.

---

### [EP-02] Grade Narrativa 3 Turnos, Filtros Multidimensionais & Pré-Inscrição Ativa

#### 🟢 US-02: Grade Narrativa dos 5 Dias & Seletor de Turnos com Filtro por Tema
* **Como** participante da SECOMP,
* **Quero** alternar facilmente entre os 5 dias temáticos da semana, filtrar as atividades pelos 3 turnos (Manhã, Tarde e Noite) e por tema transversal (Tecnologia, Gestão, Inovação, Carreira),
* **Para que** eu possa organizar minha agenda acadêmica e profissional sem perder as palestras e oficinas do meu interesse.
* **Componentes do design.md:** `surface-card-dark`, `markets-table-card`, tabs interativas com indicador `#fcd535`, badges de horário `BinancePlex`.
* **Alavanca Growth:** *Ativação & Retenção de Turno (Combate à desinformação de horários)*.
* **Regras de Negócio & Interface:**
  1. Abas principais correspondentes aos 5 Arcos Narrativos:
     * *Segunda: O MUNDO* (Keynote Gustavo Meirelles, Startup Day, Painel Big Techs).
     * *Terça: O MERCADO* (Carreira Tech, Consultoria Alumni, Keynote CyberGuard).
     * *Quarta: OS PROJETOS* (Pesquisa & Startups, Shark Tank UTFPR).
     * *Quinta: O HUMANO* (Inteligência Emocional NUAPE, Roda de Talentos, Eloah Bueno).
     * *Sexta: O FUTURO* (Novas Fronteiras da Computação, Ideathon Express, Premiação & Feira da Lua).
  2. Seletor de Turno secundário: `[Todos os Turnos]`, `[Manhã: 09h00-11h30]`, `[Tarde: 14h00-17h00]`, `[Noite: 19h00-22h00]`.
  3. Filtro temático em chips: `[Todos]`, `[Tecnologia]`, `[Gestão]`, `[Inovação]`, `[Carreira]`.
  4. Cards de atividade em `#1e2329` (surface-card-dark) com borda `#2b3139`, exibindo: título, palestrante, empresa, local físico e horário destacado.
  5. Tempo de resposta da alternância de abas/filtros estritamente inferior a 100ms.

#### 🟢 US-03: Pré-Inscrição em Atividades & Badges de Lotação em Tempo Real
* **Como** aluno participante,
* **Quero** realizar a pré-inscrição em palestras e minicursos concorridos e visualizar o status de vagas restantes em tempo real,
* **Para que** eu garanta minha vaga antecipada e não fique de fora das atividades com limite de assentos.
* **Componentes do design.md:** Badges `trading-up` (`#0ecb81`), `trading-down` (`#f6465d`), modal em `surface-card-dark`.
* **Alavanca Growth:** *Gatilho de Escassez e Previsibilidade Operacional*.
* **Regras de Negócio & Interface:**
  1. Se as vagas disponíveis forem $> 20\%$, exibir badge verde `#0ecb81` com o texto *"Vagas Abertas"*.
  2. Se as vagas forem $\le 20\%$, exibir badge vermelho `#f6465d` com o texto *"Últimas Vagas (% restante)"*.
  3. Ao clicar em *"Pré-inscrever-se"*, o sistema valida se o usuário já possui cadastro ativo ou abre modal simples com Nome, RA e E-mail.
  4. Após confirmação, o card atualiza o botão para o estado *"Inscrito"* com fundo `#3a3a1f` (primary-disabled) e exibe a mensagem de confirmação.

---

### [EP-03] Funil de Warm-up: Minicursos Pré-Evento (Set/Out) & Ativação Antecipada

#### 🟢 US-04: Catálogo das 4 Trilhas de Warm-up & Pré-Credenciamento
* **Como** calouro ou estudante em busca de capacitação prática,
* **Quero** acessar o catálogo das 4 datas de minicursos prévios (14 e 29 de Setembro / 14 e 29 de Outubro) organizados pelas 4 Trilhas Temáticas,
* **Para que** eu aprenda habilidades práticas de laboratório e já fique previamente credenciado para a semana oficial.
* **Componentes do design.md:** Cards em `surface-card-dark`, chips de trilha em tons categorizados, botão `button-primary`.
* **Alavanca Growth:** *Aquisição Antecipada (Pre-Event Activation Loop)*.
* **Regras de Negócio & Interface:**
  1. Organização em 4 Trilhas Técnicas:
     * *Trilha Inteligência & Dados* (IA com Python, Power BI com TO Brasil).
     * *Trilha Infra & Segurança* (CyberSegurança com CyberGuard, Containers com Docker).
     * *Trilha Hardware & Sistemas* (Montagem e Manutenção de PCs, Arduino/STM32 IoT).
     * *Trilha Desenvolvimento & UI* (Game DEV preparatório para GameJam, UI/UX no Figma).
  2. Cada card deve exibir: Data do Warm-up (ex: 14/09), Carga Horária (ex: 4h), Câmpus/Lab ou Online, Instrutor/Empresa parceira.
  3. O cadastro gera automaticamente o identificador único de Passaporte do aluno, já atribuindo o primeiro carimbo de aquisição.

---

### [EP-04] Motor de Gamificação 2.0: Passaporte, Progressão de Níveis & Validação Anti-Fraude

#### 🟢 US-05: Painel do Passaporte SECOMP 2.0 com Régua de Carimbos e 6 Níveis
* **Como** participante ativo da SECOMP,
* **Quero** visualizar o painel digital do meu Passaporte SECOMP contendo minha régua de carimbos acumulados e meu nível atual de maestria,
* **Para que** eu tenha clareza do meu progresso rumo à meta de 8 carimbos para o sorteio gamer de sexta-feira.
* **Componentes do design.md:** `stat-callout-card`, régua de progresso com gradiente amarelo `#fcd535`, badges de nível.
* **Alavanca Growth:** *North Star Metric (NSM) — Meta de $\ge 50\%$ de conclusão qualificada*.
* **Regras de Negócio & Interface:**
  1. A régua de carimbos exibe 8 posições obrigatórias + slots de carimbos bônus.
  2. Cada carimbo conquistado acende com ícone preenchido em `#fcd535` e data/hora do registro.
  3. O painel calcula e exibe automaticamente o **Nível de Maestria**:
     * 1 a 2 carimbos: **Novato** (Badge cinza `#707a8a`)
     * 3 a 4 carimbos: **Aprendiz** (Badge azul `#3b82f6`)
     * 5 a 6 carimbos: **Graduado** (Badge turquesa `#2dbdb6`)
     * 7 a 8 carimbos: **Adepto** (Badge verde `#0ecb81` — *Desbloqueia Elegibilidade aos Sorteios*)
     * 9 a 10 carimbos: **Iniciado** (Badge roxo `#8a3ffc`)
     * 11+ carimbos: **Mestre da SECOMP** (Badge Dourado `#fcd535` — *Acesso a Brindes VIP*)
  4. Barra de progresso com indicação textual: *"Faltam X carimbos para o próximo nível!"*.

#### 🟢 US-06: Validador de Presença por Token Descartável Anti-Fraude
* **Como** comissão organizadora e estudante presente no evento,
* **Quero** validar meus carimbos inserindo o token alfanumérico descartável gerado pelo staff e exibido no encerramento da atividade,
* **Para que** a comprovação de presença seja instantânea, justa e imune a fraudes ou compartilhamento indevido de links.
* **Componentes do design.md:** Modal de validação em `surface-card-dark`, campo de input técnico estilizado em `BinancePlex`, botão `#0ecb81`.
* **Alavanca Growth:** *Garantia de Presença Física Efetiva no Auditório e nas Salas*.
* **Regras de Negócio & Interface:**
  1. O participante abre o modal *"Validar Carimbo"* no seu passaporte e digita o token de 6 caracteres (ex: `SEC-942`).
  2. Regras de validação do token:
     * O token é emitido pelo staff no término da sessão e possui validade máxima de **15 minutos** (expiração automática no servidor).
     * O token só pode ser utilizado **uma única vez por RA/usuário**;
     * Tentativas de reutilização geram alerta de erro em `#f6465d` (*"Token já computado para este usuário"*);
     * Tentativas após o tempo limite geram alerta (*"Sessão de presença encerrada pelo staff"*).
  3. Validação com sucesso adiciona o carimbo instantaneamente, atualiza a barra de progresso e recalculada o nível de maestria.

#### 🟢 US-07: Leaderboard / Ranking em Tempo Real & Sorteio Gamer
* **Como** estudante competitivo,
* **Quero** visualizar a tabela de líderes (ranking) dos participantes com maior pontuação e data/hora de conclusão,
* **Para que** eu seja incentivado a participar de mais turnos e disputar os prêmios principais da feira gamer.
* **Componentes do design.md:** Tabela em `markets-table-card`, badges douradas de topo de ranking.
* **Alavanca Growth:** *Gamificação Competitiva e Viralidade Inter-Alunos*.
* **Regras de Negócio & Interface:**
  1. Tabela com colunas: Posição, Nome/Apelido do Aluno, Curso/Período, Total de Carimbos, Nível Conquistado.
  2. Alunos que atingirem o nível *Adepto* ($\ge 8$ carimbos) recebem o status visual *"Elegível ao Sorteio Final"*.
  3. Atualização dinâmica dos dados mantendo privacidade de e-mail e dados sensíveis.

#### 🟢 US-08: Geração Automatizada de Certificado com Hash e Nível Conquistado
* **Como** aluno participante,
* **Quero** emitir meu certificado digital oficial após o encerramento do evento com o meu nível de maestria e carga horária discriminada,
* **Para que** eu possa comprovar horas complementares acadêmicas na coordenação do curso da UTFPR.
* **Componentes do design.md:** Modal de pré-visualização, botão de download em PDF/PNG, hash de validação criptográfica em fonte mono.
* **Alavanca Growth:** *Recompensa Final e Fidelização Acadêmica*.
* **Regras de Negócio & Interface:**
  1. O botão de emissão é desbloqueado exclusivamente após a conclusão mínima de carimbos estabelecida pela organização.
  2. O certificado gerado estampa: Nome Completo do Aluno, RA, Total de Horas Computadas, Nível Conquistado (ex: "Nível: Mestre da SECOMP") e Assinaturas Digitais do DACOM e Coordenação.
  3. Gera um Hash de autenticidade único para validação da coordenação via QR Code.

---

### [EP-05] Experiência Anti-Churn no Câmpus: Arena Gamer, Gastronomia Sensorial & Feira da Lua

#### 🟢 US-09: Vitrine da Arena Gamer, Pipoca Grátis & Guia da Grande Feira da Lua
* **Como** estudante nos intervalos entre aulas e palestras,
* **Quero** consultar as atividades da Arena Gamer (jogos e torneios relâmpago de videogame), os horários da pipoca gratuita no pátio e as atrações da Feira da Lua de encerramento,
* **Para que** eu aproveite os momentos de descompressão no próprio câmpus sem ir embora entre o fim da tarde e o início da noite.
* **Componentes do design.md:** `feature-photo-card`, banners de retenção em `accent-turquoise` (#2dbdb6) e `primary` (#fcd535).
* **Alavanca Growth:** *Retenção Inter-Turno (Combate ao Churn das 17h00 às 19h00 — Meta: $\ge 70\%$ de permanência)*.
* **Regras de Negócio & Interface:**
  1. Bloco especial da Arena Gamer destacando os torneios das **17h00 às 18h45**: FIFA, Rocket League e Street Fighter.
  2. Banner sensorial informando a distribuição de **Pipoca Gratuita** no saguão (15h30 às 18h30) e Coffee-Breaks às 17h30.
  3. Cardápio digital da **Grande Feira da Lua (Sexta-feira)** com lista de Food Trucks parceiros, opções vegetarianas/veganas e programação cultural de encerramento.

---

### [EP-06] Clímax Coletivo: Shark Tank UTFPR & Votação Popular Auditada

#### 🟢 US-10: Votação Popular ao Vivo no Shark Tank UTFPR via QR Code
* **Como** espectador presente no auditório na noite de quarta-feira,
* **Quero** apontar meu smartphone para o QR Code do telão, visualizar os pitches dos alunos/startups e registrar meu voto no melhor projeto em tempo real,
* **Para que** a plateia participe ativamente da escolha do vencedor do troféu *"Destaque da Galera"*.
* **Componentes do design.md:** Interface mobile ultra-leve, cards em `surface-card-dark`, botão de votação com feedback `#0ecb81`, placar ao vivo.
* **Alavanca Growth:** *Referral & Efeito Torcida (Times trazem colegas para votar no auditório)*.
* **Regras de Negócio & Interface:**
  1. Acesso direto sem login complexo via QR Code projetado no auditório.
  2. Apresentação dos projetos concorrentes com foto do time, nome da startup e resumo da tese de 1 frase.
  3. A votação só é liberada quando o moderador abrir a sessão no painel administrativo.
  4. Trava de segurança: exatamente **1 voto por dispositivo/IP**.
  5. Após votar, o usuário visualiza na hora o gráfico percentual das intenções de voto da plateia atualizado via polling/streaming.

---

### [EP-07] Hub Imersivo de Patrocinadores (Túnel 3D), Sistema de Cotas Oficiais & Roda de Talentos

#### 🟢 US-11: Túnel 3D Interativo de Patrocinadores, Sistema de Cotas Oficiais & Contato B2B
* **Como** decisor corporativo, recrutador parceiro ou congressista da SECOMP,
* **Quero** navegar por um Túnel 3D futurista ao rolar a página, visualizando as marcas parceiras com destaque progressivo (até 2.0x), insígnias de suas cotas oficiais e um modal flutuante acessível para consultar benefícios e entrar em contato direto,
* **Para que** minha empresa compreenda o prestígio e contrapartidas das cotas da SECOMP e feche patrocínio com alto retorno sobre investimento em captação de talentos e branding.
* **Componentes do design.md:** `WarpTunnelCanvas` (partículas e streamlines discretos), container 3D `perspective: 1000px`, badges de cota color-coded, modal flutuante em `surface-card-dark` com backdrop blur e botões de alta conversão.
* **Alavanca Growth:** *Receita, Posicionamento de Marca & Atração de Patrocínio Corporativo (B2B ROI)*.
* **Regras de Negócio & Interface:**
  1. **Navegação 1 a 1 no Scroll:** O túnel mantém sticky viewport em `520vh`, avançando exatamente 1 logo por degrau de scroll; no ponto focal central, o logo ativo atinge escala de **2.0x**.
  2. **Hierarquia das 6 Cotas Oficiais:**
     * 🥇 **Cota Ouro:** TO Brasil (Analytics Corporativo & Minicursos);
     * 🥈 **Cota Prata:** ForLogic Software (Qualidade de Software, SaaS & Ideathon);
     * 🥉 **Cota Bronze:** CyberGuard Security (CyberSegurança & Estágios);
     * 🤝 **Parceiro Estratégico:** TCS (Inovação Global & Desafios Técnicos);
     * 🏛️ **Parceiro Institucional:** Incubadora Sprint (Shark Tank & Apoio Técnico);
     * 🚀 **Expositor Ecossistema:** Sebrae Paraná (Empreendedorismo & Mentoria).
  3. **Acessibilidade & Modal Flutuante:** Ao clicar no logo ativo ou acionar as teclas `Enter` ou `Espaço`, abre a modal de detalhes com descrição institucional, benefícios contratuais, tags de tecnologia e link para o site oficial.
  4. **Formulário Integrado de Contato:** Aba direta no modal permitindo envio de Nome, E-mail, Assunto e Mensagem para negociação direta de cotas com a organização.
  5. **Conforto Visual:** Feixes de luz suaves com teto de opacidade em $\le 0.08$ e fundo sem anéis ovais com borda, prevenindo ofuscamento e cansaço visual.
  6. **Retenção Sticky:** A animação do túnel permanece ancorada no topo até a visualização completa do último parceiro (Sebrae Paraná).

#### 🟢 US-12: Agendamento de Speed Interviews de 15 min na Roda de Talentos
* **Como** aluno buscando estágio ou vaga de desenvolvedor júnior,
* **Quero** escolher um horário de 15 minutos na quinta-feira à tarde para simulação real de entrevista com recrutadores das empresas parceiras e psicólogos do NUAPE,
* **Para que** eu teste minha capacidade interpessoal, receba feedback imediato sobre meu currículo e ganhe 2 carimbos no meu passaporte.
* **Componentes do design.md:** Seletor de slots de horário em grade, modal de confirmação, badge de incentivo gamificado.
* **Alavanca Growth:** *Retenção de Aluno & Ativação de Empregabilidade (Valor Prático de Mercado)*.
* **Regras de Negócio & Interface:**
  1. Janela de atendimento: Quinta-feira das 14h00 às 17h00 em blocos de 15 minutos.
  2. Formulário de agendamento solicitando: Nome, Período, Perfil do LinkedIn / Link do Currículo e Área de Interesse (Dev, Dados, Infra, Gestão).
  3. Confirmação instantânea do agendamento com mensagem clara: *"Esta atividade credita 2 Carimbos extras no seu Passaporte SECOMP"*.

---

### [EP-08] Maratona Prática & Viral Loop Social: Ideathon Express, GameJam & LinkedIn Badges

#### 🟢 US-13: Mural do Ideathon Express & Gerador de Badges comemorativos para LinkedIn
* **Como** participante concluinte da SECOMP,
* **Quero** consultar os desafios do Ideathon Express da sexta-feira e gerar um badge/card visual personalizado para compartilhar minhas conquistas no LinkedIn,
* **Para que** eu mostre minha qualificação profissional à minha rede e atraia novas conexões de mercado.
* **Componentes do design.md:** Acordeão expansível para o regulamento, gerador de imagem canvas 1200x630 com estética Binance High-Voltage.
* **Alavanca Growth:** *Viral Referral Social & Fortalecimento de Marca do Evento*.
* **Regras de Negócio & Interface:**
  1. Mural de desafios práticos propostos pela Incubadora Sprint e Sebrae com cronômetro da maratona de 4 horas.
  2. Módulo interativo *"Divulgue sua Conquista"*:
     * Usuário digita seu nome e seleciona o badge conquistado: *"SECOMP 2026 — EU ESTIVE LÁ"* ou *"SECOMP 2026 — NÍVEL MESTRE"*;
     * A ferramenta renderiza uma moldura moderna de compartilhamento com o selo do evento;
     * Botão para download direto do card formatado para o feed do LinkedIn;
     * Botão *"Copiar Texto Padrão"* com hashtags oficiais (`#SECOMP2026 #UTFPR #ConstruindoConexoes #Inovacao`).

---

## 3. Matriz de Definição de Pronto (Definition of Done - DoD)

Para que qualquer User Story seja considerada concluída:
1. **Conformidade de Design:** 100% aderente aos tokens e componentes descritos em [design.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/design.md).
2. **Critérios BDD Automatizáveis:** Possuir cenários Gherkin correspondentes mapeados em [ACCEPTANCE-CRITERIA2.0.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/ACCEPTANCE-CRITERIA2.0.md).
3. **Métricas de Performance:** Tempo de resposta de filtros e alternância de abas inferior a 100ms.
4. **Auditoria de QA:** Aprovação do Quality Gate pela **@judith** com Score $\ge 9$.
