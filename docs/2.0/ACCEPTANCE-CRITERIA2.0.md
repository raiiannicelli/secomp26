# 🧪 ACCEPTANCE-CRITERIA2.0.md — CONTRATOS BDD & CRITÉRIOS DE ACEITE (SECOMP 2026)
**Projeto:** Hub Digital & Plataforma Oficial da SECOMP 2026 (*Construindo Conexões*)  
**Elaborado por:** Rosita (*Product Owner & Especialista em BDD/Especificação Ágil*)  
**Status:** Validado e Pronto para Testes Automatizados (Quality Gate da @judith) | **Versão:** 2.0.0  
**Design System Base:** [design.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/design.md) (Binance High-Voltage Dark)  
**Histórias Vinculadas:** [docs/BACKLOG2.0.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/BACKLOG2.0.md)  
**Épicos Vinculados:** [docs/EPICO2.0.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/EPICO2.0.md)

---

## 1. Diretriz de Testabilidade & Quality Gates

Todos os cenários abaixo foram redigidos no padrão **Gherkin (Dado / Quando / Então)** para execução binária por testes ponta a ponta (Playwright / Cypress) e validação da **@judith**:
* **Zero ambiguidade:** Todo seletor, estado de cor e componente possui correspondência explícita com os tokens do `design.md`.
* **Critério de Aprovação:** O Score da @judith exigirá 100% de conformidade com estes cenários antes de liberar merge para a branch principal.

---

## 2. Cenários BDD por História de Usuário (US-01 a US-13)

---

### [US-01] Top Navigation Fixa & Hero High-Voltage com Contadores Dinâmicos

```gherkin
Funcionalidade: Hero High-Voltage e Top Navigation
  Como visitante acessando a plataforma da SECOMP 2026
  Quero visualizar a navegação fixa e o Hero em Dark Mode
  Para ter certeza de que estou no portal oficial do evento

  Cenário: Carregamento do tema Binance High-Voltage com sucesso
    Dado que o usuário acessa a página raiz "/"
    Então a cor de fundo do elemento "body" deve ser exatamente "#0b0e11" (canvas-dark)
    E a barra "[data-testid='top-nav']" deve estar fixada no topo com altura de "64px" e fundo "#0b0e11"
    E o botão principal de CTA "Garantir Vaga" deve possuir fundo "#fcd535" (primary), texto "#181a20" e border-radius de "6px" (rounded.md)
    E os 4 contadores de impacto ("5 Dias", "3 Turnos", "15+ Horas", "8+ Carimbos") devem renderizar com a fonte "BinancePlex" em peso 700
    E os selos de autoridade ("UTFPR", "DACOM", "Incubadora Sprint", "Sebrae") devem estar visíveis com opacidade mínima de 0.8

  Cenário: Ação de clique no CTA principal de inscrição
    Dado que o usuário está visualizando a seção Hero
    Quando clicar no botão "Garantir Vaga" com seletor "[data-testid='hero-cta-btn']"
    Então a página deve realizar scroll suave até a seção "[data-testid='section-inscricao']"
    E o campo de e-mail institucional deve receber foco automaticamente
```

---

### [US-02] Grade Narrativa dos 5 Dias & Seletor de Turnos com Filtro por Tema

```gherkin
Funcionalidade: Grade Narrativa Interativa e Filtros Multidimensionais
  Como participante da SECOMP
  Quero alternar entre as abas dos 5 dias, turnos e temas transversais
  Para planejar minha participação no evento sem atrito

  Cenário: Troca da aba Segunda (O Mundo) para Quarta (Os Projetos)
    Dado que a aba "Segunda: O Mundo" está ativa por padrão
    E os eventos exibidos contêm a palestra inaugural de "Gustavo Meirelles"
    Quando o usuário clicar na aba "Quarta: Os Projetos" com seletor "[data-testid='tab-quarta']"
    Então a aba "Quarta: Os Projetos" deve receber a borda ativa ou destaque "#fcd535"
    E a lista de eventos deve atualizar imediatamente exibindo o "Shark Tank UTFPR" e a palestra de "Cesar Augusto Dias"
    E o tempo de resposta da troca de estado deve ser inferior a 100ms

  Cenário: Filtragem por tema transversal (Tecnologia, Gestão, Inovação, Carreira)
    Dado que o usuário está visualizando a grade de palestras
    Quando clicar no filtro de tema "Carreira" com seletor "[data-testid='filter-theme-carreira']"
    Então apenas os cards com tag "Carreira" devem permanecer visíveis na tela
    E os cards com tags exclusivamente técnicas ou de gestão devem ser ocultados
```

