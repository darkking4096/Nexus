# 🚀 Developer Handoff: Story 7.5 Onboarding Flow

**From:** Stella (Visual Designer)  
**To:** Dex (@dev)  
**Date:** 2026-04-17  
**Status:** Ready for Implementation  

---

## 📦 What You're Getting

This handoff package includes everything you need to build the Story 7.5 User Onboarding Flow:

1. **Design Tokens** (`design-tokens.json`) — DTCG format, all colors/typography/spacing
2. **Component Specifications** (`component-specifications.md`) — Atoms, molecules, organisms with all states
3. **Wireframes** (`wireframes-mid-fi.md`) — Information architecture and interaction flows
4. **This Document** — Implementation guide and special notes

---

## 🎯 Implementation Checklist

### Phase 1: Setup (Foundation)
- [ ] Create `/src/components/Onboarding/` directory structure
- [ ] Create `/src/hooks/useOnboarding.ts` (state management hook)
- [ ] Create `/src/context/OnboardingContext.ts` (React Context or Redux)
- [ ] Import design tokens from `design-tokens.json`
- [ ] Set up Tailwind CSS config with design tokens (if using Tailwind)

### Phase 2: Build Atoms (Base Components) — 7 components
- [ ] Button (4 variants: primary, secondary, ghost, danger)
- [ ] Input (with validation states: default, focus, valid, invalid, disabled)
- [ ] Label
- [ ] Icon (SVG set or icon library)
- [ ] Badge (4 variants: success, error, warning, info)
- [ ] Avatar (with fallback to initials)
- [ ] Divider

### Phase 3: Build Molecules (Combined Components) — 8 components
- [ ] FormField (Label + Input + Helper + Error)
- [ ] FileUpload (with drag-drop + progress)
- [ ] Tooltip (with auto-positioning)
- [ ] Card (header, content, footer)
- [ ] BadgeGroup
- [ ] ButtonGroup (responsive stacking)
- [ ] ProgressBar
- [ ] Toast (success/error/info variants)

### Phase 4: Build Organisms (Complex Components) — 5 components
- [ ] Header (logo + title + profile menu)
- [ ] StepContainer (progress + title + content + nav)
- [ ] Form (multiple fields + submit)
- [ ] AnalyticsCard (metrics grid)
- [ ] Modal (overlay + dialog)

### Phase 5: Implement Pages/Screens — 6 screens
- [ ] WelcomeScreen.tsx
- [ ] TutorialStep.tsx (reusable for steps 1-5)
- [ ] ProfileSetupForm.tsx
- [ ] InstagramConnectFlow.tsx
- [ ] PostGeneratorPreview.tsx
- [ ] AnalyticsDashboard.tsx

### Phase 6: State Management
- [ ] OnboardingContext (track current step, profile data, completion)
- [ ] localStorage persistence (auto-save profile data)
- [ ] Backend integration (save profile after wizard completion)
- [ ] useOnboarding hook (step navigation, data updates)

### Phase 7: Interactions & Flows
- [ ] Step navigation (back/next, skip)
- [ ] Form validation (inline feedback)
- [ ] OAuth Instagram integration
- [ ] File upload handling
- [ ] Auto-save to localStorage
- [ ] Loading/error states

