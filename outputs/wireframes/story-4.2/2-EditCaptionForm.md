# EditCaptionForm Component — Hi-Fi Wireframe

**Story:** 4.2 - Approval UI & UX  
**Component:** EditCaptionForm  
**Fidelity:** High  
**Purpose:** Form for editing caption with real-time preview sync

---

## Visual Layout (ASCII Hi-Fi)

### Desktop (1024px+) — Modal
```
┌──────────────────────────────────────────────────────────────┐
│ Edit Caption                                        [×] Close │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Caption Text                                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Lorem ipsum dolor sit amet, consectetur adipiscing     │ │
│  │ elit. Sed do eiusmod tempor incididunt ut labore et    │ │
│  │ dolore magna aliqua.                                   │ │
│  │                                                        │ │
│  │ (Word count: 27/300)                                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Character Limit                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━ 90/300 characters             │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Preview Update (Real-time):                          │  │
│  │                                                      │  │
│  │ [Image thumbnail]                                    │  │
│  │ Lorem ipsum dolor sit amet...                        │  │
│  │ [This updates as you type]                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ──────────────────────────────────────────────────────────  │
│                                                              │
│  [Cancel]                     [Save Changes] ✅              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Tablet (768px) — Modal
```
┌─────────────────────────────────────────────┐
│ Edit Caption                      [×]        │
├─────────────────────────────────────────────┤
│                                             │
│  Caption Text                               │
│  ┌──────────────────────────────────────┐  │
│  │ Lorem ipsum dolor sit amet,          │  │
│  │ consectetur adipiscing elit.         │  │
│  │                                      │  │
│  │ (27/300)                             │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  Progress: ──────────────── 90/300          │
│                                             │
│  Preview:                                   │
│  ┌──────────────────────────────────────┐  │
│  │ [Thumbnail]                          │  │
│  │ Lorem ipsum...                       │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  [Cancel] [Save Changes]                    │
│                                             │
└─────────────────────────────────────────────┘
```

### Mobile (375px) — Full-Screen Modal
```
┌──────────────────────────────────┐
│ Edit Caption            [×] Close │
├──────────────────────────────────┤
│                                  │
│ Caption Text                     │
│ ┌──────────────────────────────┐ │
│ │ Lorem ipsum dolor sit amet   │ │
│ │                              │ │
│ │ (27/300)                     │ │
│ └──────────────────────────────┘ │
│                                  │
│ ─────────────────── 90/300       │
│                                  │
│ Preview:                         │
│ ┌──────────────────────────────┐ │
│ │ [Thumbnail]                  │ │
│ │ Lorem ipsum...               │ │
│ └──────────────────────────────┘ │
│                                  │
│ [Cancel]                         │
│ [Save Changes]                   │
│                                  │
└──────────────────────────────────┘
```

---

## Component Structure (Atomic Design)

### Modal Container
- **Type:** Organism (Modal wrapper)
- **Background:** rgba(0,0,0,0.5) (overlay)
- **Entrance:** Fade in + slide up (300ms)
- **Responsive:** Full width on mobile, 600px max on desktop
- **Padding:** 24px (desktop), 16px (mobile)
- **Border-radius:** 12px
- **Z-index:** 1000

### Header
- **Title:** 20px font-weight: 700, color: #111827
- **Close button:** Top-right corner
  - Icon: "×" or "✕"
  - Size: 32px × 32px
  - Color: #6b7280 (gray-500)
  - Hover: #111827
  - Keyboard: Escape key closes

### Caption Textarea
- **Label:** "Caption Text" (14px, font-weight: 500)
- **Textarea:**
  - Height: 150px (desktop), 120px (mobile)
  - Border: 1px solid #d1d5db (gray-300)
  - Border-radius: 6px
  - Padding: 12px
  - Font: 14px monospace or system-ui
  - Placeholder: "Enter your caption here..."
  - Max-length: 300 characters (enforced)
- **Helper text:** "(27/300)" in gray-600, right-aligned, below textarea

### Character Counter
- **Style:** Progress bar
- **Background:** #e5e7eb (gray-200)
- **Progress fill:** 
  - 0-80%: #10b981 (green-600)
  - 80-95%: #f59e0b (amber-500)
  - 95-100%: #ef4444 (red-500)
- **Height:** 4px
- **Border-radius:** 2px
- **Label:** "{current}/{max} characters" right-aligned below bar

### Preview Panel
- **Label:** "Preview Update (Real-time)"
- **Background:** #f9fafb (gray-50)
- **Border:** 1px dashed #d1d5db (gray-300)
- **Border-radius:** 6px
- **Padding:** 16px
- **Content:**
  - Image thumbnail (100px × 100px, centered)
  - Caption text (14px, line-height: 1.5)
  - Timestamp if applicable
  - Status: "[This updates as you type]" in gray-500 italic

### Action Buttons
- **Layout:** Flex row, space-between
- **Buttons:**
  1. **Cancel:** Secondary style (outline), left-aligned
  2. **Save Changes:** Primary style (green) with checkmark icon, right-aligned
- **Button height:** 40px
- **Spacing:** 12px between buttons
- **On save:** 
  - Button shows loading spinner
  - Disabled state during API call
  - Success message: "✅ Changes saved"

---

## Real-Time Preview Behavior

### Input Change Handler
```
On each keystroke:
  1. Update preview text immediately
  2. Update character counter
  3. Validate against max length
  4. Update progress bar color based on fill %
  5. (Optional) Fetch image preview if caption format changes
