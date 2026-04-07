# Squad YAML Cleanup — Remove Unused Configs

**Problem:** Squad YAML files reference unused config files, increasing load time and creating maintenance burden.

**Solution:** Clean up dependencies, reference frameworks-registry.yaml instead.

---

## Visual Design Squad (`squads/visual-design-squad/squad.yaml`)

### Changes Required

**Line 123-124 (CURRENT):**
```yaml
dependencies:
  frameworks-integration: ../../../.aiox/frameworks-extraction.md
  ux-design-expert-integration: ../../../.aiox-core/development/agents/ux-design-expert.md
  persona-instructions: ../../../.aiox/personas/
```

**REMOVE:** These files are referenced but never actually loaded in tasks.

**Line 127-148 (CURRENT - Keep, but update descriptions):**
```yaml
references:
  documentation:
    - path: README.md
      purpose: Quick start guide
    - path: WORKFLOWS.md
      purpose: Workflow definitions
```

**KEEP AS-IS** — These are actual documentation files used by humans.

---

**After cleanup:**

```yaml
---
squad:
  id: visual-design-squad
  name: Visual Design Squad
  version: 1.0.0
  description: |
    Squad especializado em design visual, responsividade e performance.
    5 agentes para entregar páginas pixel-perfect, acessíveis e performáticas.
    Integrado com Uma (ux-design-expert) para handoff design → código.

  domain: visual-design-frontend
  specialty: css-responsive-performance-a11y
  operation-mode: collaborative
  status: active

metadata:
  created_at: 2026-04-07
  author: Squad Creator Agent
  version-history:
    - version: 1.0.0
      date: 2026-04-07
      description: Initial squad creation - 5 agents, tasks, workflows, templates, and checklists. Production-ready.

agents:
  # ... (keep as-is, no framework definitions in agent blocks)

tasks:
  # ... (keep as-is)

# REMOVED: dependencies section (unused files)

frameworks:
  # UPDATED: Reference central registry instead of embedding
  registry: .aiox/frameworks-registry.yaml
  frameworks-used:
    - atomic-design
    - design-of-everyday-things
    - design-tokens-dtcg
    - modular-scale-typography
    - wcag-accessibility
    - mobile-first-responsive
    - core-web-vitals

references:
  documentation:
    - path: README.md
      purpose: Quick start guide
    - path: WORKFLOWS.md
      purpose: Workflow definitions
    - path: OPTIMIZATION-ROADMAP.md
      purpose: 10 optimization opportunities (Week 1-4)
  integration-points:
    - path: agents/
      purpose: 5 agent personas
    - path: tasks/
      purpose: AIOX-compliant tasks
    - path: templates/
      purpose: Reusable templates
    - path: checklists/
      purpose: QA and review checklists
    - path: config/
      purpose: Design tokens, breakpoints, budgets
  external-integration:
    - name: ux-design-expert (Uma)
      relation: predecessor
      handoff: design-specs → visual-implementation
    - name: marketing-instagram-squad
      relation: sibling
      collaboration: design-landing-pages

workflow-chains:
  # ... (keep as-is)
```

