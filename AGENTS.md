<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Agent Development Guide

## Overview

This guide establishes conventions for AI agents working in this repository. Following these practices ensures maintainable code, clear history, and efficient collaboration.

---

## 1. Conventional Commits (Angular Style)

Use the Angular commit message format for all commits:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Use Case |
|------|----------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code restructure without behavior change |
| `test` | Adding/updating tests |
| `chore` | Maintenance, dependencies, config |
| `perf` | Performance improvement |
| `ci` | CI/CD changes |

### Examples

```bash
feat(auth): add OAuth2 login flow
fix(api): correct date parsing in items endpoint
docs(readme): update installation instructions
test(hooks): add useItems CRUD operation tests
chore(deps): add Vitest testing framework
refactor(types): extract Item union type
```

### Rules

- Use imperative mood: "add" not "added", "fix" not "fixed"
- Keep subject line under 72 characters
- Reference issues/tickets in footer: `Refs: #123`

---

## 2. Atomic Commits

**Make each commit represent one logical change.** The ideal commit changes a single concern.

### Benefits

- **Bisectable history**: `git bisect` locates bugs quickly
- **Revertable**: Roll back one change without others
- **Reviewable**: Reviewers understand each change in isolation
- **Meaningful history**: `git log` tells the story of the codebase

### Practice

**Bad** — Multiple unrelated changes:
```
feat: add authentication and fix routing bug and update tests
```

**Good** — Separate commits:
```
feat(auth): add OAuth2 login flow
fix(routing): correct redirect after login
test(auth): add login form validation tests
```

### When to Split

- Separate feature from tests for that feature
- Separate refactoring from behavior changes
- Separate config/dependency updates from feature code
- One lint fix per commit, not bundled with features

---

## 3. Test-Driven Development (TDD)

Follow the red-green-refactor cycle:

### 1. Red — Write a Failing Test

```typescript
// First: Write the test for the behavior you want
describe('useItems', () => {
  it('should add a new item to the list', () => {
    const { result } = renderHook(() => useItems());
    act(() => result.current.addItem({ name: 'Test', type: 'task' }));
    expect(result.current.items).toHaveLength(1);
  });
});
```

### 2. Green — Make it Pass

```typescript
// Second: Implement minimum code to pass
export function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  
  const addItem = (item: Item) => {
    setItems([...items, item]);
  };
  
  return { items, addItem };
}
```

### 3. Refactor — Improve Code

```typescript
// Third: Clean up while keeping tests green
export function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  
  const addItem = useCallback((item: Item) => {
    setItems(prev => [...prev, item]);
  }, []);
  
  return { items, addItem };
}
```

### TDD Benefits

- **Design clarity**: Tests define expected behavior first
- **Confidence**: Refactoring with test coverage
- **Documentation**: Tests serve as executable specs
- **Regression prevention**: Failures caught immediately

---

## 4. Workflow: Plan, Build, Test, Push, Wait for CI, Merge

### Step 1: Plan

1. Read `.agents_tmp/PLAN.md` if it exists
2. Break work into smallest testable units
3. Identify which files need changes
4. Determine commit sequence

### Step 2: Branch

```bash
# Create feature branch from main
git checkout main
git pull origin main
git checkout -b feat/your-feature-name
```

### Step 3: Build with TDD

```bash
# Write failing test first
npm test -- --watch

# Implement until test passes
npm run test:run
```

### Step 4: Commit Often

```bash
# Stage related changes
git add src/types/__tests__/index.test.ts
git add src/types/index.ts

# Commit with conventional message
git commit -m "test(types): add isTask type guard tests"
git commit -m "feat(types): implement isTask type guard"
```

### Step 5: Push

```bash
# Push branch to remote
git push -u origin feat/your-feature-name
```

### Step 6: Create PR

```bash
gh pr create --title "feat: your feature" --body "## Summary..."
```

### Step 7: Wait for CI

Poll until all checks pass:

```bash
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/owner/repo/commits/BRANCH/check-runs" | \
  jq '[.check_runs[] | {name: .name, status: .status, conclusion: .conclusion}]'
```

### Step 8: Merge

```bash
# Ensure PR is not draft
curl -X POST -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.github.com/graphql" \
  -d '{"query": "mutation { markPullRequestReadyForReview(input: {pullRequestId: \"PR_NODE_ID\"}) { pullRequest { isDraft } } }"}'

# Merge via API with non-fast-forward (--no-ff behavior)
curl -X PUT -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/owner/repo/pulls/PR_NUM/merge" \
  -d '{"merge_method": "merge", "commit_title": "feat: your feature (#PR_NUM)"}'
```

