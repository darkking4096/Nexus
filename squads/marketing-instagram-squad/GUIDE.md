# 📖 Marketing Instagram Squad — Guia de Uso

**Gerenciamento completo de perfis de Instagram com 5 agentes especializados**

---

## 🚀 Quick Start (3 Passos)

### 1️⃣ Onboard seu perfil
```bash
@profile-strategist

Handle: @seu_handle
Nicho: copywriting
Objetivo: 10k followers em 6 meses

*onboard-profile
```

**Output:** `config/profile-context.yaml` preenchido + sumário estratégico

---

### 2️⃣ Defina sua estratégia
```bash
@profile-strategist

Profile: [@seu_handle]
Audiência: copywriters juniors
Positioning: frameworks + case studies

*define-strategy
```

**Output:** `strategy-document.md` com StoryBrand 7-Point + Value Equation

---

### 3️⃣ Lance primeiro calendário
```bash
@content-planner

Strategy: [link para strategy-document.md]
Frequência: 4 posts/semana
Pillars: 70% educação, 20% social, 10% offers

*create-calendar
```

**Output:** `content-calendar.md` com 30 dias planejados

---

## 🎭 Os 5 Agentes

| Agent | Especialidade | Comandos | Quando Usar |
|-------|---------------|----------|-----------|
| **Profile Strategist** | Estratégia mestra | `*onboard-profile`, `*define-strategy`, `*update-strategy` | Lançar perfil ou revisar estratégia |
| **Copywriter** | Copy + persuasão | `*write-caption`, `*write-hook`, `*write-cta` | Escrever posts prontos |
| **Content Planner** | Calendário editorial | `*create-calendar`, `*generate-brief` | Planejar mês ou brief específico |
| **Trend Researcher** | Trends + virality | `*find-trends`, `*suggest-format` | Descobrir oportunidades |
| **Analytics Agent** | Métricas + otimização | `*analyze-performance`, `*suggest-adjustments` | Medir e experimentar |

---

## 📋 Fluxos Completos

### Para Novo Perfil (5 dias)
```
Dia 1: Profile Strategist (*onboard-profile → *define-strategy)
Dia 2: Copywriter (*write-caption x 3)
Dia 3: Content Planner (*create-calendar)
Dia 4: Trend Researcher (*find-trends)
Dia 5: Analytics Agent (*analyze-performance) + lançamento
```

**Documentação:** `workflows/launch-new-profile.md`

---

### Para Otimizar Perfil (mensal)
```
Semana 1: Analytics Agent analisa última semana
Semana 2: Copywriter testa novos hooks, Content Planner ajusta calendário
Semana 3: Trend Researcher escaneia novas opportunities
Semana 4: Profile Strategist revisa e alinha tudo
```

**Documentação:** `workflows/optimize-existing-profile.md`

---

## 📚 Arquivos Importantes

- **`squad.yaml`** — Definição de agentes e comandos
- **`agents/*.md`** — Persona e frameworks de cada agente
- **`tasks/*.md`** — Tasks executáveis (input/output esperado)
- **`templates/*.md`** — Saídas estruturadas (strategy-document, content-calendar, etc.)
- **`config/profile-context.yaml`** — Template para seu perfil específico

---

## 💡 Pro Tips

1. **Sempre comece com Profile Strategist** — sem estratégia clara, o resto vira sorte
2. **Use os templates** — `strategy-document.md` é o "source of truth" do perfil
3. **Documente tudo** — próximas rodadas vão melhor
4. **A/B teste sempre** — Analytics Agent propõe testes com rigor
5. **Escale gradualmente** — 1 perfil → 3 perfis → 10 (cada um roda independente)

---

## 🤔 Comandos com `*`?

Todos os comandos em um agent começam com `*`. Exemplo:

```
Você está ativando o @copywriter. Os comandos disponíveis são:
  • *write-caption
  • *write-hook
  • *write-cta

Escolha qual deseja executar — veja a seção "Comandos Disponíveis" 
no arquivo agents/copywriter.md para saber o que cada um faz.
```

---

## 📞 Próximas Etapas

- [ ] Ativar Profile Strategist e preencher seu perfil
- [ ] Ler `workflows/launch-new-profile.md` completo
- [ ] Executar primeira semana (dias 1-3)
- [ ] Documentar resultados

---

**Status:** 🟢 Production Ready | **Última atualização:** 2026-04-07
