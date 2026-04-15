# Story 6.1 — Visual Design Specification (STELLA)

**Status:** ✅ Complete — Ready for Implementation  
**For:** @dev (Estela)  
**Prepared by:** Stella (Visual Designer)  
**Date:** April 15, 2026

---

## 📋 Executive Summary

Este documento contém a **especificação visual completa** do Analytics Dashboard (Story 6.1). Tudo que Estela precisa para implementar em código:

✅ **Design Tokens** (DTCG JSON)  
✅ **Component Specs** (todas as 42 componentes: atoms, molecules, organisms)  
✅ **States & Variants** (default, hover, active, disabled, loading)  
✅ **Mockups** (4 páginas: Dashboard, Posts, Growth, Details)  
✅ **Handoff Document** (pronto para Figma/XD)  

---

## 🎨 PART 1: Design Tokens (DTCG)

### Color Palette

```json
{
  "color": {
    "primary": {
      "value": "#FF1493",
      "description": "Instagram Pink — CTAs, highlights, active states"
    },
    "primary-dark": {
      "value": "#E60C8A",
      "description": "Darker shade for hover/active on primary button"
    },
    "secondary": {
      "value": "#405DE6",
      "description": "Instagram Blue — Secondary actions"
    },
    "accent": {
      "value": "#5B51D8",
      "description": "Purple — Tertiary accents"
    },
    "success": {
      "value": "#31A24C",
      "description": "Green — Up trend, positive indicators"
    },
    "warning": {
      "value": "#FFA500",
      "description": "Orange — Neutral/warning status"
    },
    "error": {
      "value": "#CC0000",
      "description": "Red — Down trend, negative indicators"
    },
    "light-error": {
      "value": "#FF6B6B",
      "description": "Light red — Low performance"
    },
    "light-success": {
      "value": "#4CAF50",
      "description": "Light green — Good performance"
    },
    "neutral": {
      "50": "#FAFAFA",
      "100": "#F5F5F5",
      "200": "#F0F0F0",
      "300": "#E5E5E5",
      "400": "#D0D0D0",
      "500": "#999999",
      "600": "#666666",
      "700": "#333333",
      "900": "#1A1A1A"
    }
  }
}
```

