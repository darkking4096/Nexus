# Visual Design Squad — Optimization Roadmap

**Status:** Production-ready + 10 optimization opportunities identified  
**Priority:** Implement top 5 for 20-30% efficiency gain  
**Timeline:** Staggered implementation (Week 1-4)

---

## 🎯 Top 5 Quick Wins (Implement Week 1)

### #1: Add Task Blockers in YAML (Effort: 15 min)
**Problem:** Tasks declare `requires` but no `blocks` field. No orchestration possible.

**Impact:** Enable parallel execution planning, reduce manual coordination.

**Implementation:**
- Edit `responsive-audit.md` YAML header: add `blocks: [quality-gate-visual]`
- Edit `a11y-audit.md` YAML header: add `blocks: [quality-gate-visual]`  
- Edit `performance-audit.md` YAML header: add `blocks: [quality-gate-visual]`

**Before:**
```yaml
---
id: responsive-audit
task: Audit responsive design
requires: [frontend-implement-page]
# (no blocks declared — downstream doesn't know this task is a prerequisite)
---
```

**After:**
```yaml
---
id: responsive-audit
task: Audit responsive design
requires: [frontend-implement-page]
blocks: [quality-gate-visual]  # ← NEW: explicitly declare dependency
---
```

---

### #2: Consolidate Responsive + A11y Audits (Effort: 2 hours)
**Problem:** Rio (responsive) and Nova (a11y) both test keyboard nav, color contrast, touch targets = 20-30% overlap.

**Impact:** Save 2-3 hours per component/page audit. Single coordinated report.

**Current state:**
- `responsive-audit.md` (Rio): Tests layout, images, breakpoints, **focus rings**, **color contrast**, **keyboard nav**
- `a11y-audit.md` (Nova): Tests **keyboard nav**, **color contrast**, **focus rings**, screen reader, ARIA

**Solution:**

Create `unified-responsive-a11y-audit.md` with coordinated checklist:

```markdown
# Unified Responsive + A11y Audit

**Agents:** Rio (Responsive Specialist) + Nova (Performance & A11y Specialist)  
**Duration:** 2-3 hours (combined, not sequential)  
**Status:** PASS / CONCERNS / FAIL

## Phase 1: Rio's Responsive Audit (1 hour)
- [ ] Desktop (1440px): Layout, typography, spacing
- [ ] Tablet (768px): Layout adapts, touch targets ≥ 44px
- [ ] Mobile (375px): Layout, images responsive, readable font sizes
- [ ] Images optimized: WebP, srcset, lazy loading
- [ ] **Focus rings visible** (any breakpoint) ← SHARED with Nova

## Phase 2: Nova's A11y Audit (1 hour)
- [ ] Semantic HTML: proper heading hierarchy (h1 > h2 > h3)
- [ ] Screen reader: tested with NVDA/JAWS, announces landmarks
- [ ] Keyboard only: Tab through all interactive elements, Shift+Tab backwards
- [ ] Color contrast: WCAG AA (≥ 4.5:1 text, ≥ 3:1 UI components)
- [ ] **Focus visible**: same blue outline on all interactive elements (iOS 15+) ← SHARED with Rio
- [ ] ARIA labels: inputs have <label>, icons have aria-label

## Phase 3: Joint Sign-off (30 min)
- [ ] Rio & Nova agree on PASS/CONCERNS/FAIL
- [ ] If CONCERNS: document specific issues, severity (critical/medium/low)
- [ ] If FAIL: send back to frontend-developer, schedule re-audit

## Outputs
- Single `{page-name}-audit-report.md` (signed by both Rio + Nova)
```

**Old workflow:** `frontend-implement-page` → Rio (1h) → Nova (1h) = 2h total  
**New workflow:** `frontend-implement-page` → Rio + Nova (1.5h parallel, 1h coordinated) = 1.5h total

**Savings:** 0.5-1 hour per audit

---

### #3: Add Iris to Component Workflow (Effort: 45 min)
**Problem:** `page-to-production` includes Iris (interaction design). `component-creation` skips her = incomplete state specs.

**Impact:** Components have complete state definitions (hover, focus, active, loading, disabled). Less QA rework.

**Solution:**

Edit `component-creation.md` workflow:

**Current:**
```markdown
## Day 1: Visual Design (Stella) + Frontend Implementation (Claude)
## Day 2: Responsive Audit (Rio) + A11y Audit (Nova)
```

**Updated:**
```markdown
## Day 1: Visual Design (Stella)
- Stella creates component visual spec (colors, typography, layout)

## Day 1.5: Interaction Design (Iris)
- Iris creates state definitions (hover, focus, active, disabled, loading)
- Iris creates animation specs (transitions, micro-interactions)

## Day 2: Frontend Implementation (Claude)
- Claude implements component with states from Iris spec

## Day 3: Unified Responsive + A11y Audit (Rio + Nova)
- Rio & Nova audit with complete states already defined
```

---

### #4: Simplify Workflow Handoff Sections (Effort: 30 min)
**Problem:** Handoff blocks repeat context (e.g., "5 colors: blue, red, green..."). Reduces scannability.

**Impact:** Reduce workflow doc size 15%, improve clarity by linking to source.

**Current style:**
```markdown
## Handoff: Stella → Iris

Previous output includes:
- 5 primary colors: #0066CC, #FF6B35, #00AA00, #FFAA00, #AA0000
- 12 typography scales: xs (13px), sm (16px), md (20px), ...
- Design tokens in DTCG format

Next task: Iris creates micro-interaction specs
```

