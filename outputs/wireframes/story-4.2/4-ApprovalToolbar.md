# ApprovalToolbar Component — Hi-Fi Wireframe

**Story:** 4.2 - Approval UI & UX  
**Component:** ApprovalToolbar  
**Fidelity:** High  
**Purpose:** Container for approval workflow with multiple cards, global actions, and toolbar controls

---

## Visual Layout (ASCII Hi-Fi)

### Desktop (1024px+) — Full Layout
```
┌────────────────────────────────────────────────────────────────────────────┐
│  NEXUS Approval Dashboard                              [Settings] [Logout] │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  Approval Workflow — Manual Mode                                          │
│  ────────────────────────────────────────────────────────────────────────  │
│                                                                            │
│  Progress: ●●●○○   3 of 5 steps approved     [Approve All] [Reject All]   │
│                                                                            │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │ ApprovalCard — Step 1: Caption        [Status: Pending ●]          │ │
│  │ Lorem ipsum dolor sit amet...                                       │ │
│  │ [Preview] [Edit] [Approve] [Reject]                               │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │ ApprovalCard — Step 2: Hashtags        [Status: Approved ●]         │ │
│  │ #nexus #marketing #instagram                                        │ │
│  │ [Preview] [Edit] [Approve] [Reject]                               │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │ ApprovalCard — Step 3: Image          [Status: Approved ●]          │ │
│  │ [Image thumbnail] 1080×1080                                         │ │
│  │ [Preview] [Edit] [Approve] [Reject]                               │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │ ApprovalCard — Step 4: Schedule        [Status: Pending ●]          │ │
│  │ Schedule: 2026-04-15 at 14:00 UTC                                  │ │
│  │ [Preview] [Edit] [Approve] [Reject]                               │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │ ApprovalCard — Step 5: Confirmation    [Status: Pending ●]          │ │
│  │ Ready to publish?                                                   │ │
│  │ [Preview] [Edit] [Approve] [Reject]                               │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│  ────────────────────────────────────────────────────────────────────────  │
│                                                                            │
│  [Back to Dashboard] [Publish Post] ✅ (enabled when all approved)        │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### Tablet (768px)
```
┌──────────────────────────────────────────────────┐
│ Approval Dashboard              [Menu]            │
├──────────────────────────────────────────────────┤
│                                                  │
│ Approval Workflow — Manual Mode                  │
│ ────────────────────────────────────────────     │
│                                                  │
│ Progress: ●●●○○  3/5 approved                   │
│ [Approve All] [Reject All]                      │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│ ┌────────────────────────────────────────────┐  │
│ │ Step 1: Caption        [Pending]           │  │
│ │ Lorem ipsum...                             │  │
│ │ [Preview] [Edit] [Approve] [Reject]        │  │
│ └────────────────────────────────────────────┘  │
│                                                  │
│ ┌────────────────────────────────────────────┐  │
│ │ Step 2: Hashtags       [Approved]          │  │
│ │ #nexus #marketing...                       │  │
│ │ [Preview] [Edit] [Approve] [Reject]        │  │
│ └────────────────────────────────────────────┘  │
│                                                  │
│ [More steps below, scroll]                      │
│                                                  │
│ ────────────────────────────────────────────     │
│ [Back] [Publish] (disabled)                     │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Mobile (375px)
```
┌──────────────────────────────────┐
│ Approval      [Menu]              │
├──────────────────────────────────┤
│                                  │
│ Manual Mode Workflow              │
│ ─────────────────────────────     │
│                                  │
│ ●●●○○  3/5 Approved              │
│                                  │
│ [Approve All] [Reject All]       │
│                                  │
├──────────────────────────────────┤
│                                  │
│ ┌────────────────────────────┐  │
│ │ Step 1: Caption [Pending]  │  │
│ │ Lorem ipsum...             │  │
│ │ [Preview]                  │  │
│ │ [Edit]                     │  │
│ │ [Approve] [Reject]         │  │
│ └────────────────────────────┘  │
│                                  │
│ [More steps, scroll]             │
│                                  │
│ [Back] [Publish]                 │
│                                  │
└──────────────────────────────────┘
```