```

### Debounce Strategy
- **Debounce delay:** 300ms
- **Purpose:** Don't re-render on every keystroke (performance)
- **Effect:** Preview updates feel instant but don't cause jank

### Edge Cases
- **Empty caption:** Show placeholder text "No caption"
- **Line breaks:** Preserve user's line breaks
- **Special characters:** Escape for safety
- **URLs:** Linkify if caption contains http/https

---

## States & Interactions

### Default State
- Textarea focused
- Character count: "0/300"
- Progress bar: Empty
- Preview empty
- Save button: enabled

### Typing State (Active)
- Real-time preview updates
- Character counter updates
- Progress bar fills based on text length

### Full (95%+)
- Progress bar turns amber/red
- Input still accepts characters but shows warning
- Helper text: "Approaching limit (285/300)"

### After Save
- Spinner in button (500ms)
- Success toast: "Caption updated successfully"
- Modal closes or resets
- Parent ApprovalCard updates with new content

### Error State (on save)
- Error message below buttons
- Save button remains enabled for retry
- Message: "Failed to save. Please try again."
- Color: red-600

---

## Accessibility (WCAG 2.1 AA)

- [ ] **Semantic HTML:** `<dialog>` element (or role="dialog")
- [ ] **Focus management:** 
  - Focus moves to textarea on open
  - Focus trap: Tab cycles through form elements
  - On close: Focus returns to trigger button (ApprovalCard Edit)
- [ ] **ARIA attributes:**
  - `aria-labelledby="modal-title"`
  - `aria-describedby="modal-description"`
  - `aria-live="polite"` on character counter
  - Textarea: `aria-label="Caption text input"`
  - Buttons: `aria-label="Save caption changes"`, `aria-label="Cancel edit"`
- [ ] **Color contrast:** All text >= 4.5:1
- [ ] **Keyboard:**
  - Tab navigates: Textarea → Cancel → Save → Close
  - Enter in textarea: No default (allow multiline)
  - Enter on buttons: Activates
  - Escape: Closes modal
- [ ] **Error messages:** Color + icon + text (not color-only)

---

## Integration Notes

### With ApprovalCard
- Opened from ApprovalCard's **Edit** button
- Pre-fills with current caption content
- On save: Returns to ApprovalCard with updated content
- Modal position: Centered over card

### With PreviewPanel
- Real-time preview shows updated content
- Shares state with PreviewPanel (sync mechanism)
- If PreviewPanel is open: Updates live as you type

### Character Limit Enforcement
- Hard limit: 300 characters (no bypass)
- Soft limit warning: 250+ characters (UI warning)
- Matches backend validation in Story 4.1

---

## Design Tokens Used

| Token | Value | Usage |
|-------|-------|-------|
| `spacing-xs` | 4px | Progress bar |
| `spacing-sm` | 8px | Form gaps |
| `spacing-md` | 16px | Panel padding |
| `spacing-lg` | 24px | Modal padding |
| `rounded-md` | 6px | Textarea |
| `rounded-lg` | 12px | Modal |
| `shadow-modal` | 0 10px 25px rgba(0,0,0,0.2) | Modal |
| `color-primary` | #3b82f6 | Focus |
| `color-success` | #10b981 | Save button |
| `color-warning` | #f59e0b | 80%+ fill |
| `color-danger` | #ef4444 | 95%+ fill |
| `duration-sm` | 150ms | Focus transitions |
| `duration-md` | 300ms | Modal entrance |

---

## Component API (TypeScript)

```typescript
interface EditCaptionFormProps {
  initialContent: string;
  maxLength?: number; // default: 300
  onSave: (content: string) => Promise<void>;
  onCancel: () => void;
  imagePreviewUrl?: string;
  isLoading?: boolean;
}
```

---

## Next Steps

→ **See:** ApprovalCard.md (parent component)  
→ **See:** PreviewPanel.md (preview sync)  
→ **See:** ApprovalToolbar.md (overall container)
