# Story 6.1 — Interaction Flows & Navigation

## Complete User Flows for Analytics Module

---

## 🎯 Primary User Flow: Marina Monitoring Her Account Health

```
[Dashboard]
    ↓
    (See overall metrics: followers, engagement, reach)
    ↓
    Decision Point:
    ├─→ Click [View Top Posts] → [Posts History]
    │                              ├─→ Click post thumbnail → [Post Details]
    │                              │                           ├─→ View insights
    │                              │                           ├─→ Read top comments
    │                              │                           └─→ [← Back to Posts History]
    │                              ├─→ Sort by "Most Liked" → [Posts History] (sorted)
    │                              ├─→ Filter by "Video" → [Posts History] (filtered)
    │                              └─→ [← Back to Dashboard]
    │
    ├─→ Click [View Growth Chart] → [Growth Chart]
    │                                ├─→ Hover data points for details
    │                                ├─→ Click week row → [Week Details]
    │                                └─→ [← Back to Dashboard]
    │
    ├─→ Change timeframe [30d → 7d] → [Dashboard] (auto-refresh metrics)
    │
    └─→ Click [Refresh] → [Dashboard] (updated metrics)
```

---

## 📊 Dashboard → Posts History Flow

```
Flow Steps:
1. User on Dashboard
2. Click [View Top Posts] button (Quick Actions)
3. Navigate to /analytics/posts
4. Load last 30 posts with metrics
5. Show sort options: "Recent" (default)
6. Show filter button for media type / date / engagement

User Actions:
- Sort: "Recent" → "Most Liked" → updates sort_by param
- Filter: Select "Video" → filters to video posts only
- Click post card → Navigate to /analytics/posts/{postId}
- Pagination: [Load More] → fetch next 10 posts
- [← Back to Dashboard] → Navigate back with state preservation

Loading States:
- Initial load: Show skeleton cards (3-4)
- Filter/sort change: Show loading spinner on affected cards
- Infinite scroll: Show skeleton at bottom
```

---

## 📈 Dashboard → Growth Chart Flow

```
Flow Steps:
1. User on Dashboard
2. Click [View Growth Chart] button (Quick Actions)
3. Navigate to /analytics/growth
4. Load growth data for last 12 weeks
5. Display line chart + summary stats + table

Interactions:
- Hover line chart points → Show tooltip (followers + date)
- Zoom: Drag on chart area to zoom into time range
- Reset zoom: Double-click chart
- Click table row → Navigate to /analytics/growth/{weekStart}
- Change period: [12 semanas] → [8 semanas] → chart updates

Loading States:
- Initial chart load: Show skeleton chart area
- Period change: Fade out → load → fade in
- Smooth transitions: Use Recharts animations
```

---

## 🔍 Post Details Flow

```
Flow Steps:
1. User on Posts History
2. Click post thumbnail or "View Details →"
3. Navigate to /analytics/posts/{postId}
4. Load full post details (media, metrics, timeline, comments)

Interactions:
- Media carousel: Click [← Slide anterior] / [Próximo Slide →]
- Timeline table: Click header to sort by metric
- Comments: Scroll to see more, click [View All Comments →]
- Top comments: Click comment to expand thread
- Share: Click [Compartilhar Relatório] → Copy link / Share to social

Loading States:
- Media carousel: Preload adjacent slides
- Comments: Virtual scroll for 100+ comments
- Timeline: Paginate if > 100 data points
```

---

## 🔄 Timeframe Selection Flow (All Pages)

```
Current: "Últimos 30d"

User clicks → Shows dropdown:
├─ 7d (Últimos 7 dias)
├─ 14d (Últimos 14 dias)
├─ 30d (Últimos 30 dias) ← Currently selected ✓
├─ 90d (Últimos 90 dias)
└─ Custom (📅 Data picker) → [Start date] [End date] [Apply]

On selection:
1. Update URL param: ?timeframe=7d
2. Show loading spinner on all metrics
3. Fetch data from /api/analytics/{profileId}/metrics?timeframe=7d
4. Update all metric cards with new data
5. Update chart data
6. Save selection to localStorage for next session
```

