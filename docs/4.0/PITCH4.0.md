# 📊 BRIEFING ESTRATÉGICO & ANÁLISE DE SPRINT — SECOMP 2026 v4.0
**Elaborado por:** Morgan (*Product Manager, Requirements Analyst & Growth Strategist*)  
**Data:** 29 de Setembro de 2026  
**Status:** Consolidado e Alinhado para Sprint 4.0 | **Versão:** 4.2.0  
**Design System Vinculado:** [designBINANCE.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/designBINANCE.md) (High-Voltage Dark `#0b0e11` + `#fcd535`)  

---

## 1. O Estado Atual do Sistema (Vitrine Pública & Módulos Interativos)

A plataforma SECOMP 2026 opera como **Vitrine Pública de Conteúdo** pré-evento (sem travas de pré-inscrição em palestras) e integra **4 Módulos Interativos Dinâmicos**, cuja ativação e liberação acontecem de forma manual e auditada via Cockpit Administrativo Master Switch (`/admin`).

| Camada / Componente | Status v4.2 | Diagnóstico de Engenharia & Produto |
|---|---|---|
| **Vitrine de Atrações** | ✅ Operacional | Grade pública de palestras, minicursos e workshops sem trava de pré-inscrição. |
| **Identificação & Perfis** | ✅ Operacional | Matriz de 3 perfis estritos: `STUDENT` (Aluno UTFPR com RA), `VISITOR` (Visitante) e `ADMIN` (Administrador). |
| **Inscrição Ideathon** | ✅ v4.2 Habilitado | Formulário dinâmico de cadastro de equipes e trilhas de ideação liberado via Admin Switch. |
| **Votação Shark Tank** | ✅ v4.2 Habilitado | Votação em tempo real com barra de progresso WebSocket, liberada manualmente por pitching. |
| **Scanner QR Code OTT** | ✅ v4.2 Habilitado | Validação direta de selos do Passaporte via leitor de câmera para tokens OTT de 15 minutos. |
| **Startup Day Showcase** | ✅ v4.2 Habilitado | Vitrine interativa de startups parceiras, mentores e agendamento de Talent Arena. |

---

## 2. Diagnóstico dos Desafios & Problemas Reais do Negócio

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                ONDE O SISTEMA ESTÁ AGORA                                │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ • O portal funciona como uma Vitrine Pública Interativa de todas as atrações.           │
│ • Não há exigência de inscrição prévia por palestra ou curso (Zero atrito).            │
│ • Ativação em tempo real dos módulos (Ideathon, Shark Tank, QR Code) pelo Admin.        │
└───────────────────────────┬─────────────────────────────────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                  ONDE QUEREMOS CHEGAR                                   │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ • Validação física instantânea no auditório em < 3 segundos por aluno (via RA / E-mail).│
│ • Engajamento total no Shark Tank e Ideathon com controle de sessão em tempo real.      │
│ • Taxa de Engajamento do Passaporte (NSM v4.0) ≥ 55% dos presentes.                     │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Matriz Estrita de 3 Perfis Únicos

1. **`STUDENT` (Aluno UTFPR):** Autenticado com RA institucional (`aXXXXXXX` ou `raXXXXXXX`). Recebe carimbos no Passaporte Digital e atinge os 6 Níveis de Maestria.
2. **`VISITOR` (Comunidade Externa / Visitante):** Autenticado via e-mail. Permite registrar presença em eventos abertos.
3. **`ADMIN` (Organizador / Administrador):** Possui acesso total ao Cockpit `/admin`, controle de ativação das sessões (Shark Tank, Ideathon, OTT) e emissão de QR Codes.

*Nota: O antigo perfil `STAFF` foi totalmente removido e unificado no perfil `ADMIN`.*
