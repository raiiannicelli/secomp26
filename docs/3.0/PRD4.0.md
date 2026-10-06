# 📋 PRODUCT REQUIREMENTS DOCUMENT (PRD) — SECOMP 2026 (v4.0)
**Produto:** Plataforma Digital, Hub Web & Cockpit Administrativo da SECOMP 2026 (*Construindo Conexões*)  
**Elaborado por:** Morgan (*Product Manager, Requirements Analyst & Growth Strategist*)  
**Status:** Consolidado e Blindado para Handoff da Squad | **Versão:** 4.0.0  
**Design System Base:** [designBINANCE.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/designBINANCE.md) (High-Voltage Dark `#0b0e11` + `#fcd535`)  
**Fundamentação Arquitetural:** [ADR2.0.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/ADR2.0.md) & [SDD-SPEC2.0.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/SDD-SPEC2.0.md)

---

## 1. Visão Executiva do Produto (v4.0 — Human-Computer Interaction & Kinetic UI)

Na versão 4.0, a SECOMP 2026 eleva o padrão de **Interação Humano-Computador (IHC)**, incorporando interfaces dinâmicas, cinéticas e contextuais orientadas a micro-interações táteis e navegação fluida em monólito modular.

A plataforma mantém a arquitetura **Identity-First** com zero mock data fallbacks, garantindo que toda a gamificação (Passaporte com carimbos), votação auditada do Shark Tank UTFPR e agendamento da Roda de Talentos ocorram sobre dados transacionais do PostgreSQL / Supabase Realtime.

### 🌟 Pilares da Atualização v4.0 (IHC & Componentes Cinéticos)
1. **Scroll Velocity Linked-Offset (Motion Dev):**
   * Sessao de Ticker infinito bidirecional de Mentores, Palestrantes e organização cuja velocidade responde dinamicamente à velocidade de rolagem do usuário (`useScroll`, `useVelocity`, `useSpring`).
2. **Interactive 3D Card Stack (Motion Dev):**
   * Galeria de fotos e registros históricos da SECOMP em formato de baralho empilhado 3D com física de arrasto (drag/swipe), descarte dinâmico e profundidade de perspectiva.
3. **Hook Sidebar RFQ & Feira da Lua (Inspora Design):**
   * Gavetas laterais retráteis contextuais estilo *Hook Sidebar* para:
     * **Feira da Lua:** Cardápios de Food Trucks, estandes de inovação e atrações culturais.

---

## 2. ICP (Ideal Customer Profile) & Personas Centrais

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. O Aluno Participante (Graduação / Pós / Egressos)                                              │
│    • Dor: Sobrecarga de texto, navegação estática e perda de momentos-chave do evento.            │
│    • IHC v4.0: Visualização fluida de mentores via ticker cinético, fotos interativas em pilha    │
│      e passaporte com checkpoints táteis em tempo real.                                            │
│    • Requisito: Acesso autenticado via /auth com RA validado e cookie seguro HttpOnly.            │
├────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. A Empresa Patrocinadora & Recrutadora (TO Brasil, TCS, ForLogic, CyberGuard)                   │
│    • Dor: Dificuldade em avaliar pacotes de patrocínio e agendar contato sem burocracia comercial.│
│    • IHC v4.0: Hook Sidebar RFQ com simulador de cotas (Diamante/Ouro/Prata) e solicitação         │
│      de proposta comercial em 1 clique sem sair do fluxo da landing page.                          │
├────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3. A Comunidade Acadêmica & Visitantes da Feira da Lua                                             │
│    • Dor: Falta de clareza sobre opções gastronômicas, horários de shows e estandes no evento.     │
│    • IHC v4.0: Hook Sidebar com cardápio interativo e cronograma cultural colapsável.             │
├────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 4. Coordenação & Staff (/chameguinho Cockpit)                                                     │
│    • Dor: Necessidade de monitoramento de fluxo de presença e gestão de fotos em tempo real.      │
│    • IHC v4.0: Telemetria viva com Supabase Realtime e upload direto de fotos para o Card Stack.   │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Arquitetura de Interação Humano-Computador (IHC v4.0)