---

## 🔽 Sort & Filter Flows

### Sort Flow
```
User clicks [Sort: ↓ Recent]

Dropdown shows:
├─ Recent (newest first) ← Default ✓
├─ Most Liked
├─ Most Commented
├─ Highest Reach
└─ Highest Engagement

On selection:
1. Update URL param: ?sort=most_liked
2. Show loading state on post cards
3. Reorder posts in current list
4. Save preference to localStorage
```

### Filter Flow
```
User clicks [Filter ▼]

Filter panel shows:
├─ Media Type (multi-select):
│  ├─ Photo
│  ├─ Video
│  ├─ Carousel
│  └─ Story
│
├─ Date Range (single-select):
│  ├─ Last 7d
│  ├─ Last 14d
│  ├─ Last 30d
│  └─ Custom (date picker)
│
└─ Engagement Level (single-select):
   ├─ High (> 5%)
   ├─ Medium (2-5%)
   └─ Low (< 2%)

On filter change:
1. Update URL params: ?media_type=video&engagement=high
2. Show badge showing active filter count: [Filter ▼] "1"
3. Reorder posts to match filters (AND logic)
4. Show message: "Showing X of 30 posts"
5. [Clear Filters] button appears to reset all
```

---

## 💾 State Management Architecture

### Local State (Component-level)
```typescript
// Dashboard
- selectedTimeframe: "7d" | "14d" | "30d" | "90d" | CustomRange
- isLoadingMetrics: boolean
- activeTab: "overview" | "breakdown"

// Posts History
- sortBy: "recent" | "most_liked" | "most_commented" | "reach" | "engagement"
- filters: { mediaType[], dateRange, engagement }
- isLoadingPosts: boolean
- currentPage: number

// Post Details
- selectedMediaSlide: number
- expandedCommentId: string | null
```

### URL State (Persisted in URL)
```
/analytics/dashboard?timeframe=30d

/analytics/posts?sort=recent&filter_media=video&filter_engagement=high&page=1

/analytics/posts/12345?timeframe=30d

/analytics/growth?period=12weeks
```

### Browser Storage (localStorage)
```
- lastSelectedTimeframe: "30d"
- lastSort: "recent"
- userPreferences: { defaultView, theme }
```

### Server State (API Cache)
```
- Analytics metrics (1h cache)
- Post list (15min cache)
- Growth data (1h cache)
- Post details (24h cache)
```

---

## 🎬 Detailed Click-Through Scenarios

### Scenario 1: Marina Wants to Understand Why Post A Performs Better Than Post B

```
1. [Dashboard] - Marina sees engagement rate: 4.8%
2. Click [View Top Posts]
3. [Posts History] - Sorts by "Most Liked"
4. Sees Post A: 456 likes, 7.2% engagement
5. Click Post A thumbnail
6. [Post Details] - Sees:
   - Full carousel (4 slides)
   - Metrics: 456 likes, 34 comments, 15 saves, 2.1k reach
   - Timeline: Shows engagement peaked at 12h
   - Comments: Top 3 comments are positive + engaged
   - Insight: "Post A had 2.8% above average engagement"
7. Marina notes: "Carousel format with call-to-action works better"
8. [← Back to Posts] to compare with Post B
9. Post B: 180 likes, 2.4% engagement (photo)
10. Marina concludes: "Carousel format > single photo"
```

---

### Scenario 2: Marina Wants to See Follower Growth Over Time

```
1. [Dashboard] - Marina sees +245 followers (last week)
2. Click [View Growth Chart]
3. [Growth Chart] - Sees:
   - Line chart: 12-week trend (increasing)
   - Summary: +850 total, 6.8% growth rate, 71 per week
   - Table: Week-by-week breakdown
   - Highest: Apr 1-8 (+2.0%)
   - Lowest: Apr 22-29 (-0.1%)
4. Marina observes: "Growth accelerating recently"
5. Hovers over Apr 22-29 (negative week)
6. Tooltip shows: 11,820 followers (lowest point)
7. Marina recalls: "That was Easter week, lower engagement expected"
8. [← Back to Dashboard] to adjust strategy
```