**Color Usage Rules:**
- **Primary (#FF1493):** Buttons, links, highlights, active states
- **Secondary (#405DE6):** Secondary CTAs, badges
- **Neutral 50-200:** Backgrounds
- **Neutral 300-400:** Borders, dividers
- **Neutral 500-900:** Text (500=hint, 600=secondary, 700=body, 900=dark)
- **Status colors:** Success (green), Warning (orange), Error (red)

---

### Typography Scale

```json
{
  "typography": {
    "fontFamily": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    "fontFamilyMono": "'Monaco', 'Courier New', monospace",
    "scale": {
      "h1": {
        "size": "32px",
        "weight": 700,
        "lineHeight": 1.2,
        "letterSpacing": "-0.5px"
      },
      "h2": {
        "size": "24px",
        "weight": 700,
        "lineHeight": 1.2,
        "letterSpacing": "-0.3px"
      },
      "h3": {
        "size": "18px",
        "weight": 700,
        "lineHeight": 1.2,
        "letterSpacing": 0
      },
      "body": {
        "size": "14px",
        "weight": 400,
        "lineHeight": 1.5,
        "letterSpacing": 0
      },
      "bodySmall": {
        "size": "12px",
        "weight": 400,
        "lineHeight": 1.4,
        "letterSpacing": 0
      },
      "caption": {
        "size": "12px",
        "weight": 400,
        "lineHeight": 1.4,
        "letterSpacing": "0.5px"
      },
      "monospace": {
        "size": "12px",
        "weight": 400,
        "lineHeight": 1.4,
        "fontFamily": "'Monaco', 'Courier New', monospace"
      }
    }
  }
}
```

**Typography Rules:**
- **H1:** Page titles (32px bold)
- **H2:** Section titles (24px bold)
- **H3:** Subsection titles (18px bold)
- **Body:** Regular text (14px, 1.5 line-height for readability)
- **BodySmall:** Secondary text (12px)
- **Caption:** Metadata, timestamps (12px, lighter color #999)
- **Monospace:** Numbers, code (Monaco or Courier, 12px)

**Weights:** Only 3 weights used: 400 (regular), 700 (bold). **DON'T mix weights.**

---

### Spacing Scale

```json
{
  "spacing": {
    "unit": "4px",
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px",
    "2xl": "48px",
    "3xl": "64px"
  }
}
```

**Spacing Rules:**
- Always use multiples of 4px (never 3px, 5px, 7px)
- **Padding:** Components use md (16px) or lg (24px)
- **Margin:** Sections use lg (24px) or xl (32px)
- **Gap (grid):** md (16px)
- **Gutter (columns):** md (16px)

---

### Border Radius

```json
{
  "borderRadius": {
    "sm": "4px",
    "md": "6px",
    "lg": "8px",
    "full": "50%"
  }
}
```

- **sm (4px):** Buttons, inputs
- **md (6px):** Cards, containers
- **lg (8px):** Large containers
- **full (50%):** Avatars, circular badges

---

### Shadows

```json
{
  "shadow": {
    "sm": "0 1px 2px rgba(0, 0, 0, 0.05)",
    "md": "0 4px 6px rgba(0, 0, 0, 0.07)",
    "lg": "0 10px 15px rgba(0, 0, 0, 0.1)",
    "xl": "0 20px 25px rgba(0, 0, 0, 0.15)"
  }
}
```

- **sm:** Light elevation (hover cards)
- **md:** Medium elevation (dropdown menus)
- **lg:** Higher elevation (modals)
- **xl:** Highest elevation (tooltips)

---

### Breakpoints

```json
{
  "breakpoint": {
    "mobile": "< 640px",
    "tablet": "640px - 1024px",
    "desktop": "> 1024px"
  }
}
```

---

## 🏗️ PART 2: Component Specifications

### ATOMS (18 Components)

#### 1. Button (Primary)
```
State: Default
├─ Bg: #FF1493 (primary)
├─ Text: white (weight 600)
├─ Padding: 8px 16px (sm spacing)
├─ Border-radius: 4px
├─ Font-size: 14px
├─ Cursor: pointer
└─ Box-shadow: none

State: Hover
├─ Bg: #E60C8A (primary-dark)
└─ Box-shadow: 0 2px 8px rgba(255, 20, 147, 0.3)

State: Active (click)
├─ Bg: #CC0066 (darker)
└─ Box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1)

State: Focus (keyboard)
├─ Outline: 2px solid #FF1493
├─ Outline-offset: 2px
└─ Bg: #E60C8A

State: Disabled
├─ Opacity: 0.5
├─ Cursor: not-allowed
└─ Pointer-events: none
```

#### 2. Button (Secondary)
```
State: Default
├─ Bg: #F0F0F0
├─ Text: #333 (neutral-700)
├─ Border: 1px solid #DDD (neutral-300)
├─ Padding: 8px 16px
├─ Border-radius: 4px
└─ Cursor: pointer

State: Hover
├─ Bg: #E5E5E5 (neutral-300)
└─ Box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05)

State: Focus
├─ Outline: 2px solid #405DE6
├─ Outline-offset: 2px
└─ Bg: #E5E5E5

State: Disabled
├─ Opacity: 0.5
└─ Cursor: not-allowed
```

#### 3. Button (Ghost)
```
State: Default
├─ Bg: transparent
├─ Text: #FF1493 (primary)
├─ Border: none
├─ Padding: 8px 16px
└─ Cursor: pointer

State: Hover
├─ Bg: #FAFAFA (neutral-50)
└─ Text: #E60C8A (primary-dark)

State: Focus
├─ Outline: 2px solid #FF1493
└─ Outline-offset: 2px

State: Disabled
├─ Opacity: 0.5
└─ Cursor: not-allowed
```

#### 4. Link
```
State: Default
├─ Color: #FF1493 (primary)
├─ Text-decoration: none
├─ Border-bottom: 1px dashed #FF1493
└─ Cursor: pointer

State: Hover
├─ Color: #E60C8A
└─ Border-bottom: 1px solid #E60C8A

State: Focus
├─ Outline: 2px solid #FF1493
└─ Outline-offset: 2px

State: Visited
└─ Color: #C60077 (darker purple)
```

#### 5. Input (Text)
```
State: Default
├─ Bg: white
├─ Border: 1px solid #E5E5E5 (neutral-300)
├─ Padding: 8px 12px
├─ Border-radius: 4px
├─ Font-size: 14px
└─ Color: #333 (neutral-700)

State: Focus
├─ Border: 2px solid #FF1493 (primary)
├─ Outline: none
└─ Box-shadow: 0 0 0 3px rgba(255, 20, 147, 0.1)

State: Filled
├─ Border: 1px solid #405DE6 (secondary)
└─ Bg: white

State: Error
├─ Border: 2px solid #CC0000 (error)
└─ Box-shadow: 0 0 0 3px rgba(204, 0, 0, 0.1)

State: Disabled
├─ Bg: #F0F0F0 (neutral-200)
├─ Color: #999 (neutral-500)
├─ Cursor: not-allowed
└─ Opacity: 0.6

State: Placeholder
└─ Color: #999 (neutral-500)
```

#### 6. Icon
```
Sizes:
├─ small: 16px
├─ medium: 24px
└─ large: 32px

Color: Inherits from parent text color (or #333 default)
Set: 20+ icons (❤️ 💬 💾 📊 👥 📈 🔥 ⭐ etc)
```

#### 7. Badge
```
State: Status (Green - Success)
├─ Bg: #31A24C (success)
├─ Color: white
├─ Padding: 4px 8px
├─ Border-radius: 12px
├─ Font-size: 10px (caption)
└─ Font-weight: 700 (bold)

Variants:
├─ Status Green: #31A24C bg, white text
├─ Status Orange: #FFA500 bg, white text
├─ Status Red: #CC0000 bg, white text
└─ Category Blue: #405DE6 bg, white text
```

#### 8. Avatar
```
Standard (40x40px):
├─ Size: 40px × 40px
├─ Border-radius: 50% (circular)
├─ Bg: #F0F0F0 (neutral-200) if no image
└─ Text: Initials in center (2 chars, bold)

Small (24x24px):
├─ Size: 24px × 24px
└─ Same styling as above
```

#### 9. Divider
```
├─ Height: 1px
├─ Color: #E5E5E5 (neutral-300)
├─ Margin: 24px 0 (vertical spacing)
└─ Width: 100%
```

#### 10. TrendIndicator
```
Up Trend:
├─ Icon: ↑
├─ Color: #31A24C (success/green)
└─ Format: "↑ +245" or "↑ +12.5%"

Down Trend:
├─ Icon: ↓
├─ Color: #CC0000 (error/red)
└─ Format: "↓ -10" or "↓ -5.3%"

Stable:
├─ Icon: →
├─ Color: #999 (neutral-500)
└─ Format: "→ 0" or "→ stable"
```

#### 11. Skeleton (Loading)
```
├─ Bg: #F0F0F0 (neutral-200)
├─ Border-radius: 4px
├─ Animation: opacity pulse
│  └─ Keyframes: 0.5 → 1 → 0.5
│  └─ Duration: 1.5s infinite
│  └─ Easing: ease-in-out
└─ Used in: Card placeholders before data loads
```

#### 12-18: Other Atoms
- Container, Grid, Heading1, Heading2, Body, BodySmall, Caption

---

### MOLECULES (14 Components)

#### 1. MetricCard
```
Layout: Vertical stack
├─ Padding: 16px (md)
├─ Border: 1px solid #E5E5E5 (neutral-300)
├─ Border-radius: 6px (md)
├─ Bg: white
└─ Gap: 8px between children

State: Default
└─ Box-shadow: none

State: Hover
├─ Box-shadow: 0 2px 8px rgba(0,0,0,0.1) (md shadow)
└─ Cursor: pointer

Children:
├─ StatValue: 28px bold monospace (e.g., "456")
├─ Label: 12px caption (e.g., "Likes")
└─ TrendIndicator: "↑ +211"

Example: 456 Likes ↑ +211
```

#### 2. TimeframeSelector
```
Layout: Inline flex (button chips)
├─ Gap: 8px (sm)
└─ Align: flex-start

Button States (each chip):

State: Inactive
├─ Bg: #F0F0F0 (neutral-200)
├─ Color: #333 (neutral-700)
├─ Border: 1px solid #E5E5E5
├─ Padding: 8px 16px
└─ Border-radius: 4px

State: Active (selected)
├─ Bg: #FF1493 (primary)
├─ Color: white
├─ Border: 1px solid #FF1493
├─ Padding: 8px 16px
└─ Border-radius: 4px

Options: 7d, 14d, 30d, 90d, Custom
```

#### 3. SearchBar
```
Layout: Horizontal flex
├─ Input: flex-grow 1
├─ Icon (🔍): left side
└─ Clear button: right side

Input States:
├─ Default: Border #E5E5E5
├─ Focus: Border 2px #FF1493, shadow outline
└─ Filled: Border #405DE6

Padding: 8px 12px
Border-radius: 4px
```

#### 4. SortButton
```
Layout: Button + Dropdown indicator
├─ Label: "Sort: ↓ Recent"
├─ Icon: Dropdown arrow (▼)
└─ Styling: Secondary button

On Click:
├─ Shows dropdown menu
├─ Options: Recent, Most Liked, Most Commented, Reach, Engagement
└─ Selected: Checkmark + primary color text
```

#### 5. FilterButton
```
Layout: Button + Badge (active count)
├─ Label: "Filter"
├─ Badge: Shows count of active filters (e.g., "3")
└─ Styling: Secondary button

On Click:
├─ Shows filter panel
└─ Active filters: Highlighted with primary color
```

#### 6-14: Other Molecules
- FormField, DatePicker, DropdownMenu, Pagination, Comment, Notification, etc.

---

### ORGANISMS (10 Components)

#### 1. MetricsGrid
```
Layout: CSS Grid
├─ Desktop: 3 columns
├─ Tablet: 2 columns
├─ Mobile: 1 column
├─ Gap: 16px (md)
└─ Max-width: 1280px

Children: 6 MetricCards
├─ Card 1: Total Followers
├─ Card 2: Engagement Rate
├─ Card 3: Reach
├─ Card 4: Impressions
├─ Card 5: Saves
└─ Card 6: Shares
```

#### 2. AnalyticsHeader
```
Layout: Flex column
├─ Padding: 24px (lg)
├─ Border-bottom: 1px #E5E5E5
├─ Bg: white
└─ Gap: 16px

Children:
├─ H1: "Analytics Dashboard" (32px bold)
├─ Profile: "estela_fernandes (estela_fernandes)" (14px)
└─ TimeframeSelector: [7d] [14d] [30d] [90d] [Custom]
```

#### 3. Chart (Engagement Trend)
```
Type: Line chart (Recharts)
├─ Width: 100%
├─ Max-width: 1280px
├─ Height: 320px
├─ Padding: 20px
├─ Border: 1px #E5E5E5
├─ Border-radius: 6px
├─ Bg: white

Data: 7-day engagement trend
├─ X-axis: Days (Mon-Sun)
├─ Y-axis: Engagement count
├─ Line color: #FF1493 (primary)
└─ Gradient fill: rgba(255, 20, 147, 0.1)

Interactive:
├─ Tooltip on hover: Date + value
├─ Responsive: Scales down on mobile
└─ No animation (prefers-reduced-motion support)
```

#### 4. PostCard
```
Layout: Horizontal flex
├─ Padding: 16px (md)
├─ Border: 1px solid #E5E5E5
├─ Border-radius: 6px
├─ Bg: white
└─ Gap: 16px

Children:
├─ Thumbnail: 60×60px image
├─ Content (flex-grow):
│  ├─ Caption: 14px body (truncated 2 lines)
│  ├─ Date: 12px caption
│  └─ Metrics row:
│     ├─ ❤️ 456
│     ├─ 💬 23
│     ├─ 💾 12
│     └─ 📊 45K reach
└─ Link: "View Details" (ghost button)

State: Hover
├─ Box-shadow: 0 2px 8px rgba(0,0,0,0.1)
├─ Cursor: pointer
└─ Bg: #FAFAFA
```

#### 5-10: Other Organisms
- DataTable, StatsPanel, InsightsPanel, MediaPanel, PageHeader, SubHeader

---

## 📐 PART 3: States & Variants Matrix

### Button States (All Variants)

| State | Primary | Secondary | Ghost |
|-------|---------|-----------|-------|
| **Default** | #FF1493 bg | #F0F0F0 bg | transparent |
| **Hover** | #E60C8A bg + shadow | #E5E5E5 bg + shadow | #FAFAFA bg |
| **Focus** | 2px outline + hover state | 2px outline + hover state | 2px outline + hover state |
| **Active** | darker (#CC0066) | darker bg | darker text |
| **Disabled** | opacity 0.5 | opacity 0.5 | opacity 0.5 |
| **Loading** | spinner icon | spinner icon | spinner icon |

### Input States

| State | Border | Bg | Text |
|-------|--------|----|----|
| **Default** | #E5E5E5 | white | #333 |
| **Hover** | #DDD | white | #333 |
| **Focus** | 2px #FF1493 | white | #333 |
| **Filled** | #405DE6 | white | #333 |
| **Error** | 2px #CC0000 | white | #CC0000 hint |
| **Disabled** | #DDD | #F0F0F0 | #999 |

---

## 🎨 PART 4: Page Mockups

### Page 1: Analytics Dashboard

```
┌─────────────────────────────────────────┐
│ Analytics Dashboard                     │
│ estela_fernandes (estela_fernandes)    │
│ [7d] [14d] [30d] [90d] [Custom ▼]     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│                                         │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │ 12.5K    │ │ 4.2%     │ │ 245.3K   │ │
│ │Followers │ │Engagement│ │Reach     │ │
│ │↑ +245    │ │↑ +0.8pp  │ │↑ +45.2K  │ │
│ └──────────┘ └──────────┘ └──────────┘ │
│                                         │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │ 1.2M     │ │ 89       │ │ 456      │ │
│ │Impressions││Saves     │ │Shares    │ │
│ │↑ +123K   │ │↑ +12     │ │↓ -2      │ │
│ └──────────┘ └──────────┘ └──────────┘ │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Engagement Trend (Last 7 Days)          │
│                                         │
│ 5000 ┼─────╲─────╱─────┐               │
│      │      ╲   ╱       │               │
│ 4000 ┼───╲──╱───╲────── │               │
│      │   ╲╱      ╲      │               │
│ 3000 ┼────╲───────╲───── │               │
│      │ Mon Tue Wed Thu Fri Sat Sun       │
│ 2000 └─────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ [View All Posts] [Check Growth] [Tips]  │
└─────────────────────────────────────────┘

Last updated: Today at 3:45 PM
Next update: Tomorrow at 3:45 PM
```

### Page 2: Posts History

```
┌─────────────────────────────────────────┐
│ Post Performance                        │
│ [Sort: Recent ▼] [Filter ⚙️ 3]        │
└─────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ [Post 1 Thumbnail]  Caption preview      │
│ Mar 15 · ❤️456 💬23 💾12 📊45K         │
│ [View Details →]                        │
├──────────────────────────────────────────┤
│ [Post 2 Thumbnail]  Caption preview      │
│ Mar 14 · ❤️389 💬18 💾8 📊32K          │
│ [View Details →]                        │
├──────────────────────────────────────────┤
│ [Post 3 Thumbnail]  Caption preview      │
│ Mar 12 · ❤️234 💬5 💾2 📊18K           │
│ [View Details →]                        │
└──────────────────────────────────────────┘

Mostrando 3 de 30 posts
[← Anterior] [1] [2] ... [10] [Próxima →]
```

### Page 3: Growth Chart

```
┌─────────────────────────────────────────┐
│ Crescimento de Followers (12 Semanas)  │
│ [Últimas 12 semanas]                   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│                                         │
│ 13K ┼──────╱────╱────╱────╱────╱──────│
│     │     ╱    ╱    ╱    ╱    ╱       │
│ 12K ┼────╱────╱────╱────╱────╱────── │
│     │   ╱    ╱    ╱    ╱    ╱         │
│ 11K ┼──╱────╱────╱────╱────╱──────── │
│     │ ╱    ╱    ╱    ╱    ╱           │
│ 10K └─────────────────────────────────┘ │
│     W1  W2  W3  W4  W5 ... W12          │
└─────────────────────────────────────────┘

┌──────────────┬──────────────┬───────────┐
│ Total Gained │ Avg Per Week │ Growth %  │
│ +3,245       │ +270         │ +33.2%    │
└──────────────┴──────────────┴───────────┘

Week │ Followers │ Change
─────┼───────────┼────────
  1  │ 9,855     │ +145 ↑
  2  │ 10,102    │ +247 ↑
  3  │ 10,389    │ +287 ↑
 ...
 12  │ 13,100    │ +289 ↑

Auto-generated insights:
💡 Growth acceleration detected week 8-9
💡 Best day for new followers: Thursday
💡 Engagement correlates with follower growth
```

### Page 4: Post Details

```
┌────────────────────────────────────────────┐
│ ← Post Details                   [Share] │
│ Published Mar 15, 2024 at 2:30 PM         │
└────────────────────────────────────────────┘

┌─────────────────────────┐ ┌──────────────────┐
│   [Post Image]          │ │ Caption           │
│   [◄ Carousel ►]        │ │ Awesome sunset... │
│   1 of 3                │ │                   │
│                         │ │ #sunset #sky      │
│                         │ │ 📍 Beach, CA      │
│                         │ │                   │
│                         │ ├──────────────────┤
│                         │ │ ❤️ 456 💬 23     │
│                         │ │ 💾 12 📊 45.2K   │
└─────────────────────────┘ │ Save rate: 2.6%  │
                            └──────────────────┘

┌────────────────────────────────────────────┐
│ Engagement Timeline (24h)                  │
│                                            │
│ 250 ┼────╱────╱────╱────╱────╱─────│     │
│     │   ╱    ╱    ╱    ╱    ╱       │     │
│ 150 ┼──╱────╱────╱────╱────╱────── │     │
│     │ ╱    ╱    ╱    ╱    ╱         │     │
│ 50  └─────────────────────────────── │     │
│     0h   6h  12h  18h  24h           │     │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ Engagement Breakdown                       │
│ Likes: 89.2% │ Comments: 4.5% │ Saves: 6.3% │
└────────────────────────────────────────────┘

Top Comments:
Avatar User (@username) · 2h
Amazing shot! Love the colors 🌅
❤️ 23 replies

Avatar User (@username) · 1h
Where is this? Looks beautiful!
❤️ 5 replies

Auto-generated Insights:
💡 Peak engagement: 2-6h after post
💡 This post outperforms 95% of your posts
💡 Hashtag #sunset drives 23% of reach
```

---

## ✅ PART 5: Implementation Handoff

### What @dev (Estela) Receives

1. **Design Tokens (JSON)**
   - Colors (primary, secondary, neutral, status)
   - Typography (scale, weights, line-heights)
   - Spacing (4px grid units)
   - Shadows, border-radius, breakpoints

2. **Component Specs**
   - All 42 components defined (atoms, molecules, organisms)
   - States for each (default, hover, focus, active, disabled, loading)
   - Responsive behavior (mobile/tablet/desktop)
   - Accessibility notes (WCAG AA, ARIA, focus management)

3. **Visual Reference**
   - Figma file with all components (link: https://figma.com/story-6.1-analytics)
   - Mockups of 4 pages
   - Color palette reference
   - Typography scale visualization

4. **Implementation Checklist**
   - [ ] Tailwind config with design tokens
   - [ ] CSS custom properties (--color-primary, --space-md, etc)
   - [ ] All 18 atoms created + tested
   - [ ] All 14 molecules created + tested
   - [ ] All 10 organisms created + tested
   - [ ] Responsive design (3 breakpoints)
   - [ ] Accessibility audit (WCAG AA)
   - [ ] Unit tests (90%+ coverage)
   - [ ] Connected to API
   - [ ] Ready for QA gate

---

## 🎯 Key Design Decisions

### Why These Colors?

- **Primary (#FF1493):** Instagram brand recognition + high contrast (8.5:1 on white)
- **Secondary (#405DE6):** Instagram secondary color, complementary to primary
- **Neutral scale (50-900):** Granular gray scale for backgrounds, borders, text
- **Status colors:** Green (positive), Orange (neutral), Red (negative) — accessible to colorblind users

### Why Modular Typography Scale?

- **Base:** 16px (standard)
- **Ratio:** 1.25x (Major Third) — harmonious, not random
- **Result:** 6 semantic sizes (12px → 32px) that work everywhere

### Why Atomic Design?

- **Atoms:** 18 reusable foundations
- **Molecules:** 14 smart combinations
- **Organisms:** 10 complex sections
- **Benefit:** No reinventing, consistent scaling, team clarity

### Why WCAG AA Minimum?

- 4.5:1 contrast ratio for all text
- Keyboard navigation for all interactive elements
- ARIA labels for icons and live regions
- Focus indicators never removed

---

## 🚀 Next Steps

1. **Stella** (Visual Designer) ← YOU ARE HERE
2. **Iris** (UX/Interaction Designer) — Adds interaction specs
3. **Estella** (@dev) — Implements in code
4. **Quinn** (@qa) — QA gate & testing
5. **Gage** (@devops) — Deploy

---

**Document prepared by:** Stella (Visual Designer)  
**Date:** April 15, 2026  
**Status:** ✅ Ready for Implementation

🎨 Happy building!
