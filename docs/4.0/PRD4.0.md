# 📋 PRODUCT REQUIREMENTS DOCUMENT (PRD) — SECOMP 2026 (v4.0)
**Produto:** Plataforma Digital, Hub Web & Cockpit Administrativo da SECOMP 2026 (*Construindo Conexões*)  
**Elaborado por:** Morgan (*Product Manager, Requirements Analyst & Growth Strategist*)  
**Status:** Consolidado e Blindado para Handoff da Squad | **Versão:** 4.2.0  
**Design System Base:** [designBINANCE.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/designBINANCE.md) (High-Voltage Dark `#0b0e11` + `#fcd535`)  
**Fundamentação Arquitetural:** [ADR4.0.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/3.0/ADR4.0.md) & [SDD-SPEC4.0.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/4.0/SDD-SPEC4.0.md)

---

## 1. Visão Executiva do Produto (v4.2 — Vitrine Pública & Módulos Interativos)

A plataforma da SECOMP 2026 v4.2 é configurada como **Vitrine Pública Interativa de Atrações** na fase de pré-construção. O sistema **remove a necessidade de inscrição prévia em palestras ou minicursos**, permitindo que qualquer visitante explore a programação livremente. 

Adicionalmente, o sistema incorpora os módulos interativos com liberação controlada manualmente pelo Cockpit Administrativo (`/admin`):
- **Ideathon (Inscrição de Equipes):** Cadastro dinâmico de times e trilhas.
- **Shark Tank Live Voting:** Votação popular e corporativa em tempo real ativada por pitch.
- **Validação QR Code OTT:** Leitor de câmera para presenças com tokens de 15 minutos.
- **Startup Day Showcase:** Vitrine interativa de startups, mentores e agendamento de Talent Arena.

### 🌟 Pilares do Produto (v4.2)
1. **Vitrine Pública sem Inscrição Prévia:** Apresentação da grade completa de atrações nos 3 turnos (Manhã, Tarde, Noite).
2. **Validação Direta por QR Code (RA de Aluno ou E-mail):** Leitura do token OTT de 15 min no auditório.
3. **Módulos Interativos com Ativação Manual (Admin Switch):** Controle em tempo real de votações e formulários.
4. **Matriz Estrita de 3 Perfis Únicos (Sem Staff):** `STUDENT`, `VISITOR` e `ADMIN`.

---

## 2. Personas & Perfis do Sistema

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. STUDENT (Aluno UTFPR)                                                                           │
│    • Identificação: E-mail institucional + RA acadêmico validado (aXXXXXXX / raXXXXXXX).         │
│    • Acesso: Cursos, leitura de QR Code, inscrição de time no Ideathon e voto no Shark Tank.     │
├────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. VISITOR (Comunidade Externa / Visitante)                                                       │
│    • Identificação: E-mail válido sem exigência de RA.                                            │
│    • Acesso: Cursos, leitura de QR Code, inscrição de time no Ideathon e voto no Shark Tank.                │
├────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3. ADMIN (Administrador / Organização)                                                            │
│    • Identificação: Credencial administrativa no /auth.                                          │
│    • Acesso: Cockpit /admin, emissão de QR Codes, ativação/desativação de sessões ao vivo.         │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Matriz MoSCoW de Requisitos (v4.2)

### 3.1 Must Have
1. **Vitrine de Atrações:** Exibição da grade completa sem botões de pré-inscrição em palestras.
2. **Módulos Interativos Dinâmicos:** Tela de inscrição de times no Ideathon, votação em tempo real no Shark Tank, leitor QR Code OTT e Startup Day Showcase.
3. **Admin Master Switch:** Painel de controle no Cockpit para liberar/bloquear manualmente as sessões ao vivo.
4. **Restrição de 3 Perfis:** Suporte exclusivo aos papéis `STUDENT`, `VISITOR` e `ADMIN`.
5. **Segurança OWASP Top 10:** Cookie `secomp_session` HttpOnly e SameSite=Strict.

### 3.2 Won't Have (Nesta versão)
1. Inscrições prévias individuais para palestras ou minicursos.
2. Papel intermediário `STAFF`.
