# 📑 BACKLOG4.0.md — HISTÓRIAS DE USUÁRIO & BACKLOG PRIORIZADO (SECOMP 2026 v4.0)
**Projeto:** Hub Digital, Plataforma Oficial & Cockpit Administrativo da SECOMP 2026 (*Construindo Conexões*)  
**Elaborado por:** Rosita (*Product Owner & Especialista em BDD/Especificação Ágil*)  
**Status:** Consolidado para Handoff Técnico | **Versão:** 4.2.0  
**Design System Vinculado:** [designBINANCE.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/designBINANCE.md) (High-Voltage Dark `#0b0e11` + `#fcd535`)  

---

## 1. Stories Priorizadas da Sprint 4.0 (Vitrine Pública & Módulos Interativos)

| ID | Título Resumido | Épico | Prioridade | SP | Métrica Impactada |
|---|---|---|---|---|---|
| **US-01** | Vitrine Pública de Atrações sem Inscrição Prévia | EP-02 | Must Have | 5 pts | Zero atrito de navegação e busca |
| **US-06** | Validador de Presença via Leitor QR Code 15m (`/validate`) | EP-04 | Must Have | 8 pts | Carimbo direto com RA de Aluno ou E-mail |
| **US-14** | Registro & Login com 3 Perfis (`STUDENT`, `VISITOR`, `ADMIN`) | EP-09 | Must Have | 8 pts | Autenticação RBAC simplificada |
| **US-20** | Inscrição Dinâmica de Equipes no Ideathon | EP-10 | Must Have | 5 pts | Cadastro de times e seleção de trilhas |
| **US-21** | Votação em Tempo Real no Shark Tank Live | EP-11 | Must Have | 8 pts | Participação ao vivo por pitching |
| **US-22** | Vitrine & Interatividade Startup Day Showcase | EP-12 | Must Have | 5 pts | Exposição de startups e mentores |
| **US-23** | Admin Master Switch para Liberação de Sessões | EP-09 | Must Have | 5 pts | Controle em tempo real pelo Cockpit Admin |

---

## 2. Cenários BDD Destacados (Gherkin)

```gherkin
Feature: Módulos Interativos e Liberação Manual por Administrador

  Scenario: Administrador libera votação do Shark Tank manualmente no Cockpit
    Given que o usuário "raimorato@alunos.utfpr.edu.br" está logado com perfil "ADMIN"
    When ativa a chave "shark_tank_voting_active" no Cockpit "/admin"
    Then o evento WebSocket "SESSION_STATUS_CHANGED" é transmitido para todos os clientes
    And a interface dos participantes exibe o botão "Votar nesta Startup" habilitado

  Scenario: Inscrição de equipe no Ideathon quando o formulário está liberado
    Given que a sessão de inscrição do Ideathon foi ativada pelo Admin
    And o aluno "rai.moratto@alunos.utfpr.edu.br" está logado como "STUDENT"
    When preenche o formulário da equipe "CodeCraft" com 3 integrantes
    Then a equipe é registrada com sucesso no banco de dados
    And a confirmação é exibida na tela do aluno

  Scenario: Participante tenta votar no Shark Tank antes da liberação manual
    Given que a chave "shark_tank_voting_active" está desativada no sistema
    When o participante acessa o painel do Shark Tank
    Then a interface exibe a mensagem "Votação Fechada. Aguarde a apresentação pelo mediador."
    And o botão de envio permanece desabilitado
```
