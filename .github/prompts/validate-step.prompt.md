---
description: "Validate that all success criteria for the current step are met"
agent: code-reviewer
tools:
  - search
  - read
  - execute
  - web
  - todo
---

# Validate Step Completion

You are now in **Code Reviewer** mode, validating that all success criteria for a step are met.

**Step Number**: ${input:step-number:Enter the step number (e.g., "5-0", "5-1") - REQUIRED}

## Instructions

### Step 1: Verify Step Number Provided

If no step number was provided:
- **STOP** and ask the user to provide the step number
- Step number is REQUIRED (format: "5-0", "5-1", etc.)

### Step 2: Retrieve Exercise Issue

Use GitHub CLI to find the main exercise issue:
```bash
gh issue list --state open
```

Look for the issue with "Exercise:" in the title and capture its number.

Get the full issue with all comments:
```bash
gh issue view <issue-number> --comments
```

### Step 3: Locate Step and Success Criteria

Search through the issue content for the specified step:
- Find the section that starts with `# Step ${step-number}:`
- Extract the entire step content
- Locate the **Success Criteria** or **Validation Checklist** section within that step

**Example step format**:
```markdown
# Step 5-1: Implement POST Endpoint

:keyboard: Activity:
1. Write test for POST endpoint
2. Implement endpoint

Success Criteria:
- [ ] Test file exists: packages/backend/__tests__/app.test.js
- [ ] Test includes POST /api/todos test case
- [ ] Endpoint implemented in packages/backend/src/app.js
- [ ] All tests passing (npm test)
- [ ] Returns 201 status code
- [ ] Returns todo object with id, title, completed, createdAt
```

### Step 4: Check Each Criterion

For each success criterion in the list:

1. **Check file existence**:
   ```bash
   test -f <file-path> && echo "✅ Found" || echo "❌ Not found"
   ```

2. **Check code implementation**:
   - Read relevant files
   - Search for expected functions, endpoints, or logic
   - Verify implementation matches requirements

3. **Run tests**:
   ```bash
   cd packages/backend && npm test
   cd packages/frontend && npm test
   ```

4. **Check test coverage**:
   - Verify specific test cases exist
   - Confirm tests are passing

5. **Validate behavior**:
   - If step requires UI validation, check that UI tests pass
   - Review console output for errors

### Step 5: Report Validation Results

Provide a clear, structured report:

**Format**:
```markdown
## Step ${step-number} Validation Report

### Success Criteria Status

1. ✅ Test file exists: packages/backend/__tests__/app.test.js
2. ✅ Test includes POST /api/todos test case
3. ✅ Endpoint implemented in packages/backend/src/app.js
4. ✅ All tests passing (12/12)
5. ✅ Returns 201 status code
6. ✅ Returns todo object with required fields

### Overall Status: ✅ COMPLETE

All success criteria met. Step 5-1 is complete and ready for commit.

### Next Steps
1. /commit-and-push feature/implement-post-endpoint
```

**If criteria are NOT met**:
```markdown
## Step ${step-number} Validation Report

### Success Criteria Status

1. ✅ Test file exists: packages/backend/__tests__/app.test.js
2. ✅ Test includes POST /api/todos test case
3. ❌ Endpoint implemented in packages/backend/src/app.js
   - Issue: Endpoint returns 500 instead of 201
   - Fix: Check validation logic in endpoint handler
4. ❌ All tests passing (11/12)
   - Failure: POST /api/todos should return 201
   - Error: Expected 201, received 500

### Overall Status: ❌ INCOMPLETE

### Items to Fix

**Critical**:
- Fix endpoint to return 201 status code
- Resolve POST endpoint test failure

**Recommendation**:
Use @tdd-developer to debug and fix the endpoint implementation.
```

### Step 6: Provide Actionable Guidance

Based on validation results:

**If complete**:
- Confirm all criteria met
- Suggest next step: `/commit-and-push <branch-name>`

**If incomplete**:
- List specific items that need attention
- Provide concrete guidance on how to fix each issue
- Suggest which agent to use for fixes:
  - Implementation bugs → `@tdd-developer`
  - Code quality issues → `@code-reviewer`
  - UI test issues → `@test-engineer`

## Validation Checklist Examples

### Common Success Criteria Patterns

**File Existence**:
```
- [ ] File exists: packages/backend/src/app.js
- [ ] Test file exists: packages/backend/__tests__/app.test.js
```

**Code Implementation**:
```
- [ ] POST /api/todos endpoint defined
- [ ] Endpoint includes validation logic
- [ ] Error handling implemented
```

**Test Coverage**:
```
- [ ] Test case for POST endpoint exists
- [ ] Test validates 201 status code
- [ ] Test validates response structure
- [ ] Test includes error case (400 when title missing)
```

**Test Results**:
```
- [ ] All backend tests passing
- [ ] All frontend tests passing
- [ ] All UI tests passing (if required)
```

**Behavior Validation**:
```
- [ ] Endpoint returns correct status code
- [ ] Response includes required fields
- [ ] Error handling works as expected
```

## Important Notes

### Step Number is Required
This prompt requires a step number to locate the correct success criteria. Format examples:
- `5-0` (Step 0 of Exercise 5)
- `5-1` (Step 1 of Exercise 5)
- `5-2` (Step 2 of Exercise 5)

### Thorough Validation
Check each criterion carefully:
- Don't just check if files exist - verify they contain the right code
- Don't just check if tests exist - verify they pass
- Don't assume - actually run tests and check output

### Clear Communication
Report results clearly:
- Use ✅ for met criteria
- Use ❌ for unmet criteria
- Provide specific guidance for fixes
- Include relevant error messages or logs

## Error Handling

**If step number not provided**:
```
❌ Step number is required

Please provide the step number:
/validate-step 5-1
```

**If step not found in issue**:
```
❌ Could not find Step ${step-number} in issue #42

Available steps in issue:
- Step 5-0
- Step 5-1
- Step 5-2

Please verify the step number and try again.
```

**If no success criteria found**:
```
⚠️ No explicit success criteria found for Step ${step-number}

Performing standard validation checks:
- File existence
- Test execution
- Code implementation

If you expected specific criteria, please check the issue format.
```

## Success Criteria

You've successfully validated the step when:
- ✅ Step number provided and located in issue
- ✅ Success criteria extracted from step
- ✅ Each criterion checked against workspace state
- ✅ Clear report provided with ✅/❌ indicators
- ✅ Actionable guidance provided for any incomplete items
- ✅ Next steps clearly communicated

Remember: Validation is about ensuring quality and completeness. Be thorough, be clear, and provide actionable feedback.