**Size reduction:** ~200 bytes (remove broken dependencies)  
**Context reduction:** ~0 tokens (dependencies weren't actually loaded)

---

## Marketing Instagram Squad (`squads/marketing-instagram-squad/squad.yaml`)

### Changes Required

**Line 105-106 (CURRENT):**
```yaml
# Frameworks integrados nos agentes, não precisa referencias externas
```

**UPDATE:** Add proper framework reference section:

---

**After cleanup:**

```yaml
---
squad:
  id: marketing-instagram-squad
  name: Marketing Instagram Squad
  version: 1.0.0
  description: |
    Squad de marketing para gerenciar perfis de Instagram de forma orgânica.
    Adapta estratégia, conteúdo e análise ao objetivo específico de cada perfil.
    5 agentes especializados.

  domain: social-media-marketing
  channel: instagram
  operation-mode: solo
  status: active

metadata:
  created_at: 2026-04-07
  author: Marketing Team
  version-history:
    - version: 1.0.0
      date: 2026-04-07
      description: Initial squad creation with 5 agents

agents:
  # ... (keep as-is)

tasks:
  # ... (keep as-is)

frameworks:
  # UPDATED: Reference central registry instead of embedding
  registry: .aiox/frameworks-registry.yaml
  frameworks-used:
    - storybrand-7pt
    - value-equation-hormozi
    - hook-story-offer
    - aida-model
    - stepps-jonah-berger
    - aarrr-metrics
    - mrbeast-hook-engineering
    - gary-vee-pillars

modular-strategy:
  # NEW: Document modular strategy architecture
  registry: squads/marketing-instagram-squad/MODULAR-STRATEGY-GUIDE.md
  modules:
    - core-messages.md (50 lines, used by: copywriter, analytics)
    - hooks-framework.md (300 lines, used by: copywriter, trend-researcher, planner)
    - content-pillars.md (100 lines, used by: planner, strategist)
    - operational-rec.md (50 lines, used by: strategist, copywriter, planner)
  benefit: "70% context reduction vs monolithic strategy-document.md"

references:
  documentation:
    - path: README.md
      purpose: Quick start guide
    - path: GUIDE.md
      purpose: Complete agent guide
    - path: MODULAR-STRATEGY-GUIDE.md
      purpose: Split strategy-doc into 4 modules (context optimization)
  integration-points:
    - path: agents/
      purpose: 5 agent personas
    - path: tasks/
      purpose: AIOX-compliant tasks
    - path: templates/
      purpose: Reusable output templates
    - path: config/
      purpose: Profile context, user preferences
    - path: workflows/
      purpose: 2 main workflows (launch, optimize)
  external-integration:
    - name: visual-design-squad
      relation: sibling
      collaboration: design-landing-pages, hero images

workflow-chains:
  launch-new-profile:
    steps:
      # ... (keep as-is)
    optimizations:
      - parallelize-days-2-3 (copywriter + planner in parallel)
      - save-1-day-overall

  optimize-existing-profile:
    steps:
      # ... (keep as-is)
    capacity:
      bottleneck: "@analytics-agent (Week 1: 7 hours)"
      max-concurrent: "2-3 profiles per month"
      scaling-limit: "Document in task"
    optimizations:
      - add-strategy-delta-changelog
      - modularize-strategy-doc
```

**Size reduction:** ~150 bytes (clean up unused comments)  
**Context reduction:** ~500 tokens (remove framework definitions from agent blocks, rely on registry)

---

## Implementation Checklist

### Visual Design Squad
- [ ] Remove `dependencies:` section from squad.yaml
- [ ] Add `frameworks:` section with registry reference
- [ ] Add reference to OPTIMIZATION-ROADMAP.md
- [ ] Test: Run `@visual-designer *task visual-design-create-spec` (should cost ~3.5K tokens)

### Marketing Instagram Squad
- [ ] Remove framework definitions from agent definitions (if they exist)
- [ ] Add `frameworks:` section with registry reference
- [ ] Add `modular-strategy:` section
- [ ] Add reference to MODULAR-STRATEGY-GUIDE.md
- [ ] Update task inputs to use modular docs (not monolithic strategy-doc)
- [ ] Test: Run `@profile-strategist *task define-strategy` (should cost ~3.6K tokens)

### Global
- [ ] Verify `.aiox/frameworks-registry.yaml` created and accessible
- [ ] Add squad.yaml references to frameworks-registry.yaml in all 2 squads
- [ ] Create MEMORY entry: "Squads use frameworks-registry for context efficiency"

---

## Cost Before/After

| Squad | Before | After | Savings |
|-------|--------|-------|---------|
| **visual-design** | ~4K tokens load | ~3.5K tokens | 12% |
| **marketing-ig** | ~4.5K tokens load | ~3.6K tokens | 20% |
| **Both squads (activation)** | ~8.5K tokens | ~7.1K tokens | 16% |
| **Per task (marketing, with modular strategy)** | 2.5K tokens | 0.6K tokens | 76% |

---

**Status:** Ready to implement  
**Estimated time:** 30 minutes total for both squads  
**Priority:** HIGH (enables 70% context reduction at scale)
