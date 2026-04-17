# Strategy: Resolve All 25 Failing Tests

**Date:** 2026-04-17  
**Target:** Push-ready state (0 failing tests)  
**Status:** EXECUTION PHASE

---

## Executive Summary

**Root Causes (4 categories):**

1. **Mock Configuration Issues** (7 failures) - Tests using `vi.fn()` incorrectly for class mocking
2. **ReportService Logic** (4 failures) - Date comparisons, language, followers calculation
3. **ContentMetricsService** (6 failures) - Historical metrics and engagement rate calculations
4. **Service Implementation Issues** (8 failures) - StoryGenerator, EngagementAnalysis, PublishService issues

---

## Detailed Fix Plan

### Category 1: Mock Configuration (7 failures)

**Affected Tests:**
- ResearchService.test.ts
- CaptionGenerator.test.ts (2 files)
- PublishService.test.ts (2 files)
- VisualGenerator.test.ts (2 files)

**Root Cause:**
```javascript
// WRONG - Returns a function, not a class
vi.fn().mockResolvedValue({...})

// CORRECT - Use mockImplementation with class keyword
vi.fn(function MockClass() { ... })
// OR use class directly
```

**Fix Strategy:**
- Replace all `vi.fn().mockResolvedValue()` with proper class mocks
- Use `vi.spyOn()` for method mocking
- Ensure constructors are properly mocked

**Example Fix:**
```javascript
// Before:
vi.mock('services/CopywriterClient', () => ({
  default: vi.fn().mockResolvedValue({ caption: 'test' })
}));

// After:
vi.mock('services/CopywriterClient', () => ({
  default: vi.fn(function() {
    this.generateCaption = vi.fn().mockResolvedValue({ caption: 'test' });
  })
}));
```

---

### Category 2: ReportService (4 failures)

**Issues Identified:**

1. **dist/ folder out of sync** - Contains old pt-BR code
   - Fix: Run `npm run build` to rebuild

2. **followers_gained calculation** - Returns 0
   - Issue: Query in ReportService.ts line 123-127 uses wrong logic
   - Current: Fetches start_followers >= startDate (gets data AFTER start)
   - Correct: Needs data just BEFORE period starts for baseline
   - Status: ALREADY FIXED in src/ but dist/ not rebuilt

3. **Language inconsistency**
   - Issue: `getPeriodLabel()` uses pt-BR locale
   - Fix: Change to 'en-US'
   - Status: ALREADY FIXED in src/, need rebuild

4. **Key insights in Portuguese**
   - Issue: Test expects Portuguese strings but implementation returns English
   - Or test expects English but implementation returns Portuguese
   - Fix: Align test expectations with implementation

**Implementation:**
1. Rebuild: `npm run build`
2. Verify dist files are updated
3. Run tests to validate

---

### Category 3: ContentMetricsService (6 failures)

**Root Cause:** Historical metrics queries not returning expected data

**Affected Tests:**
- should return current metrics for a post
- should calculate engagement rate correctly
- should include content details (media type, posted_at)
- should return historical metrics (daily snapshots)
- should calculate historical engagement rates
- should respect days parameter (max 90)

**Fix Strategy:**
1. Review test data insertion (insertTestPostMetricsWithDate)
2. Verify ContentMetricsService.getPostMetricsWithHistory() query logic
3. Ensure date comparisons use proper ISO format
4. Check that historical snapshots are generated correctly

**Expected Implementation:**
- Snapshots should be generated at 24-hour intervals
- Engagement rate calculation: (likes + comments + shares) * 100 / reach
- Query should respect the `days` parameter (max 90 days)

---

### Category 4: Service Implementation Issues (8 failures)

#### 4.1 StoryGenerator (2 failures)

**Failure 1: Content Length Assertion**
- Error: Expected 14, got 15
- Cause: ContentLength calculation changed or test assertion is wrong
- Fix: Verify calculation includes correct character count for "test headline"

**Failure 2: Contrast Validation**
- Error: contrastValidated = false, expected true
- Cause: ContrastValidator.validateWCAG_AA() returns false
- Fix: Check contrast ratio threshold in validator

#### 4.2 EngagementAnalysisService (1 failure)

**Issue:** Trends direction returns 'stable' instead of 'up'
- Cause: Engagement trending calculation not detecting upward trend
- Fix: Review threshold logic for trend detection

#### 4.3 PublishService (2 failures - from mocks)

**Dependencies:** Fix Category 1 (mock issues) first

---

## Execution Order

```
1. FIX: Mock configurations (resolve TypeError)
2. BUILD: npm run build (sync dist/ files)
3. FIX: ReportService (date logic)
4. FIX: ContentMetricsService (historical data)
5. FIX: StoryGenerator (assertions/logic)
6. FIX: EngagementAnalysisService (trend detection)
7. VERIFY: npm test (all passing)
8. COMMIT: Final commit with all fixes
9. PUSH: git push to origin/master
```

---

## Testing Command

```bash
# After each fix:
npm test -- --reporter=verbose

# Final validation:
npm run lint && npm run typecheck && npm test
```

---

## Success Criteria

✅ All 25 failing tests pass  
✅ Lint: 0 errors (warnings OK)  
✅ TypeCheck: 0 errors  
✅ Build: Successful  
✅ No new failures introduced  

---

## Notes for Implementation

- **Mock Pattern:** All class mocks must use constructor functions, not `vi.fn()`
- **Date Format:** Use ISO 8601 throughout (YYYY-MM-DDTHH:MM:SSZ)
- **Rebuild Required:** After fixing src files, run build to sync dist/
- **Incremental Testing:** Test each category after fixing to catch cascading issues