---

### [US-03] Pré-Inscrição em Atividades & Badges de Lotação em Tempo Real

```gherkin
Funcionalidade: Pré-Inscrição e Gestão de Vagas
  Como aluno participante
  Quero visualizar as vagas restantes e pré-inscrever-me em atividades concorridas
  Para garantir meu assento com antecedência

  Cenário: Exibição de badge de escassez para vagas reduzidas
    Dado que uma atividade possui apenas 15% de vagas restantes
    Então o card deve exibir o badge "[data-testid='badge-vagas']" com fundo "#f6465d" (trading-down)
    E o texto do badge deve ser "Últimas Vagas"

  Cenário: Fluxo de pré-inscrição em atividade com sucesso
    Dado que o usuário visualiza uma atividade com vagas livres
    Quando clicar no botão "Pré-inscrever-se" com seletor "[data-testid='btn-pre-inscricao']"
    Então o botão deve mudar seu estado para "Inscrito" com background "#3a3a1f" (primary-disabled)
    E o contador de vagas deve decrescer em 1 unidade em tempo real
```

---

### [US-04] Catálogo das 4 Trilhas de Warm-up & Pré-Credenciamento (Set/Out)

```gherkin
Funcionalidade: Catálogo de Minicursos Pré-Evento
  Como estudante universitário
  Quero consultar os minicursos de Setembro e Outubro por trilhas
  Para me capacitar antecipadamente nos laboratórios

  Cenário: Renderização das 4 Trilhas Temáticas
    Dado que o usuário navega até a seção "#minicursos"
    Então devem ser renderizados cards em superfícies "#1e2329" (surface-card-dark) com bordas "#2b3139" (hairline-on-dark)
    E as 4 trilhas devem estar representadas: "Inteligência & Dados", "Infra & Segurança", "Hardware & Sistemas" e "Desenvolvimento & UI"
    E deve existir pelo menos 1 minicurso para as datas de "14 ou 29 de Setembro" e "14 ou 29 de Outubro"

  Cenário: Pré-credenciamento no minicurso gerando ID do passaporte
    Dado que o usuário preenche o formulário de inscrição com Nome "Rai Moratto" e RA "a1234567"
    Quando clicar em "Confirmar Inscrição"
    Então o modal deve exibir a mensagem de confirmação com checkmark em "#0ecb81"
    E deve exibir o Passaporte Digital ativo com o primeiro carimbo de aquisição
```

---

### [US-05] Painel do Passaporte SECOMP 2.0 com Régua de Carimbos e 6 Níveis

```gherkin
Funcionalidade: Gamificação do Passaporte e Progressão de Níveis
  Como participante da SECOMP
  Quero visualizar minha régua de carimbos e meu nível de maestria
  Para me engajar na meta de conclusão de 8 carimbos

  Cenário: Exibição visual dos slots de carimbos e nível Novato
    Dado que o participante possui 2 carimbos validados
    Quando acessar a aba "[data-testid='section-passaporte']"
    Então 2 slots devem estar preenchidos com o ícone em "#fcd535"
    E 6 slots devem estar vazios com borda tracejada em "#2b3139"
    E o badge de nível exibido deve ser "Novato" com fundo cinza "#707a8a"

  Cenário: Transição para nível Adepto ao atingir 8 carimbos
    Dado que o participante atinge 8 carimbos oficiais
    Então o badge de maestria deve atualizar para "Adepto" com fundo "#0ecb81"
    E a mensagem "Parabéns! Você está elegível para o Sorteio Gamer de Sexta-feira!" deve ser exibida
```

---

### [US-06] Validador de Presença por Token Descartável Anti-Fraude

