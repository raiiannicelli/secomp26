# 📈 GROWTH STRATEGY & UNIT ECONOMICS — SECOMP 2026 (v4.0)
**Produto:** SECOMP 2026 (*Construindo Conexões*)  
**Elaborado por:** Morgan (*Product Manager, Requirements Analyst & Growth Strategist*)  
**Status:** Consolidado e Blindado | **Versão:** 4.2.0  
**Design System Vinculado:** [designBINANCE.md](file:///home/rai-moratto/Documents/projetos/software-house/software-house/projects/SECOMP2026/docs/designBINANCE.md)  

---

## 1. Tese Central de Crescimento & North Star Metric (NSM v4.3)

A versão 4.3 combina a **segurança de identidade (Identity-First)** com a **mecânica presencial de QR Code exclusivo por atividade (Cursos, Palestras e Rodas de Conversa)** e **módulos interativos em tempo real**.

```text
★ NORTH STAR METRIC (NSM v4.3):
Taxa de Acúmulo de Carimbos Autênticos & Retenção Presencial
Definição: % de participantes autenticados (STUDENT ou VISITOR) que acumulam ≥ 8 carimbos 
           oficiais escaneando os QR Codes exclusivos exibidos nos telões de Cursos, 
           Palestras e Rodas de Conversa (atendendo até 7 horários por plataforma).

META: ≥ 65% da base presencial (≥ 350 participantes qualificados com passaporte preenchido).
```


---

## 2. O Funil de Conversão Cinético (AARRR v4.2)

```mermaid
graph TD
    subgraph 1. AQUISIÇÃO / ACQUISITION
        A1[Tráfego Orgânico + Redes + Cartazes] --> A2[Landing Page com Hero High-Voltage]
        A2 --> A3[Vitrine de Atrações]
    end

    subgraph 2. ATIVAÇÃO / ACTIVATION
        A3 --> B1[Cadastro /auth com 3 Perfis: STUDENT, VISITOR, ADMIN]
        B1 --> B2[Emissão de Cookie Seguro HttpOnly]
        B2 --> B3[Desbloqueio do Passaporte Digital]
    end

    subgraph 3. RETENÇÃO & ENGAJAMENTO AO VIVO
        B3 --> C1[Check-in no Auditório via Leitor QR Code OTT]
        C1 --> C2[Inscrição de Equipe no Ideathon Express]
        C2 --> C3[Votação em Tempo Real no Shark Tank Live]
    end

    subgraph 4. RECEITA & PARCERIAS (REVENUE / B2B)
        C3 --> D1[Startups & Mentores no Startup Day Showcase]
        D1 --> D2[Agendamentos de Mentoria na Talent Arena]
        D2 --> D3[Speed Interviews & Retorno de Cotas B2B]
    end

    subgraph 5. RECOMENDAÇÃO / REFERRAL
        D3 --> E1[Projetos Campeões do Ideathon & Shark Tank]
        E1 --> E2[Badge Generator 1200x630 para LinkedIn]
        E2 --> E3[Post Viral com Tag #SECOMP2026UTFPR]
    end
```

---

## 3. Cronograma de Tração e Ativação dos Módulos (09 a 13 de Novembro)

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ CRONOGRAMA DE ACTIVATION E VALOR DA SECOMP 2026 v4.2                                   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ DIA 1 (SEG): Abertura + 85% de Check-ins no Leitor QR Code OTT na Palestra Magna       │
│ DIA 2 (TER): Startup Day Showcase + Agendamentos da Roda de Talentos                   │
│ DIA 3 (QUA): Ideathon Express (Liberação das Inscrições de Equipes via Admin Switch)  │
│ DIA 4 (QUI): Apresentação dos Protótipos do Ideathon + Roda de Talentos                │
│ DIA 5 (SEX): Shark Tank Live (Ativação da Votação em Tempo Real pelo Admin) + Feira   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```
