---
description: "Create UI tests for required critical user journeys"
agent: test-engineer
tools:
  - search
  - read
  - edit
  - execute
  - todo
---

# Create UI Tests for Critical User Journeys

You are now in **Test Engineer** mode, creating Playwright UI tests for critical user journeys.

**Journeys**: ${input:journeys:Enter specific journeys to test (or leave empty for defaults: create, edit, toggle, delete, error handling)}

## Instructions

### Step 1: Determine Test Scenarios

**If journeys were provided**:
- Use the specified journeys

**If no journeys provided**, use default critical paths:
- Create new todo
- Edit/update existing todo
- Toggle todo completion status
- Delete todo
- Core error-state handling (e.g., empty title validation)

**HARD LIMIT**: Maximum 5 Playwright test cases for this run (target 3-5)
- If more than 5 candidate scenarios exist, select the highest-risk 5
- Focus on: Create, Toggle, Delete, and 1-2 error paths
- List deferred scenarios instead of creating more tests

**Requirements**:
- At least 1 error-path test within the 3-5 total
- Focus on highest-value user journeys
- Include happy path and critical error cases

### Step 2: Review Existing Test Structure

Check for existing UI tests:
```bash
find packages/frontend/tests/ui -name "*.spec.js"
```

Review:
- Existing test files
- Page object classes (if any)
- Test patterns being used

### Step 3: Create or Update Page Object Model

**Page Objects centralize selectors and interactions**.

Create or update page object class:
```javascript
// packages/frontend/tests/ui/pages/TodoPage.js
class TodoPage {
  constructor(page) {
    this.page = page;
    
    // Centralized selectors - use accessible, stable selectors
    this.newTodoInput = page.getByRole('textbox', { name: /new todo/i });
    this.addButton = page.getByRole('button', { name: /add/i });
    this.todoList = page.getByRole('list');
  }

  async goto() {
    await this.page.goto('http://localhost:3000');
    await this.addButton.waitFor({ state: 'visible' });
  }

  async addTodo(title) {
    await this.newTodoInput.fill(title);
    await this.addButton.click();
    // State-based wait - wait for todo to appear
    await this.page.getByText(title).waitFor({ state: 'visible' });
  }

  async toggleTodo(title) {
    const todoItem = await this.page.getByText(title);
    const checkbox = todoItem.locator('..').getByRole('checkbox');
    await checkbox.click();
    await checkbox.waitFor({ state: 'visible' });
  }

  async deleteTodo(title) {
    const todoItem = await this.page.getByText(title);
    const deleteButton = todoItem.locator('..').getByRole('button', { name: /delete/i });
    await deleteButton.click();
    // State-based wait - wait for todo to disappear
    await this.page.getByText(title).waitFor({ state: 'detached' });
  }
}

module.exports = { TodoPage };
```

**Selector Priority** (most to least stable):
1. `getByRole('button', { name: /add/i })` - Accessible roles
2. `getByLabelText('Email')` - Form labels
3. `getByTestId('todo-item')` - Test IDs
4. Avoid: CSS classes, IDs (`.class`, `#id`)

**Always use state-based waits**:
- ✅ `waitFor({ state: 'visible' })`
- ✅ `waitFor({ state: 'detached' })`
- ❌ `waitForTimeout(2000)` - Never use arbitrary timeouts

### Step 4: Create Test Cases

Create or update test file with focused scenarios:

```javascript
// packages/frontend/tests/ui/e2e.spec.js
const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');

test.describe('Todo Application', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  test('user can create a new todo', async ({ page }) => {
    await todoPage.addTodo('Buy groceries');
    await expect(page.getByText('Buy groceries')).toBeVisible();
  });

  test('user can toggle todo completion', async ({ page }) => {
    await todoPage.addTodo('Read book');
    await todoPage.toggleTodo('Read book');
    
    const checkbox = page.getByText('Read book')
      .locator('..')
      .getByRole('checkbox');
    await expect(checkbox).toBeChecked();
  });

  test('user can delete a todo', async ({ page }) => {
    await todoPage.addTodo('Delete me');
    await todoPage.deleteTodo('Delete me');
    await expect(page.getByText('Delete me')).not.toBeVisible();
  });

  // Error-path test (REQUIRED - at least 1)
  test('shows error when creating todo without title', async ({ page }) => {
    await todoPage.addButton.click(); // Try to add without title
    await expect(page.getByText(/title.*required/i)).toBeVisible();
  });
});
```