```gherkin
Funcionalidade: Validação de Presença com Token Descartável
  Como participante e organizador
  Quero validar presença por código de uso único exibido na sala
  Para certificar que os carimbos foram obtidos presencialmente

  Cenário: Validação bem-sucedida de token dentro do prazo
    Dado que o participante está na palestra e a sessão de presença está aberta
    E o staff projeta o token "SEC-784" válido por 15 minutos
    Quando o participante digitar "SEC-784" no campo "[data-testid='input-token']"
    E clicar em "Validar Carimbo"
    Então uma mensagem de sucesso "Carimbo Computado com Sucesso!" deve ser exibida
    E a contagem de carimbos no passaporte deve aumentar em 1 unidade

  Cenário: Rejeição de token duplicado para o mesmo participante
    Dado que o participante já validou o token "SEC-784"
    Quando tentar submeter novamente o token "SEC-784"
    Então o sistema deve exibir alerta em "#f6465d": "Token já utilizado por este usuário"
    E nenhum carimbo adicional deve ser computado
```

---

### [US-07] Leaderboard / Ranking em Tempo Real & Sorteio Gamer

```gherkin
Funcionalidade: Leaderboard Gamificado
  Como participante competitivo
  Quero ver o ranking dos participantes com mais carimbos
  Para acompanhar minha posição no ecossistema

  Cenário: Renderização do Ranking em tempo real
    Dado que o usuário acessa o painel "[data-testid='section-ranking']"
    Então a tabela deve listar as colunas "Posição", "Participante", "Carimbos" e "Nível"
    E os 3 primeiros colocados devem exibir o ícone de troféu dourado em "#fcd535"
    E os participantes com 8+ carimbos devem exibir a tag "Elegível ao Sorteio"
```

---

### [US-08] Geração Automatizada de Certificado com Hash e Nível Conquistado

```gherkin
Funcionalidade: Emissão de Certificado Digital
  Como concluinte da SECOMP
  Quero emitir meu certificado após o evento
  Para validar horas complementares na universidade

  Cenário: Emissão liberada para participante com meta cumprida
    Dado que o evento foi encerrado e o aluno concluiu a carga horária mínima
    Quando clicar em "Emitir Certificado Digital"
    Então deve ser gerado o documento com Nome Completo, RA, Horas Totais e Nível de Maestria
    E deve conter um Hash SHA-256 criptográfico para validação institucional
```

---

### [US-09] Vitrine da Arena Gamer, Pipoca Grátis & Guia da Feira da Lua

```gherkin
Funcionalidade: Anti-Churn Inter-Turno no Câmpus
  Como estudante no período das 17h00 às 19h00
  Quero consultar as atrações da Arena Gamer e da Feira da Lua
  Para desfrutar do câmpus e continuar no evento para a noite

  Cenário: Exibição da programação da janela 17h00 - 18h45
    Dado que o usuário visualiza o bloco da Arena Gamer
    Então deve exibir os torneios "FIFA", "Rocket League" e "Street Fighter"
    E o banner sensorial deve destacar "Pipoca Grátis no Pátio (15h30 às 18h30)" e "Coffee-Break às 17h30"
```

---

### [US-10] Votação Popular ao Vivo no Shark Tank UTFPR via QR Code

```gherkin
Funcionalidade: Votação Popular do Shark Tank UTFPR
  Como plateia do auditório
  Quero votar pelo smartphone no melhor pitch
  Para escolher o Destaque da Galera da Incubadora Sprint

  Cenário: Registro de voto auditado e atualização de porcentagem
    Dado que a votação está com status "Aberta" pelo administrador
    Quando o usuário selecionar a startup "InovaTech" e clicar em "Confirmar Voto"
    Então o botão deve mudar para "Voto Computado" com estilo "#0ecb81"
    E a barra percentual da startup deve se atualizar em tempo real
    E todos os outros botões de voto devem ser travados para este dispositivo
```

---

### [US-11] Túnel 3D Interativo de Patrocinadores, Sistema de Cotas Oficiais & Contato B2B

