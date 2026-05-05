# Copilot Instructions for TODO Application

## Project Context

This is a full-stack TODO application with:
- **Frontend**: React application with modern UI components
- **Backend**: Express.js REST API
- **Development Philosophy**: Iterative, feedback-driven development with emphasis on test-first practices
- **Current Phase**: Backend stabilization and frontend feature completion

The project follows Test-Driven Development (TDD) principles and emphasizes incremental, validated changes.

## Documentation References

Refer to these project documents for detailed guidance:
- [docs/project-overview.md](../docs/project-overview.md) - Architecture, tech stack, and project structure
- [docs/testing-guidelines.md](../docs/testing-guidelines.md) - Test patterns and standards
- [docs/workflow-patterns.md](../docs/workflow-patterns.md) - Development workflow guidance

## Development Principles

Follow these core principles when working on this project:

1. **Test-Driven Development**: Write tests FIRST, then implement code to pass them (RED-GREEN-REFACTOR cycle)
2. **Incremental Changes**: Make small, testable modifications rather than large sweeping changes
3. **Systematic Debugging**: Use test failures as guides to identify and resolve issues
4. **Validation Before Commit**: Ensure all tests pass and no lint errors exist before committing

## Testing Scope

This project uses a multi-layered testing strategy to balance fast feedback with comprehensive quality coverage:

### Test Types

- **Backend Unit/Integration Tests**: Jest + Supertest for API endpoint testing
- **Frontend Component Tests**: React Testing Library for component behavior and user interaction
- **UI End-to-End Tests**: Playwright for critical user journey automation
- **Manual Browser Testing**: Exploratory validation and visual checks

### Testing Approach by Context

**Backend API Changes**:
- Write Jest tests FIRST that define expected API behavior
- Run test to see it fail (RED)
- Implement the minimum code to pass the test (GREEN)
- Refactor while keeping tests passing (REFACTOR)
- This is true TDD: Test first, then code to pass the test

**Frontend Component Features**:
- Write React Testing Library tests FIRST for component behavior
- Run test to see it fail (RED)
- Implement component code to pass the test (GREEN)
- Refactor while keeping tests passing (REFACTOR)
- Follow with manual browser testing for full UI flows and visual validation

**UI Test Automation**:
- Playwright tests validate critical end-user journeys
- Use stable selectors (test IDs, roles, accessible labels)
- Implement state-based waits, not arbitrary timeouts
- Run UI tests to verify complete user workflows

**Rationale**: Combine fast feedback from unit/integration tests with end-to-end quality confidence from UI tests.

## Workflow Patterns

### 1. TDD Workflow (RED-GREEN-REFACTOR)

```
Write/Fix Test → Run Test → See Failure (RED) → 
Implement Code → Run Test → See Pass (GREEN) → 
Refactor → Verify Tests Still Pass → Commit
```

**Key Points**:
- Always write the test before the implementation
- Run tests frequently to get immediate feedback
- Keep the cycle tight and focused on one behavior at a time

### 2. Code Quality Workflow

```
Run Lint → Review Issues → Categorize by Type → 
Fix Systematically → Re-run Lint → Verify Clean → Commit
```

**Key Points**:
- Address lint errors before committing
- Group similar issues and fix in batches
- Re-validate after each set of fixes

### 3. Integration Workflow

```
Identify Issue → Debug with Tests → Write Test Cases → 
Implement Fix → Verify Unit Tests → Verify Integration → 
Manual Validation → Commit
```

**Key Points**:
- Use tests to isolate the root cause
- Validate at multiple levels (unit, integration, end-to-end)
- Confirm the fix doesn't introduce regressions

### 4. UI Testing Workflow

```
Define Critical Journeys → Create Playwright Tests → 
Run Tests → Debug Failures → Classify Issues → 
Fix Application or Test → Validate Coverage → Commit
```

**Key Points**:
- Focus on high-value user workflows
- Use stable, accessible selectors
- Classify failures: application defect, test defect, or environment issue
- Do NOT run Playwright tests outside of test-engineer mode

## Agent Usage

Use specialized agents for specific workflows:

### `@tdd-developer` Agent
**Use For**:
- Implementing backend API features with Jest tests
- Creating frontend components with React Testing Library tests
- Following RED-GREEN-REFACTOR TDD cycle
- Debugging unit and integration test failures

