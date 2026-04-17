# 🎨 Story 7.5: User Onboarding Flow — Mid-Fidelity Wireframes

**Project:** NEXUS Platform  
**Story:** 7.5 (User Onboarding Flow & Interactive Tutorial)  
**Fidelity Level:** Mid-Fidelity (Mid-Fi)  
**Created:** 2026-04-17  
**Status:** Ready for Visual Design (Stella)  

---

## 📋 Wireframe Scope

This package contains mid-fidelity wireframes for:
- ✅ Welcome Screen (first-time visitor landing)
- ✅ Tutorial Steps 1-5 (guided onboarding flow)
- ✅ Profile Setup Form (integrated with tutorial)
- ✅ Help Tooltips (context-aware assistance)
- ✅ Mobile Responsive Layout
- ✅ State Transitions (loading, error, success)

**Target Duration:** 5-10 minutes per user  
**Mobile Support:** iPhone SE (375px) + Android (360px) minimum  
**Accessibility:** WCAG 2.1 AA (labeled inputs, focus management, keyboard nav)

---

## 🎯 Screen 1: Welcome Screen

**When:** First visit (detected via `hasCompletedOnboarding` flag)  
**Duration on screen:** 10-20 seconds  
**Primary CTA:** "Start Tutorial"  

### ASCII Wireframe

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  NEXUS                                    [Profile ⋮]  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                                                         │
│              [Hero Image / Animated SVG]               │
│              (Shows growth, Instagram posts)           │
│                                                         │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ✨ Welcome to NEXUS                                   │
│                                                         │
│  Your AI-powered platform for Instagram growth        │
│                                                         │
│  In 5 minutes you'll:                                 │
│  • Create your profile                               │
│  • Connect Instagram                                 │
│  • Generate your first post                          │
│  • Publish and track analytics                       │
│                                                         │
│  [────────────────────────────────────────]           │
│                                                         │
│  ╔════════════════════════════════════════╗           │
│  ║  ▶ START TUTORIAL                      ║           │
│  ╚════════════════════════════════════════╝           │
│                                                         │
│  [Skip for now]                                        │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ Privacy Policy  |  Terms of Service  |  Help Center    │
└─────────────────────────────────────────────────────────┘
```

### Component Breakdown (Atomic Design)

**Atoms:**
- Hero Image (placeholder for marketing content)
- Primary Button (CTA "Start Tutorial")
- Link (Skip option)
- Divider (visual separation)

**Molecules:**
- Benefit List (icon + text, 4 items)
- Footer Links (3 links in row)

**Organisms:**
- Header (logo + profile menu)
- Welcome Hero (image + headline + benefits)
- CTA Section (button + skip link)

### Design Notes

```yaml
layout:
  hero_height: 280px  # Responsive: scales on mobile
  spacing: 24px (lg)  # 3x base unit
  alignment: Center-aligned, single column

colors:
  background: #f8f9fa (light gray)
  text_primary: #1a202c (dark)
  text_secondary: #4a5568 (muted)
  cta_button: #6366f1 (brand primary)
  cta_hover: #4f46e5 (darker shade)

typography:
  headline: 32px, bold, #1a202c
  body: 16px, regular, #4a5568
  link: 14px, underline, #6366f1

states:
  hover: Button scale 1.02, shadow
  focus: Border 2px solid #6366f1, outline 2px offset
  active: CTA highlight with checkmark animation (if coming back)

mobile_adaptations:
  hero_height: 200px
  headline: 24px
  button_height: 48px (touch target >= 44px)
  padding: 16px (sm)
