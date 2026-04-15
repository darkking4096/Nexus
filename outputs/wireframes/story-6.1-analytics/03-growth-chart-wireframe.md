# Story 6.1 — Growth Chart (High-Fidelity Wireframe)

## 3. CRESCIMENTO — Gráfico de Crescimento Semanal de Followers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  📊 NEXUS Analytics                    [Perfil] [Refresh] [Settings]   [👤] │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Crescimento de Followers                  [Período: Últimos 12 semanas] │
│  Tendência semanal                                [📅 Customizar]          │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📊 Gráfico de Crescimento                                                 │
│                                                                             │
│  Followers                                                                  │
│  12,600  ┃                                                                 │
│          ┃         ╱╲                                                      │
│  12,400  ┃       ╱  ╲      ╱╲                                             │
│          ┃      ╱    ╲    ╱  ╲         ╱╲                                 │
│  12,200  ┃    ╱      ╲  ╱    ╲       ╱  ╲    ╱╲                         │
│          ┃  ╱         ╲╱      ╲    ╱    ╲  ╱  ╲    ╱╲                   │
│  12,000  ┃╱                    ╲  ╱      ╲╱    ╲  ╱  ╲                 │
│          ┃                      ╲╱            ╲╱    ╲                   │
│  11,800  ┃                                        ╲                       │
│          ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│          Apr 1  Apr 8  Apr 15 Apr 22 Apr 29 May 6  May 13 May 20 May 27   │
│                                                                             │
│  ✓ Hover over points for exact values                                      │
│  ✓ Drag to zoom on specific time range                                    │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📈 Resumo de Crescimento                                                 │
│                                                                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐        │
│  │ Total Gained     │  │ Avg Per Week     │  │ Growth Rate      │        │
│  │ +850 followers   │  │ ~71 per semana   │  │ 6.8% ao período  │        │
│  │ vs 4 semanas atrás
 │  │ vs 6 semanas atrás │  │ (comparado a anterior 4 sem) │        │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘        │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Semana        Followers   Ganho    % Crescimento   Status               │
│  ──────────────────────────────────────────────────────────────────────   │
│  May 20-27     12,450      +245     +2.0%           ↑ Ótimo              │
│  May 13-20     12,205      +180     +1.5%           ↑ Bom                │
│  May 6-13      12,025      +120     +1.0%           → Estável            │
│  Apr 29-May 6  11,905      +85      +0.7%           ↓ Baixo              │
│  Apr 22-29     11,820      -10      -0.1%           ↓ Crítico            │
│  Apr 15-22     11,830      +65      +0.6%           → Estável            │
│  Apr 8-15      11,765      +145     +1.2%           ↑ Bom                │
│  Apr 1-8       11,620      +230     +2.0%           ↑ Ótimo              │
│                                                                             │
│  [Load More Weeks]                                                         │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  💡 Insights                                                               │
│                                                                             │
│  ✓ Semanas com maior crescimento: Apr 1-8 (+2.0%) e May 20-27 (+2.0%)  │
│  ✓ Correlação forte com posts de alta performance                        │
│  ✗ Semana Apr 22-29 teve queda (revise estratégia de conteúdo)         │
│  → Tendência geral: Crescimento estável, 6.8% em 12 semanas            │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📝 Atualizado às 15h23  |  Próxima atualização em 1h22min               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Componentes (Atomic Design)

### Atoms
- **ChartContainer** — SVG chart wrapper
- **ChartTooltip** — Hover tooltip showing exact value
- **DataPoint** — Circular marker on line (interactive)
- **GrowthBadge** — Icon + % (↑ +2.0%, → -0.1%)
- **StatusIndicator** — Status color badge (Ótimo/Bom/Estável/Baixo/Crítico)
- **StatCard** — Number + Label + Comparison

### Molecules
- **SummaryStats** — 3 StatCards (Total Gained + Avg Per Week + Growth Rate)
- **GrowthRow** — Week + Followers + Gain + % + Status
- **ZoomControls** — Buttons to zoom in/out on chart
- **PeriodSelector** — "Últimos 12 semanas" with dropdown

### Organisms
- **GrowthLineChart** — Complete chart with axis labels + legend + tooltip
- **GrowthTable** — Table of weekly data with sorting
- **InsightsPanel** — 4 bullet points with insights
- **GrowthPage** — Page header + Chart + Summary + Table + Insights

