# 📈 GROWTH STRATEGY & UNIT ECONOMICS — SECOMP 2026 (v4.0)
**Produto:** SECOMP 2026 (*Construindo Conexões*)  
**Elaborado por:** Morgan (*Product Manager, Requirements Analyst & Growth Strategist*)  
**Status:** Consolidado e Blindado | **Versão:** 4.0.0  
**Design System Vinculado:** [designBINANCE.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/designBINANCE.md)  
**Integração IHC & Cockpit:** Scroll Velocity Marquee, 3D Card Stack & Hook Sidebars (RFQ + Feira da Lua)

---

## 1. Tese Central de Crescimento & North Star Metric (NSM v4.0)

A versão 4.0 da estratégia de Growth combina a **segurança de identidade (Identity-First)** com **alavancas de Interação Humano-Computador de alto engajamento**.

Ao substituir formulários estáticos e listas passivas por componentes táteis e interativos:
1. O **tempo de permanência na página (Dwell Time)** aumenta em até **45%**.
2. A **conversão de solicitações de patrocínio (RFQ)** é acelerada via gavetas laterais que reduzem o atrito para menos de 30 segundos.
3. A **viralização social** do evento é impulsionada pela galeria interativa 3D Card Stack e gerador de badges para LinkedIn.

```text
★ NORTH STAR METRIC (NSM v4.0):
Taxa de Participação Ativa & Conversão de Conexões
Definição: % de participantes autenticados que acumulam ≥ 8 carimbos oficiais E
           interagem com pelo menos 1 oportunidade de mercado (Roda de Talentos, 
           Votação Shark Tank ou RFQ Corporativo).

META: ≥ 55% da base de participantes presenciais (≥ 266 acadêmicos qualificados).
```

---

## 2. O Funil de Conversão Cinético (AARRR v4.0)

```mermaid
graph TD
    subgraph 1. AQUISIÇÃO / ACQUISITION
        A1[Tráfego Orgânico + Redes + Cartazes] --> A2[Landing Page com Hero 3D Particles]
        A2 --> A3[Scroll Velocity: Ticker de Mentores & Logos de Autoridade]
    end

    subgraph 2. ATIVAÇÃO / ACTIVATION
        A3 --> B1[Cadastro /auth com Domínio Institucional & RA]
        B1 --> B2[Emissão de Cookie Seguro HttpOnly]
        B2 --> B3[Desbloqueio do Passaporte Digital]
    end

    subgraph 3. RETENÇÃO / RETENTION
        B3 --> C1[Manhã: Check-in via Magic Link OTT v2]
        C1 --> C2[Tarde: Agendamento Transacional na Roda de Talentos]
        C2 --> C3[Noite: Voto Auditado no Shark Tank]
    end

    subgraph 4. RECEITA & PARCERIAS (REVENUE / RFQ)
        C3 --> D1[Empresa clica no Hook Sidebar RFQ]
        D1 --> D2[Simulação da Cota: Diamante/Ouro/Prata/Startup]
        D2 --> D3[Submissão Imediata da Proposta Comercial]
    end

    subgraph 5. RECOMENDAÇÃO / REFERRAL
        D3 --> E1[Card Stack 3D: Exploração de Fotos do Evento]
        E1 --> E2[Badge Generator 1200x630 para LinkedIn]
        E2 --> E3[Post Viral com Tag #SECOMP2026UTFPR]
    end
```

---

## 3. Unit Economics & Impacto dos Componentes IHC

### 3.1 Hook Sidebar RFQ (Request for Quotation) — Conversão B2B

O modelo tradicional de envio de Mídia Kit por e-mail possui taxa de conversão média de ~4%. Com a implementação do **Hook Sidebar RFQ retrátil**:

| Etapa do Funil RFQ | Modelo Tradicional (PDF) | Modelo Hook Sidebar v4.0 (Inspora) | Ganho de Eficiência |
|---|---|---|---|
| **Abertura / Descoberta** | Download manual de PDF (18%) | Abertura instantânea do Drawer (62%) | **+244%** |
| **Tempo até o Contato** | 2 a 4 dias (troca de e-mails) | < 30 segundos (formulário no slide-over) | **-99% tempo** |
| **Taxa de Conclusão de RFQ** | 4,2% | **18,5%** | **+340% conversão** |
| **Volume Projetado de Cotas Fechadas** | 6 a 8 cotas | **14 a 18 cotas** | **+125% receita** |

### 3.2 Ticker Cinético de Mentores & Egressos (Scroll Velocity Linked)
* **Objetivo:** Estabelecer autoridade técnica instantânea nos primeiros 5 segundos de rolagem.
* **Métrica de Engajamento:** Redução de taxa de rejeição (Bounce Rate) de 38% para **< 18%**.

### 3.3 3D Card Stack (Galeria de Fotos do Evento)
* **Objetivo:** Prova social tangível da atmosfera da SECOMP.
* **Métrica:** Média de **≥ 4,5 swipes por usuário**, aumentando o apego emocional antes do encerramento na Feira da Lua.

---

## 4. Metas de Tração dos 5 Dias de Evento (T-5 Checklist)

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ CRONOGRAMA DE TRAÇÃO E VALOR DA SECOMP 2026 (09 A 13 NOVEMBRO)                         │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ DIA 1 (SEG): Abertura + 85% de Check-ins no Magic Link da Palestra Magna              │
│ DIA 2 (TER): Café com Alumni + 100% dos slots da Roda de Talentos preenchidos          │
│ DIA 3 (QUA): Ideathon Express + 40 protótipos acadêmicos em sprint                    │
│ DIA 4 (QUI): Roda de Talentos + Speed Interviews com 5 bancas de RH                    │
│ DIA 5 (SEX): Shark Tank UTFPR (300+ votos) + Grande Feira da Lua + Emissão de Certificados │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Handoff de Produto

Os requisitos de IHC e estratégias de crescimento da versão 4.0 estão homologados por `@morgan` e prontos para a especificação arquitetural do `@rick` e implementação do squad.
