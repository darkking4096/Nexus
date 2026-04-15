# Story 6.1 — High-Fidelity Wireframes Handoff Package for @dev (Estela)

**Prepared by:** Uma (UX-Design Expert)  
**For:** @dev (Estela) — Implementation  
**Project:** NEXUS Analytics Dashboard (Story 6.1)  
**Fidelity Level:** High-Fidelity (Ready for Development)  
**Date:** 2026-04-15

---

## 📦 What You're Getting

This handoff package contains **complete, production-ready wireframes** for the analytics module. Everything is designed at **High-Fidelity** level, meaning you have:

✅ Detailed layout specifications  
✅ Component inventory with atomic design structure  
✅ Exact spacing and typography scales  
✅ Color tokens and design system parameters  
✅ Interaction flows and user scenarios  
✅ Accessibility requirements (WCAG AA)  
✅ Mobile responsiveness breakpoints  
✅ Data requirements and API contracts  

---

## 🎯 Your Implementation Challenge

You're building a **4-page analytics dashboard** that displays Instagram metrics for user Marina:

**Page 1: Dashboard**
- 6 metric cards (followers, engagement, reach, etc.)
- Engagement trend line chart (7 days)
- Quick action buttons
- Timeframe selector (7d/14d/30d/90d/custom)

**Page 2: Posts History**
- List of 30 posts with thumbnails
- Sort and filter options
- Engagement metrics per post
- Links to detailed post view
- Infinite scroll / pagination

**Page 3: Growth Chart**
- Line chart of follower growth (12 weeks)
- Summary stats (total gained, avg/week, growth %)
- Weekly data table
- Auto-generated insights
- Drill-down to week details

**Page 4: Post Details**
- Full-size media preview (carousel support)
- Caption and metadata
- Detailed engagement metrics
- Timeline of engagement over time
- Top comments section
- Engagement breakdown (likes/comments/saves/shares)
- Performance insights

---

## 📚 Files in This Package

```
outputs/wireframes/story-6.1-analytics/
├── 01-dashboard-wireframe.md           ← Start here: Dashboard layout + annotations
├── 02-posts-history-wireframe.md       ← Posts list, sort, filter
├── 03-growth-chart-wireframe.md        ← Growth visualization
├── 04-post-details-wireframe.md        ← Detailed post metrics
├── 05-component-inventory.md           ← 18 atoms + 14 molecules + 10 organisms
├── 06-interaction-flows.md             ← Navigation flows + user scenarios
└── 07-handoff-package.md               ← This file
```

---

## 🚀 Quick Start for @dev

### Step 1: Read These First (15 min)
1. Skim **01-dashboard-wireframe.md** to see what you're building
2. Read the "Components (Atomic Design)" section to understand structure
3. Look at the "Design Tokens" section for colors/spacing/typography

### Step 2: Understand the Component Hierarchy (20 min)
1. Open **05-component-inventory.md**
2. Review the 18 atoms — these are your building blocks
3. Review the 14 molecules — these combine atoms
4. Review the 10 organisms — these form the page sections

### Step 3: Get the Full Context (30 min)
1. Read **06-interaction-flows.md** to understand user journeys
2. Note the 4 primary flows and mobile considerations
3. Check keyboard navigation and error handling

### Step 4: Start Building
1. Set up your design tokens in Tailwind config
2. Create atoms first (buttons, cards, icons, etc.)
3. Compose molecules from atoms
4. Build organism components
5. Connect to API endpoints from Story 6.1 backend

---

## 🎨 Design System at a Glance

### Color Palette
```
Primary: #FF1493 (Instagram Pink) — All CTAs, highlights
Secondary: #405DE6 (Instagram Blue) — Accents
Success: #31A24C (Green) — Up/positive trends
Warning: #FFA500 (Orange) — Neutral/warning
Error: #CC0000 (Red) — Down/negative
Neutral bg: #FAFAFA, #F0F0F0
Text: #333 (primary), #666 (secondary), #999 (tertiary)
```

