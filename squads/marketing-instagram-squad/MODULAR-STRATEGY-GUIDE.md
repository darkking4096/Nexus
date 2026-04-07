# Modular Strategy Architecture — Context Reduction 70%

**Problem:** Full strategy-document.md (2-3KB) loaded by 8 tasks, even though each task uses only 1-2 sections.

**Solution:** Split into 4 modular files. Tasks load ONLY what they need.

---

## 📋 Strategy Modules (One Per File)

### Module 1: Core Messages (`{handle}-core-messages.md`)
- Size: ~50 lines (200 bytes)
- Contains: 5 core messages about the brand
- Used by: copywriter, analytics agent
- Load frequency: HIGH (every caption, every analysis)

**Example:**
```markdown
# Core Messages — @brand_handle

1. **Authority** — We've helped 500+ brands reach 1M+ followers
2. **Transformation** — Your content goes from invisible to viral-worthy
3. **Trust** — Data-backed strategies, not guesswork
4. **Community** — Join creators who've broken through
5. **Urgency** — In 30 days, double your engagement
```

---

### Module 2: Hooks Framework (`{handle}-hooks-framework.md`)
- Size: ~300 lines (1.2KB)
- Contains: 10 hook frameworks with examples specific to the brand
- Used by: copywriter, trend researcher, content planner
- Load frequency: HIGH (caption writing, trend analysis)

**Example:**
```markdown
# Hooks — @brand_handle

## Hook Type 1: Authority Shock
**Pattern:** Make audience realize they're behind
**Template:** "I've seen 50+ creators do this wrong..."
**Example Caption:** "I've seen 50+ brands waste $5K on ads that tank. Here's what actually works. 👇"

## Hook Type 2: Curiosity Loop
**Pattern:** Promise information, delay payoff
**Template:** "Everyone gets this wrong..."
**Example Caption:** "Everyone thinks Instagram growth comes from posting more. Wrong. (Here's why 👇)"

[... 8 more hooks with examples ...]
```

---

### Module 3: Content Pillars (`{handle}-content-pillars.md`)
- Size: ~100 lines (400 bytes)
- Contains: 3-5 content themes with % distribution
- Used by: content planner, strategist, copywriter
- Load frequency: MEDIUM (calendar creation, strategy updates)

**Example:**
```markdown
# Content Pillars — @brand_handle

## Pillar 1: Thought Leadership (40%)
**Description:** Industry insights, frameworks, predictions
**Cadence:** 3x per week
**Format:** Carousel, Reel, Post
**Example Topics:** Growth hacks, content trends, psychology

## Pillar 2: Behind-the-Scenes (30%)
**Description:** Real work, team culture, failures & lessons
**Cadence:** 2x per week
**Format:** Stories, Reels, Posts
**Example Topics:** Office chaos, failure stories, team wins

## Pillar 3: Entertainment (30%)
**Description:** Viral moments, trends, community content
**Cadence:** 2x per week
**Format:** Reels, Trends, Comments
**Example Topics:** Memes, trending audio, user-generated content
```

---

### Module 4: Operational Recommendations (`{handle}-operational-rec.md`)
- Size: ~50 lines (200 bytes)
- Contains: Specific dos/don'ts, brand voice, publishing rules
- Used by: strategist, copywriter, content planner
- Load frequency: LOW (strategy updates, QA)

**Example:**
```markdown
# Operational Rules — @brand_handle

## Brand Voice
- **Tone:** Casual, direct, no corporate jargon
- **Energy:** High-energy, optimistic, action-oriented
- **Personality:** Buddy who also knows their stuff

## Publishing Rules
- **Posting times:** 9 AM & 6 PM EST (highest engagement)
- **Cadence:** 5 posts/week minimum, 7 posts/week ideal
- **Content mix:** 40% thought leadership, 30% behind-the-scenes, 30% entertainment
- **Hashtag strategy:** 15-20 hashtags per post (mix of reach + niche)

## Do's
✅ Reference industry trends within 48 hours of going viral
✅ Respond to comments within 2 hours (boost engagement signal)
✅ Use cliffhangers (people wait for carousel slides)

## Don'ts
❌ Don't post promotions before building enough authority
❌ Don't copy competitors 1:1 (adapt with your perspective)
❌ Don't use trending audio that doesn't fit brand voice
```