**Simplified style:**
```markdown
## Handoff: Stella → Iris

Previous output: `{project}-design-tokens.md`  
Next task: `interaction-design-spec.md`

👉 See Stella's DTCG tokens in design-tokens.md (colors, typography, spacing sections)
```

---

### #5: Document Load Profile by Squad Size (Effort: 20 min)
**Problem:** No documented scaling limits. Nova's a11y audits become bottleneck at scale.

**Impact:** Prevents runtime surprises. Guides resource planning.

**Solution:**

Add section to both workflow docs:

```markdown
## Scaling & Capacity

### Max Concurrent Components: 2-3 per week per designer

- Stella (Visual Designer): Can spec 2-3 components in parallel
- Iris (UX/Interaction): Can design 2-3 interactions in parallel  
- Claude (Frontend Dev): **BOTTLENECK** — implements 1 component at a time (takes 4-8 hours)
- Rio (Responsive Specialist): Can audit 3-4 components in parallel
- Nova (Performance & A11y): **BOTTLENECK** — audits 1-2 components per day (4-6 hours each)

### Recommendations
- For **3-5 components/week:** Hire 2nd frontend developer (Claude overloaded)
- For **4+ components/week:** Hire 2nd performance/a11y specialist (Nova bottleneck)
- For **10+ components/week:** Consider automated accessibility testing (complementary to Nova's manual audit)

### Timeline Estimates
- Component (simple button): 2-3 days (Stella + Iris + Claude + Rio + Nova)
- Component (complex form field): 3-4 days
- Page (5-10 components): 5-7 days
```

---

## 📊 Medium-Priority Improvements (Week 2-3)

### #6: Create Unified Responsive + A11y Checklist Template
**Effort:** 1 hour  
**Impact:** Consistent QA across all projects

**File:** `checklists/responsive-a11y-unified.md`

---

### #7: Link Templates to Tasks Explicitly
**Effort:** 1.5 hours  
**Impact:** Single source of truth for output formats

**Current:** Tasks embed example structure. Templates folder unused.  
**Updated:** Tasks reference template files by path.

Example:
```markdown
## Output

- Filename: `{component-name}-spec.md`
- Format: Use template `squads/visual-design-squad/templates/interaction-spec-template.md`
- Substitute variables: `{component-name}`, `{states}`, `{transitions}`
```

---

### #8: Add Performance Budget Tracking
**Effort:** 2 hours  
**Impact:** Prevent performance regressions

**New file:** `config/performance-budget.yaml`

```yaml
core-web-vitals-budget:
  lcp: 2.5s      # Largest Contentful Paint
  fid: 100ms     # First Input Delay
  cls: 0.1       # Cumulative Layout Shift
  inp: 200ms     # Interaction to Next Paint

file-size-budget:
  js: 100KB      # JavaScript bundle (gzipped)
  css: 30KB      # CSS (gzipped)
  images: 200KB  # Total images per page
```

Nova uses this in `audit-performance.md` to check against budget.

---

### #9: Create Component Versioning System
**Effort:** 1.5 hours  
**Impact:** Track design/code evolution, prevent rework

**Structure:**
```
components/
├── button/
│   ├── v1/
│   │   ├── design-spec.md
│   │   ├── implementation.html
│   │   └── audit-report.md
│   ├── v2/
│   │   └── ...
│   └── CHANGELOG.md
```

---

### #10: Automate a11y Testing with Tools
**Effort:** 3-4 hours  
**Impact:** Complement Nova's manual audit, catch issues earlier

**Tools:**
- axe DevTools (Chrome extension) — automated a11y scanning
- Lighthouse CI — performance regression detection
- WAVE (WebAIM) — accessibility evaluation

Nova runs these in `audit-a11y.md` before manual review.

---

## 🗓️ Implementation Timeline

```
Week 1 (April 7-11)
├─ #1: Add task blockers (15 min)
├─ #3: Add Iris to component workflow (45 min)
├─ #4: Simplify handoff sections (30 min)
└─ #5: Document scaling limits (20 min)

Week 2 (April 14-18)
├─ #2: Consolidate responsive + a11y audits (2h)
├─ #6: Create unified checklist template (1h)
└─ #7: Link templates to tasks (1.5h)

Week 3 (April 21-25)
├─ #8: Add performance budget tracking (2h)
└─ #9: Create component versioning (1.5h)

Week 4 (April 28-May 2)
└─ #10: Automate a11y testing (3-4h)
```

---

## 📈 Expected Impact

| Metric | Before | After | Gain |
|--------|--------|-------|------|
| **Audit time per page** | 2h (Rio + Nova sequential) | 1.5h (Rio + Nova parallel) | **25% faster** |
| **Component workflow** | 2 days (without Iris) | 2.5 days (with Iris) | **Complete specs** |
| **Workflow clarity** | Verbose handoffs | Concise references | **Better scannability** |
| **Scaling limit** | Unknown | 2-3 concurrent components | **Documented bottlenecks** |
| **Efficiency gain** | Baseline | 20-30% | **Net improvement** |

---

**Last updated:** 2026-04-07  
**Owner:** Visual Design Squad (Stella + Iris + Claude + Rio + Nova)  
**Status:** Ready for phased rollout