---

### Scenario 3: Marina Wants to Review Only Video Content Performance

```
1. [Dashboard]
2. Click [View Top Posts]
3. [Posts History] - Shows all 30 posts
4. Click [Filter ▼]
5. Select "Video" media type
6. Automatically filters to 8 videos only
7. Filter badge shows: [Filter ▼] "1"
8. Marina sees: "Showing 8 of 30 posts"
9. Click [Sort: ↓ Recent] → change to "Most Liked"
10. Videos reorder: Best-performing videos first
11. Marina sees: "Videos get 6-8% engagement (vs 3-4% photos)"
12. [Clear Filters] to remove filter
```

---

## 📱 Mobile Navigation Considerations

### Mobile Dashboard
```
Vertical stack:
- MetricCard (full width)
- MetricCard (full width)
- MetricCard (full width)
- ... (6 cards vertical)
- Chart (horizontal scroll if needed)
- Quick Actions (vertical stack)

Hamburger menu:
├─ Dashboard
├─ Posts
├─ Growth
├─ Settings
└─ Logout
```

### Mobile Posts History
```
Post cards:
- Thumbnail (50x50) on left
- Caption + metrics stacked right
- Less whitespace
- [Filter ▼] as button
- Sort: Dropdown remains same
```

### Mobile Post Details
```
Vertical layout:
- Media fullscreen
- Caption below media
- Metrics as 2x3 grid (instead of 3x2)
- Timeline: Horizontal scroll
- Comments: Full width
```

---

## ♿ Keyboard Navigation Flows

### Dashboard Keyboard Flow
```
Tab key progression:
1. [TimeframeSelector] button
2. MetricCard 1 (clickable for details)
3. MetricCard 2
4. ... MetricCard 6
5. [View Top Posts] button
6. [View Growth Chart] button
7. [Schedule Content] button
8. [Get Insights] button
9. [Refresh] button
10. Footer

Enter/Space: Activate buttons
Tab + Arrow keys: Navigate dropdown options
Escape: Close dropdowns
```

### Posts History Keyboard Flow
```
Tab key:
1. [Filter ▼] button
2. [Sort ▼] dropdown
3. PostCard 1 (focus shows outline)
4. [View Details →] link (within card)
5. ... PostCard 3
6. [Load More] button
7. [← Anterior] button
8. [Próxima →] button

Enter: Follow links / Activate buttons
Arrow keys: Navigate within dropdown
Escape: Close filter panel
```

---

## 🔔 Error Handling Flows

### API Error: Failed to Load Metrics

```
[Dashboard]
├─ MetricCard shows skeleton initially
├─ API call fails
├─ MetricCard shows error state:
│  └─ Error icon + "Failed to load. Retry?"
└─ [Retry] button
    └─ Retry API call
```

### API Error: Rate Limited

```
User makes 4+ requests per 60s
├─ Rate limit error from backend
├─ Show toast: "⚠️ Too many requests. Please wait 30 seconds."
├─ [Refresh] button disabled
└─ Auto-enable after 60s
```

### Network Error: No Internet

```
User on [Dashboard]
├─ API call times out (5s)
├─ Show banner: "📡 Connection lost. Working offline."
├─ Show cached data if available (last 1h)
├─ Metrics show: "Updated 45 min ago"
├─ Disable [Refresh] button
└─ Auto-retry when connection restores
```

---

## 📊 Analytics Events to Track

### Page Views
```
- dashboard_viewed
- posts_history_viewed
- growth_chart_viewed
- post_details_viewed
```

### User Actions
```
- timeframe_changed: {from, to}
- sort_applied: {sort_type}
- filter_applied: {filter_type}
- post_clicked: {post_id}
- comment_viewed: {post_id, comment_count}
- refresh_clicked: {}
- share_report_clicked: {page}
```

### Performance Metrics
```
- page_load_time: ms
- api_response_time: ms
- metric_calculation_time: ms
- chart_render_time: ms
```

