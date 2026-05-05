# Development Memory System

## Purpose

This memory system helps track patterns, decisions, and lessons learned during development. It serves as a knowledge base that AI assistants can reference to provide more context-aware suggestions and help you avoid repeating mistakes or rediscovering solutions.

## Two Types of Memory

### Persistent Memory
- **Location**: `.github/copilot-instructions.md`
- **Purpose**: Foundational principles, workflows, and universal project guidelines
- **Scope**: Rarely changes; defines core development philosophy
- **Examples**: TDD workflow, agent usage patterns, commit conventions

### Working Memory
- **Location**: `.github/memory/` directory (this directory)
- **Purpose**: Accumulated discoveries, patterns, and session-specific learnings
- **Scope**: Evolves with each development session
- **Examples**: Specific bug fixes, code patterns, API design decisions

## Directory Structure

```
.github/memory/
├── README.md                    # This file - explains the memory system
├── session-notes.md             # Historical session summaries (committed)
├── patterns-discovered.md       # Accumulated code patterns (committed)
└── scratch/
    ├── .gitignore              # Ignores all files in scratch/
    └── working-notes.md        # Active session notes (NOT committed)
```

### File Purposes

#### `session-notes.md` (Committed to Git)
- **What**: Historical record of completed development sessions
- **When**: Updated at the END of each session
- **Content**: Summary of accomplishments, key findings, decisions, outcomes
- **Why**: Provides context about project evolution and past work
- **Git Status**: Committed - part of permanent project history

#### `patterns-discovered.md` (Committed to Git)
- **What**: Catalog of recurring code patterns and solutions
- **When**: Updated when you discover or decide on a reusable pattern
- **Content**: Pattern name, context, problem, solution, examples
- **Why**: Helps maintain consistency and avoid reinventing solutions
- **Git Status**: Committed - shared knowledge for all developers

#### `scratch/working-notes.md` (NOT Committed)
- **What**: Active working notes for current session
- **When**: Updated continuously DURING active development
- **Content**: Current task, approach, findings, blockers, next steps
- **Why**: Scratch space for thinking and tracking in-progress work
- **Git Status**: Not committed - ephemeral workspace

## When to Use Each File

### During TDD Workflow

**Active Work (scratch/working-notes.md)**:
```
Current Task: Implement POST /api/todos endpoint
Approach: TDD - write test first, then implementation
Key Findings:
- Test expects 201 status and todo object with id, title, completed, createdAt
- Need to validate title is present
Decisions Made:
- Use array.push() for in-memory storage
- Generate IDs using Date.now() for simplicity
Next Steps:
- Implement validation test
- Add error handling for duplicate IDs
```

**After Session (session-notes.md)**:
```
## Session: Implement TODO CRUD Endpoints - 2026-05-05

### Accomplished
- Implemented POST /api/todos with validation
- Implemented GET /api/todos and GET /api/todos/:id
- All tests passing

### Key Findings
- In-memory array works for prototype
- Need 404 handling for non-existent todos
- Validation prevents incomplete data
```

**Pattern Discovered (patterns-discovered.md)**:
```
### Pattern: Service Initialization

**Context**: Setting up in-memory data stores
**Problem**: Should we initialize with empty array or null?
**Solution**: Always initialize with empty array []
**Why**: Avoids null checks in every operation
**Example**: const todos = []; // Better than: let todos = null;
```

### During Linting Workflow

**Active Work (scratch/working-notes.md)**:
```
Current Task: Fix ESLint errors in app.js
Findings:
- 15 errors total: 8 unused vars, 5 console statements, 2 no-undef
- Unused vars are from old debug code
- Console statements should use proper logger
Decisions:
- Remove unused debug variables
- Replace console.log with logger (to be implemented)
- Fix undefined variable references
Blockers:
- Need to decide on logging strategy
```

### During Debugging Workflow

**Active Work (scratch/working-notes.md)**:
```
Current Task: Debug toggle always setting completed to true
Approach:
1. Review toggle function code
2. Add test case for both directions
3. Identify bug location
Key Findings:
- Bug in line 45: todo.completed = true (hardcoded)
- Should be: todo.completed = !todo.completed
- Missing test coverage for toggle false->true->false
Decisions:
- Fix the bug
- Add bidirectional toggle test
- Consider adding property-based test for toggle invariant
```

**After Session (session-notes.md)**:
```
## Session: Fix Toggle Bug - 2026-05-05

### Key Findings
- Toggle function had hardcoded true instead of negation
- Test coverage gap: only tested false->true, not true->false

### Decisions
- Added comprehensive toggle tests
- Implemented property-based test: toggle(toggle(x)) === x
```

**Pattern Discovered (patterns-discovered.md)**:
```
### Pattern: Toggle Implementation

**Context**: Boolean property toggling
**Problem**: How to reliably toggle boolean values
**Solution**: Use negation operator with explicit property assignment
**Example**: 
```javascript
// Good
item.completed = !item.completed;

// Bad (hardcoded)
item.completed = true;
```
**Related Files**: src/app.js (handleToggleTodo)
```

## How AI Uses These Patterns

When you ask Copilot for help, it can:

1. **Reference Session History**: "Based on session-notes.md, you decided to use in-memory storage"
2. **Apply Discovered Patterns**: "Following the Service Initialization pattern in patterns-discovered.md, initialize with []"
3. **Consider Active Context**: "Your working-notes.md shows you're debugging toggle - let me check that pattern"
4. **Avoid Known Issues**: "Session notes indicate toggle had a hardcoded bug - ensuring new code uses negation"

## Best Practices

### ✅ DO

- **Update working-notes.md continuously** during active development
- **Be specific** in your findings and decisions
- **Capture "why"** not just "what" in patterns
- **Summarize at session end** - move key points to session-notes.md
- **Document patterns** when you solve something you might encounter again
- **Keep working-notes.md focused** on current task
- **Review past sessions** before starting new work

### ❌ DON'T

- **Don't commit scratch/working-notes.md** - it's ephemeral
- **Don't skip session summaries** - they preserve institutional knowledge
- **Don't duplicate** - reference existing patterns instead of rewriting
- **Don't be vague** - "Fixed bug" is less helpful than "Toggle used hardcoded true instead of negation"
- **Don't forget context** - explain why decisions were made

## Workflow Summary

### During Active Development
1. Open `scratch/working-notes.md`
2. Document current task and approach
3. Record findings and decisions as you work
4. Update blockers and next steps

### At End of Session
1. Review `scratch/working-notes.md`
2. Extract key accomplishments → add to `session-notes.md`
3. Extract reusable patterns → add to `patterns-discovered.md`
4. Clear or archive working-notes.md for next session

### Before Starting New Work
1. Review recent entries in `session-notes.md`
2. Check `patterns-discovered.md` for relevant patterns
3. Start fresh `scratch/working-notes.md` for new task

## Example Interaction with AI

```
You: "I need to implement DELETE endpoint for todos"

Copilot: "Looking at your patterns-discovered.md, you're using in-memory 
array storage. For DELETE, we should:
1. Find todo by ID (check session-notes.md - you used findIndex before)
2. Return 404 if not found (consistent with GET pattern)
3. Remove from array using splice()
4. Return success response

Based on your TDD workflow, let's write the test first..."
```

---

## Getting Started

1. **Right now**: Open `scratch/working-notes.md` and document what you're working on
2. **During work**: Keep notes about findings and decisions
3. **End of session**: Summarize key points into `session-notes.md`
4. **When you discover a pattern**: Add it to `patterns-discovered.md`

This system grows with you and helps both you and AI assistants provide better, more context-aware development support.
