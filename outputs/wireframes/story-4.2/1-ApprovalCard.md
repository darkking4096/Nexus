# ApprovalCard Component — Hi-Fi Wireframe

**Story:** 4.2 - Approval UI & UX  
**Component:** ApprovalCard  
**Fidelity:** High  
**Purpose:** Display individual approval card for each workflow step

---

## Visual Layout (ASCII Hi-Fi)

### Desktop (1024px+)
```
┌─────────────────────────────────────────────────────────────┐
│ ApprovalCard                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Step 1: Caption Review        [Status: Pending]           │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Content Area:                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Lorem ipsum dolor sit amet, consectetur adipiscing   │  │
│  │ elit. Sed do eiusmod tempor incididunt ut labore et  │  │
│  │ dolore magna aliqua.                                 │  │
│  │                                                      │  │
│  │ [Edit] [Preview]                        [Read only] │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Action Buttons (bottom right):                            │
│  [👁 Preview] [✏️ Edit] [✅ Approve] [❌ Reject]            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Tablet (768px)
```
┌──────────────────────────────────────────────┐
│ ApprovalCard                                 │
├──────────────────────────────────────────────┤
│                                              │
│  Step 1: Caption Review   [Pending]          │
│  ──────────────────────────────────────────  │
│                                              │
│  Content:                                    │
│  ┌────────────────────────────────────────┐ │
│  │ Lorem ipsum dolor sit amet,            │ │
│  │ consectetur adipiscing elit.           │ │
│  │ [Edit] [Preview]                       │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ──────────────────────────────────────────  │
│                                              │
│  [Preview] [Edit]                           │
│  [Approve] [Reject]                         │
│                                              │
└──────────────────────────────────────────────┘
```

### Mobile (375px)
```
┌─────────────────────────────────┐
│ ApprovalCard                    │
├─────────────────────────────────┤
│                                 │
│ Step 1: Caption [Pending]       │
│ ───────────────────────────────  │
│                                 │
│ Content:                        │
│ ┌─────────────────────────────┐ │
│ │ Lorem ipsum dolor sit amet  │ │
│ │ [Edit]                      │ │
│ └─────────────────────────────┘ │
│                                 │
│ ───────────────────────────────  │
│                                 │
│ [Preview]                       │
│ [Approve]                       │
│ [Reject]                        │
│                                 │
└─────────────────────────────────┘
```

---

## Component Structure (Atomic Design)

### Container
- **Type:** Atom (Card wrapper)
- **Props:** `step`, `title`, `content`, `status`
- **Padding:** 24px (desktop), 16px (tablet), 12px (mobile)
- **Border:** 1px solid #e5e7eb (gray-200)
- **Border-radius:** 8px
- **Background:** #ffffff
- **Shadow:** 0 1px 3px rgba(0,0,0,0.1)
- **Responsive:** Full width, max-width 600px

### Header Section
- **Title:** 18px font-weight: 600, color: #111827 (gray-900)
- **Subtitle/Step:** "Step N: [Title]"
- **Status Badge:** Right-aligned
  - Pending: 🟡 yellow-100 bg, yellow-700 text
  - Approved: 🟢 green-100 bg, green-700 text
  - Rejected: 🔴 red-100 bg, red-700 text

### Content Area
- **Background:** #f9fafb (gray-50)
- **Padding:** 16px
- **Border-radius:** 6px
- **Font:** 14px, line-height: 1.6, color: #374151 (gray-700)
- **Max height:** 200px (scroll if overflow)
- **Indicator:** "[Read only]" label bottom-right in gray-500

### Action Buttons
- **Layout:** Flex row, gap: 12px, right-aligned
- **Buttons:** 4 total
  1. **Preview:** Secondary style (outline)
  2. **Edit:** Secondary style
  3. **Approve:** Primary style (green)
  4. **Reject:** Destructive style (red)
- **Button size:** 40px height (mobile), 44px (tablet+)
- **Spacing:** 12px between buttons

---

## States & Interactions

### Default State
- Status: Pending
- All buttons enabled
- Content read-only

### Hover State (Desktop)
- Border color: #d1d5db (gray-300)
- Shadow elevation: 0 4px 6px rgba(0,0,0,0.15)
- Button opacity: 0.9 → 1.0 on button hover

### Focus State
- Outline: 2px solid #3b82f6 (blue-500)
- Outline-offset: 2px

### Approved State
- Status badge: "✅ Approved"
- Background tint: #f0fdf4 (green-50)
- Buttons: Edit/Preview remain enabled, Approve → disabled, Reject → disabled

### Rejected State
- Status badge: "❌ Rejected"
- Background tint: #fef2f2 (red-50)
- Buttons: Edit enabled, Approve → disabled, Reject → disabled

### Loading State (on button click)
- Button clicked becomes disabled
- Show spinner inside button
- Overlay card with opacity 0.7

---

## Accessibility (WCAG 2.1 AA)

- [ ] **Semantic HTML:** `<article>` container, `<header>`, `<div role="contentinfo">`
- [ ] **Color contrast:** All text >= 4.5:1 ratio
- [ ] **Focus indicators:** 2px outline on all interactive elements
- [ ] **ARIA labels:** 
  - `aria-label="Approval card for Step 1: Caption Review"`
  - `aria-label="Edit caption content"` (Edit button)
  - `aria-label="Approve this step"` (Approve button)
- [ ] **Status:** `aria-live="polite"` on status badge for dynamic updates
- [ ] **Tab order:** Logical (title → content → buttons L→R)
- [ ] **Keyboard nav:** Tab to navigate, Enter/Space to activate buttons
- [ ] **No keyboard traps:** Escape closes modals if opened from card

---

## Integration Notes

### With EditCaptionForm
- Clicking **Edit** button opens EditCaptionForm modal
- Form pre-fills with current content
- Form has save/cancel buttons
- On save: ApprovalCard updates, modal closes

### With PreviewPanel
- Clicking **Preview** button shows PreviewPanel (modal or side panel)
- Preview displays read-only version with final styling
- Shows how content will appear when published

### With ApprovalToolbar
- ApprovalCard is repeated in a list inside ApprovalToolbar
- Toolbar manages global actions (Approve All, Reject All)
- Individual card actions sync with toolbar state

---

## Design Tokens Used

| Token | Value | Usage |
|-------|-------|-------|
| `spacing-xs` | 4px | Small gaps |
| `spacing-sm` | 8px | Form inputs |
| `spacing-md` | 16px | Content padding |
| `spacing-lg` | 24px | Card padding |
| `rounded-md` | 6px | Content area |
| `rounded-lg` | 8px | Card border |
| `shadow-sm` | 0 1px 3px rgba(0,0,0,0.1) | Default |
| `shadow-md` | 0 4px 6px rgba(0,0,0,0.15) | Hover |
| `color-primary` | #3b82f6 (blue-500) | Focus/approve |
| `color-success` | #10b981 (green-600) | Approve button |
| `color-danger` | #ef4444 (red-500) | Reject button |
| `color-warning` | #f59e0b (amber-500) | Pending status |

---

## Component API (TypeScript)

```typescript
interface ApprovalCardProps {
  step: number;
  title: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  onEdit: () => void;
  onPreview: () => void;
  onApprove: () => void;
  onReject: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}
```

---

## Next Steps

→ **See:** EditCaptionForm.md (editing interface)  
→ **See:** PreviewPanel.md (preview display)  
→ **See:** ApprovalToolbar.md (toolbar container)