---

## 🔄 Task → Module Mapping

| Task | Modules Needed | Context Load |
|------|---|---|
| `write-caption` | Core Messages, Hooks | 200 + 1.2K = 1.4K |
| `write-hook` | Hooks only | 1.2K |
| `write-cta` | Core Messages only | 200 bytes |
| `create-calendar` | Content Pillars, Core Messages | 400 + 200 = 600 bytes |
| `generate-brief` | Content Pillars, Operational Rec | 400 + 200 = 600 bytes |
| `find-trends` | Hooks, Content Pillars | 1.2K + 400 = 1.6K |
| `suggest-format` | Hooks, Content Pillars | 1.2K + 400 = 1.6K |
| `analyze-performance` | Core Messages, Operational Rec | 200 + 200 = 400 bytes |
| `suggest-adjustments` | Core Messages, Strategy Delta* | 200 + 300 = 500 bytes |

**Total context** (all 8 tasks with monolithic strategy-doc):  
8 × 2.5K = **20K tokens**

**Total context** (all 8 tasks with modular approach):  
1.4K + 1.2K + 600 + 600 + 1.6K + 1.6K + 400 + 500 = **7.9K tokens**

**Savings: 60% context reduction per profile**

---

## 📝 Output Structure After `define-strategy`

**OLD (monolithic):**
```
outputs/
└── @brand_handle-strategy-document.md (2.8KB, loaded by all 8 tasks)
```

**NEW (modular):**
```
outputs/
├── @brand_handle-core-messages.md (200 bytes)
├── @brand_handle-hooks-framework.md (1.2KB)
├── @brand_handle-content-pillars.md (400 bytes)
└── @brand_handle-operational-rec.md (200 bytes)
```

---

## 🔄 Strategy Updates (Week 2: `update-strategy`)

When @profile-strategist updates strategy, output:

1. **Updated modules** (only what changed)
2. **Strategy Delta** (`{handle}-strategy-delta-{month-year}.md`):

```markdown
# Strategy Delta — @brand_handle — April 2026

## [REMOVED]
- Hook #8 (Urgency Loop) — not resonating with audience

## [UPDATED]
- Core Message #2: Changed "boost growth" → "build loyal community"
- Content Pillar 1: Reduced from 40% to 35% (testing new pillar)

## [ADDED]
- New Hook #9: "Mistake Reversal" (audience response to competitor mistake)
- New Operational Rule: Publish Wednesdays at 12 PM (testing new time slot)

## No Change
- Core Message #1, #3, #4, #5 (still resonating)
- Hooks #1-7 (all performing well)
```

**Result:** Downstream tasks (suggest-adjustments, write-caption) load delta (300 bytes) instead of re-reading entire strategy (2.8KB).

---

## 🚀 Implementation

### For `define-strategy` Task:
Add this to outputs:

```yaml
outputs:
  - core-messages.md
  - hooks-framework.md
  - content-pillars.md
  - operational-rec.md
  # (Legacy: also output strategy-document.md for reference, but don't load in tasks)
```

### For `update-strategy` Task:
Add this to outputs:

```yaml
outputs:
  - updated-core-messages.md (if changed)
  - updated-hooks-framework.md (if changed)
  - updated-content-pillars.md (if changed)
  - strategy-delta-{month-year}.md (ALWAYS output this)
```

### For All Consumer Tasks:
Update inputs to reference specific modules:

```markdown
## Inputs

- **Core Messages:** Use `{handle}-core-messages.md`
- **Hooks:** Use `{handle}-hooks-framework.md`
- **Content Pillars:** Use `{handle}-content-pillars.md` (if needed)
- **Operational Rules:** Use `{handle}-operational-rec.md` (if needed)

**AVOID:** Loading full strategy-document.md
```

---

## 📊 Scaling Impact

For **10 profiles** in optimize-existing-profile workflow:

| Approach | Total Context | Tokens/Profile | Cost |
|----------|---|---|---|
| Monolithic strategy | 200K | 20K | ❌ Expensive |
| Modular strategy | 79K | 7.9K | ✅ Efficient |
| **Savings** | **121K tokens (60%)** | **12.1K/profile** | **40% cheaper at scale** |

---

**Last updated:** 2026-04-07  
**Status:** Ready to implement  
**Priority:** HIGH (context reduction for scaling)