**Test Best Practices**:
- Each test is independent (no shared state)
- Use `beforeEach` to reset state (reload page)
- Tests read like user stories ("user can...")
- Focus on scenario assertions, not implementation details

### Step 5: Verify Test Count

**BEFORE finishing**:
- Count the total number of `test(...)` or `it(...)` blocks created/updated
- If count > 5, reduce to highest-priority 5
- Document deferred scenarios in a comment or report

**Example**:
```javascript
// Created 5 tests (at limit):
// 1. Create todo (happy path)
// 2. Toggle completion (happy path)
// 3. Delete todo (happy path)
// 4. Empty title error (error path)
// 5. Server error handling (error path)

// Deferred scenarios (for future):
// - Edit todo title
// - Bulk delete
// - Filter by completion status
```

**Do not claim "small scope" if authored count > 5**.

### Step 6: Report Results

Provide summary of created/updated tests:

```markdown
## UI Tests Created/Updated

### Page Objects
- ✅ Created: packages/frontend/tests/ui/pages/TodoPage.js
  - Centralized selectors for all todo interactions
  - State-based waits for reliability

### Test Cases (5 total - at limit)

**Happy Path Tests**:
1. ✅ User can create a new todo
2. ✅ User can toggle todo completion
3. ✅ User can delete a todo

**Error Path Tests**:
4. ✅ Shows error when creating todo without title
5. ✅ Shows error when server unavailable

### Deferred Scenarios
- Edit todo title (lower priority)
- Filter todos by status (lower priority)

### Files Changed
- packages/frontend/tests/ui/pages/TodoPage.js (created)
- packages/frontend/tests/ui/e2e.spec.js (updated)

### Next Steps
1. /run-ui-tests - Execute tests and validate
```

## Important Notes

### Maximum 5 Tests
This prompt creates a **maximum of 5 Playwright test cases** in one run:
- Focus on highest-value journeys
- Include at least 1 error-path test
- Defer lower-priority scenarios

### Page Object Model Required
- Put reusable selectors and interactions in page objects
- Keep test files focused on scenario assertions
- Avoid duplicating selectors across tests

### Stable Selectors Required
- Prefer `getByRole`, `getByLabel`, `getByTestId`
- Avoid brittle CSS selectors
- Match how users interact with UI

### State-Based Waits Required
- Always wait for specific state changes
- Never use arbitrary `waitForTimeout()`
- Wait for elements to appear/disappear

### Test Isolation Required
- Each test must be independent
- Use `beforeEach` to reset state
- Don't share data between tests

## Error Handling

**If more than 5 scenarios requested**:
```
⚠️ Maximum 5 tests per run

Requested: 8 scenarios
Creating: 5 highest-priority scenarios
Deferred: 3 lower-priority scenarios

Focus on critical paths first.
```

**If test count exceeds limit during creation**:
```
⚠️ Test count exceeded (6 tests created)

Reducing to 5 highest-priority tests:
Keeping: Create, Toggle, Delete, Empty Title Error, Server Error
Deferring: Edit Todo Title

Limit enforced: 5 tests maximum.
```

## Success Criteria

You've successfully created UI tests when:
- ✅ Test count ≤ 5 (hard limit enforced)
- ✅ At least 1 error-path test included
- ✅ Page Object Model used for interactions
- ✅ Stable selectors used (accessible roles/labels)
- ✅ State-based waits implemented (no arbitrary timeouts)
- ✅ Tests are isolated and independent
- ✅ Test scenarios read like user stories
- ✅ Files and scenarios clearly reported

Remember: Quality over quantity. 3-5 reliable tests covering critical paths are better than 20 flaky tests.
