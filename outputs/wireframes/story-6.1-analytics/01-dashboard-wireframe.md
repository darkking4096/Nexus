# Story 6.1 — Analytics Dashboard (High-Fidelity Wireframe)

## 1. DASHBOARD PRINCIPAL — Métricas em Tempo Real

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  📊 NEXUS Analytics                    [Perfil] [Refresh] [Settings]   [👤] │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Analytics Dashboard                                  [Período: Últimos 30d] │
│  estela_fernandes (estela_fernandes)                      [📅 Data picker]  │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────┐  ┌──────────────────────┐  ┌────────────────────┐ │
│  │ 👥 Followers        │  │ 📈 Engagement Rate   │  │ 🔥 Total Reach     │ │
│  │ 12,450              │  │ 4.2%                 │  │ 45,230             │ │
│  │ ↑ +245 (última sem) │  │ ↑ +0.8pp (vs 7d)    │  │ ↑ +12,450 (vs 7d)  │ │
│  │                     │  │                      │  │                    │ │
│  └─────────────────────┘  └──────────────────────┘  └────────────────────┘ │
│                                                                             │
│  ┌─────────────────────┐  ┌──────────────────────┐  ┌────────────────────┐ │
│  │ 💬 Avg Comments     │  │ ❤️  Avg Likes        │  │ 💾 Avg Saves       │ │
│  │ 23 (por post)       │  │ 145 (por post)       │  │ 18 (por post)      │ │
│  │ ↑ +5 (vs 7d)       │  │ ↑ +32 (vs 7d)       │  │ ↑ +4 (vs 7d)       │ │
│  │                     │  │                      │  │                    │ │
│  └─────────────────────┘  └──────────────────────┘  └────────────────────┘ │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📊 Engagement Trend (Últimos 7 dias)                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                         │ │
│  │                                    ╱╲                                   │ │
│  │              ╱╲                   ╱  ╲              ╱╲                 │ │
│  │            ╱  ╲    ╱╲           ╱    ╲            ╱  ╲               │ │
│  │    ╱╲    ╱      ╲╱  ╲         ╱      ╲  ╱╲    ╱╲╱    ╲             │ │
│  │   ╱  ╲╱                ╲     ╱        ╲╱  ╲  ╱          ╲           │ │
│  │ ╱                        ╲ ╱                ╲╱            ╲         │ │
│  │  4.1  4.2  3.9  4.4  4.8  5.2  4.9%                               │ │
│  │  Mon  Tue  Wed  Thu  Fri  Sat  Sun                                 │ │
│  │                                                                         │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🎯 Quick Actions                                                           │
│                                                                             │
│  [View Top Posts]  [View Growth Chart]  [Schedule Content]  [Get Insights]  │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📝 Atualizado às 15h23  |  🔄 Próxima atualização em 1h22min             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Componentes (Atomic Design)

### Atoms
- **MetricCard** — Container com número grande + label + trend indicator
- **TrendBadge** — Seta + percentual (↑ +245, ↑ +0.8pp)
- **Button (Primary/Secondary)** — CTA buttons
- **Divider** — Visual separation
- **Badge** — Status indicator (updated time)

### Molecules
- **MetricWidget** — MetricCard + TrendBadge juntos (reutilizável 6x)
- **TimeframeSelector** — [Últimos 30d] com date picker
- **QuickActionsBar** — 4 buttons inline
- **ChartLegend** — Labels para gráfico

### Organisms
- **AnalyticsHeader** — Page title + profile name + timeframe selector
- **MetricsGrid** — Grid 3x2 de MetricWidgets
- **TrendChart** — Chart container com legend
- **AnalyticsDashboard** — Complete dashboard page

---

## Design Tokens

### Spacing
```
Base unit: 8px
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
```

### Colors
```
Primary: #FF1493 (Instagram Pink)
Secondary: #405DE6 (Instagram Blue)
Success: #31A24C (Green trend up)
Neutral-50: #FAFAFA (Light bg)
Neutral-900: #1A1A1A (Dark text)
```

### Typography
```
H1: 32px / 1.2 / bold
H2: 24px / 1.2 / bold
Body: 14px / 1.5 / regular
SmallText: 12px / 1.4 / regular
```

---

## Annotations

### MetricCard Behavior
- **Normal state**: Display metric value + trend
- **Hover state**: Slight shadow elevation, cursor pointer
- **Click**: Open detailed view (se aplicável)
- **Loading**: Skeleton loader (pulse animation)
- **Error**: Error icon + "Failed to load" message

### Chart Behavior
- **Y-axis**: 0-6% range for engagement rate
- **X-axis**: 7 dias (Mon-Sun)
- **Interactive**: Hover shows exact value in tooltip
- **Responsive**: Chart stacks on mobile (landscape recommended)

### Timeframe Selector
- **Default**: "Últimos 30d"
- **Options**: 7d, 14d, 30d, 90d, Custom range
- **Behavior**: Clicking updates all metrics (with loading state)
- **Persisted**: Save selection to localStorage

### Refresh Button
- **Manual refresh**: Updates all metrics immediately
- **Rate limit**: Max 1 request per 60 seconds
- **Loading state**: Spinner icon + "Atualizando..."
- **Error state**: "Erro ao atualizar. Tentar novamente?" with retry button

---

## Accessibility (WCAG AA)

- [ ] All metric values have aria-label (e.g., "12 thousand 450 followers")
- [ ] Trend indicators use visually distinct colors + text (not color alone)
- [ ] Chart has aria-describedby pointing to description text
- [ ] All buttons have proper focus states (2px outline, 2px offset)
- [ ] Time period dropdown is keyboard accessible
- [ ] Color contrast >= 4.5:1 for all text

---

## Mobile Responsiveness

### Breakpoint: < 640px
- Metrics stack 1 column (width: 100% - 32px padding)
- Chart becomes full-width horizontal scroll
- Quick Actions buttons stack vertically
- Timeframe dropdown becomes button chip

### Breakpoint: 640px - 1024px
- Metrics grid: 2 columns
- Chart remains full-width
- Quick Actions: 2 columns

### Breakpoint: > 1024px
- Metrics grid: 3 columns (current design)
- Full layout as shown

---

## Performance Notes

- [ ] Lazy load chart (use Recharts or Chart.js)
- [ ] Debounce timeframe selector (300ms)
- [ ] Cache metric API responses (1 hour, as per Story 6.1)
- [ ] Skeleton loaders show during initial load
- [ ] Trend calculations happen server-side (not client)

---

## Next Screens
- Click [View Top Posts] → Goes to "Histórico de Posts"
- Click [View Growth Chart] → Goes to "Crescimento"
- Click on MetricCard → Goes to "Detalhes" (drill-down)