```gherkin
Funcionalidade: Hub Imersivo de Patrocinadores e Sistema de Cotas
  Como decisor corporativo ou congressista da SECOMP
  Quero navegar pelo Túnel 3D, inspecionar as marcas em cada cota oficial e abrir o modal detalhado
  Para avaliar o retorno de investimento institucional e negociar cotas com a organização

  Cenário: Progressão 1 a 1 no Túnel 3D via Rolagem (Scrollytelling)
    Dado que o usuário acessa a seção "#patrocinadores" ancorada no viewport
    Quando rolar a página verticalmente dentro do container estendido de "520vh"
    Então exatamente 1 logotipo parceiro deve avançar para o foco central da câmera por estágio
    E o logotipo em foco deve atingir escala aproximada de "2.0x"
    E a insígnia da cota correspondente ("Cota Ouro", "Cota Prata", etc.) deve ser exibida no badge flutuante
    E o scroll deve permanecer travado em sticky até a visualização completa do parceiro final "Sebrae Paraná"

  Cenário: Abertura da Modal de Cota com Acessibilidade por Teclado
    Dado que o logotipo da "TO Brasil" está ativo no centro do palco do túnel
    Quando o usuário pressionar a tecla "Enter" ou a barra de "Espaço" sobre o elemento focado
    Então a modal flutuante de detalhes da cota deve se abrir com animação suave
    E deve exibir o título "TO Brasil" acompanhado da insígnia "Cota Ouro"
    E deve listar as contrapartidas: "Keynote Magna", "2 Minicursos Práticos" e "Bancada VIP"
    E quando o usuário pressionar a tecla "Escape"
    Então a modal deve se fechar retornando o foco ao palco do túnel

  Cenário: Envio de Mensagem de Contato Institucional na Modal
    Dado que a modal de cota de um parceiro está aberta
    Quando o usuário preencher o campo "Seu Nome" com "Ana Gestora"
    E preencher o campo "Seu E-mail Corporativo" com "ana@empresa.com.br"
    E preencher a "Mensagem" com "Gostaria de negociar cota para o próximo ano"
    E clicar no botão "Enviar Mensagem Direta"
    Então deve ser exibida a confirmação de envio com sucesso
    E os campos do formulário devem ser resetados

  Cenário: Garantia de Conforto Visual e Ausência de Ofuscamento
    Dado que o efeito de sucção do túnel ("WarpTunnelCanvas") está ativo durante o scroll
    Quando o renderizador do canvas traçar os feixes de luz
    Então a opacidade máxima de qualquer partícula ou feixe não deve ultrapassar "0.08"
    E nenhum anel oval estático com borda sólida deve estar presente no plano de fundo
```

---

### [US-12] Agendamento de Speed Interviews de 15 min na Roda de Talentos

```gherkin
Funcionalidade: Speed Interviews com RHs
  Como aluno em busca de oportunidade de estágio
  Quero reservar um slot de 15 minutos na quinta-feira
  Para praticar simulação de entrevista e ganhar carimbos extras

  Cenário: Agendamento com confirmação de 2 carimbos bônus
    Dado que o usuário escolhe o horário "Quinta-feira, 15h00"
    E preenche seu perfil do LinkedIn e área "Desenvolvimento de Software"
    Quando clicar em "Confirmar Agendamento"
    Então deve ser exibido o comprovante com a mensagem: "Atividade confirmada! Você receberá 2 Carimbos extras no seu Passaporte"
```

---

### [US-13] Mural do Ideathon Express & Gerador de Badges para LinkedIn

```gherkin
Funcionalidade: Ideathon Express e Badges Sociais
  Como participante concluinte
  Quero gerar um badge personalizado para o feed do LinkedIn
  Para demonstrar publicamente minhas competências e conquistas

  Cenário: Geração do badge social 1200x630
    Dado que o participante digita seu nome "Rai Moratto" e escolhe o badge "Nível Mestre Conquistado"
    Quando clicar em "Gerar Imagem para LinkedIn"
    Então a moldura Binance High-Voltage deve ser renderizada na dimensão 1200x630px
    E deve disponibilizar o botão "Baixar Imagem" e "Copiar Texto com Hashtags Oficiais"
```