**Do NOT Use For**:
- Creating or running Playwright UI tests (use `@test-engineer` instead)
- Code quality/lint fixes (use `@code-reviewer` instead)

### `@code-reviewer` Agent
**Use For**:
- Addressing ESLint errors and warnings
- Code quality improvements and refactoring
- Style consistency and best practices
- Pre-commit code validation

**Do NOT Use For**:
- Feature implementation (use `@tdd-developer` instead)
- UI test automation (use `@test-engineer` instead)

### `@test-engineer` Agent
**Use For**:
- Creating Playwright UI test automation
- Executing end-to-end UI test suites
- Debugging and triaging UI test failures
- Validating critical user journeys
- Isolation checks for UI test reliability

**Do NOT Use For**:
- Unit or integration tests (use `@tdd-developer` instead)
- Feature implementation (use `@tdd-developer` instead)

## Memory System

This project uses a working memory system to track development discoveries, patterns, and decisions.

### Memory Types

- **Persistent Memory**: This file (`.github/copilot-instructions.md`) contains foundational principles and workflows that rarely change
- **Working Memory**: `.github/memory/` directory contains accumulated discoveries, patterns, and session-specific learnings that evolve with development

### Memory Files

#### Committed to Git (Permanent Records)
- **`.github/memory/session-notes.md`**: Historical session summaries documenting completed work
  - Updated at the END of each development session
  - Captures accomplishments, key findings, decisions, and outcomes
  - Provides context about project evolution

- **`.github/memory/patterns-discovered.md`**: Catalog of recurring code patterns and solutions
  - Updated when discovering or deciding on reusable patterns
  - Documents pattern name, context, problem, solution, and examples
  - Helps maintain consistency across the codebase

#### Not Committed (Ephemeral Workspace)
- **`.github/memory/scratch/working-notes.md`**: Active session working notes
  - Updated continuously DURING active development
  - Tracks current task, approach, findings, blockers, next steps
  - Scratch space for thinking and in-progress work
  - At end of session, key findings are summarized into `session-notes.md`

### When to Use Memory Files

**During Active Development**:
- Document findings, decisions, and blockers in `scratch/working-notes.md`
- Reference to track progress and maintain context during complex work

**At End of Session**:
- Summarize key accomplishments into `session-notes.md`
- Extract reusable patterns into `patterns-discovered.md`
- Clear or archive working notes for next session

**Before Starting New Work**:
- Review recent `session-notes.md` entries for context
- Check `patterns-discovered.md` for relevant patterns to apply

### How AI Uses Memory

When providing assistance, AI assistants can:
- Reference session history to understand past decisions
- Apply discovered patterns to maintain consistency
- Consider active context from working notes
- Avoid known issues documented in previous sessions

For detailed information about the memory system, see [`.github/memory/README.md`](.github/memory/README.md).

## Workflow Utilities

GitHub CLI commands are available for workflow automation:

### Issue Management

```bash
# List all open issues
gh issue list --state open

# View specific issue details
gh issue view <issue-number>

# View issue with all comments
gh issue view <issue-number> --comments
```

### Exercise Workflow

- The main exercise issue has "Exercise:" in the title
- Individual steps are posted as comments on the main issue
- Use `/execute-step` to work on a specific step
- Use `/validate-step` to verify step completion
- Retrieve issue details with `gh issue view` before starting work

## Git Workflow

### Conventional Commits

Use conventional commit format for all commits:

```
<type>: <description>

[optional body]
[optional footer]
```

**Types**:
- `feat:` - New feature
- `fix:` - Bug fix
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks
- `docs:` - Documentation changes
- `refactor:` - Code refactoring without behavior change
- `style:` - Code style/formatting changes

**Examples**:
```bash
git commit -m "feat: add todo item completion toggle"
git commit -m "fix: resolve API endpoint 404 error"
git commit -m "test: add integration tests for todo creation"
```

### Branch Strategy

- **Main branch**: `main` - Stable, production-ready code
- **Feature branches**: `feature/<descriptive-name>` - New features or enhancements
- **Bugfix branches**: `fix/<descriptive-name>` - Bug fixes

### Commit Best Practices

1. **Stage all changes before committing**:
   ```bash
   git add .
   git commit -m "feat: your message"
   ```

2. **Push to the correct branch**:
   ```bash
   git push origin <branch-name>
   ```

3. **Keep commits focused**: One logical change per commit

4. **Verify before pushing**: Ensure all tests pass and no lint errors exist
