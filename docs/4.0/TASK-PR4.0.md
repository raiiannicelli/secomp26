# 📋 TASK-PR4.0.md — ROTEAMENTO DE TAREFAS: VITRINE PÚBLICA, 3 PERFIS & MÓDULOS INTERATIVOS (v4.2)
**Projeto:** Hub Digital, Plataforma Oficial & Cockpit Administrativo da SECOMP 2026 (*Construindo Conexões*)  
**Elaborado por:** Judith (*Router & Quality Guardian*)  
**Escopo Restrito:** **Vitrine Pública, 3 Perfis Únicos & Módulos Interativos (Ideathon, Shark Tank, QR Code, Startup Day)**  
**Status:** Pronto para Execução | **Versão:** 4.2.0  

---

## 🛡️ Regras de Ouro & Quality Gates v4.2

1. **Zero Botão de Pré-Inscrição em Atividades:** Palestras e cursos atuam como **vitrine pública de atrações**. Não há chamadas de pré-inscrição individual.
2. **Admin Master Switch Mandatory:** O acesso aos formulários do Ideathon, botão de voto do Shark Tank e leitor de QR Code deve consultar o estado `session_status` mantido no CMS e atualizado via WebSocket.
3. **Validação Direta via QR Code:** O escaneamento em `/validate` valida o token OTT de 15 minutos e registra o carimbo diretamente em `attendance_records` associado ao `user_id`.
4. **Matriz Estrita de 3 Perfis Únicos:**
   - **`STUDENT`**: Aluno UTFPR com RA validado.
   - **`VISITOR`**: Visitante externo com e-mail (possui acesso à vitrine, QR Code, Ideathon e Shark Tank).
   - **`ADMIN`**: Administrador / Organização com acesso ao Cockpit `/admin` e às chaves de liberação manual (sem papel `STAFF`).

---

## 📋 Detalhamento dos PRs (Sprint v4.2)

### 🔹 PR-29 (Backend - @rj): Contratos, Enums & Middleware Admin Switch
- **Arquivos:** [`contracts.schema.ts`](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/backend/src/schemas/contracts.schema.ts), [`authRoutes.ts`](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/backend/src/routes/authRoutes.ts), [`adminRoutes.ts`](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/backend/src/routes/adminRoutes.ts), [`schema.prisma`](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/prisma/schema.prisma)
- **Tarefas:**
  1. Restabelecer os 3 perfis `['STUDENT', 'VISITOR', 'ADMIN']` e remover o enum/papel `STAFF`.
  2. Implementar endpoint `PUT /api/v1/admin/cms/session_status` para controle das chaves de liberação manual (`shark_tank_voting_active`, `ideathon_registration_open`, `ott_scanner_active`).
  3. Emitir evento WebSocket `SESSION_STATUS_CHANGED` via Supabase Realtime ao alternar as chaves.

---

### 🔹 PR-30 (Frontend - @carol): Módulos Interativos, Validação QR Code & Arena-Live Counter
- **Arquivos:** `Navbar.tsx`, `ScheduleSection.tsx`, `IdeathonFormModal.tsx`, `SharkTankLivePanel.tsx`, `ValidateScannerModal.tsx`, `StartupDayShowcase.tsx`
- **Tarefas:**
  1. Remover QR Code estático pós-login da Navbar e o botão acionável de scanner de câmera (`📷 QR Code`).
  2. Implementar a mecânica de validação por QR Code dinâmico por Curso/Palestra/Roda de conversa (URL `/validar-presenca?activityId={ID}`).
  3. Vincular a validação com a concessão de **+1 carimbo** no `Passaporte` do participante e incremento da contagem de inscritos/presentes.
  4. Implementar contagem de inscritos em tempo real na vitrine de cursos/palestras utilizando o mesmo padrão reativo de barramento do `ArenaLivePage`.
  5. Atualizar a grade de cursos/palestras sem botões de trava de pré-inscrição estática.
  6. Conectar a renderização dos componentes às chaves do Admin Master Switch ativadas em tempo real.


---

### 🔹 PR-31 (Quality Gate - @judith): Testes de Integração & Cobertura v4.2
- **Arquivos:** `backend/tests/*`
- **Tarefas:**
  1. Executar a suíte completa de testes `npm run test:all`.
  2. Garantir 100% de aprovação na validação de presenças, ausência do papel `STAFF`, trava anti-voto duplo no Shark Tank e autorização do Admin Switch.
  3. Validar a ausência de fallbacks mockados no frontend.
