# Story 6.1 — Component Inventory (Atomic Design)

## Complete Component Hierarchy for Analytics Module

---

## 🔴 ATOMS (Base Components — 18 total)

### Layout & Structure
1. **Container**
   - Padding: 16px (md), 24px (lg)
   - Max-width: 1280px
   - Used in: All pages

2. **Divider**
   - Color: #E5E5E5
   - Height: 1px
   - Margin: 24px 0

3. **Grid**
   - Default: 12-column
   - Responsive: 4-col (mobile), 8-col (tablet), 12-col (desktop)
   - Gutter: 16px

### Typography
4. **Heading1** (H1)
   - Font-size: 32px
   - Font-weight: bold
   - Line-height: 1.2
   - Used in: Page titles

5. **Heading2** (H2)
   - Font-size: 24px
   - Font-weight: bold
   - Line-height: 1.2
   - Used in: Section titles

6. **Body** (P)
   - Font-size: 14px
   - Font-weight: regular
   - Line-height: 1.5
   - Color: #333

7. **BodySmall**
   - Font-size: 12px
   - Font-weight: regular
   - Line-height: 1.4
   - Color: #666

8. **Caption** (time, metadata)
   - Font-size: 12px
   - Font-weight: regular
   - Color: #999
   - Letter-spacing: 0.5px

9. **Monospace** (code, numbers)
   - Font-family: 'Monaco', 'Courier New'
   - Font-size: 12px

### Interactive Elements
10. **Button (Primary)**
    - Bg: #FF1493 (Instagram Pink)
    - Text: white
    - Padding: 8px 16px
    - Border-radius: 4px
    - Hover: Darker shade #E60C8A
    - Focus: 2px outline #FF1493
    - Disabled: Opacity 0.5

11. **Button (Secondary)**
    - Bg: #F0F0F0
    - Text: #333
    - Border: 1px #DDD
    - Same padding & radius as Primary
    - Hover: #E5E5E5 background

12. **Button (Ghost)**
    - Bg: transparent
    - Text: #FF1493
    - Border: none
    - Hover: Bg #F9F9F9

13. **Link**
    - Color: #FF1493
    - Text-decoration: none
    - Border-bottom: 1px dashed
    - Hover: Underline solid
    - Focus: 2px outline

14. **Icon**
    - Size: 16px (small), 24px (medium), 32px (large)
    - Color: Inherits from parent or #333
    - Set: 20+ common icons (❤️ 💬 💾 📊 👥 📈 🔥 etc)

### Data Display
15. **Badge**
    - Padding: 4px 8px
    - Border-radius: 12px
    - Font-size: 10px
    - Font-weight: bold
    - Variants: status (green/orange/red), category (blue)

16. **Avatar**
    - Size: 40x40px (standard), 24x24px (small)
    - Border-radius: 50%
    - Background: Initials or image
    - Fallback: Gray with initials