---

## Design Tokens

### Chart Colors
```
Line color: #FF1493 (Instagram Pink)
Point color: #FF1493
Hover point: #FF1493 (larger)
Fill area (optional): rgba(255, 20, 147, 0.1)
Grid lines: #E5E5E5
Axis labels: #666666
```

### Status Colors
```
Ótimo (↑ > 1.5%): #31A24C (Green)
Bom (0.7-1.5%): #4CAF50 (Light green)
Estável (-0.5 a 0.7%): #FFA500 (Orange)
Baixo (-1.5 a -0.5%): #FF6B6B (Light red)
Crítico (< -1.5%): #CC0000 (Dark red)
```

### Table Styling
```
Header bg: #FAFAFA
Row hover: #F5F5F5
Border: 1px solid #E5E5E5
Column align: numbers right-aligned
```

---

## Annotations

### Line Chart Behavior
- **Y-axis**: Auto-scaled to data range + 5% padding
- **X-axis**: Week labels (Mon-Sun format) or date range
- **Hover**: Show tooltip with exact followers count + date
- **Smooth curve**: Use bezier curves (not linear)
- **Responsive**: Scales to container width

### Data Points
- **Clickable**: Opens detail view for that week
- **Hover**: Enlarges point + shows tooltip
- **Color**: Same as line (#FF1493)

### Summary Stats
- **Total Gained**: Difference between max and min in period
- **Avg Per Week**: Total gained / number of weeks
- **Growth Rate**: ((latest - earliest) / earliest) * 100

### Status Coloring
- Automatically assign based on weekly growth %
- Use color + text (not color alone for accessibility)
- Show trend arrow (↑ ↓ →) alongside percentage

### Table Sorting
- **Click column header** to sort
- **Followers**: Sort ascending/descending
- **Ganho**: Sort by absolute gain
- **% Crescimento**: Sort by percentage growth
- **Status**: Sort by status level (Ótimo → Crítico)

### Insights Panel
- **Auto-generated** based on data:
  - Highest growth week
  - Lowest growth week
  - Overall trend (up/stable/down)
  - Correlation with engagement (if available)
- **Actionable**: "Revise estratégia de conteúdo" for low weeks

---

## Accessibility (WCAG AA)

- [ ] Chart has aria-label: "Line chart showing follower growth over 12 weeks"
- [ ] Data points are keyboard accessible (arrow keys to navigate)
- [ ] Tooltip content is in DOM (not just visual)
- [ ] Table headers have proper <th> tags with scope="col"
- [ ] Status indicators use text + color (not color alone)
- [ ] Zoom controls have proper focus states

---

## Mobile Responsiveness

### < 640px
- Chart height: 250px, width: 100%
- Chart scrollable horizontally (13 weeks)
- Summary stats: Stack vertically (1 column)
- Table: Horizontal scroll, fixed first column
- Insights: 1 per row (stack vertically)

### 640px - 1024px
- Chart height: 300px
- Summary stats: 1-2 columns
- Table: Full width, no scroll if fits

### > 1024px
- Standard layout (current design)

---

## Performance Notes

- [ ] Use Recharts or Chart.js (not canvas for accessibility)
- [ ] Lazy load chart (only render when in viewport)
- [ ] Virtual scrolling for table (if > 52 weeks)
- [ ] Cache growth data API response (1 hour)
- [ ] Debounce zoom/pan interactions (100ms)
- [ ] Limit chart render updates (max 60fps)

---

## Data Requirements

**Per Week:**
```json
{
  "week_start": "ISO 8601 date (Monday)",
  "week_end": "ISO 8601 date (Sunday)",
  "followers_count": number,
  "followers_gained": number,
  "growth_percentage": number,
  "status": "excellent|good|stable|low|critical"
}
```

**Summary:**
```json
{
  "total_gained": number,
  "avg_per_week": number,
  "growth_rate_percentage": number,
  "highest_week": {week_start, followers_gained},
  "lowest_week": {week_start, followers_gained},
  "trend": "up|stable|down"
}
```

---

## Navigation
- Click data point or table row → Opens "Week Details" view
- Click [← Back] → Returns to Dashboard
- Breadcrumb: Dashboard > Growth > Week Details

