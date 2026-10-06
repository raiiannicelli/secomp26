# 🏛️ EPICO4.0.md — ESTRUTURAÇÃO DOS ÉPICOS ESTRATÉGICOS (SECOMP 2026 v4.0)
**Projeto:** Hub Digital, Plataforma Oficial & Cockpit Administrativo da SECOMP 2026 (*Construindo Conexões*)  
**Elaborado por:** Rosita (*Product Owner & Especialista em BDD/Especificação Ágil*)  
**Status:** Consolidado e Alinhado com Engenharia | **Versão:** 4.2.0  
**Design System Vinculado:** [designBINANCE.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/designBINANCE.md) (High-Voltage Dark `#0b0e11` + `#fcd535`)  

---

## 1. Épicos Atualizados v4.2 (Vitrine Pública, 3 Perfis & Módulos Interativos)

### [EP-01 & EP-02] Vitrine Pública de Atrações & Grade Narrativa 3 Turnos
* **Objetivo de Negócio:** Apresentar a grade dos 5 dias de evento (Manhã, Tarde, Noite) como vitrine pública de atrações sem trava de pré-inscrição individual.
* **Componentes:** `ScheduleSection.tsx`, `WorkshopsSection.tsx`.

### [EP-04] Motor de Gamificação: Passaporte & Validação por QR Code OTT 15m
* **Objetivo de Negócio:** Conceder carimbos e calcular os 6 Níveis de Maestria via leitor de QR Code de 15 min no auditório.
* **Componentes:** `ValidateScannerModal.tsx`, `PassportTab.tsx`.

### [EP-09] Identidade & Matriz de 3 Perfis Únicos (STUDENT, VISITOR, ADMIN)
* **Objetivo de Negócio:** Gerenciar o cadastro e login com validação de RA para alunos da UTFPR (`STUDENT`), e-mail para participantes externos (`VISITOR`) e acesso administrativo (`ADMIN`), descontinuando o papel `STAFF`.
* **Componentes:** `AuthPage.tsx`, `authGuard.ts`, `contracts.schema.ts`.

### [EP-10] Módulo Interativo Ideathon & Inscrição de Equipes
* **Objetivo de Negócio:** Permitir o cadastro dinâmico de equipes e seleção de trilhas temáticas com controle de abertura/fechamento manual pelo Admin.
* **Componentes:** `IdeathonFormModal.tsx`, `ideathonRoutes.ts`.

### [EP-11] Shark Tank Live Voting & Votação em Tempo Real
* **Objetivo de Negócio:** Habilitar votação ao vivo por pitching com atualização imediata via WebSocket (Supabase Realtime) e trava de voto único por `clientFingerprint`.
* **Componentes:** `SharkTankLivePanel.tsx`, `sharkTankRoutes.ts`.

### [EP-12] Startup Day Showcase & Conexão de Ecossistema
* **Objetivo de Negócio:** Exibir a vitrine interativa de startups, mentores e conectar alunos ao agendamento de Talent Arena.
* **Componentes:** `StartupDayShowcase.tsx`, `talentArenaRoutes.ts`.
