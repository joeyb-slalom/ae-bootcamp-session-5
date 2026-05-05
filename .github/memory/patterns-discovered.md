# Discovered Code Patterns

## Purpose

This file catalogs recurring code patterns and solutions discovered during development. Each pattern documents the context, problem, solution, and examples to maintain consistency and avoid reinventing solutions.

**Important**: This file is committed to git and serves as a shared knowledge base for all developers and AI assistants.

---

## Pattern Template

Use this template when documenting a new pattern:

```markdown
### Pattern: [Pattern Name]

**Context**: [When/where this pattern applies]

**Problem**: [What problem does this solve?]

**Solution**: [How to implement the pattern]

**Why**: [Rationale for this approach]

**Example**:
```language
// Code example demonstrating the pattern
```

**Anti-Pattern** (if applicable):
```language
// What NOT to do
```

**Related Files**: [Where this pattern is used]

**References**: [Links to documentation, issues, or commits]
```

---

## Patterns Catalog

### Pattern: Service Initialization

**Context**: Setting up in-memory data stores or service state at application startup

**Problem**: Should we initialize collections with empty arrays or null? How do we avoid null checks throughout the codebase?

**Solution**: Always initialize collections with empty arrays/objects rather than null or undefined

**Why**: 
- Eliminates null/undefined checks in every operation
- Arrays can be safely iterated immediately
- Prevents "Cannot read property of null" runtime errors
- Makes code more predictable and easier to test

**Example**:
```javascript
// Good - Initialize with empty array
const todos = [];

// Methods can safely operate without null checks
todos.push(newTodo);
todos.filter(t => t.completed);
todos.find(t => t.id === id);
```

**Anti-Pattern**:
```javascript
// Bad - Initialize with null
let todos = null;

// Every operation needs null checks
if (todos !== null) {
  todos.push(newTodo);
}

// Verbose and error-prone
const completed = todos?.filter(t => t.completed) || [];
```

**Related Files**: 
- `packages/backend/src/app.js` (todos array initialization)
- Any service initialization code

**References**: 
- Session: Initial Project Setup - 2026-05-04

---

## Adding New Patterns

When you discover a pattern worth documenting:

1. **Verify it's reusable** - Is this a one-off solution or something that will recur?
2. **Capture the context** - When would someone need this pattern?
3. **Document the "why"** - Why is this approach better than alternatives?
4. **Provide examples** - Show both good and bad implementations
5. **Link to usage** - Where is this pattern already applied?

## Pattern Categories

As patterns accumulate, consider organizing them into categories:

- **Data Management**: Initialization, CRUD operations, state management
- **Error Handling**: Validation, 404 responses, error messages
- **Testing**: Test structure, mocking, assertions
- **API Design**: Endpoint conventions, response formats, status codes
- **Frontend Patterns**: Component structure, state management, event handling
- **UI Testing**: Selector strategies, wait patterns, test isolation

---

## Notes

- Patterns should be prescriptive - tell developers what to do
- Include anti-patterns to show what to avoid
- Update patterns if better approaches are discovered
- Reference patterns in code reviews and PR comments
- AI assistants can reference these patterns to provide consistent suggestions
