---
description: "Execute instructions from the current GitHub Issue step"
agent: tdd-developer
tools:
  - search
  - read
  - edit
  - execute
  - web
  - todo
---

# Execute Step from GitHub Issue

You are now in **TDD Developer** mode, executing step-by-step activities from a GitHub Issue.

## Task

Execute the instructions from the current exercise step systematically, following TDD principles.

**Issue Number**: ${input:issue-number:Enter issue number (or leave empty to auto-detect exercise issue)}

## Instructions

### Step 1: Retrieve Issue Content

If no issue number was provided:
- Use `gh issue list --state open` to find the exercise issue
- The main exercise issue has "Exercise:" in the title
- Capture the issue number

Get the full issue with comments:
```bash
gh issue view <issue-number> --comments
```

### Step 2: Parse Latest Step Instructions

- Locate the most recent step comment in the issue
- Extract all `:keyboard: Activity:` sections from that step
- Identify the step number (e.g., "Step 5-1:")

### Step 3: Execute Activities Systematically

For each activity in the step:

1. **Follow TDD Principles**:
   - If implementing new features: Write tests FIRST (RED-GREEN-REFACTOR)
   - If fixing failing tests: Fix code to make tests pass (GREEN)
   - Run tests after each change to verify

2. **Scope Boundaries**:
   - ✅ DO: Backend unit/integration tests (Jest + Supertest)
   - ✅ DO: Frontend component tests (React Testing Library)
   - ❌ DO NOT: Create or run Playwright UI tests (use `/create-ui-tests` and `/run-ui-tests` instead)

3. **Testing Workflow**:
   - Write test first for new features
   - Implement minimal code to pass
   - Run tests to verify
   - Refactor while keeping tests green

4. **Do NOT Commit or Push**:
   - Changes will be committed using `/commit-and-push` prompt
   - Focus only on completing the activities

### Step 4: Update Working Notes

Document progress in `.github/memory/scratch/working-notes.md`:
- Current step and activities completed
- Key findings and decisions made
- Test results (pass/fail counts)

### Step 5: Provide Next Commands

After completing all activities, provide the user with next steps in this exact order:

**If the step requires UI test automation workflow**:
```
Next steps:
1. /create-ui-tests
2. /run-ui-tests
3. /validate-step {step-number}
```

**If UI workflow is NOT required**:
```
Next steps:
1. /validate-step {step-number}
```

**IMPORTANT**: 
- Never recommend `/validate-step` before required UI test prompts
- Always run UI test creation and execution BEFORE validation if the step requires it
- The step instructions will indicate if UI tests are required

## Success Criteria

You've successfully executed the step when:
- ✅ All `:keyboard: Activity:` sections are completed
- ✅ Tests are written first for new features (TDD)
- ✅ All tests pass (`npm test` in backend/frontend)
- ✅ Working notes updated with progress
- ✅ No commits or pushes made (deferred to `/commit-and-push`)
- ✅ Next commands provided to user

## Example Execution Flow

```
1. Found exercise issue #42
2. Located Step 5-1: "Implement POST /api/todos endpoint"
3. Activities identified:
   - Activity 1: Write test for POST endpoint
   - Activity 2: Implement endpoint handler
   - Activity 3: Run tests to verify

4. Executing TDD cycle:
   [RED] Writing test for POST /api/todos...
   [Test written - expecting 201 status and todo object]
   [Running tests... FAILED as expected]
   
   [GREEN] Implementing endpoint...
   [Code implemented]
   [Running tests... PASSED ✅]
   
   [REFACTOR] Cleaning up code...
   [Running tests... PASSED ✅]

5. Updated working notes with progress

Next steps:
1. /validate-step 5-1
```

Remember: Focus on completing activities with TDD discipline. Let `/create-ui-tests`, `/run-ui-tests`, and `/commit-and-push` handle their respective tasks.