17. **TrendIndicator** (Arrow + Percent)
    - Up arrow: ↑ (green #31A24C)
    - Down arrow: ↓ (red #CC0000)
    - Stable: → (gray #999)
    - Format: "↑ +245" or "↓ -10"

18. **Skeleton** (Loading)
    - Bg: #F0F0F0
    - Animation: pulse (opacity 0.5 → 1 → 0.5)
    - Duration: 1.5s infinite

---

## 🟡 MOLECULES (Simple Combinations — 14 total)

### Metric Display
1. **MetricCard**
   - Components: StatValue + Label + TrendIndicator
   - Layout: Vertical stack
   - Padding: 16px
   - Border: 1px #E5E5E5
   - Border-radius: 8px
   - Hover: Shadow 0 2px 8px rgba(0,0,0,0.1)
   - Example: "456 Likes ↑ +211 (vs 145 med)"

2. **MetricWidget**
   - Components: MetricCard + Optional comparison text
   - Size: 200px wide (fits 3 per row on desktop)
   - Used in: Dashboard, Detail view

3. **StatDisplay**
   - Components: Large number (28px bold) + Label (12px)
   - No border, clean layout
   - Used in: Summary cards

4. **EngagementBadge**
   - Components: Icon + Number + optional trend
   - Inline layout
   - Compact: "❤️ 456"
   - Extended: "❤️ 456 (↑ +211)"

### Form Elements
5. **FormField**
   - Components: Label + Input/Select + Error message
   - Padding: 12px
   - Border-radius: 4px
   - Focus: 2px outline

6. **DatePicker**
   - Components: Input + Calendar widget
   - Format: YYYY-MM-DD
   - Inline or popup calendar

7. **TimeframeSelector**
   - Components: Button chip (selected) + Dropdown
   - Options: 7d, 14d, 30d, 90d, Custom
   - Active: #FF1493 background, white text
   - Inactive: #F0F0F0 background

8. **SearchBar**
   - Components: Input + Icon (🔍) + Clear button
   - Padding: 8px 12px
   - Border: 1px #DDD
   - Focus: Border #FF1493

### Navigation & Filtering
9. **SortButton**
   - Components: Label + Dropdown icon (▼)
   - Button styling: Secondary
   - On click: Shows sort options
   - Selected: "Sort: ↓ Recent"

10. **FilterButton**
    - Components: Label + Dropdown icon (▼)
    - Button styling: Secondary
    - On click: Shows filter panel
    - Active: Badge shows count of active filters

11. **DropdownMenu**
    - Components: Button + Menu items list
    - Menu bg: white
    - Menu border: 1px #DDD
    - Item padding: 12px 16px
    - Hover: #F5F5F5 background
    - Selected: Checkmark + primary color text

12. **Pagination**
    - Components: Page numbers + Previous/Next buttons
    - Layout: "Mostrando 3 de 30" + [← Anterior] [Próxima →]
    - Disabled: Opacity 0.5

### Comments & Interactions
13. **Comment**
    - Components: Avatar + Username + Time + Text + Likes + Reply button
    - Padding: 12px
    - Border-bottom: 1px #E5E5E5
    - Avatar size: 32x32px
    - Hover: Bg #FAFAFA

14. **Notification**
    - Components: Icon + Message + Close button
    - Variants: success (green), error (red), info (blue)
    - Position: Top-right
    - Auto-dismiss: 4 seconds

---

## 🟢 ORGANISMS (Complex UI Sections — 10 total)

### Headers & Navigation
1. **PageHeader**
   - Components: Title (H1) + Subtitle + Right-side actions
   - Padding: 24px
   - Border-bottom: 1px #E5E5E5
   - Layout: Flex with space-between

2. **AnalyticsHeader**
   - Components: PageHeader + Profile name + Timeframe selector
   - Profile format: "estela_fernandes (estela_fernandes)"

3. **SubHeader**
   - Components: Breadcrumb + Sort + Filter + Actions
   - Padding: 16px
   - Layout: Flex, wrapped on mobile

### Data Display
4. **MetricsGrid**
   - Components: 3x2 grid of MetricCards (desktop) or responsive
   - Gap: 16px
   - Responsive breakpoints:
     - Mobile: 1 column
     - Tablet: 2 columns
     - Desktop: 3 columns

5. **StatsPanel**
   - Components: 3 StatDisplay cards (Total Gained, Avg Per Week, Growth Rate)
   - Layout: Horizontal row
   - Border: 1px #E5E5E5
   - Padding: 20px
   - BG: #FAFAFA

6. **DataTable**
   - Components: Sortable table with rows
   - Header: Bg #FAFAFA, font-weight bold
   - Rows: Border-bottom #E5E5E5
   - Cell padding: 12px
   - Hover: Bg #F5F5F5
   - Alternate row colors: Optional (helps readability)

7. **Chart**
   - Components: SVG/Canvas chart + Legend + Tooltip
   - Library: Recharts recommended
   - Responsive: Max-width 100%, maintains aspect ratio
   - Tooltip: Shows on hover with exact values

### Cards & Containers
8. **PostCard**
   - Components: Thumbnail (60x60) + Caption preview + Date + Metrics row + View Details link
   - Padding: 16px
   - Border: 1px #E5E5E5
   - Border-radius: 8px
   - Layout: Horizontal flex
   - Hover: Shadow elevation

9. **MediaPanel**
   - Components: Full-size media display + Navigation buttons
   - Media size: 400px width (desktop)
   - Navigation: Previous/Next buttons + Slide indicator
   - Border-radius: 8px
   - BG: #F0F0F0 (while loading)

10. **InsightsPanel**
    - Components: 3-4 insight bullets + recommendations
    - Icon + Text per insight
    - Padding: 20px
    - Border-left: 4px primary color
    - BG: #FFFAF0 (light yellow background)

---

## 🔵 TEMPLATES (Page Layouts — 4 total)

### Layout Structure
1. **AnalyticsDashboard Template**
   ```
   PageHeader
   ├─ H1: "Analytics Dashboard"
   ├─ Subtitle: Profile name
   └─ TimeframeSelector
   
   Content Grid:
   ├─ MetricsGrid (6 cards)
   ├─ Divider
   ├─ Chart (Engagement Trend)
   └─ QuickActionsBar (4 buttons)
   
   Footer:
   └─ LastUpdated + NextUpdateTime
   ```

2. **PostsHistory Template**
   ```
   SubHeader
   ├─ H2: "Post Performance"
   ├─ SortButton
   └─ FilterButton
   
   Content:
   └─ PostsList (vertical stack of PostCards)
   
   Footer:
   └─ Pagination
   ```

3. **GrowthChart Template**
   ```
   PageHeader
   ├─ H2: "Crescimento de Followers"
   └─ PeriodSelector (12 semanas)
   
   Content:
   ├─ Chart (Line chart)
   ├─ StatsPanel
   ├─ DataTable (Weekly data)
   └─ InsightsPanel
   ```

4. **PostDetails Template**
   ```
   PageHeader
   ├─ H2: "Post Details"
   ├─ Publication date
   └─ Actions (Back, Share)
   
   TwoColumnLayout:
   ├─ Left (35%): MediaPanel
   └─ Right (65%):
       ├─ CaptionPanel
       ├─ EngagementGrid
       ├─ EngagementChart
       ├─ TimelineTable
       ├─ EngagementTypeBreakdown
       └─ CommentsSection
   
   Footer:
   └─ InsightsPanel + Actions
   ```

---

## 📐 Design System Parameters

### Colors (Complete Palette)
```
Primary Brand:
  - #FF1493 (Instagram Pink) - CTAs, highlights
  - #405DE6 (Instagram Blue) - Secondary
  - #5B51D8 (Purple) - Accents
  
Status:
  - #31A24C (Green) - Up/positive
  - #FFA500 (Orange) - Neutral/warning
  - #CC0000 (Red) - Down/negative
  - #4CAF50 (Light Green) - Good
  - #FF6B6B (Light Red) - Low
  
Neutrals:
  - #FAFAFA (Bg light)
  - #F5F5F5 (Bg slightly darker)
  - #F0F0F0 (Bg cards)
  - #E5E5E5 (Border)
  - #999999 (Text secondary)
  - #666666 (Text tertiary)
  - #333333 (Text primary)
  - #1A1A1A (Text dark)
```

### Spacing Scale
```
Base unit: 8px

xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 48px
3xl: 64px
```

### Typography Scale
```
H1: 32px / 700 / 1.2
H2: 24px / 700 / 1.2
H3: 18px / 700 / 1.2
Body: 14px / 400 / 1.5
BodySmall: 12px / 400 / 1.4
Caption: 12px / 400 / 1.4
Monospace: 12px / 400 / 1.4

Font family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
```

### Border Radius
```
sm: 4px (inputs, buttons)
md: 6px (cards)
lg: 8px (containers)
full: 50% (avatars)
```

### Shadows
```
sm: 0 1px 2px rgba(0,0,0,0.05)
md: 0 4px 6px rgba(0,0,0,0.07)
lg: 0 10px 15px rgba(0,0,0,0.1)
xl: 0 20px 25px rgba(0,0,0,0.15)
```

### Breakpoints
```
Mobile: < 640px
Tablet: 640px - 1024px
Desktop: > 1024px
```

---

## 🚀 Implementation Guide

### For @dev (Estela):

**Phase 1: Setup Design System**
- Create Tailwind config with tokens above (colors, spacing, typography)
- Create CSS custom properties (--color-primary, --space-md, etc)
- Create base component library with 18 atoms

**Phase 2: Build Molecules**
- Combine atoms into 14 molecules
- Test props and variants
- Add unit tests for each molecule

**Phase 3: Compose Organisms**
- Build 10 organism components using molecules
- Test responsive behavior
- Add accessibility checks (WCAG AA)

**Phase 4: Templates**
- Create 4 page templates
- Connect to API endpoints (Story 6.1 backend)
- Add state management for filters/sorts

**Phase 5: Quality Assurance**
- Run visual regression tests
- Check a11y (axe-core)
- Performance audit (Lighthouse)
- Cross-browser testing

---

## 📝 Component File Structure

```
src/components/
├── atoms/
│   ├── Button.tsx
│   ├── Icon.tsx
│   ├── Avatar.tsx
│   ├── Badge.tsx
│   ├── Divider.tsx
│   └── ... (18 total atoms)
│
├── molecules/
│   ├── MetricCard.tsx
│   ├── Comment.tsx
│   ├── PostCard.tsx
│   ├── TimeframeSelector.tsx
│   └── ... (14 total molecules)
│
├── organisms/
│   ├── MetricsGrid.tsx
│   ├── DataTable.tsx
│   ├── Chart.tsx
│   ├── PostsList.tsx
│   └── ... (10 total organisms)
│
├── templates/
│   ├── DashboardTemplate.tsx
│   ├── PostsHistoryTemplate.tsx
│   ├── GrowthChartTemplate.tsx
│   └── PostDetailsTemplate.tsx
│
├── pages/
│   ├── Dashboard.tsx
│   ├── PostsHistory.tsx
│   ├── GrowthChart.tsx
│   └── PostDetails.tsx
│
├── styles/
│   ├── tokens.css (design tokens)
│   ├── typography.css
│   └── animations.css
│
└── types/
    └── analytics.ts (TypeScript interfaces)
```

---

## ✅ Completion Checklist (for @dev)

- [ ] All 18 atoms created + tested
- [ ] All 14 molecules created + tested
- [ ] All 10 organisms created + tested
- [ ] All 4 templates connected to pages
- [ ] Responsive design tested (3 breakpoints)
- [ ] Accessibility audit passed (WCAG AA)
- [ ] Unit tests: 90%+ coverage
- [ ] Visual regression tests pass
- [ ] Performance: Lighthouse score > 90
- [ ] Cross-browser testing: Chrome, Firefox, Safari, Edge
- [ ] Storybook documentation created
- [ ] Ready for QA gate