---

## Component Structure (Atomic Design)

### Main Container
- **Type:** Organism (Toolbar wrapper)
- **Background:** #ffffff
- **Min-height:** 100vh (full screen)
- **Responsive:** Full width, responsive padding

### Header Section
- **Title:** "Approval Workflow — [Mode]" (24px, font-weight: 700)
- **Breadcrumb:** [Product] > [Campaign] > [Post] (if applicable)
- **Styling:** #111827 (gray-900)

### Progress Section
- **Label:** "Progress:" (14px, font-weight: 500)
- **Visual indicator:** Progress circles (●●●○○)
  - Pending: 🟡 Yellow
  - Approved: 🟢 Green
  - Rejected: 🔴 Red
- **Count:** "N of M steps approved"
- **Global action buttons:**
  1. **Approve All:** Primary style (green) — approves all remaining pending steps
  2. **Reject All:** Destructive style (red) — rejects all remaining steps
  - Spacing: 16px between buttons
  - Confirmation: Modal on click ("Are you sure?")

### Cards Container
- **Type:** Vertical stack
- **Layout:** Single column (mobile/tablet) or with optional preview panel (desktop)
- **Gap:** 16px between cards
- **Padding:** 24px (desktop), 16px (mobile)
- **Scroll:** Vertical scroll if height exceeds viewport

### Individual ApprovalCard
- **See:** ApprovalCard.md wireframe
- **Repeated:** Once per approval step
- **State:** Each card maintains independent state

### Bottom Action Bar
- **Background:** #fafafa (gray-50)
- **Border-top:** 1px solid #e5e7eb (gray-300)
- **Position:** Sticky (always visible at bottom)
- **Padding:** 16px 24px
- **Layout:** Flex row, space-between
- **Buttons:**
  1. **Back to Dashboard:** Secondary style (outline)
     - Action: Navigate back to approval list/dashboard
  2. **Publish Post:** Primary style (green)
     - Disabled until all steps approved
     - Hover text: "Complete all steps to publish"
     - Action: Submit to backend, show confirmation, redirect to published post

---

## State Management

### Toolbar State Object
```typescript
{
  steps: [
    { id: 1, title: "Caption", status: "pending", content: "...", },
    { id: 2, title: "Hashtags", status: "approved", content: "...", },
    { id: 3, title: "Image", status: "approved", content: "...", },
    { id: 4, title: "Schedule", status: "pending", content: "...", },
    { id: 5, title: "Confirmation", status: "pending", content: "...", },
  ],
  totalApproved: 2,
  totalRejected: 0,
  totalPending: 3,
  isPublishing: false,
}
```

### Step State Machine
```
pending → (user clicks Approve) → approved
pending → (user clicks Reject) → rejected
pending → (user clicks Edit) → editing (modal opens)
approved → (user clicks Reject) → rejected
rejected → (user clicks Approve) → approved
rejected → (user clicks Edit) → editing
```

---

## Global Actions

### Approve All Button
- **Precondition:** At least one pending step exists
- **Action:**
  1. Show confirmation modal
  2. On confirm: Set all pending steps to approved
  3. Update progress indicator
  4. Enable "Publish Post" button if all steps now approved
- **Loading state:** Spinner, disabled
- **Error state:** Toast notification, button remains enabled for retry

### Reject All Button
- **Precondition:** At least one pending step exists
- **Warning:** "This will reject all pending steps. Continue?"
- **Action:**
  1. Show confirmation modal
  2. On confirm: Set all pending steps to rejected
  3. Disable "Publish Post" button
  4. Show toast: "All steps rejected"

### Publish Post Button
- **Precondition:** All steps approved
- **Enabled state:** Green background, clickable
- **Disabled state:** Gray background, cursor: not-allowed, tooltip: "Complete all steps to publish"
- **Action on click:**
  1. Show loading spinner in button
  2. Call backend publish API
  3. On success: Redirect to published post view + success toast
  4. On error: Show error toast, button remains enabled for retry

---

## Integration Points

### With ApprovalCard
- Each card is a child component
- Card state updates trigger toolbar state updates
- Global actions (Approve All, Reject All) update all cards

