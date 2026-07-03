# 1. OBJECTIVE

Build a comprehensive test suite covering all core functionality of the tasklist application, excluding UI component rendering and API endpoint tests. Tests will focus on type utilities, localStorage helpers, and the `useItems` hook logic.

# 2. CONTEXT SUMMARY

**Project Stack:** Next.js 16 with React 19, TypeScript, SWR for data fetching, localStorage for persistence.

**Core Modules to Test:**
- `src/types/index.ts` - Type guards (`isTask`, `isAppointment`) and utility functions (`getItemDateTime`)
- `src/context/SWRProvider.tsx` - LocalStorage utilities (`getStoredItems`, `setStoredItems`, `clearStoredItems`)
- `src/hooks/useItems.ts` - CRUD operations, filtering, sorting, and state management

**Testing Framework:** Vitest (modern, fast, excellent TypeScript support)

# 3. APPROACH OVERVIEW

1. **Install Vitest** - Add as dev dependency with required configs
2. **Create test utilities** - Helper functions for mocking localStorage and generating test fixtures
3. **Test type utilities** - Atomic tests for each type guard and utility function
4. **Test storage utilities** - Unit tests for localStorage operations with proper mocking
5. **Test useItems hook** - Comprehensive tests for all CRUD operations and helper functions
6. **Setup test scripts** - Add npm scripts for running tests

**Commit Structure (Angular Conventional Commits):**
- Each file added or test block added as separate atomic commits
- `chore:` for config/setup changes
- `test:` for test files
- `feat:` for test utility helpers

# 4. IMPLEMENTATION STEPS

## Step 1: Add Vitest and Testing Dependencies
**Goal:** Install testing framework and configure for Next.js/TypeScript
**Method:** Add vitest, @vitest/coverage-v8, jsdom environment, and update configs
**Files:** `package.json`, `vite.config.ts`, `tsconfig.json`

## Step 2: Create Test Utilities and Fixtures
**Goal:** Provide reusable helpers for mocking localStorage and generating test data
**Method:** Create `src/__tests__/utils/testHelpers.ts` with mock implementations
**Files:** `src/__tests__/utils/testHelpers.ts`, `src/__tests__/utils/fixtures.ts`

## Step 3: Test Type Utilities
**Goal:** Verify all type guards and utility functions work correctly
**Method:** Create test file exercising `isTask`, `isAppointment`, `getItemDateTime`
**Files:** `src/types/__tests__/index.test.ts`

## Step 4: Test Storage Utilities
**Goal:** Ensure localStorage operations handle edge cases properly
**Method:** Test `getStoredItems`, `setStoredItems`, `clearStoredItems` with mocked localStorage
**Files:** `src/context/__tests__/SWRProvider.test.ts`

## Step 5: Test useItems Hook - CRUD Operations
**Goal:** Verify add, update, delete, and toggle operations work correctly
**Method:** Test each CRUD function with mock SWR state
**Files:** `src/hooks/__tests__/useItems.test.ts`

## Step 6: Test useItems Hook - Query Functions
**Goal:** Verify filtering, sorting, and search functions work correctly
**Method:** Test `getItemsByDateRange`, `getAllItems`, `importItems`, `clearAllItems`
**Files:** `src/hooks/__tests__/useItems.test.ts`

# 5. TESTING AND VALIDATION

**Success Criteria:**
- All type guard tests pass (`isTask`, `isAppointment`)
- All utility function tests pass (`getItemDateTime`)
- All localStorage utility tests pass (get, set, clear operations)
- All CRUD operation tests pass (add, update, delete, toggle)
- All query/filter tests pass (date range, search, priority sorting)
- Import/export tests pass

**Validation Commands:**
```bash
npm test           # Run all tests
npm test -- --run  # Run tests once (CI mode)
npm run coverage   # Generate coverage report
```

**Coverage Expectations:**
- `src/types/index.ts`: 100% coverage
- `src/context/SWRProvider.tsx`: 100% coverage for exportable functions
- `src/hooks/useItems.ts`: 100% coverage for all exported functions