GitHub's default merge creates a merge commit (equivalent to `--no-ff`), preserving the feature branch history.

---

## 5. Code Quality Principles

### Maintainability Over Efficiency

**Prefer** clear, readable code:
```typescript
const itemNames = items.map(item => item.name);
```

**Avoid** premature optimization:
```typescript
const itemNames = items.reduce((acc, item, i, arr) => {
  if (i === arr.length - 1) return [...acc, item.name];
  return acc;
}, []);
```

### Developer Experience

- **Explicit over implicit**: Clear variable names, avoid magic numbers
- **Consistent patterns**: Follow existing code style in the repo
- **Small functions**: Each function does one thing well
- **Readable over clever**: Future maintainers will thank you

### Single Responsibility

Each module/function should have one reason to change:
- `useItems.ts` manages item state
- `SWRProvider.tsx` provides data fetching context
- `types/index.ts` defines TypeScript types

---

## 6. Handling Pre-existing Issues

### Don't Fix Unrelated Bugs

If you encounter lint errors or bugs outside your scope:
1. Fix only what's necessary for your changes
2. Document pre-existing issues in commit message
3. Consider creating a separate issue for tracking

### Example

```
chore: add Vitest testing framework

Note: Pre-existing lint errors in src/components/ remain unfixed.
Recommended follow-up: Create issue to track lint debt.
```

---

## 7. PR Best Practices

### Keep PRs Small

- Under 400 lines changed is ideal
- One feature or fix per PR
- Separate refactoring from feature work

### PR Description Template

```markdown
## Summary
Brief description of what this PR does.

## Changes
- List specific changes made
- Use bullet points

## Test Results
- Tests added/updated: X
- Coverage: X%

## Checklist
- [ ] Tests pass locally
- [ ] Tests added for new behavior
- [ ] Documentation updated (if needed)
```

### CI Requirements

Ensure your CI workflow:
1. Runs tests on PR/push to main
2. Requires tests to pass before merge
3. Runs build to catch compile errors

---

## 8. GitHub API Quick Reference

### Get PR Status
```bash
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/owner/repo/pulls/PR_NUM" | \
  jq '{state, mergeable, mergeable_state}'
```

### Get Check Runs
```bash
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/owner/repo/commits/BRANCH/check-runs" | \
  jq '.check_runs[] | {name, status, conclusion}'
```

### Get PR Node ID (for GraphQL mutations)
```bash
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/owner/repo/pulls/PR_NUM" | \
  jq '.node_id'
```

---

## 9. Additional Recommendations

### Start from Main

Always branch from the latest `main` to avoid merge conflicts:
```bash
git checkout main && git pull origin main
```

### Prefer Non-Fast-Forward Merging

Always use `--no-ff` when merging to preserve the feature branch history:

```bash
git merge --no-ff feat/your-feature-name
```

This creates a merge commit that groups all feature commits together, maintaining the micro-to-macro logical flow:
- Small, atomic commits tell the story of *how* a feature was built
- The merge commit summarizes *what* the feature accomplishes
- `git log --first-parent` shows a clean project history
- `git log` shows the detailed development path

### Hierarchical Branching Strategy

Break down features into a tree structure, from macro to micro:

```
main
  └── feat/user-authentication          # Feature umbrella
        ├── feat/auth/types              # Type definitions
        │     └── (atomic commits)
        ├── feat/auth/login              # Login sub-feature
        │     ├── feat/auth/login/api    # API layer
        │     │     └── (atomic commits)
        │     └── feat/auth/login/ui     # UI layer
        │           └── (atomic commits)
        ├── feat/auth/logout             # Logout sub-feature
        │     └── (atomic commits)
        └── feat/auth/session            # Session management
              └── (atomic commits)
```

**Rules:**
1. Each branch has exactly one logical concern
2. Branch names reflect the scope: `feat/auth/login/api`
3. Merge upward: `atomic → subfeature → feature → main`
4. Never merge sideways (sibling features should not depend on each other)
5. Rebase sub-branches onto parent before merging up

**Example workflow:**

```bash
# Start with the smallest atomic piece
git checkout -b feat/auth/types main
git add src/types/auth.ts && git commit -m "feat(auth/types): define user and session types"
git merge --no-ff feat/auth/types

# Build on it with the next logical piece
git checkout -b feat/auth/login/api feat/auth/types
git add src/app/api/auth/login.ts && git commit -m "feat(auth/login/api): add login endpoint"
git merge --no-ff feat/auth/login/api

# Continue until feature is complete
git checkout -b feat/auth feat/main  # Branch from updated main
git merge --no-ff feat/auth/types
git merge --no-ff feat/auth/login/api
git merge --no-ff feat/auth/session
git merge --no-ff feat/auth
```

