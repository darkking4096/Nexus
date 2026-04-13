# PreviewPanel Component — Hi-Fi Wireframe

**Story:** 4.2 - Approval UI & UX  
**Component:** PreviewPanel  
**Fidelity:** High  
**Purpose:** Display read-only preview of how content will appear when published

---

## Visual Layout (ASCII Hi-Fi)

### Desktop (1024px+) — Side Panel
```
Main Content Area             │  Preview Panel
─────────────────────────────┼─────────────────────────────────
                             │  Preview
[ApprovalCard 1]             │  ┌─────────────────────────────┐
[ApprovalCard 2]             │  │                             │
[ApprovalCard 3]             │  │  [Image Preview - Full]     │
[ApprovalCard 4]             │  │                             │
                             │  │  ┌───────────────────────┐  │
                             │  │  │ Caption:              │  │
                             │  │  │ Lorem ipsum dolor sit │  │
                             │  │  │ amet, consectetur...  │  │
                             │  │  └───────────────────────┘  │
                             │  │                             │
                             │  │  Step: 1 of 4               │
                             │  │  Status: Pending ●          │
                             │  │                             │
                             │  │  Layout: Instagram Post     │
                             │  │  Dimensions: 1080 × 1080    │
                             │  │  Aspect Ratio: 1:1          │
                             │  │                             │
                             │  │  [← Prev] [Next →]          │
                             │  │  [Close Preview]            │
                             │  └─────────────────────────────┘
```

### Tablet (768px) — Modal
```
┌──────────────────────────────────┐
│ Preview                  [×]      │
├──────────────────────────────────┤
│                                  │
│  [Image Preview - Full]          │
│                                  │
│  ┌──────────────────────────────┐│
│  │ Caption:                     ││
│  │ Lorem ipsum dolor sit amet   ││
│  └──────────────────────────────┘│
│                                  │
│  Step: 1 of 4                    │
│  Status: Pending ●               │
│                                  │
│  Layout: Instagram Post          │
│  Dimensions: 1080 × 1080         │
│                                  │
│  [← Prev] [Next →]               │
│  [Close]                         │
│                                  │
└──────────────────────────────────┘
```

### Mobile (375px) — Full-Screen Preview
```
┌─────────────────────────────────┐
│ Preview              [×] Close   │
├─────────────────────────────────┤
│                                 │
│  [Image Preview]                │
│  [scaled to mobile]             │
│                                 │
│  ┌─────────────────────────────┐│
│  │ Caption:                    ││
│  │ Lorem ipsum...              ││
│  └─────────────────────────────┘│
│                                 │
│  Step: 1 of 4                   │
│  Pending ●                      │
│                                 │
│  Instagram Post                 │
│                                 │
│  [Prev]                         │
│  [Next]                         │
│  [Close]                        │
│                                 │
└─────────────────────────────────┘
```

---

## Component Structure (Atomic Design)

### Container
- **Type:** Organism (Panel wrapper)
- **Responsive:** 
  - Desktop: Right sidebar, width 340px, position sticky
  - Tablet: Modal, 100% width
  - Mobile: Full-screen modal
- **Background:** #ffffff
- **Border:** 1px solid #e5e7eb (left border on desktop)
- **Box shadow:** Desktop: none, Tablet/Mobile: 0 10px 25px rgba(0,0,0,0.2)

### Header
- **Title:** "Preview" (18px, font-weight: 600)
- **Close button:** Top-right (icon: ×)
- **Sticky:** Remains visible when scrolling content

### Image Preview Area
- **Container:** Centered, responsive
- **Image:**
  - Display at actual dimensions or scaled to fit container
  - Max-width: 100%
  - Max-height: 400px (desktop), 250px (mobile)
  - Border-radius: 6px
  - Background: #f3f4f6 (gray-100) if loading
  - Aspect ratio: Maintained (1:1 for Instagram post)
- **Loading state:** Skeleton loader
- **Error state:** Placeholder icon + "Unable to load preview"

### Caption Box
- **Background:** #f9fafb (gray-50)
- **Border:** 1px solid #d1d5db (gray-300)
- **Border-radius:** 6px
- **Padding:** 12px
- **Font:** 14px, line-height: 1.6, color: #374151
- **Label:** "Caption:" (font-weight: 500, gray-700)
- **Content:** Read-only, full text display with word wrap

### Metadata Section
- **Label:** "Step: N of M"
- **Status indicator:**
  - Pending: 🟡 yellow circle
  - Approved: 🟢 green circle
  - Rejected: 🔴 red circle
- **Layout details:**
  - "Layout: [Type]" (e.g., "Instagram Post")
  - "Dimensions: 1080 × 1080"
  - "Aspect Ratio: 1:1"
- **Font:** 13px, gray-600
- **Spacing:** 12px between each info line

### Navigation Buttons
- **Layout:** Flex row, center alignment
- **Buttons:**
  1. **Previous:** `[← Prev]` - disabled if on first step
  2. **Next:** `[Next →]` - disabled if on last step
- **Button style:** Secondary (outline)
- **Spacing:** 12px between buttons
- **Height:** 36px

### Close Button
- **Text:** "[Close Preview]"
- **Style:** Secondary
- **Position:** Bottom of panel
- **Action:** Closes preview, returns to ApprovalCard view

---

## Preview Content Simulation