```mermaid
graph TD
    subgraph EXPERIÊNCIA DE NAVEGAÇÃO IHC v4.0
        A[Hero 3D Particles Mesh] --> B[Scroll Velocity Marquee: Mentores & Egressos]
        B --> C[Ideathon 3D Curved Cylinder]
        C --> D[Shark Tank Flashlight Mask + Voto Único]
        D --> E[Roda de Talentos Transacional]
        E --> F[Galeria Card Stack 3D: Registros & Vivências]
        F --> G[Feira da Lua & Grand Finale]
    end

    subgraph DOCKS LATERAIS & HOOK SIDEBARS (Inspora Design)
        H[Botão Flutuante RFQ Patrocinador] --> I[Hook Sidebar: Simulador de Cotas & Proposta]
        J[Botão Flutuante Feira da Lua] --> K[Hook Sidebar: Cardápio Food Trucks & Atrações]
    end
```

---

## 4. Matriz MoSCoW de Requisitos de Produto (v4.0)

### 4.1 Must Have (Crítico para a Conversão e IHC)
1. **Ticker Cinético de Mentores ([Motion Scroll Velocity](https://motion.dev/examples/react-scroll-velocity-linked-offset)):**
   * Faixa de rolagem contínua com nomes, empresas e fotos de mentores.
   * Aceleração proporcional à inércia do scroll da página.
   * Direção reativa (inversão instantânea quando o usuário rola para cima/baixo).

2. **Galeria 3D Card Stack ([Motion Card Stack](https://motion.dev/examples/react-card-stack)):**
   * Empilhamento de cartões de registros visuais do evento (laboratórios, palestras, networking).
   * Gesto de arrasto lateral (swipe left/right) com rotação tangencial e transição do card ativo para a base do baralho.
   * Botões de navegação rápida para usuários em desktop.

3. **Hook Sidebar RFQ de Patrocínio ([Inspora Hook Sidebar](https://www.inspora.design/posts/hook-sidebar)):**
   * Dock lateral retrátil colapsável posicionado à direita da tela.
   * Seletor interativo de Cotas (Diamante R$ 4k, Ouro R$ 2k, Prata R$ 1k, Startup R$ 500).
   * Formulário minimalista de solicitação de contato corporativo (Empresa, Nome do Responsável, E-mail, Telefone).

4. **Hook Sidebar da Feira da Lua & Cardápio:**
   * Painel colapsável com abas:
     * *Food Trucks & Chopp Artesanal* (Cardápios e faixas de preço).
     * *Palco & Shows ao Vivo* (Line-up musical da sexta-feira).
     * *Feirinha Maker* (Demonstrações de robótica e projetos acadêmicos).

5. **Integridade de Dados & Zero Mock:**
   * Todas as interações (votos, carimbos, agendamentos) integradas estritamente aos endpoints do backend `/api/v1/` com feedback de erro em caso de falha de rede.

---

### 4.2 Should Have (Alto Valor Agregado)
* **Feedback Háptico Visual:** Micro-animações de confirmação com `framer-motion` em cliques de botões, carimbos e envio de propostas.
* **Persistência de Estado do Drawer:** O estado aberto/fechado das sidebars não bloqueia a rolagem vertical da página principal.

---

### 4.3 Could Have (Diferenciais Futuros)
* **Visualização AR/3D de Brindes e Crachá Físico:** Pré-visualização tridimensional do kit de boas-vindas da conferência.

---

## 5. Critérios de Aceite Globais (Quality Gates)

* **Performance:** 60fps constantes nas animações de scroll velocity e card stack sem layout thrashing.
* **Acessibilidade (a11y):** Todas as gavetas e sidebars navegáveis via teclado (`Tab`, `Esc` para fechar).
* **Segurança:** Sanitização de entradas em todos os formulários RFQ contra XSS e injeção.