### Spacing System
```
Base: 8px
Scale: 4px (xs), 8px (sm), 16px (md), 24px (lg), 32px (xl)
Use for: Padding, margins, gaps
```

### Typography
```
H1: 32px / bold / 1.2 line-height
H2: 24px / bold / 1.2 line-height
Body: 14px / regular / 1.5 line-height
Small: 12px / regular / 1.4 line-height
Font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto
```

### Breakpoints
```
Mobile: < 640px (1 column metrics)
Tablet: 640-1024px (2 column metrics)
Desktop: > 1024px (3 column metrics)
```

---

## 🔗 API Contract (Backend Interface)

The backend from Story 6.1 provides these endpoints:

### Dashboard Metrics
```
GET /api/analytics/{profileId}/metrics?timeframe=30d

Response:
{
  "current": {
    "followers": 12450,
    "engagement_rate": 4.2,
    "total_reach_30d": 45230,
    "avg_comments": 23,
    "avg_likes": 145,
    "avg_saves": 18
  },
  "history": [
    { "date": "2026-04-14", "followers": 12245, "engagement_rate": 4.0 }
    // ... 29 more entries for 30 days
  ]
}
```

### Posts List
```
GET /api/analytics/{profileId}/posts?limit=10&offset=0

Response:
{
  "posts": [
    {
      "id": "123456",
      "media_type": "carousel",
      "caption": "Text here...",
      "published_at": "2026-04-14T18:45:00Z",
      "thumbnail_url": "https://...",
      "metrics": {
        "likes": 456,
        "comments": 34,
        "saves": 15,
        "reach": 2100,
        "engagement_rate": 7.2
      }
    }
    // ... 9 more posts
  ],
  "total": 30
}
```

### Post Details
```
GET /api/analytics/{profileId}/posts/{postId}

Response:
{
  "id": "123456",
  "media_type": "carousel",
  "caption": "Caption here...",
  "published_at": "2026-04-14T18:45:00Z",
  "media_urls": ["url1", "url2", "url3", "url4"],
  "location": "São Paulo, SP",
  "mentioned_users": ["user1", "user2"],
  "hashtags": ["hashtag1", "hashtag2"],
  "metrics": {
    "likes": 456,
    "comments": 34,
    "saves": 15,
    "shares": 197,
    "reach": 2100,
    "impressions": 3400,
    "engagement_rate": 7.2,
    "views": null  // for carousel
  },
  "timeline": [
    { "hours_after": 1, "likes": 45, "comments": 3, "saves": 2, "reach": 240, "engagement_rate": 6.2 },
    // ... data points for 24+ hours
  ],
  "top_comments": [
    {
      "user": { "id": "u1", "username": "user_name", "avatar_url": "..." },
      "text": "Great post!",
      "created_at": "2026-04-14T20:30:00Z",
      "likes": 12
    }
    // ... 2 more top comments
  ]
}
```

### Growth Data
```
GET /api/analytics/{profileId}/growth?weeks=12

Response:
{
  "summary": {
    "total_gained": 850,
    "avg_per_week": 71,
    "growth_rate_percentage": 6.8,
    "trend": "up"
  },
  "weeks": [
    {
      "week_start": "2026-04-21",
      "week_end": "2026-04-27",
      "followers_count": 12450,
      "followers_gained": 245,
      "growth_percentage": 2.0,
      "status": "excellent"
    }
    // ... 11 more weeks (backwards in time)
  ]
}
```

---

## 🎬 User Stories Driving the Design

### User 1: Marina (Instagram Creator)
**Goal:** Monitor if her content strategy is working  
**Problem:** Too many Instagram-only insights, needs integrated view  
**Solution:** Dashboard showing key metrics + drill-down to post details  

**Key Actions:**
1. Check overall growth trend
2. Identify best-performing posts
3. Understand which content types perform best
4. Make data-driven content decisions