### Instagram Post Example
```
┌──────────────────────────────┐
│                              │
│      [Image 1080×1080]       │
│      ┌──────────────────┐    │
│      │                  │    │
│      │   Color photo    │    │
│      │   or carousel    │    │
│      │   thumbnail      │    │
│      │                  │    │
│      └──────────────────┘    │
│                              │
│  ┌──────────────────────────┐│
│  │ Caption:                 ││
│  │                          ││
│  │ Discover the magic of... ││
│  │ Our new collection is... ││
│  │ Stay tuned! 🎉           ││
│  └──────────────────────────┘│
│                              │
│  Step: 1 of 4                │
│  Status: Pending ●           │
│                              │
│  Instagram Post              │
│  1080 × 1080 (Square)        │
│                              │
└──────────────────────────────┘
```

### Story Example (if added in future)
```
┌──────────────────────────────┐
│                              │
│  [Image 1080×1920 Portrait]  │
│  ┌──────────────────────────┐│
│  │                          ││
│  │   Story format           ││
│  │   Tall/portrait          ││
│  │   aspect ratio           ││
│  │                          ││
│  └──────────────────────────┘│
│                              │
│  ┌──────────────────────────┐│
│  │ Caption:                 ││
│  │ Limited time offer...    ││
│  └──────────────────────────┘│
│                              │
│  Step: 2 of 4                │
│  Status: Approved ●          │
│                              │
│  Instagram Story             │
│  1080 × 1920 (Portrait)      │
│                              │
└──────────────────────────────┘
```

---

## States & Interactions

### Default State
- Displays current step's content
- Both Prev/Next buttons available (unless on boundary)
- Preview renders immediately

### Loading State
- Skeleton loader for image
- Placeholder for caption
- Buttons disabled

### Approved State
- Status badge: "🟢 Approved"
- Background: #f0fdf4 (green tint)
- Border: 1px solid #d1f3d6 (green border)

### Rejected State
- Status badge: "🔴 Rejected"
- Background: #fef2f2 (red tint)
- Border: 1px solid #fee2e2 (red border)

### Navigation (Prev/Next)
- **Prev disabled:** When on step 1
- **Next disabled:** When on last step
- **Button color:** Gray when disabled
- **Click:** Triggers smooth transition to adjacent step

### Error State
- Image load failed: Show placeholder icon
- Caption missing: Show "No caption provided"

---

## Keyboard Navigation

- **Escape:** Close preview panel
- **ArrowLeft:** Previous step
- **ArrowRight:** Next step
- **Tab:** Navigate through buttons and close button
- **Enter/Space:** Activate focused button

---

## Accessibility (WCAG 2.1 AA)

- [ ] **Semantic HTML:** `<aside>` (desktop) or `<dialog>` (mobile)
- [ ] **Image alt text:** `alt="Preview of Step N: [title]"`
- [ ] **ARIA attributes:**
  - `aria-label="Preview panel showing approval step preview"`
  - `aria-live="polite"` on status badge
  - Buttons: `aria-label="View previous approval step"`, `aria-label="View next approval step"`
- [ ] **Color contrast:** 
  - Text vs background: >= 4.5:1
  - Status indicators: Use icon + text (not color-only)
- [ ] **Focus management:**
  - Focus trap on modal (tablet/mobile)
  - Focus visible: 2px outline on buttons
- [ ] **Skip links:** Skip to close button from top

---

## Integration Notes

### With ApprovalCard
- Opened from ApprovalCard's **Preview** button
- Displays content for that specific step
- Step number correlates to card order

### With EditCaptionForm
- If caption is edited while preview open: Preview updates live (if sync enabled)
- Shows before/after comparison (optional feature)

### Backend Sync
- Fetches preview data from Story 4.1 API
- Uses cached image if available
- Fallback to placeholder if image unavailable

---

## Design Tokens Used

| Token | Value | Usage |
|-------|-------|-------|
| `spacing-xs` | 4px | Border radius |
| `spacing-sm` | 8px | Label/content gap |
| `spacing-md` | 12px | Padding, gaps |
| `spacing-lg` | 16px | Content padding |
| `rounded-md` | 6px | Image, boxes |
| `rounded-lg` | 8px | Panel |
| `shadow-modal` | 0 10px 25px rgba(0,0,0,0.2) | Modal |
| `color-primary` | #3b82f6 | Focus |
| `color-success` | #10b981 | Approved |
| `color-danger` | #ef4444 | Rejected |
| `color-warning` | #f59e0b | Pending |
| `duration-sm` | 150ms | Button transitions |
| `duration-md` | 300ms | Step transitions |

---

## Component API (TypeScript)

```typescript
interface PreviewStep {
  step: number;
  title: string;
  imageUrl: string;
  caption: string;
  status: 'pending' | 'approved' | 'rejected';
  layout: 'instagram-post' | 'instagram-story' | 'reel';
  dimensions: { width: number; height: number };
}

interface PreviewPanelProps {
  steps: PreviewStep[];
  currentStepIndex: number;
  onClose: () => void;
  onNavigate: (stepIndex: number) => void;
  isLoading?: boolean;
}
```

---

## Next Steps

→ **See:** ApprovalCard.md (parent component)  
→ **See:** EditCaptionForm.md (content editing)  
→ **See:** ApprovalToolbar.md (overall container)
