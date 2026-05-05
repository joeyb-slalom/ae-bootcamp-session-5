---
description: "Run UI tests and summarize failures"
agent: test-engineer
tools:
  - read
  - execute
  - todo
---

# Run UI Tests and Analyze Results

Execute Playwright UI tests and provide clear pass/fail summary with failure triage.

## Input

No user input required.

## Instructions

### 1. Install Playwright Dependencies (REQUIRED FIRST STEP)

**CRITICAL**: Before running UI tests, install Playwright browsers and OS dependencies:

```bash
npm run test:ui:install --workspace=frontend
```

**For Ubuntu/Linux environments** (including Codespaces):
- This step is **MANDATORY** and must complete successfully
- The command performs `playwright install --with-deps chromium`
- Includes automatic bounded Ubuntu repo remediation for common Yarn GPG key issues
- Includes one automatic retry after remediation

**Important Notes**:
- Run `test:ui:install` after every container rebuild
- If the install script fails **after the automatic retry**, STOP immediately
- Report an environment blocker with:
  - The failing command
  - Key error lines from the output
  - DO NOT attempt ad-hoc package hunting or broad OS troubleshooting

**DO NOT** continue to run Playwright tests after a failed dependency install.

### 2. Ensure Backend and Frontend Are Running

UI tests require both services to be running:

**Check if services are running**:
```bash
# Check for running processes
lsof -i :3001  # Backend
lsof -i :3000  # Frontend
```

**If not running, start from repo root**:
```bash
npm start
```

This starts both backend (port 3001) and frontend (port 3000) concurrently.

**Wait for services to be ready**:
- Backend: Should show "Server running on port 3001"
- Frontend: Should show "webpack compiled successfully"

### 3. Run UI Tests

Execute Playwright tests:

```bash
cd packages/frontend
npm run test:ui
```

**Capture full output** including:
- Test suite names
- Individual test results
- Pass/fail counts
- Duration
- Error messages and stack traces (if any)

### 4. Summarize Results

**Parse test output** to determine:
- Total tests run
- Tests passed
- Tests failed
- Tests skipped
- Total duration

**Example output**:
```
Running 5 tests using 1 worker

  ✓ user can create a new todo (1234ms)
  ✓ user can toggle todo completion (987ms)
  ✗ user can delete a todo (2345ms)
  ✓ shows error when creating todo without title (456ms)
  ✓ user can edit todo title (789ms)

  4 passed (5.8s)
  1 failed (2.3s)
```

### 5. Triage Failures (If Any)

For each failing test, classify the root cause into one of three categories:

#### Category 1: Application Code Bug

**Indicators**:
- Test expectations are correct
- Application behavior is wrong
- Test passed previously, now fails after code changes
- Error occurs in application code (not test code)

**Example**:
```
Test: expects 201 status when creating todo
Actual: receives 500 internal server error
Evidence: Console shows "Cannot read property 'title' of undefined"
Root Cause: Backend endpoint has a bug in validation logic
```

**Recommendation**: Fix application code (handoff to `@tdd-developer`)

#### Category 2: Test Code Issue

**Indicators**:
- Selector doesn't match actual UI
- Test logic has bugs or wrong expectations
- Flaky due to improper waits
- Test needs updating after intentional UI changes

**Example**:
```
Test: Cannot find button with name "Add Todo"
Actual: Button text is now "Add" (intentional UI change)
Evidence: Selector uses old button text
Root Cause: Test selector needs updating
```

**Recommendation**: Update test code (this agent can fix)

#### Category 3: Environment Issue

**Indicators**:
- Test fails intermittently
- Works locally but fails in CI
- Network timeouts or connection refused
- Missing browser dependencies
- Port conflicts

**Example**:
```
Test: Timeout waiting for page to load
Actual: Error: ECONNREFUSED localhost:3000
Evidence: Frontend dev server not running
Root Cause: Services not started before tests
```

**Recommendation**: Fix environment (start services, install dependencies)

### 6. Provide Detailed Failure Report

