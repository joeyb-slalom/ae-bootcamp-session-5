---
description: "Analyze changes, generate commit message, and push to feature branch"
tools:
  - read
  - execute
  - todo
---

# Commit and Push Changes

Analyze current changes, generate a conventional commit message, and push to a feature branch.

**Branch Name**: ${input:branch-name:Enter the feature branch name (REQUIRED)}

## Instructions

### Step 1: Verify Branch Name Provided

If no branch name was provided:
- **STOP** and ask the user to provide a branch name
- Branch name is REQUIRED

### Step 2: Pre-Commit Validation

**Check if UI tests are required**:
- Review the current step instructions
- If the step includes required UI test workflow:
  - Verify that `/run-ui-tests` was successfully executed in this chat session, OR
  - Run `npm run test:ui --workspace=frontend` to validate UI tests pass

**Run unit/integration tests**:
```bash
# Backend tests
cd packages/backend && npm test

# Frontend tests
cd packages/frontend && npm test
```

**Verify all tests pass** before proceeding. If tests fail, STOP and report failures.

### Step 3: Analyze Changes

Review what has changed:
```bash
git status
git diff
```

Categorize changes:
- New features added
- Bug fixes
- Tests added or updated
- Refactoring
- Documentation updates

### Step 4: Generate Conventional Commit Message

Based on the analyzed changes, generate a commit message following conventional commit format:

**Format**: `<type>: <description>`

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `test`: Adding or updating tests
- `refactor`: Code refactoring without behavior change
- `chore`: Maintenance tasks
- `docs`: Documentation changes
- `style`: Code style/formatting

**Examples**:
- `feat: add POST /api/todos endpoint with validation`
- `fix: resolve toggle completion state bug`
- `test: add integration tests for todo CRUD operations`
- `refactor: extract validation logic into separate function`

**Guidelines**:
- Keep description concise but descriptive
- Use imperative mood ("add" not "added")
- Don't capitalize first letter
- No period at the end

### Step 5: Create or Switch to Branch

**If branch doesn't exist**, create it:
```bash
git checkout -b ${branch-name}
```

**If branch exists**, switch to it:
```bash
git checkout ${branch-name}
```

**CRITICAL**: 
- ❌ Never commit to `main` branch
- ✅ Only use the user-provided branch name

### Step 6: Stage, Commit, and Push

```bash
# Stage all changes
git add .

# Commit with generated message
git commit -m "<generated-message>"

# Push to feature branch
git push origin ${branch-name}
```

### Step 7: Confirm Success

Report to the user:
- Branch used
- Commit message
- Files changed
- Push status

**Example output**:
```
✅ Changes committed and pushed successfully

Branch: feature/implement-post-endpoint
Commit: feat: add POST /api/todos endpoint with validation
Files changed: 3 (app.js, app.test.js, working-notes.md)
Pushed to: origin/feature/implement-post-endpoint

All tests passing:
- Backend: 12/12 ✅
- Frontend: 8/8 ✅
- UI: 5/5 ✅ (if required)
```

## Important Notes

### Never Commit to Main
This prompt ONLY commits to the user-provided feature branch. If the current branch is `main`, the prompt will create/switch to the specified branch first.

### Test Validation Required
All tests must pass before committing:
- Backend unit/integration tests
- Frontend component tests
- UI tests (if the step requires UI workflow)

If any test fails, STOP and report the failure. Do not commit broken code.

### Conventional Commits
Always follow conventional commit format. This helps with:
- Automated changelog generation
- Semantic versioning
- Clear commit history
- Code review efficiency

## Error Handling

**If tests fail**:
```
❌ Cannot commit - tests are failing

Backend tests: 11/12 (1 failure)
Failure: POST /api/todos should return 201
Error: Expected 201, received 500

Please fix failing tests before committing.
```

**If no branch name provided**:
```
❌ Branch name is required

Please provide a branch name:
/commit-and-push feature/my-branch-name
```

**If trying to commit to main**:
```
✅ Detected current branch is 'main'
Creating and switching to: ${branch-name}
```

## Success Criteria

You've successfully committed and pushed when:
- ✅ All tests passing (unit, integration, UI if required)
- ✅ Changes committed with conventional commit message
- ✅ Pushed to specified feature branch (not main)
- ✅ User informed of success with details