### Phase 8: Accessibility & Mobile
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Focus management (move focus to step title on navigation)
- [ ] ARIA labels on all interactive elements
- [ ] Focus indicators (outline: 2px solid #6366f1)
- [ ] Mobile responsiveness (test on 375px, 640px, 1024px)
- [ ] Touch targets (48x48px minimum)

### Phase 9: Testing
- [ ] Unit tests for useOnboarding hook
- [ ] Integration tests for step navigation
- [ ] E2E tests for complete onboarding flow
- [ ] Mobile responsiveness testing
- [ ] Accessibility audit (a11y)
- [ ] Performance (First Paint < 1s)

### Phase 10: Code Review
- [ ] CodeRabbit self-healing (auto-fix CRITICAL/HIGH)
- [ ] Lint + typecheck passing
- [ ] Tests passing (100% coverage for new code)
- [ ] No console errors/warnings

---

## 🎨 Design Token Integration

### Option A: Tailwind CSS (Recommended)

If using Tailwind, import tokens and configure `tailwind.config.js`:

```javascript
// tailwind.config.js
const designTokens = require('./outputs/wireframes/story-7.5-onboarding/design-tokens.json');

module.exports = {
  theme: {
    colors: {
      primary: designTokens.color.primary.value,
      'primary-dark': designTokens.color.primary_dark.value,
      'primary-light': designTokens.color.primary_light.value,
      success: designTokens.color.success.value,
      error: designTokens.color.error.value,
      warning: designTokens.color.warning.value,
      info: designTokens.color.info.value,
      text: {
        primary: designTokens.color.text.primary.value,
        secondary: designTokens.color.text.secondary.value,
        disabled: designTokens.color.text.disabled.value,
      },
      // ... more colors
    },
    spacing: {
      xs: designTokens.spacing.xs.value,
      sm: designTokens.spacing.sm.value,
      md: designTokens.spacing.md.value,
      // ... more spacing
    },
    // ... more theme config
  },
};
```

Then use in components:
```jsx
<button className="bg-primary text-white px-md py-lg rounded-md hover:bg-primary-dark">
  Start Tutorial
</button>
```

### Option B: CSS Variables

If not using Tailwind, create CSS variables:

```css
/* src/styles/design-tokens.css */
:root {
  --color-primary: #6366f1;
  --color-primary-dark: #4f46e5;
  --color-success: #10b981;
  --color-text-primary: #1a202c;
  --color-text-secondary: #4a5568;
  /* ... more variables */
  
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  /* ... more spacing */
  
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  /* ... more typography */
}
```

Then use in components:
```jsx
<button style={{
  backgroundColor: 'var(--color-primary)',
  padding: `var(--spacing-lg) var(--spacing-md)`,
  borderRadius: 'var(--border-radius-md)',
}}>
  Start Tutorial
</button>
```

---

## 🔧 Component Implementation Examples

### Button Component

```tsx
// src/components/atoms/Button.tsx
import React from 'react';
import './Button.css'; // or use Tailwind classes

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  children,
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${disabled || loading ? 'disabled' : ''}`}
      disabled={disabled || loading}
      onClick={onClick}
      aria-busy={loading}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
};
```

### FormField Component

```tsx
// src/components/molecules/FormField.tsx
import React from 'react';
import { Input } from '../atoms/Input';
import { Label } from '../atoms/Label';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  placeholder?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  helperText,
  required = false,
  placeholder,
}) => {
  return (
    <div className="form-field">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-error">*</span>}
      </Label>
      <Input
        id={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : `${name}-helper`}
      />
      {error && <div id={`${name}-error`} className="error-message">{error}</div>}
      {helperText && <div id={`${name}-helper`} className="helper-text">{helperText}</div>}
    </div>
  );
};
```

### StepContainer Component

```tsx
// src/components/organisms/StepContainer.tsx
import React from 'react';
import { Header } from './Header';
import { ProgressBar } from '../molecules/ProgressBar';
import { Button } from '../atoms/Button';

interface StepContainerProps {
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  icon?: string;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  children: React.ReactNode;
  isNextDisabled?: boolean;
  isNextLoading?: boolean;
}

export const StepContainer: React.FC<StepContainerProps> = ({
  step,
  totalSteps,
  title,
  subtitle,
  icon,
  onNext,
  onBack,
  onSkip,
  children,
  isNextDisabled = false,
  isNextLoading = false,
}) => {
  return (
    <div className="step-container">
      <Header />
      <ProgressBar current={step} total={totalSteps} />
      
      <main className="step-content">
        <div className="step-header">
          {icon && <span className="icon">{icon}</span>}
          <h1>{title}</h1>
          {subtitle && <p className="subtitle">{subtitle}</p>}
        </div>

        <div className="step-body">
          {children}
        </div>

        <div className="step-footer">
          <div className="button-group">
            <Button
              variant="secondary"
              onClick={onBack}
              disabled={step === 1}
            >
              ◄ Back
            </Button>
            <Button
              variant="primary"
              onClick={onNext}
              disabled={isNextDisabled}
              loading={isNextLoading}
            >
              Next ▶
            </Button>
          </div>
          <a href="#" onClick={onSkip} className="skip-link">
            [Skip remaining steps]
          </a>
        </div>
      </main>
    </div>
  );
};
```

---

## 🔄 State Management Pattern

### useOnboarding Hook

```tsx
// src/hooks/useOnboarding.ts
import { useState, useEffect } from 'react';

interface OnboardingData {
  profileData: {
    name: string;
    bio: string;
    profilePicture: string;
  };
  instagramHandle: string;
  instagramConnected: boolean;
  currentStep: number;
  isCompleted: boolean;
}

const INITIAL_STATE: OnboardingData = {
  profileData: { name: '', bio: '', profilePicture: '' },
  instagramHandle: '',
  instagramConnected: false,
  currentStep: 1,
  isCompleted: false,
};