```

---

## 🎯 Screen 2-6: Tutorial Steps (5 steps)

**Progress Indicator:** Horizontal bar showing "Step X of 5"  
**Navigation:** Back/Next buttons + skip option  
**Auto-save:** Form data persisted to localStorage after each step  

### Tutorial Step Template (Reusable)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  NEXUS                          [Step 2 of 5] ▓░░░░░░ │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Step Headline                                          │
│  ─────────────────────────                             │
│                                                         │
│  Step description / context                            │
│  (1-2 sentences explaining what user needs to do)      │
│                                                         │
│  [────────────────────────────────────────]             │
│                                                         │
│  [Form Fields / Interactive Content Here]              │
│  [Example: Input, dropdown, radio, OAuth button]       │
│                                                         │
│  [────────────────────────────────────────]             │
│                                                         │
│  💡 Tip: Context-aware help text with ? icon          │
│                                                         │
│  [────────────────────────────────────────]             │
│                                                         │
│  ┌──────────────────┬──────────────────────────────┐   │
│  │ ◄ BACK           │       NEXT ▶ [ENABLED]       │   │
│  └──────────────────┴──────────────────────────────┘   │
│                                                         │
│  [Skip remaining steps]                                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Step 1: Create Your Profile

**Primary Input:** Name, Bio, Profile Picture upload  
**Validation:** Real-time inline feedback  
**Key interaction:** Drag-drop or click to upload image  

```
┌─────────────────────────────────────────────────────────┐
│ NEXUS                          [Step 1 of 5] ▓░░░░░░   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  👤 Create Your Profile                                │
│                                                         │
│  Let's get to know you. This takes 2 minutes.         │
│                                                         │
│  [────────────────────────────────────────]             │
│                                                         │
│  Profile Picture                                       │
│  ┌──────────────────────────────────────┐              │
│  │                                      │              │
│  │    📸 Click or Drag to Upload       │              │
│  │    (JPG, PNG • Max 5MB)             │              │
│  │                                      │              │
│  │    [or use Gravatar @yourmail]      │              │
│  └──────────────────────────────────────┘              │
│                                                         │
│  Full Name *                                            │
│  ┌──────────────────────────────────────┐              │
│  │ [Type your name...]              [✓] │  ← Valid   │
│  └──────────────────────────────────────┘              │
│  Min 2 characters required                             │
│                                                         │
│  Bio / About You                                        │
│  ┌──────────────────────────────────────┐              │
│  │ [Tell us what you're about...]       │              │
│  │ [Max 160 chars]              [65/160]│              │
│  └──────────────────────────────────────┘              │
│  Optional • Add personality!                            │
│                                                         │
│  [────────────────────────────────────────]             │
│                                                         │
│  💡 Tip: Use keywords that match your niche          │
│  [?]                                                    │
│                                                         │
│  ┌──────────────────┬──────────────────────────────┐   │
│  │ ◄ BACK [disabled]│       NEXT ▶ [enabled]       │   │
│  └──────────────────┴──────────────────────────────┘   │
│                                                         │
│  [Skip to Connect Instagram]                            │
└─────────────────────────────────────────────────────────┘
```

**Component Notes:**
- Input fields use `form-field` molecule (label + input + helper)
- Validation icon (checkmark/error) displays inline on blur
- File upload shows progress bar during image process
- "Next" button disabled until name is filled

---

### Step 2: Connect Instagram

**Primary Action:** OAuth button (custom Instagram integration)  
**Visual:** Show Instagram logo, permission info  
**Fallback:** Manual Instagram handle entry  

```
┌─────────────────────────────────────────────────────────┐
│ NEXUS                          [Step 2 of 5] ░▓░░░░░░  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📱 Connect Instagram                                  │
│                                                         │
│  Authorize NEXUS to access your Instagram account.    │
│                                                         │
│  [────────────────────────────────────────]             │
│                                                         │
│  What we'll access:                                     │
│  ✓ Your profile info (name, bio, profile picture)     │
│  ✓ Your posts and captions                            │
│  ✓ Engagement metrics (likes, comments)               │
│  ✗ We won't post without your permission              │
│  ✗ We won't share your data with 3rd parties          │
│                                                         │
│  [────────────────────────────────────────]             │
│                                                         │
│  ╔════════════════════════════════════════╗           │
│  ║  🔗 LOGIN WITH INSTAGRAM               ║           │
│  ╚════════════════════════════════════════╝           │
│                                                         │
│  OR                                                     │
│                                                         │
│  Enter your Instagram handle manually:                  │
│  ┌──────────────────────────────────────┐              │
│  │ @ [yourname]                     [✓]  │ Connected  │
│  └──────────────────────────────────────┘              │
│  (without the @ symbol)                                 │
│                                                         │
│  [────────────────────────────────────────]             │
│                                                         │
│  💡 Why we need this: To fetch your posts and        │
│  generate insights based on your actual content.      │
│  [?]                                                    │
│                                                         │
│  ┌──────────────────┬──────────────────────────────┐   │
│  │ ◄ BACK           │       NEXT ▶ [enabled]       │   │
│  └──────────────────┴──────────────────────────────┘   │
│                                                         │
│  [Skip to Next Step]                                    │
└─────────────────────────────────────────────────────────┘
```

**States:**
- **Idle:** OAuth button in brand color, manual entry hidden
- **Connected (OAuth):** Checkmark + "Connected" badge, account name displayed
- **Connected (Manual):** Handle shown, checkmark badge
- **Error:** Red border on input, error message with retry option

---

### Step 3: Generate Your First Post

**Primary Action:** Generate post using template  
**Visual:** Show template preview, edit option  
**Demo data:** Pre-filled with example Instagram content  

```
┌─────────────────────────────────────────────────────────┐
│ NEXUS                          [Step 3 of 5] ░░▓░░░░░  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ✨ Generate Your First Post                           │
│                                                         │
│  Let's create engaging content for your audience.      │
│                                                         │
│  [────────────────────────────────────────]             │
│                                                         │
│  Choose a template:                                     │
│                                                         │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │ Growth Tips      │  │ Behind-the-      │            │
│  │ (Educational)    │  │ Scenes           │            │
│  │                  │  │ (Storytelling)   │            │
│  │ [Select]         │  │ [Select]         │            │
│  └──────────────────┘  └──────────────────┘            │
│                                                         │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │ Trending Topic   │  │ Call-to-Action   │            │
│  │ (News-based)     │  │ (Engagement)     │            │
│  │                  │  │                  │            │
│  │ [Select]         │  │ [Select]         │            │
│  └──────────────────┘  └──────────────────┘            │
│                                                         │
│  [────────────────────────────────────────]             │
│                                                         │
│  📱 Post Preview:                                       │
│                                                         │
│  ┌──────────────────────────────────────┐              │
│  │ @your_profile                  ⋮     │              │
│  │ ─────────────────────────────────    │              │
│  │ [Image placeholder 1:1 ratio]         │              │
│  │                                      │              │
│  │ ♥ 0 likes                            │              │
│  │                                      │              │
│  │ Your first post. Edit the caption:  │              │
│  │ "🚀 Just launched on NEXUS! Check  │              │
│  │  out my content strategy..."        │              │
│  │                                      │              │
│  │ 📝 [Edit Caption]  🎨 [Use AI]      │              │
│  └──────────────────────────────────────┘              │
│                                                         │
│  [────────────────────────────────────────]             │
│                                                         │
│  ┌──────────────────┬──────────────────────────────┐   │
│  │ ◄ BACK           │       NEXT ▶ [enabled]       │   │
│  └──────────────────┴──────────────────────────────┘   │
│                                                         │
│  [Skip to Publish Step]                                 │
└─────────────────────────────────────────────────────────┘
```

**Interaction Notes:**
- Template cards show icon + title + description
- Clicking template shows full editor (modal or full-screen)
- Post preview updates in real-time as user edits
- "Use AI" button opens caption generator

---

### Step 4: Publish & Share

**Primary Action:** Publish post to Instagram  
**Secondary:** Share post link, get shortlink  
**Celebration:** Success animation with confetti  

```
┌─────────────────────────────────────────────────────────┐
│ NEXUS                          [Step 4 of 5] ░░░▓░░░░  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🚀 Publish & Share                                    │
│                                                         │
│  Your post is ready. Let's go live!                    │
│                                                         │
│  [────────────────────────────────────────]             │
│                                                         │
│  📱 Post to Publish:                                    │
│  ┌──────────────────────────────────────┐              │
│  │ @your_profile                  ⋮     │              │
│  │ ─────────────────────────────────    │              │
│  │ [Image preview]                      │              │
│  │                                      │              │
│  │ Your first post. Edit the caption:  │              │
│  │ "🚀 Just launched on NEXUS!..."    │              │
│  └──────────────────────────────────────┘              │
│                                                         │
│  [────────────────────────────────────────]             │
│                                                         │
│  ╔════════════════════════════════════════╗           │
│  ║  ✔ PUBLISH TO INSTAGRAM              ║           │
│  ╚════════════════════════════════════════╝           │
│                                                         │
│  [────────────────────────────────────────]             │
│                                                         │
│  After publishing:                                      │
│  □ Share on your feed              [Learn more]        │
│  □ Get analytics link              [Copy]              │
│  □ Schedule for best time          [Premium]           │
│                                                         │
│  [────────────────────────────────────────]             │
│                                                         │
│  💡 Tip: Monitor engagement for 24 hours to see       │
│  what resonates with your audience.                    │
│  [?]                                                    │
│                                                         │
│  ┌──────────────────┬──────────────────────────────┐   │
│  │ ◄ BACK           │       NEXT ▶ [enabled]       │   │
│  └──────────────────┴──────────────────────────────┘   │
│                                                         │
│  [Skip to Analytics]                                    │
└─────────────────────────────────────────────────────────┘
```

**Loading State (during publish):**
```
┌─────────────────────────────────────────────────────────┐
│                  Publishing...                          │
│                                                         │
│           [████████░░░░░░░░░░] 60%                     │
│                                                         │
│           Uploading image to Instagram...              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Success State (post-publish):**
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    🎉 SUCCESS! 🎉                       │
│                                                         │
│         Your post is live on Instagram!               │
│                                                         │
│    [View on Instagram] [Go to Dashboard]              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### Step 5: View Analytics

**Primary Display:** Key metrics dashboard (views, likes, comments)  
**Visual:** Cards with numbers, mini charts  
**Interaction:** Click to see detailed insights  

```
┌─────────────────────────────────────────────────────────┐
│ NEXUS                          [Step 5 of 5] ░░░░░▓░░░  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📊 View Analytics                                     │
│                                                         │
│  Track how your post performs. Updates in real-time.  │
│                                                         │
│  [────────────────────────────────────────]             │
│                                                         │
│  Performance (Last 24 Hours)                            │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ 📈 Views     │  │ ❤️ Likes     │  │ 💬 Comments  │  │
│  │              │  │              │  │              │  │
│  │   1,240      │  │    87        │  │     12       │  │
│  │   ↑ 340% ▲   │  │   ↑ 120% ▲   │  │  ↑ 85% ▲    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ 👥 Reach     │  │ 💾 Saves     │  │ 🔗 Shares    │  │
│  │              │  │              │  │              │  │
│  │    5,820     │  │     34       │  │     18       │  │
│  │   ↑ 210% ▲   │  │  ↑ 156% ▲   │  │  ↑ 92% ▲    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                         │
│  [────────────────────────────────────────]             │
│                                                         │
│  👥 Audience Breakdown                                  │
│                                                         │
│  Top Demographics:                                      │
│  • Women: 62%                                           │
│  • Ages 25-34: 48%                                      │
│  • USA, UK, Canada: 76%                                │
│  • Most active: Monday-Friday 6-9 PM UTC               │
│                                                         │
│  [────────────────────────────────────────]             │
│                                                         │
│  Next Steps:                                            │
│  ✓ Go to Dashboard to see full analytics               │
│  ✓ Schedule your next post                             │
│  ✓ Get AI recommendations                              │
│                                                         │
│  [────────────────────────────────────────]             │
│                                                         │
│  ┌──────────────────┬──────────────────────────────┐   │
│  │ ◄ BACK           │  COMPLETE ▶ [enabled]        │   │
│  └──────────────────┴──────────────────────────────┘   │
│                                                         │
│  [Go back to edit another post]                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Completion State:**
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                   ✅ YOU DID IT! ✅                     │
│                                                         │
│    Congratulations on completing the tutorial!         │
│                                                         │
│    You're all set to use NEXUS. Happy posting! 🚀     │
│                                                         │
│    [Go to Dashboard]  [Create Another Post]            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 Help Tooltips (Context-Aware)

Appear on hover (desktop) or tap (mobile) of `?` icon.

### Tooltip Examples

**Step 1: "Bio / About You" Field**
```
┌─────────────────────────────────────┐
│ Bio Tips                             │
├─────────────────────────────────────┤
│ Use keywords that match your niche  │
│                                     │
│ ❌ "I like Instagram"              │
│ ✅ "Content creator | Photography │
│     | Travel blogger"               │
│                                     │
│ This helps our AI understand your  │
│ audience better.                    │
│                                     │
│ [Close] [Learn more]                │
└─────────────────────────────────────┘
```

**Step 2: "Instagram Handle" Field**
```
┌─────────────────────────────────────┐
│ Instagram Handle                    │
├─────────────────────────────────────┤
│ Your public Instagram username      │
│                                     │
│ Format: yourname (without @)        │
│                                     │
│ Example: sarah_photography          │
│          (not @sarah_photography)   │
│                                     │
│ [Close] [Learn more]                │
└─────────────────────────────────────┘
```

**Step 3: "Choose a Template"**
```
┌─────────────────────────────────────┐
│ Post Templates                      │
├─────────────────────────────────────┤
│ Start with a template to save time. │
│                                     │
│ Growth Tips: Educational content   │
│   Best for: Building authority     │
│                                     │
│ Behind-the-Scenes: Personal touch  │
│   Best for: Building connection    │
│                                     │
│ Trending Topics: Current news      │
│   Best for: Viral potential        │
│                                     │
│ Call-to-Action: Drive engagement   │
│   Best for: Conversion            │
│                                     │
│ [Close] [Learn more]                │
└─────────────────────────────────────┘
```

### Tooltip Styling

```yaml
tooltip:
  trigger: click (mobile) | hover (desktop) | ? icon
  position: Auto-position to avoid going off-screen
  width: 300px (max)
  background: White (#ffffff)
  border: 1px solid #e2e8f0 (light gray)
  shadow: 0 4px 12px rgba(0, 0, 0, 0.15)
  border_radius: 6px
  padding: 16px
  z_index: 1000 (above form)
  animation: Fade in 150ms ease-out
  dismissible: Click X or click outside
```

---

## 🔄 Interaction Flows

### Complete Onboarding Flow

```
┌─────────────┐
│   Welcome   │
│   Screen    │
└──────┬──────┘
       │ [Start Tutorial] or [Skip]
       ↓
   ┌───────────────────────────────────────┐
   │ Step 1: Create Profile                │ ← Auto-save on Next
   │ (Name, Bio, Profile Picture)          │
   └───────────────────────────────────────┘
       │ [Back] [Next]
       ↓
   ┌───────────────────────────────────────┐
   │ Step 2: Connect Instagram             │ ← OAuth or Manual
   │ (OAuth Login)                          │
   └───────────────────────────────────────┘
       │ [Back] [Next]
       ↓
   ┌───────────────────────────────────────┐
   │ Step 3: Generate First Post           │ ← Template Selection
   │ (Template Preview, Edit)              │
   └───────────────────────────────────────┘
       │ [Back] [Next]
       ↓
   ┌───────────────────────────────────────┐
   │ Step 4: Publish & Share               │ ← Publish Action
   │ (Review, Confirm Publish)             │
   └───────────────────────────────────────┘
       │ [Back] [Next]
       ↓
   ┌───────────────────────────────────────┐
   │ Step 5: View Analytics                │ ← Display Metrics
   │ (Engagement Dashboard)                │
   └───────────────────────────────────────┘
       │ [Complete]
       ↓
  ┌──────────────────────────┐
  │ Onboarding Complete ✅   │
  │ → Dashboard              │
  └──────────────────────────┘
```

### Step Navigation Behavior

```yaml
navigation:
  next_button:
    enabled: Only if current step is valid
    action: Validate form → Save to localStorage → Show next step
    loading_state: Spinner + disabled button

  back_button:
    enabled: Always (except step 1)
    action: Go to previous step (data preserved from localStorage)

  skip_option:
    enabled: On any step
    action: Jump to next incomplete step (or dashboard if all skipped)
    confirmation: "Are you sure? You can complete this later."

  progress_bar:
    filled: Up to current step
    animation: Smooth transition between steps (300ms)

  auto_save:
    trigger: After each field blur (debounced 500ms)
    storage: localStorage under key: `onboarding_step_{stepNum}_data`
    fallback: If localStorage unavailable, warn user
```

### Error Handling

**Input Validation Error:**
```
┌─────────────────────────────────────────┐
│ Full Name *                             │
│ ┌──────────────────────────────────┐   │
│ │ [ab]                          [✗] │   │
│ └──────────────────────────────────┘   │
│ ⚠️ Minimum 2 characters required        │
└─────────────────────────────────────────┘
```

**OAuth Connection Error:**
```
┌──────────────────────────────────┐
│ ⚠️ Connection Failed              │
├──────────────────────────────────┤
│ We couldn't connect to Instagram. │
│ Please check that:                │
│                                  │
│ ✓ You have an active Instagram   │
│   account                        │
│ ✓ Your password is correct       │
│ ✓ Two-factor auth is disabled    │
│                                  │
│ [Try Again]  [Use Manual Entry]  │
└──────────────────────────────────┘
```

**Publish Error:**
```
┌──────────────────────────────────┐
│ ❌ Publish Failed                 │
├──────────────────────────────────┤
│ Error: Instagram API timeout     │
│                                  │
│ Your post was NOT published.     │
│ Please try again in a few        │
│ minutes.                         │
│                                  │
│ [Retry]  [Save as Draft]         │
└──────────────────────────────────┘
```

---

## 📱 Mobile Responsive Layout

### Breakpoints

```yaml
breakpoints:
  mobile: < 640px  (iPhone SE, Galaxy A10)
  tablet: 640px - 1024px (iPad, Galaxy Tab)
  desktop: > 1024px (Desktop, laptop)
```

### Mobile Adaptations (< 640px)

1. **Hero Section:**
   - Height reduced from 280px → 200px
   - Image scales proportionally
   - Headline size: 32px → 24px

2. **Form Fields:**
   - Full width (no side margins)
   - Button height: 48px minimum (touch target)
   - Padding: 16px instead of 24px

3. **Metrics Cards (Step 5):**
   - Stack vertically (2 per row → 1 per row on very small phones)
   - Card height stays adequate for readability

4. **Tooltips:**
   - Position: Below trigger (not floating)
   - Width: 95vw (max) with 8px margin
   - No hover state; tap to open/close

5. **Navigation Buttons:**
   - Full width (stacked vertically on very small screens)
   - Generous padding for touch accuracy

### Mobile Code Reference

```css
/* Example: Responsive typography */
@media (max-width: 640px) {
  .step-headline {
    font-size: 24px; /* down from 32px */
    line-height: 1.3;
  }
  
  .form-field {
    margin-bottom: 16px; /* down from 24px */
  }
  
  button {
    min-height: 48px;
    min-width: 44px;
  }
  
  .modal-tooltip {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    border-radius: 12px 12px 0 0;
    width: 100%;
    max-height: 60vh;
  }
}
```

---

## 🎨 Component Inventory (Atomic Design)

### Atoms (7 total)

| Component | States | Usage |
|-----------|--------|-------|
| **Button** | Default, Hover, Active, Disabled, Loading | All CTAs |
| **Input** | Default, Focus, Valid, Invalid, Disabled | Form fields |
| **Label** | Default (dark gray) | Form labels |
| **Icon** | Various (settings, close, check, etc.) | Badges, tooltips |
| **Badge** | Success (green), Error (red), Warning (orange) | Validation states |
| **Link** | Default, Hover, Active, Visited | Skip options, helpers |
| **Divider** | Horizontal line | Section separation |

### Molecules (8 total)

| Component | Composition | Usage |
|-----------|------------|-------|
| **Form Field** | Label + Input + Helper + Error | Every form input |
| **File Upload** | Input area + Progress bar + Preview | Profile picture |
| **Tooltip** | Icon (?) + Popover + Text | Help text |
| **Card** | Header + Content + Footer | Analytics metrics, templates |
| **Badge Group** | Multiple badges in row | Permission list |
| **Button Group** | 2-3 buttons side-by-side | Step navigation |
| **Progress Bar** | Filled/empty track + label | Step indicator |
| **Toast** | Icon + Message + Close button | Success/error messages |

### Organisms (5 total)

| Component | Composition | Usage |
|-----------|------------|-------|
| **Header** | Logo + Title + Menu | Page top |
| **Step Container** | Progress + Title + Content + Buttons | Each tutorial step |
| **Form** | Multiple form-fields + validation | Step 1 & 3 |
| **Modal** | Header + Content + Close button | Tooltips, confirmations |
| **Dashboard** | Grid of cards + metrics | Step 5 analytics |

### Templates

- **Welcome Screen Template** — Logo + hero + benefits + CTA
- **Step Template** — Progress + title + form/content + nav buttons
- **Success Template** — Celebration + next actions
- **Error Template** — Icon + message + retry button

---

## 🎨 Design Tokens (For Stella)

```yaml
colors:
  primary: '#6366f1'      # Indigo - brand color
  primary_dark: '#4f46e5'  # Darker indigo (hover)
  primary_light: '#818cf8' # Lighter indigo (disabled)
  
  success: '#10b981'       # Green
  error: '#ef4444'         # Red
  warning: '#f59e0b'       # Amber
  info: '#3b82f6'          # Blue
  
  text_primary: '#1a202c'   # Dark gray
  text_secondary: '#4a5568' # Medium gray
  text_disabled: '#a0aec0'  # Light gray
  
  background: '#f8f9fa'     # Light gray background
  surface: '#ffffff'        # White (cards, inputs)
  border: '#e2e8f0'         # Border gray
  
  dark_bg: '#0f172a'        # Dark mode background
  dark_surface: '#1e293b'   # Dark mode surface

typography:
  font_family: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI"'
  
  sizes:
    xs: 12px
    sm: 14px
    base: 16px
    lg: 18px
    xl: 20px
    2xl: 24px
    3xl: 32px
  
  weights:
    regular: 400
    medium: 500
    semibold: 600
    bold: 700
  
  line_heights:
    tight: 1.2
    normal: 1.5
    relaxed: 1.7

spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px

shadows:
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'

border_radius:
  sm: 4px
  md: 6px
  lg: 8px
  xl: 12px
  2xl: 16px
  full: 9999px

transitions:
  fast: 150ms ease-out
  normal: 300ms ease-out
  slow: 500ms ease-out
```

---

## ✅ Success Criteria (for Stella's Design Work)

- [ ] All wireframes converted to high-fidelity designs (Figma)
- [ ] Responsive mockups for mobile (375px) & desktop (1440px)
- [ ] All states documented (default, hover, active, disabled, loading, error)
- [ ] Accessibility annotations (color contrast, focus indicators, labels)
- [ ] Animation specs defined (transitions, timing, easing)
- [ ] Component library updated with all atoms/molecules/organisms
- [ ] Design handoff package prepared for @dev
- [ ] Design tokens exported (CSS, Tailwind, JSON)
- [ ] Brand consistency verified (colors, typography, spacing)
- [ ] Mobile touch targets verified (44x44px minimum)

---

## 📋 Next Steps

1. **@visual-designer (Stella)** → Review wireframes, create high-fidelity designs
2. **@dev (Dex)** → Implement components using Stella's designs
3. **@qa (Quinn)** → Test onboarding flow, mobile responsiveness, accessibility

---

**Wireframes Created:** 2026-04-17  
**Designed for Story:** 7.5 — User Onboarding Flow & Interactive Tutorial  
**Status:** Ready for Visual Designer (Stella)
