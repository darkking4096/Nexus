# QA Fix Request — Story 1.4

**Date:** 2026-04-08  
**Story:** 1.4 - Marketing Instagram Squad Integration  
**Agent:** Quinn (QA)  
**Status:** ✅ RESOLVED  
**Resolution Date:** 2026-04-08  
**Priority:** 🔴 BLOCKER (Fixed)

---

## Issue Summary

TypeScript compilation error prevents merge. Type mismatch in ResearchService.ts causing `npm run typecheck` to fail.

---

## Technical Details

**Error:**
```
packages/backend/src/services/ResearchService.ts(54,68): error TS2345:
Argument of type 'ContentRow[]' is not assignable to parameter of type 'ContentRecord[]'.
Type 'ContentRow' is not assignable to type 'ContentRecord'.
  Index signature for type 'string' is missing in type 'ContentRow'.
```

**Location:**
- File: `packages/backend/src/services/ResearchService.ts`
- Lines: 54, 68
- Problem: `ContentRow[]` passed where `ContentRecord[]` expected

---

## Solution Options

### Option 1: Add Index Signature to ContentRow (Recommended)
```typescript
interface ContentRow extends Record<string, unknown> {
  // existing properties
  [key: string]: unknown;
}
```

### Option 2: Transform Type at Call Site
```typescript
const recordArray = contentRows.map(row => ({
  ...row,
  [Symbol.toStringTag]: 'ContentRecord'
}));
```

### Option 3: Use Type Assertion (Not Recommended)
```typescript
const records = contentRows as ContentRecord[];
```

---

## Testing Checklist

- [ ] Fix applied to ResearchService.ts
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run test` passes (36/36)
- [ ] No new TypeScript errors introduced
- [ ] Commit message references Story 1.4 and issue

---

## Verification

After fix, @dev should run:
```bash
npm run typecheck
npm run lint
npm run test
```

Then resubmit for QA verification:
```
*review 1.4
```

---

## Notes

- This is a TYPE SAFETY issue, not a runtime bug
- Fix should take ~5 minutes
- No code logic changes needed, only type definition adjustments
- Core functionality already implemented and working correctly

**Assigned to:** @dev (Dex)