### With EditCaptionForm
- Opens as modal from ApprovalCard's Edit button
- On save: Updates card content, toolbar state
- Form is contained within card context

### With PreviewPanel
- Opens from ApprovalCard's Preview button
- Can be desktop side panel or mobile modal
- Displays current step's preview

### Backend (Story 4.1)
- Fetches workflow steps on page load
- Syncs card approvals to backend
- Publishes post when ready

---

## Keyboard Navigation

- **Tab:** Navigate through cards and buttons
- **Shift+Tab:** Navigate backwards
- **Enter/Space:** Activate buttons
- **Escape:** Close any open modals
- **Ctrl/Cmd+Enter:** Quick publish (if all approved)

---

## Accessibility (WCAG 2.1 AA)

- [ ] **Semantic HTML:** `<main>`, `<section>`, `<nav>`
- [ ] **ARIA attributes:**
  - `aria-label="Approval workflow toolbar"`
  - Progress: `aria-live="polite"` (updates when status changes)
  - Buttons: Clear labels without relying on color
- [ ] **Color contrast:** >= 4.5:1 for all text
- [ ] **Focus management:** 
  - Focus visible: 2px outline
  - Tab order: Left-to-right, top-to-bottom
  - Focus trap: None (user can tab out)
- [ ] **Form labels:** Each card/field properly labeled
- [ ] **Error messages:** Color + icon + text
- [ ] **Keyboard only:** All actions possible via keyboard
- [ ] **Status updates:** Use aria-live for dynamic updates

---

## Responsive Behavior

### Desktop (1024px+)
- Toolbar in left column (70% width)
- PreviewPanel in right sidebar (30% width, sticky)
- Progress bar at top
- All cards visible in single column

### Tablet (768px-1023px)
- Full width cards
- PreviewPanel: Modal (triggered from card)
- Progress bar at top, horizontal scroll if needed
- Cards stack vertically with 16px gap

### Mobile (<768px)
- Full width, single column
- PreviewPanel: Full-screen modal
- Buttons stack vertically if space constrained
- Touch targets: 44px × 44px minimum

---

## Error Handling

### API Errors
- **Caption fetch fails:** Show skeleton, "Loading..." placeholder
- **Publish fails:** Show error toast, "Failed to publish. Retry?" with retry button
- **Approval action fails:** Revert card state, show error toast

### Validation
- **Publish without approval:** Disable button, show tooltip
- **Edit form validation:** Errors in form, save button disabled
- **Character limits:** Warn user in real-time

---

## Design Tokens Used

| Token | Value | Usage |
|-------|-------|-------|
| `spacing-xs` | 4px | Gaps |
| `spacing-sm` | 8px | Form spacing |
| `spacing-md` | 16px | Card gap |
| `spacing-lg` | 24px | Container padding |
| `rounded-md` | 6px | Cards, buttons |
| `rounded-lg` | 8px | Modals |
| `shadow-md` | 0 4px 6px rgba(0,0,0,0.1) | Cards |
| `shadow-lg` | 0 10px 25px rgba(0,0,0,0.2) | Modals |
| `color-primary` | #3b82f6 | Publish button |
| `color-success` | #10b981 | Approve |
| `color-danger` | #ef4444 | Reject |
| `duration-sm` | 150ms | Button transitions |
| `duration-md` | 300ms | Page transitions |

---

## Component API (TypeScript)

```typescript
interface ApprovalStep {
  id: number;
  title: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  imageUrl?: string;
}

interface ApprovalToolbarProps {
  steps: ApprovalStep[];
  postId: string;
  mode: 'manual' | 'auto';
  onPublish: (postId: string) => Promise<void>;
  onBack: () => void;
  onStepUpdate?: (stepId: number, status: string) => Promise<void>;
  isPublishing?: boolean;
}
```

---

## Next Steps

→ **Component inventory:** ApprovalCard.md, EditCaptionForm.md, PreviewPanel.md  
→ **Integration:** Connect to Story 4.1 backend API  
→ **Testing:** Unit tests, accessibility audit, responsive testing
