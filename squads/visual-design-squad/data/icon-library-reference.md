# Icon Library Reference

**Version:** 1.0.0  
**Last Updated:** 2026-04-07  
**Scope:** Design system icon guidelines, conventions, and available icon sets

---

## Icon Systems in Use

### 1. **Feather Icons** (Primary)
- **Link:** https://feathericons.com/
- **License:** MIT (free)
- **Size:** 24px base
- **Styles:** Line (stroke)
- **Usage:** General UI icons, buttons, navigation
- **NPM:** `npm install feather-icons`

**Common Icons:**
- Navigation: `home`, `menu`, `arrow-left`, `arrow-right`, `chevron-up`, `chevron-down`
- Actions: `edit`, `trash-2`, `download`, `upload`, `share-2`, `copy`
- Status: `check`, `x`, `alert-circle`, `info`, `help-circle`
- Forms: `search`, `filter`, `settings`, `sliders`
- Social: `twitter`, `facebook`, `linkedin`, `mail`, `phone`

**Example Usage:**
```html
<svg class="icon icon--24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
</svg>
```

### 2. **Heroicons** (Secondary)
- **Link:** https://heroicons.com/
- **License:** MIT (free)
- **Sizes:** 16px, 20px, 24px
- **Styles:** Solid, Outline
- **Usage:** Alternative for larger, filled icons
- **NPM:** `npm install heroicons`

**Common Icons:**
- Large format versions of common UI icons
- Both filled and outline styles available
- Better for larger display sizes (32px+)

### 3. **Material Design Icons** (Fallback)
- **Link:** https://fonts.google.com/icons
- **License:** Apache 2.0
- **Sizes:** Scalable
- **Usage:** Fallback/alternative icons
- **NPM:** `npm install @material-design-icons/font`

---

## Icon Size System

### Standard Sizes

| Size | Pixels | Use Case | Example |
|------|--------|----------|---------|
| **xs** | 16px | Inline icons, badges | Inline status indicator |
| **sm** | 20px | Form inputs, small buttons | Search icon in input |
| **md** | 24px | Standard buttons, navigation | Nav menu icons |
| **lg** | 32px | Large buttons, cards | Card action button |
| **xl** | 48px | Feature icons, hero sections | Large call-to-action |
| **2xl** | 64px | Hero graphics, large illustrations | Homepage hero icon |

### Spacing Around Icons

```
Icon + Text: 8px gap
Icon within button: 8px gap from text
Icon in input: 12px from edge
Standalone icon: 24px minimum space around
```

---

## Icon Usage Guidelines

### Icon Color

**Always use `currentColor` or CSS variables:**

```css
.icon {
  color: var(--color-primary);
  /* or */
  color: currentColor;
}
```