For each failure, provide:

```markdown
### Failure: [Test Name]

**File**: `path/to/test.spec.js:line`

**Error Message**:
```
[Exact error from test output]
```

**Classification**: [Application Bug | Test Code | Environment]

**Root Cause**:
[Detailed explanation of why the test failed]

**Evidence**:
- [Specific observations from error output]
- [Screenshots/logs if available]
- [Network requests if relevant]

**Recommendation**:
[Specific action to fix the issue]
```

### 7. Generate Overall Summary

Provide clear, actionable summary of test run.

## Output Format

```markdown
## UI Test Execution Results

### Summary
- **Total Tests**: [count]
- **Passed**: [count] ✅
- **Failed**: [count] ❌
- **Skipped**: [count] ⏭️
- **Duration**: [seconds]s

### Test Details

#### Passed Tests ✅
1. ✅ User can create a new todo (1.2s)
2. ✅ User can toggle completion (0.9s)
3. ✅ User sees error for empty title (0.5s)
[... list all passing tests ...]

#### Failed Tests ❌

##### 1. User can delete a todo

**File**: `packages/frontend/tests/ui/e2e.spec.js:42`

**Error**:
```
Error: Timed out 5000ms waiting for expect(locator).not.toBeVisible()

Locator: getByText('Delete me')
Expected: not.toBeVisible()
Received: visible
```

**Classification**: Application Bug

**Root Cause**: 
The DELETE endpoint is not removing the todo from the backend. The UI updates optimistically but the item reappears after page refresh because the backend change failed.

**Evidence**:
- Network tab shows DELETE request returns 200
- But GET /api/todos still includes the "deleted" item
- Backend logs show "Cannot find index of todo"

**Recommendation**:
Fix the DELETE endpoint implementation in `packages/backend/src/app.js`.
This is an application code issue. Consider using `@tdd-developer` to:
1. Review the DELETE endpoint logic
2. Fix the bug in todo removal
3. Verify backend tests cover this scenario

### Classification Summary

- 🐛 **Application Bugs**: [count]
- 🧪 **Test Code Issues**: [count]
- 🔧 **Environment Issues**: [count]

### Next Steps

[If all tests pass:]
✅ All UI tests passing! Ready to proceed.

Next command:
```
/validate-step {step-number}
```

[If tests fail due to application bugs:]
⚠️ Application bugs found. Recommend fixing before proceeding.

Suggested actions:
1. Use `@tdd-developer` to fix application bugs
2. Re-run `/run-ui-tests` to verify fixes
3. Then proceed to `/validate-step {step-number}`

[If tests fail due to test code issues:]
⚠️ Test code needs updates.

I can fix these test code issues. Please confirm if you'd like me to update the tests.

[If tests fail due to environment issues:]
❌ Environment issues detected.

Please resolve:
1. [Specific environment fix needed]
2. Then re-run `/run-ui-tests`
```

## Troubleshooting

### Playwright Not Installed

**Error**: `Error: browserType.launch: Executable doesn't exist`

**Solution**:
```bash
npm run test:ui:install --workspace=frontend
```

### Services Not Running

**Error**: `Error: ECONNREFUSED localhost:3000`

**Solution**:
```bash
# From repo root
npm start
```

Wait for both services to start, then re-run tests.

### Port Conflicts

**Error**: `Error: Port 3000 is already in use`

**Solution**:
```bash
# Find and kill process using the port
lsof -ti :3000 | xargs kill -9
lsof -ti :3001 | xargs kill -9

# Restart services
npm start
```

### Browser Launch Fails

**Error**: `Error: Failed to launch browser`

**Solution**:
Re-run Playwright install with OS dependencies:
```bash
npm run test:ui:install --workspace=frontend
```

If this fails after automatic remediation and retry, report as environment blocker.

## References

- Playwright documentation: https://playwright.dev
- Testing guidelines: See [docs/testing-guidelines.md](../../docs/testing-guidelines.md)
- Failure triage: See your agent instructions