This structure:
- Makes code review focused (one logical change per PR)
- Enables partial rollbacks if issues arise
- Documents the decomposition of complex features
- Allows parallel work on independent sub-features

### Use Meaningful Branch Names

```bash
feat/add-user-authentication
fix/login-redirect-bug
chore/add-vitest-framework
refactor/extract-types
```

### Avoid Deeply Nested Code

Prefer early returns and flat structures:
```typescript
// Bad
if (user) {
  if (user.isActive) {
    if (user.hasPermission) {
      // Do something
    }
  }
}

// Good
if (!user?.isActive) return;
if (!user?.hasPermission) return;
// Do something
```

### Document Non-Obvious Decisions

Use code comments for:
- Workarounds for known issues
- Performance trade-offs
- Architecture decisions

---

## 10. Summary Checklist

- [ ] Use conventional commits (type(scope): description)
- [ ] Keep commits atomic (one logical change each)
- [ ] Practice TDD: red, green, refactor
- [ ] Write tests before implementation
- [ ] Prefer maintainability over clever optimization
- [ ] Keep PRs small and focused
- [ ] Wait for CI to pass before merging
- [ ] Don't fix unrelated pre-existing issues
- [ ] Document non-obvious decisions in commits

---

## 11. E2E Testing with Playwright

This project uses Playwright for end-to-end testing. Tests are located in the `e2e/` directory.

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with visible browser
npm run test:e2e:headed

# Run with Playwright UI
npm run test:e2e:ui

# View HTML report
npm run test:e2e:report

# Run specific tests by name pattern
npx playwright test --grep "task"
```

### Test Structure

```
e2e/
├── fixtures.ts                    # Shared test fixtures and helpers
├── pages/
│   ├── index.ts                   # Page object exports
│   ├── Header.ts                  # Header page object
│   ├── Calendar.ts                # Calendar view page object
│   └── dialogs/
│       ├── index.ts               # Dialog exports
│       ├── AddTaskDialog.ts       # Add task dialog page object
│       ├── AddAppointmentDialog.ts
│       ├── EditItemDialog.ts
│       └── DeleteConfirmDialog.ts
├── task.spec.ts                   # Task CRUD tests
├── appointment.spec.ts            # Appointment CRUD tests
├── search-sort.spec.ts            # Search and sort tests
└── import-export.spec.ts          # Import/export tests
```

### Page Object Model (POM)

Use the Page Object Model pattern for maintainable selectors and actions:

```typescript
import { test, expect } from './fixtures';
import { Header, Calendar, AddTaskDialog } from './pages';

test('create a new task', async ({ page, getTomorrowDate }) => {
  const header = new Header(page);
  const calendar = new Calendar(page);
  const addTaskDialog = new AddTaskDialog(page);

  await header.clickAddTask();
  await addTaskDialog.addTask({
    name: 'New Task',
    deadlineDate: getTomorrowDate(),
    priority: 'High',
  });

  await expect(calendar.isItemVisible('New Task')).resolves.toBe(true);
});
```

### Available Fixtures

| Fixture | Description |
|---------|-------------|
| `storageReset` | Clear localStorage and reload the page |
| `getTodayDate` | Get today's date in ISO format (YYYY-MM-DD) |
| `getTomorrowDate` | Get tomorrow's date |
| `getDateDaysFromNow(days)` | Get date N days from today |
| `getCurrentTime` | Get current time (HH:MM format) |

### Adding Data Attributes

For better testability, prefer adding `data-testid` attributes to components:

```tsx
// In component
<div data-testid="calendar-grid">
  <ItemTile data-testid={`item-${item.id}`} />
</div>

// In test
const item = page.locator('[data-testid="item-1"]');
```

### Writing E2E Tests

**Test conventions:**
- One logical behavior per test
- Use descriptive test names: `should create a task with all fields`
- Clean up state between tests using `beforeEach` or fixtures
- Avoid hardcoded waits; use `expect()` conditions with timeouts

**What to test:**
- User workflows (CRUD operations)
- Form validation
- Search and filter functionality
- Sort behavior
- Import/export functionality
- Error handling
- Empty states

**What to avoid:**
- Testing implementation details
- Snapshot tests
- Testing third-party services directly
- Brittle selectors that break on UI changes

---

*Last updated: 2026-07-03*
