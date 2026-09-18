# 📊 BRIEFING ESTRATÉGICO — SECOMP 2026 v3.0
**Elaborado por:** Morgan (*Product Manager & Growth Strategist*)  
**Data:** 18 de Setembro de 2026  
**Base:** `.context.md` v2.0 + gaps identificados em produção  
**Próxima ação:** Handoff para @rosita → novos épicos → @judith roteia PRs 13+

---

## 1. O que a v2.0 Entregou (Baseline)

A v2.0 fechou com **100% dos 13 PRs verdes**. A plataforma está funcional:

| Camada | Status |
|---|---|
| Frontend (9 seções + modais) | ✅ Completo |
| Backend (Fastify + Prisma + Redis + BullMQ) | ✅ Completo |
| Gamificação (6 níveis, OTT, leaderboard) | ✅ Completo |
| Certificados (HMAC-SHA256 + BullMQ) | ✅ Completo |
| Design System | ⚠️ Divergindo — futurista vs. preto/amarelo/branco |
| Estado da UI | ⚠️ God Store — 1 arquivo, 8 domínios acoplados |
| Identificação do Participante | ❌ Não existe — todos são anônimos |
| Tokens de presença reais | ❌ Aceita qualquer `SEC-*` sem lista oficial |
| Seção "Sobre o DACOMP" | ❌ Dead link no Navbar — conteúdo inexistente |

---

## 2. Os 4 Gaps Estratégicos do v3.0

### GAP-01 — Identidade do Participante (CRÍTICO)

**Problema:** A plataforma não sabe quem está navegando. Gamificação, certificados e Roda de Talentos existem mas não têm "dono". O Leaderboard mostra nomes hardcoded.

**Impacto de negócio:** Sem identificação, não podemos emitir certificados reais, não podemos personalizar o passaporte, e o Shark Tank vota por fingerprint anônimo — sem rastreabilidade para o sorteio.

**Solução v3.0:** `SessionModal` — tela de boas-vindas não-bloqueante que coleta **nome + RA + e-mail** na primeira visita. Persiste em `sessionSlice`. Desbloqueia toda a cadeia de valor posterior.

---

### GAP-02 — Estado Acoplado (RISCO TÉCNICO)

**Problema:** `useUIStore.ts` tem 194 linhas e 8 domínios num único store. Qualquer mudança de stamp re-renderiza o Navbar. Qualquer voto re-renderiza a grade de palestras.

**Impacto:** Performance degradada em mobile — 60% dos acessos em novembro serão mobile. Testabilidade zero da lógica de tokens.

**Solução v3.0:** Refatoração em 5 slices com `persist` middleware + `tokenService.ts` isolado.

---

### GAP-03 — Design System Divergindo (RISCO DE MARCA)

**Problema:** O `designBINANCE.md` foi adulterado com paleta Nike sobreposta — dois blocos `colors:` em conflito. Efeitos de brilho foram removidos dos componentes mas o `design.md` ainda os documenta como padrão.

**Solução v3.0:**
- Restaurar `designBINANCE.md` para estado limpo (paleta original Binance)
- Atualizar `design.md` removendo tokens deletados e documentando a nova regra: **zero glow, neutro nos técnicos, preto/amarelo/branco como core**

---

### GAP-04 — Conteúdo Ausente — Seção DACOMP

**Problema:** O navbar tem `href: '# sobre-secomp'` — link com espaço extra e seção inexistente. Dead link visível para patrocinadores e empresas.

**Impacto:** Principal seção de credibilidade institucional para captação de cotas está vazia.

**Solução v3.0:** Criar `AboutDACOMPSection.tsx` com: história do DACOMP, estatísticas do evento, equipe organizadora, e CTA para parceria.

---

## 3. Novos Épicos para v3.0

| ID | Épico | Responsável | PR |
|---|---|---|---|
| **EP-09** | Identidade do Participante (Session System) | @carol + @rj | PR-13 |
| **EP-10** | Refatoração de Estado (Slices + Persist) | @carol | PR-14 |
| **EP-11** | Design System Alignment v3 | @carol | PR-15 |
| **EP-12** | Seção Institucional DACOMP | @carol | PR-16 |
| **EP-13** | Tokens OTT Reais por Atividade | @rj | PR-17 |

---

## 4. North Star Metric — Mantida & Expandida

> **NSM v2.0:** Passaporte concluído — ≥ 50% dos inscritos completam 7+ carimbos

**NSM v3.0 adiciona:**
- **Taxa de Identificação:** ≥ 80% dos visitantes preenchem nome + RA
- **Zero Dead Links:** 100% dos links do Navbar resolvem para conteúdo real
- **Coerência Visual:** 100% dos componentes usam apenas `#0b0e11 / #fcd535 / #ffffff` como core

---

## 5. Decisões de Produto Abertas

**Decisão 1 — Session System:** O `SessionModal` deve ser obrigatório (bloqueia até preencher) ou opcional (pode fechar e usar anônimo)?

> Recomendo **opcional mas persistente** — aparece a cada visita se não preenchido, sem bloquear navegação.

**Decisão 2 — Tokens OTT Reais:** Quem define os códigos `SEC-XXXX` — a organização DACOMP em planilha, ou gerado pelo backend na abertura de cada sessão?

> Recomendo **gerado pelo backend** via `POST /api/v1/staff/sessions/open` — já especificado no SDD-SPEC. O organizador abre a sessão e o código aparece no telão.

**Decisão 3 — Seção DACOMP:** Conteúdo hardcoded ou dinâmico via CMS?

> Para novembro: **hardcoded** com dados reais da equipe. CMS é complexidade desnecessária agora.

---

## 6. Cronograma Sugerido v3.0

```
SET 18-22  →  PR-14 (Slices + Persist) + PR-15 (Design System fix)
SET 23-28  →  PR-13 (SessionModal + sessionSlice) + PR-17 (Tokens reais)
OUT 01-05  →  PR-16 (Seção DACOMP) + Quality Gate 3.0
OUT 06+    →  Freeze de features. Apenas bugfixes e conteúdo real
NOV 09     →  SECOMP 2026 ao vivo
```

*Aguardando confirmação das 3 decisões acima para @rosita iniciar o fatiamento em histórias BDD.*