### User 2: Marina's Content Planner
**Goal:** Plan content calendar based on performance data  
**Problem:** Not knowing which types of content to prioritize  
**Solution:** Growth chart shows weekly trends, post details show engagement breakdown  

**Key Actions:**
1. See follower growth patterns by week
2. Identify which posts get most engagement
3. Spot patterns (carousel > photos, etc.)
4. Plan next month's content strategy

---

## 🚦 Implementation Priorities

### Must Have (Scope of Story 6.1)
- [x] Dashboard with 6 metric cards
- [x] Timeframe selector (7d/14d/30d/90d)
- [x] Engagement trend chart (7 days)
- [x] Posts list with sort/filter
- [x] Post details view
- [x] Growth chart (12 weeks)
- [x] All atoms + molecules + organisms
- [x] Responsive design (mobile/tablet/desktop)
- [x] Accessibility (WCAG AA)

### Should Have (Post-Story 6.1)
- [ ] Dark mode support
- [ ] Export analytics as PDF
- [ ] Email report scheduling
- [ ] Comparison with previous periods
- [ ] Advanced filters (by hashtag, mention, etc.)
- [ ] Trending analysis
- [ ] Competitor comparison

### Nice to Have
- [ ] Animated transitions
- [ ] Customizable dashboard layout
- [ ] Advanced data export (CSV, JSON)
- [ ] Real-time notifications
- [ ] Instagram Stories analytics

---

## 📋 Development Checklist

### Phase 1: Design System Setup (1-2 days)
- [ ] Create Tailwind config with design tokens
- [ ] Set up CSS custom properties
- [ ] Create base component styles
- [ ] Set up Storybook for documentation

### Phase 2: Build Atoms (2-3 days)
- [ ] Button (Primary, Secondary, Ghost variants)
- [ ] Icon system (20+ common icons)
- [ ] Avatar component
- [ ] Badge component
- [ ] Card container
- [ ] Divider
- [ ] Skeleton loader
- [ ] ... (18 total atoms)
- [ ] Unit tests for each atom

### Phase 3: Build Molecules (3-4 days)
- [ ] MetricCard (value + label + trend)
- [ ] MetricWidget (card in grid)
- [ ] EngagementBadge
- [ ] PostCard (thumbnail + metrics)
- [ ] TimeframeSelector (dropdown)
- [ ] SortButton
- [ ] FilterButton
- [ ] DropdownMenu
- [ ] Comment component
- [ ] DataTable
- [ ] ... (14 total molecules)
- [ ] Unit tests for each molecule

### Phase 4: Build Organisms (3-4 days)
- [ ] MetricsGrid (3x2 cards)
- [ ] Chart component (Recharts)
- [ ] PostsList
- [ ] DataTable (sortable, filterable)
- [ ] PageHeader
- [ ] SubHeader (with sort/filter)
- [ ] StatsPanel (3 cards)
- [ ] InsightsPanel
- [ ] MediaPanel (carousel)
- [ ] CommentsSection
- [ ] ... (10 total organisms)
- [ ] Integration tests

### Phase 5: Build Pages & Connect API (3-4 days)
- [ ] Dashboard page
- [ ] Posts History page
- [ ] Growth Chart page
- [ ] Post Details page
- [ ] Connect to API endpoints
- [ ] State management (Context API or Zustand)
- [ ] Error handling
- [ ] Loading states

### Phase 6: Quality & Polish (2-3 days)
- [ ] Responsive testing (3 breakpoints)
- [ ] Accessibility audit (axe-core)
- [ ] Performance profiling (Lighthouse)
- [ ] Cross-browser testing
- [ ] Visual regression tests
- [ ] Storybook documentation
- [ ] Code review