export const useOnboarding = () => {
  const [data, setData] = useState<OnboardingData>(() => {
    // Load from localStorage on init
    const saved = localStorage.getItem('onboarding_data');
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem('onboarding_data', JSON.stringify(data));
  }, [data]);

  const updateProfileData = (updates: Partial<OnboardingData['profileData']>) => {
    setData(prev => ({
      ...prev,
      profileData: { ...prev.profileData, ...updates },
    }));
  };

  const setInstagramConnected = (handle: string, connected: boolean) => {
    setData(prev => ({
      ...prev,
      instagramHandle: handle,
      instagramConnected: connected,
    }));
  };

  const nextStep = () => {
    setData(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 5),
    }));
  };

  const prevStep = () => {
    setData(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1),
    }));
  };

  const goToStep = (step: number) => {
    setData(prev => ({
      ...prev,
      currentStep: Math.max(1, Math.min(step, 5)),
    }));
  };

  const completeOnboarding = async () => {
    // Save to backend
    await fetch('/api/onboarding/complete', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    setData(prev => ({
      ...prev,
      isCompleted: true,
    }));

    // Clear localStorage
    localStorage.removeItem('onboarding_data');
  };

  return {
    data,
    updateProfileData,
    setInstagramConnected,
    nextStep,
    prevStep,
    goToStep,
    completeOnboarding,
  };
};
```

---

## 🎯 Special Implementation Notes

### 1. **Auto-Save Pattern**
- After each field blur or when user clicks Next, save to localStorage
- Key format: `onboarding_step_{stepNum}_data`
- Show subtle "Saved" indicator for 2 seconds
- On step navigation, data is automatically restored

### 2. **OAuth Instagram Flow**
```tsx
// Pseudo-code for OAuth integration
const handleInstagramLogin = async () => {
  const redirectUri = `${window.location.origin}/oauth/instagram/callback`;
  const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&scope=user_profile,user_media`;
  
  window.location.href = authUrl;
};

// In callback route:
// Extract code from URL params, exchange for access token, get user info
```

### 3. **File Upload Handling**
```tsx
const handleFileUpload = async (file: File) => {
  if (file.size > 5 * 1024 * 1024) { // 5MB
    setError('File too large');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  
  const { url } = await response.json();
  updateProfileData({ profilePicture: url });
};
```

### 4. **Form Validation**
```tsx
const validateStep = (step: number): boolean => {
  switch (step) {
    case 1:
      return data.profileData.name.length >= 2;
    case 2:
      return data.instagramConnected;
    case 3:
      return !!data.postData?.content; // if post step
    default:
      return true;
  }
};

// Use in Next button:
<Button
  onClick={nextStep}
  disabled={!validateStep(data.currentStep)}
/>
```

### 5. **Loading States**
```tsx
const [isLoading, setIsLoading] = useState(false);

const handleNextStep = async () => {
  setIsLoading(true);
  try {
    // API call if needed
    await someAsyncOperation();
    nextStep();
  } catch (error) {
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
};

// In component:
<Button
  onClick={handleNextStep}
  loading={isLoading}
  disabled={isLoading}
>
  Next ▶
</Button>
```

---

## 📱 Mobile Responsiveness Rules

### Breakpoint Strategy
```typescript
// src/hooks/useMediaQuery.ts
export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addListener(listener);
    return () => media.removeListener(listener);
  }, [matches, query]);

  return matches;
};

// Usage:
const isMobile = useMediaQuery('(max-width: 640px)');
```

### Component Adaptations
```tsx
// Example: ButtonGroup responsive behavior
<div className={`button-group ${isMobile ? 'vertical' : 'horizontal'}`}>
  <Button>Back</Button>
  <Button>Next</Button>
</div>

// CSS:
.button-group {
  display: flex;
  gap: 12px;
}

.button-group.horizontal {
  flex-direction: row;
}

.button-group.vertical {
  flex-direction: column;
}

.button-group button {
  flex: 1;
  min-height: 48px; /* touch target */
}
```

---

## ♿ Accessibility Checklist

- [ ] All inputs have associated labels (`<label htmlFor={id}>`)
- [ ] Buttons have aria-label if text not visible
- [ ] Form errors have aria-invalid and aria-describedby
- [ ] Modals have aria-modal and focus trap
- [ ] Keyboard navigation works (Tab, Shift+Tab, Enter, Escape)
- [ ] Focus indicators visible (outline: 2px solid #6366f1)
- [ ] Color contrast ≥ 4.5:1 for text (WCAG AA)
- [ ] Image alt text for all images
- [ ] Loading states have aria-busy
- [ ] Links have visible focus state
- [ ] Touch targets ≥ 48x48px

---

## 🧪 Testing Requirements

### Unit Tests (useOnboarding hook)
```typescript
describe('useOnboarding', () => {
  it('should load data from localStorage', () => {
    // Test initial state
  });

  it('should save to localStorage on update', () => {
    // Test auto-save
  });

  it('should navigate between steps', () => {
    // Test nextStep, prevStep, goToStep
  });

  it('should validate form data', () => {
    // Test validateStep
  });
});
```

### Integration Tests (Form + Navigation)
```typescript
describe('Onboarding Flow', () => {
  it('should render welcome screen on first visit', () => {
    // Mock localStorage as empty
  });

  it('should progress through steps', () => {
    // Test full step progression
  });

  it('should validate inputs before allowing next', () => {
    // Test form validation blocks next
  });

  it('should save to backend on completion', () => {
    // Test completeOnboarding API call
  });
});
```

### E2E Tests (Full Flow)
```typescript
describe('Complete Onboarding', () => {
  it('should complete full onboarding flow', () => {
    cy.visit('/onboarding');
    cy.contains('Start Tutorial').click();
    
    // Step 1: Profile
    cy.get('input[name="name"]').type('John Doe');
    cy.get('input[name="bio"]').type('Content Creator');
    cy.contains('Next').click();
    
    // Step 2: Instagram
    cy.contains('Login with Instagram').click();
    // ... Instagram OAuth mock
    
    // Continue through remaining steps...
    
    cy.contains('Complete').click();
    cy.contains('You did it!').should('be.visible');
  });
});
```

---

## 🚀 Performance Notes

- **Lazy load images** in post preview (use `<img loading="lazy" />`)
- **Debounce** auto-save on form input (500ms)
- **Memoize** components to prevent unnecessary re-renders
- **Code-split** step components if bundle size is concern
- **First Paint target:** < 1s
- **Step transitions:** 300ms smooth (use CSS transitions)

---

## 📝 Files to Create

```
src/
├── components/
│   ├── Onboarding/
│   │   ├── OnboardingFlow.tsx (main orchestrator)
│   │   ├── WelcomeScreen.tsx
│   │   ├── TutorialStep.tsx
│   │   ├── ProfileSetupForm.tsx
│   │   ├── InstagramConnectFlow.tsx
│   │   ├── PostGeneratorPreview.tsx
│   │   └── AnalyticsDashboard.tsx
│   ├── atoms/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Label.tsx
│   │   ├── Icon.tsx
│   │   ├── Badge.tsx
│   │   ├── Avatar.tsx
│   │   └── Divider.tsx
│   ├── molecules/
│   │   ├── FormField.tsx
│   │   ├── FileUpload.tsx
│   │   ├── Tooltip.tsx
│   │   ├── Card.tsx
│   │   ├── BadgeGroup.tsx
│   │   ├── ButtonGroup.tsx
│   │   ├── ProgressBar.tsx
│   │   └── Toast.tsx
│   └── organisms/
│       ├── Header.tsx
│       ├── StepContainer.tsx
│       ├── Form.tsx
│       ├── AnalyticsCard.tsx
│       └── Modal.tsx
├── hooks/
│   ├── useOnboarding.ts
│   ├── useMediaQuery.ts
│   └── useOAuth.ts (for Instagram)
├── context/
│   └── OnboardingContext.ts
└── styles/
    └── design-tokens.css
```

---

## ✅ Delivery Checklist

When complete, Dex should deliver:
- [ ] All components implemented (atoms, molecules, organisms)
- [ ] All screens rendered (welcome, steps 1-5, completion)
- [ ] State management working (useOnboarding hook)
- [ ] localStorage auto-save working
- [ ] Form validation working
- [ ] OAuth integration tested
- [ ] Responsive design verified (375px, 640px, 1024px)
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] All tests passing
- [ ] Lint + typecheck passing
- [ ] CodeRabbit review clean (no CRITICAL/HIGH issues)
- [ ] Performance verified (First Paint < 1s)

---

## 📞 Questions?

If you have questions about the design or specs, check:
1. **component-specifications.md** — All atom/molecule/organism specs
2. **design-tokens.json** — All colors, typography, spacing
3. **wireframes-mid-fi.md** — Interaction flows and layouts

Good luck with the implementation! 🚀

---

**Stella's Notes:**
> I've created pixel-perfect specs with all component states. The design tokens are production-ready. Focus on making the interactions smooth and accessible. Remember: mobile-first approach, 48px minimum touch targets, and WCAG AA compliance. You've got this! 🎨

---

*Created by Stella (Visual Designer) — Story 7.5 Onboarding Flow*
*Ready for @dev (Dex) Implementation*
