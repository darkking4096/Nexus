# Story 6.1 — Posts History (High-Fidelity Wireframe)

## 2. HISTÓRICO DE POSTS — Últimos 30 Posts com Métricas

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  📊 NEXUS Analytics                    [Perfil] [Refresh] [Settings]   [👤] │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Post Performance                          [Sort: ↓ Recent] [Filter ▼]    │
│  Últimos 30 posts publicados                                               │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  [🖼️ Thumbnail]  "Caption text appears here..."         Publicado em   ││
│  │                                                          15 de abr 15h23││
│  │  [Carousel: 4 slides] ou [Video: 45s]                                 ││
│  │                                                                         ││
│  │  Métricas:                                                              ││
│  │  ❤️ 234 likes  |  💬 12 comments  |  💾 8 saves  |  📊 1.2k reach      ││
│  │                                                                         ││
│  │  Engagement Rate: 4.8%      [View Details →]                           ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  [🖼️ Thumbnail]  "Outro caption interessante..."      Publicado em   ││
│  │                                                          14 de abr 18h45││
│  │  [Photo]                                                               ││
│  │                                                                         ││
│  │  Métricas:                                                              ││
│  │  ❤️ 456 likes  |  💬 34 comments  |  💾 15 saves  |  📊 2.1k reach     ││
│  │                                                                         ││
│  │  Engagement Rate: 7.2%      [View Details →]                           ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  [🖼️ Thumbnail]  "Caption aqui..."                    Publicado em   ││
│  │                                                          13 de abr 12h30││
│  │  [Story/Reel: 15s]                                                     ││
│  │                                                                         ││
│  │  Métricas:                                                              ││
│  │  ❤️ 178 likes  |  💬 8 comments  |  💾 5 saves  |  📊 890 reach       ││
│  │                                                                         ││
│  │  Engagement Rate: 3.4%      [View Details →]                           ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│  [Load More...]                                                            │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📝 Mostrando 3 de 30 posts  |  [← Página Anterior] [Próxima Página →]   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Componentes (Atomic Design)

### Atoms
- **Thumbnail** — Small media preview (60x60px)
- **MediaBadge** — Icon indicator (📷 Photo, 🎥 Video, 📋 Carousel, 📖 Story)
- **MetricBadge** — Icon + number (❤️ 234)
- **LinkButton** — "View Details →"
- **SortButton** — [Sort: ↓ Recent] dropdown
- **FilterButton** — [Filter ▼] with dropdown

### Molecules
- **PostCard** — Thumbnail + Caption preview + Date + Metrics + View Details link
- **MetricsRow** — 4 MetricBadges inline (likes, comments, saves, reach)
- **EngagementMetric** — Rate % + comparison (4.8%)
- **PostHeader** — Sort button + Filter button inline
- **Pagination** — "Mostrando X de Y" + Previous/Next buttons

### Organisms
- **PostsList** — Vertical stack of PostCards with infinite scroll
- **PostsHistoryPage** — Page header + PostHeader + PostsList + Pagination

---

## Design Tokens

### Card Spacing
```
Card padding: 16px
Thumbnail size: 60x60px
Gap between metrics: 12px
Card border-radius: 8px
Card border: 1px solid #E5E5E5
```

### Thumbnail Styling
```
Size: 60x60px
Border-radius: 6px
Object-fit: cover
Background: #F0F0F0 (while loading)
```

---

## Annotations

### PostCard Behavior
- **Thumbnail**: Clickable → Opens post detail view
- **Caption preview**: Truncated at 80 chars + "..."
- **Hover state**: Card shadow increases, slight background color change
- **Media type badge**: Shows icon based on media_type (photo/video/carousel/story)

### Sort Button
- **Default**: Recent (newest first)
- **Options**:
  - Recent (Date DESC)
  - Most Liked (Likes DESC)
  - Most Commented (Comments DESC)
  - Highest Reach (Reach DESC)
  - Highest Engagement Rate (Engagement DESC)
- **Behavior**: Clicking updates list order (with loading state)

### Filter Button
- **Options**:
  - Media type: Photo, Video, Carousel, Story
  - Date range: Last 7d, Last 14d, Last 30d, Custom
  - Engagement: High (>5%), Medium (2-5%), Low (<2%)
- **Behavior**: Can apply multiple filters (AND logic)

### Pagination
- **Load More**: Infinite scroll or "Load More" button
- **Shows**: "Mostrando 3 de 30 posts"
- **Accessible**: Skip link if jumping to next section

### Engagement Rate Color Coding
```
> 6%: Green (#31A24C) - Excellent
3-6%: Yellow (#FFA500) - Good
< 3%: Gray (#999999) - Low
```

---

## Accessibility (WCAG AA)

- [ ] Thumbnail has alt text: "{type} - {caption preview} - {engagement_rate}%"
- [ ] Sort/Filter buttons have aria-label + aria-expanded
- [ ] Engagement metrics have proper semantic HTML (using <dl> or <span> with aria-label)
- [ ] "View Details" links have aria-label: "View details for post by {date}"
- [ ] Pagination buttons are keyboard accessible
- [ ] Color coding has text indicator (not color alone)

---

## Mobile Responsiveness

### < 640px
- PostCard becomes single row (thumbnail left, metrics stacked right)
- Thumbnail: 50x50px
- Caption text: 12px font size
- Metrics: Grid 2x2 instead of 1x4
- Pagination: Hidden, infinite scroll only

### 640px - 1024px
- PostCard standard layout
- Metrics: Grid 2x2
- Pagination: Show "Previous/Next"

### > 1024px
- Standard layout (current design)

---

## Performance Notes

- [ ] Lazy load thumbnails (intersection observer)
- [ ] Debounce sort/filter changes (300ms)
- [ ] Virtual scrolling for 30+ posts (use react-window)
- [ ] Cache post list API responses (15 minutes)
- [ ] Pagination: Fetch next 10 posts on scroll to bottom

---

## Data Requirements

**Per Post:**
```json
{
  "id": "string",
  "media_type": "photo|video|carousel|story",
  "caption": "string (up to 80 chars for preview)",
  "published_at": "ISO 8601 timestamp",
  "thumbnail_url": "string",
  "metrics": {
    "likes": number,
    "comments": number,
    "saves": number,
    "reach": number,
    "engagement_rate": number (percentage)
  }
}
```

---

## Navigation
- Click thumbnail or "View Details →" → Goes to "Post Details"
- Click [← Back] → Returns to Dashboard
- Navigation breadcrumb: Dashboard > Post Performance > Post Details