### Phase 7: QA Gate (1 day)
- [ ] All tests passing
- [ ] Linting passes
- [ ] TypeScript: no errors
- [ ] Coverage: 90%+ on new code
- [ ] Accessibility: WCAG AA compliant
- [ ] Performance: Lighthouse > 90

---

## 🔗 Dependencies

### Frontend Libraries (Recommended)
```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.x",
  "tailwindcss": "^3.x",
  "recharts": "^2.x",
  "zustand": "^4.x",
  "axios": "^1.x",
  "date-fns": "^2.x",
  "classnames": "^2.x"
}
```

### Testing Libraries
```json
{
  "@testing-library/react": "^14.x",
  "@testing-library/jest-dom": "^6.x",
  "jest": "^29.x",
  "vitest": "^0.x",
  "@axe-core/react": "^4.x"
}
```

### Development Tools
```json
{
  "@storybook/react": "^7.x",
  "typescript": "^5.x",
  "eslint": "^8.x",
  "prettier": "^3.x"
}
```

---

## 🚨 Common Pitfalls to Avoid

1. **Don't hardcode colors** — Use design tokens from tailwind.config.js
2. **Don't build one-off styles** — Use atomic components, not custom CSS
3. **Don't skip accessibility** — WCAG AA is non-negotiable
4. **Don't ignore mobile** — Test on 3 breakpoints minimum
5. **Don't over-engineer** — Build what's needed, not what you think might be needed
6. **Don't skip error handling** — Plan for API failures, timeouts, rate limits
7. **Don't forget loading states** — Every async operation needs visual feedback

---

## 💬 Questions & Clarifications

### Q: Should I build pagination or infinite scroll?
**A:** Infinite scroll with "Load More" button. Fetch next 10 posts on demand. Easier for mobile.

### Q: How often should metrics auto-refresh?
**A:** Manual refresh via [Refresh] button only. Show "Last updated at 15h23" with "Next update in 1h22min" message.

### Q: Should I support multiple profiles?
**A:** Story 6.1 scope: Single profile only. Multi-profile support is future work.

### Q: What about timezone handling for timestamps?
**A:** Display times in user's local timezone. Store all times in UTC in backend. Use date-fns for formatting.

### Q: Should I cache data in localStorage?
**A:** Cache API responses for 1h (metrics), 15min (posts), 24h (post details) using React Query or similar. localStorage for user preferences only.

### Q: How do I handle Instagram's rate limiting?
**A:** Backend handles this (Story 6.1). Frontend: Show toast if rate limit hit, disable refresh for 60s.

---

## 📞 Contact & Support

**Designer (UX-Design Expert - Uma):**
- Questions about wireframes or design decisions
- Accessibility or responsive issues
- Component behavior or interaction flows

**Backend Support (Story 6.1 - @dev):**
- API endpoint questions
- Data format clarifications
- Rate limiting or caching behavior

**QA Support:**
- Testing guidelines
- Acceptance criteria clarification

---

## ✨ Final Notes

This is a **high-fidelity design package**, meaning:

✅ Layouts are proven  
✅ Components are documented  
✅ Interactions are specified  
✅ Accessibility is built-in  
✅ Mobile is considered  
✅ You can start building immediately  

**You don't need to make design decisions.** Just build what's shown. If something doesn't make sense, ask @architect or @pm before deviating from the spec.

**Goal:** Estela implements 4 pages with 42 total components (18 atoms + 14 molecules + 10 organisms) that display real Instagram analytics data from Story 6.1 backend.

**Timeline estimate:** 2-3 weeks for full implementation including QA gate.

---

**Next Steps:**
1. ✅ You've received wireframes (today)
2. 📋 Start with component inventory (tomorrow)
3. 🏗️ Begin building atoms → molecules → organisms (week 1-2)
4. 🔗 Connect API and build pages (week 2-3)
5. 🧪 QA testing and refinement (week 3)
6. 🎉 Ready for story completion

---

**Good luck, Estela!** 🎨👩‍💻

— Uma, desenhando com empatia 💝