**Color variants:**
- Primary action: `var(--color-primary)` (#2563EB)
- Danger/error: `var(--color-error)` (#DC2626)
- Success: `var(--color-success)` (#059669)
- Disabled: `var(--color-gray-300)` (#D1D5DB)
- Text default: `var(--color-text-primary)` (#1F2937)

### Icon Strokes & Fills

**Stroke icons (Feather):**
```css
.icon {
  stroke-width: 2;
  fill: none;
}
```

**Filled icons (Heroicons solid):**
```css
.icon {
  fill: currentColor;
}
```

### Icon Animations

**Rotate (loading spinner):**
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.icon--loading {
  animation: spin 1.5s linear infinite;
}
```

**Pulse (notification):**
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.icon--pulse {
  animation: pulse 2s ease-in-out infinite;
}
```

### Icon in Buttons

**Button with icon only:**
```html
<button class="btn btn--icon" aria-label="Close menu">
  <svg class="icon icon--24" viewBox="0 0 24 24" ...>
    <!-- x icon -->
  </svg>
</button>
```

**Button with icon + text:**
```html
<button class="btn">
  <svg class="icon icon--20 btn__icon" ...>
    <!-- edit icon -->
  </svg>
  <span>Edit Profile</span>
</button>
```

**Icon button spacing:**
```css
.btn__icon {
  margin-right: var(--spacing-1); /* 8px gap */
}
```

### Icon in Forms

**Input with icon:**
```html
<div class="form-field">
  <svg class="icon icon--sm form-field__icon" ...>
    <!-- search icon -->
  </svg>
  <input type="search" class="form-field__input" placeholder="Search...">
</div>
```

**Styling:**
```css
.form-field__icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-secondary);
}

.form-field__input {
  padding-left: 40px; /* Icon width (20px) + spacing */
}
```

---

## Icon Accessibility

### Required Attributes

**Icon-only buttons must have aria-label:**
```html
<button aria-label="Close menu">
  <svg class="icon" ...><!-- x icon --></svg>
</button>
```

**Decorative icons (no aria-label needed):**
```html
<p>
  Saved to library
  <svg class="icon" aria-hidden="true" ...><!-- check icon --></svg>
</p>
```

**With aria-hidden="true":**
- Use when icon is purely decorative
- Text already conveys meaning
- Example: Check mark next to "Saved"

### Screen Reader Text

**If icon is only indicator:**
```html
<button>
  <svg class="icon" aria-hidden="true"><!-- bell icon --></svg>
  <span class="sr-only">3 notifications</span>
</button>
```

**Sr-only class:**
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### Color Not Alone

**Never use color only to convey meaning:**

```html
<!-- ❌ Bad: Only red color means error -->
<svg class="icon" style="color: red;"><!-- warning --></svg>

<!-- ✅ Good: Icon + color + text -->
<div class="error">
  <svg class="icon error__icon"><!-- warning icon --></svg>
  <span>This field is required</span>
</div>
```

---

## Icon Naming Convention

### Pattern: `{function}-{variant}`

**Examples:**
- `chevron-down`, `chevron-up`, `chevron-left`, `chevron-right`
- `arrow-down`, `arrow-up`, `arrow-left`, `arrow-right`
- `check`, `check-circle`, `check-square`
- `x`, `x-circle`, `x-square`
- `plus`, `plus-circle`, `plus-square`
- `trash`, `trash-2` (alternative style)
- `edit`, `edit-2`, `edit-3`
- `menu`, `menu-icon` (alternative naming)

---

## Status Icons

| Status | Icon | Color | Usage |
|--------|------|-------|-------|
| **Success** | `check`, `check-circle` | Green (#059669) | Completed action |
| **Warning** | `alert-circle`, `alert-triangle` | Amber (#D97706) | Caution needed |
| **Error** | `x`, `x-circle`, `alert-circle` | Red (#DC2626) | Problem/failure |
| **Info** | `info`, `info-circle` | Blue (#0EA5E9) | Informational |
| **Loading** | `loader` (animated) | Primary (#2563EB) | In progress |

---

## Icon States

### Default State
```css
.icon {
  color: var(--color-text-primary);
  opacity: 1;
}
```

### Hover State
```css
button:hover .icon {
  color: var(--color-primary);
  transform: scale(1.1);
}
```

### Disabled State
```css
button:disabled .icon {
  color: var(--color-gray-300);
  opacity: 0.6;
}
```

### Loading State
```css
.icon--loading {
  animation: spin 1.5s linear infinite;
}
```

---

## Common Icon Combinations

### Form Field Icons
- Search input: `search` icon (left side)
- Email input: `mail` icon
- Password input: `lock` icon or `eye`/`eye-off`
- Phone input: `phone` icon
- Success state: `check` or `check-circle`

### Navigation Icons
- Home: `home`
- Profile: `user` or `user-circle`
- Settings: `settings` or `sliders`
- Help: `help-circle` or `info`
- Menu: `menu` or `menu-icon`
- Close menu: `x`

### Action Icons
- Edit: `edit`, `edit-2`, `edit-3`
- Delete: `trash`, `trash-2`
- Download: `download`
- Upload: `upload`
- Share: `share-2`
- Copy: `copy`
- External link: `external-link`

### Social Icons
- Twitter: `twitter`
- Facebook: `facebook`
- Instagram: `instagram` (from Material Design)
- LinkedIn: `linkedin`
- Email: `mail`

---

## SVG Implementation Best Practices

### Inline SVG
```html
<svg class="icon icon--24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

### SVG as Image
```html
<img src="/icons/check.svg" alt="Completed" class="icon icon--24">
```

### SVG as Background
```css
.icon-bg {
  background: url('/icons/check.svg') no-repeat center;
  background-size: 24px;
  width: 24px;
  height: 24px;
}
```

### Attributes to Include
- `viewBox="0 0 24 24"` (preserves scaling)
- `fill="none"` (for stroke icons)
- `stroke="currentColor"` (uses CSS color)
- `stroke-width="2"` (standard stroke weight)
- `stroke-linecap="round"` (smooth corners)
- `stroke-linejoin="round"` (smooth joints)

---

## Responsive Icons

### Icon Size by Breakpoint

| Breakpoint | Button Icon | Nav Icon | Standalone |
|------------|-------------|----------|------------|
| Mobile (320px) | 20px | 24px | 32px |
| Tablet (768px) | 20px | 24px | 32px |
| Desktop (1024px) | 24px | 24px | 48px |

### Responsive CSS
```css
.icon {
  width: 20px;
  height: 20px;
}

@media (min-width: 1024px) {
  .icon {
    width: 24px;
    height: 24px;
  }
}
```

---

## Icon Fonts vs SVG

| Aspect | Icon Font | SVG |
|--------|-----------|-----|
| **Performance** | Single file, cached | Individual files, HTTP2 benefits |
| **Scalability** | Uses font-size | Scales independently |
| **Coloring** | Single color | Multiple colors possible |
| **Animation** | Limited | Full animation support |
| **Accessibility** | Needs aria-hidden | Built-in support |
| **Recommendation** | Legacy | **Modern (preferred)** |

**Recommendation:** Use SVG for new projects, icon fonts for legacy support.

---

## Checklist for Using Icons

- [ ] Icon is meaningful and clear
- [ ] Icon-only buttons have `aria-label`
- [ ] Decorative icons have `aria-hidden="true"`
- [ ] Icon color uses CSS variables or `currentColor`
- [ ] Icon size matches system (16, 20, 24, 32, 48, 64px)
- [ ] Color not sole indicator of meaning (use pattern + color)
- [ ] Sufficient color contrast (3:1 minimum for graphical objects)
- [ ] Icon animated with `prefers-reduced-motion` respected
- [ ] Icon responsive to breakpoints
- [ ] Icon loads efficiently (SVG inline or optimized)

---

## Tools & Resources

- **Feather Icons:** https://feathericons.com/
- **Heroicons:** https://heroicons.com/
- **Material Design Icons:** https://fonts.google.com/icons
- **SVG Optimization:** https://jakearchibald.github.io/svgomg/
- **Icon Animation:** CSS transforms, keyframes
- **Accessibility:** https://www.w3.org/WAI/tutorials/images/

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-04-07 | Initial icon library reference |

---

*Icon Library Reference for Visual Design Squad. Maintain consistency across all icon usage through this guide.*
