# NEXUS Documentation

**Project:** NEXUS — Multi-Profile Instagram Management Platform  
**Status:** Epic 1 in progress | 3/4 stories complete

---

## 📂 What's Where

### Stories (Development Work)
**Location:** `docs/stories/{id}.story.md`  
**What:** Story description, acceptance criteria, scope, tasks

- [1.1.story.md](stories/1.1.story.md) — Auth & Encryption ✅
- [1.2.story.md](stories/1.2.story.md) — Instagrapi Integration ✅
- [1.3.story.md](stories/1.3.story.md) — Playwright MCP ✅
- [1.4.story.md](stories/1.4.story.md) — Squad Integration (blocked)

### Quality Gates (QA Decisions)
**Location:** `docs/qa/gates/{id}.gate.yaml`  
**What:** Formal QA verdict, checklist results, issues

- [1.2.gate.yaml](qa/gates/1.2.gate.yaml) — ✅ PASS
- [1.3.gate.yaml](qa/gates/1.3.gate.yaml) — ✅ PASS
- [1.4.gate.yaml](qa/gates/1.4.gate.yaml) — 🔴 FAIL (type error)

### Fix Requests (When QA Says FAIL)
**Location:** `docs/qa/fix-requests/QA_FIX_REQUEST_{id}.md`  
**What:** Issue details, solution options, testing checklist

- [QA_FIX_REQUEST_1.3.md](qa/fix-requests/QA_FIX_REQUEST_1.3.md) — 3 critical issues (resolved)
- [QA_FIX_REQUEST_1.4.md](qa/fix-requests/QA_FIX_REQUEST_1.4.md) — TypeScript error (awaiting fix)

### Setup Guides (Integration Instructions)
**Location:** `docs/guides/{feature}.md`  
**What:** How to set up & use each integration

- [instagram-setup.md](guides/instagram-setup.md) — Instagrapi configuration
- [playwright-setup.md](guides/playwright-setup.md) — Playwright browser automation

### Architecture (Technical Design)
**Location:** `docs/architecture/`  
**What:** System design, data models, technical decisions

- [ARCHITECTURE.md](architecture/ARCHITECTURE.md)
- [FULL-STACK-ARCHITECTURE.md](architecture/FULL-STACK-ARCHITECTURE.md)
- [DATA-MODEL.md](architecture/DATA-MODEL.md)

### Requirements (Business Definition)
**Location:** `docs/`  
**What:** Product vision, functional requirements

- [PRD-NEXUS.md](PRD-NEXUS.md) — Full product requirements
- [project-vision.md](project-vision.md) — Vision & goals

---

## 🎯 Quick Links by Role

**@dev (Developer)**
- Start: [1.4.story.md](stories/1.4.story.md) (blocked, waiting for fix)
- Fix: [QA_FIX_REQUEST_1.4.md](qa/fix-requests/QA_FIX_REQUEST_1.4.md)
- Setup: [guides/](guides/)

**@qa (Quality Assurance)**
- Review: [stories/](stories/) (check QA Results section)
- Gate: [qa/gates/](qa/gates/) (create/update verdicts)
- Track: [qa/fix-requests/](qa/fix-requests/) (issues needing fixes)

**@pm / @po (Product)**
- Vision: [project-vision.md](project-vision.md)
- Reqs: [PRD-NEXUS.md](PRD-NEXUS.md)
- Progress: Check [stories/](stories/) QA Results section

---

## 📊 Current Status

| Story | Dev | QA | Action |
|-------|-----|----|--------|
| 1.1 | ✅ | ✅ | Merged |
| 1.2 | ✅ | ✅ | Ready: `@devops *push` |
| 1.3 | ✅ | ✅ | Ready: `@devops *push` |
| 1.4 | 🔄 | 🔴 | Blocked: @dev fix type error |

---

## 🔗 File Structure

```
docs/
├── README.md                    ← YOU ARE HERE
├── PRD-NEXUS.md                (requirements)
├── project-vision.md           (vision)
│
├── stories/                     (development work)
│   ├── 1.1.story.md
│   ├── 1.2.story.md
│   ├── 1.3.story.md
│   └── 1.4.story.md
│
├── qa/                          (quality assurance)
│   ├── gates/                  (formal decisions)
│   │   ├── 1.2.gate.yaml
│   │   ├── 1.3.gate.yaml
│   │   └── 1.4.gate.yaml
│   └── fix-requests/           (when FAIL)
│       ├── QA_FIX_REQUEST_1.3.md
│       └── QA_FIX_REQUEST_1.4.md
│
├── guides/                      (integration setup)
│   ├── instagram-setup.md
│   └── playwright-setup.md
│
└── architecture/                (technical design)
    ├── ARCHITECTURE.md
    ├── FULL-STACK-ARCHITECTURE.md
    └── DATA-MODEL.md
```

---

## ✅ Simple Rules

1. **Story work** → goes in `stories/{id}.story.md`
2. **QA verdict** → goes in `qa/gates/{id}.gate.yaml` (only here)
3. **Dev fix needed** → goes in `qa/fix-requests/QA_FIX_REQUEST_{id}.md` (only when FAIL)
4. **Setup/integration** → goes in `guides/{feature}.md`
5. **Architecture** → goes in `architecture/`
6. **Navigation** → this file (docs/README.md)

**No duplicates. One source of truth for each fact.**

---

Last updated: 2026-04-08
