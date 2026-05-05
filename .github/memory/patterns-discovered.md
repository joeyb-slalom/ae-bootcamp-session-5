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

### Pattern: Dual Validation for Required Fields

**Context**: Validating required string inputs in API endpoints

**Problem**: Users can submit either missing fields or empty strings - both are invalid but require different checks

**Solution**: Implement dual validation checking both presence AND non-empty value

**Why**:
- Catches both `undefined`/`null` (missing) and `""` (empty string) cases
- Prevents subtle bugs where empty strings pass single validation
- Explicit validation makes requirements clear
- Test cases naturally cover both edge cases

**Example**:
```javascript
// Good - Dual validation
app.post('/api/todos', (req, res) => {
  const { title } = req.body;
  
  // Check both missing AND empty
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  // Process valid title...
});
```

**Anti-Pattern**:
```javascript
// Bad - Only checks presence
if (!title) {
  return res.status(400).json({ error: 'Title is required' });
}
// Empty string "" passes this check!

// Bad - Only checks empty
if (title === '') {
  return res.status(400).json({ error: 'Title is required' });
}
// Undefined/null passes this check!
```

**Related Files**:
- `packages/backend/src/app.js` - POST /api/todos endpoint validation
- `packages/backend/__tests__/app.test.js` - Tests for both missing and empty title

**References**:
- Session: Fix Backend Tests with TDD (Step 5-1) - 2026-05-05
- Commit: 0fb7ead

---

### Pattern: RESTful Status Codes

**Context**: Returning appropriate HTTP status codes from REST API endpoints

**Problem**: Which status code for which operation? Consistency matters for API consumers.

**Solution**: Follow RESTful conventions for status codes

**Why**:
- Standard conventions make APIs predictable
- Proper status codes enable correct client-side error handling
- Makes API self-documenting
- Test assertions validate correct behavior

**Example**:
```javascript
// Good - RESTful status codes
app.get('/api/todos', (req, res) => {
  res.status(200).json(todos); // OK - returning data
});

app.post('/api/todos', (req, res) => {
  const todo = createTodo(req.body);
  res.status(201).json(todo); // Created - new resource
});

app.put('/api/todos/:id', (req, res) => {
  const todo = updateTodo(id);
  if (!todo) {
    return res.status(404).json({ error: 'Not found' }); // Not Found
  }
  res.status(200).json(todo); // OK - returning updated data
});

app.delete('/api/todos/:id', (req, res) => {
  deleteTodo(id);
  res.status(204).send(); // No Content - deleted, no body
});

app.post('/api/todos', (req, res) => {
  if (!req.body.title) {
    return res.status(400).json({ error: 'Bad request' }); // Bad Request
  }
  // ...
});
```

**Common Status Codes**:
- **200 OK**: Successful GET, PUT, PATCH with response body
- **201 Created**: Successful POST creating new resource
- **204 No Content**: Successful DELETE, no response body
- **400 Bad Request**: Invalid input/validation error
- **404 Not Found**: Resource doesn't exist

**Related Files**:
- `packages/backend/src/app.js` - All API endpoints
- `packages/backend/__tests__/app.test.js` - Status code assertions

**References**:
- Session: Fix Backend Tests with TDD (Step 5-1) - 2026-05-05

---

### Pattern: React Query State Management

**Context**: Managing server state (fetching, creating, updating, deleting) in React applications

**Problem**: Need to handle loading states, errors, automatic refetching, and cache invalidation for API calls

**Solution**: Use React Query with useQuery for fetching and useMutation for modifications

**Why**:
- Automatic loading/error states eliminate manual state management
- Built-in caching reduces unnecessary API calls
- Query invalidation ensures UI stays in sync with server
- Separates data fetching concerns from component rendering logic
- Reduces boilerplate compared to useEffect + useState

**Example**:
```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Custom hook for fetching data
const useTodos = () => {
  return useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const response = await fetch('/api/todos');
      if (!response.ok) {
        throw new Error('Failed to fetch todos');
      }
      return response.json();
    },
  });
};

// In component
function TodoApp() {
  const queryClient = useQueryClient();
  const { data: todos = [], isLoading, isError, error } = useTodos();

  // Mutation for creating
  const addTodoMutation = useMutation({
    mutationFn: async (title) => {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      return response.json();
    },
    onSuccess: () => {
      // Automatically refetch todos after successful creation
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  // Mutation for deleting
  const deleteTodoMutation = useMutation({
    mutationFn: async (id) => {
      await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  // Automatic states available
  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">{error.message}</Alert>;

  return (
    <div>
      {todos.map(todo => (
        <TodoItem 
          key={todo.id} 
          todo={todo} 
          onDelete={() => deleteTodoMutation.mutate(todo.id)}
        />
      ))}
    </div>
  );
}
```

**Key Concepts**:
- **queryKey**: Unique identifier for caching and invalidation
- **queryFn**: Async function that fetches data
- **mutationFn**: Async function that modifies data
- **onSuccess**: Callback after successful mutation (invalidate queries to refetch)
- **Destructured states**: data, isLoading, isError, error from useQuery

**Related Files**:
- `packages/frontend/src/App.js` - useTodos hook and all mutations

**References**:
- Session: Incremental Frontend Implementation (Step 5-3) - 2026-05-05
- React Query docs: https://tanstack.com/query/latest

---

### Pattern: MUI Conditional Rendering

**Context**: Showing/hiding UI elements based on application state (loading, error, empty)

**Problem**: Need to display different UI for loading, error, and empty states without complex conditional logic

**Solution**: Use short-circuit evaluation with JSX fragments for clean conditional rendering

**Why**:
- Keeps JSX readable and declarative
- No ternary nesting hell
- Each condition is independent and clear
- Easy to add/remove states

**Example**:
```javascript
function TodoApp() {
  const { data: todos = [], isLoading, isError, error } = useTodos();

  return (
    <Container>
      {/* Loading state */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error state */}
      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading todos: {error?.message || 'Unknown error'}
        </Alert>
      )}

      {/* Empty state */}
      {!isLoading && !isError && todos.length === 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="body1" color="text.secondary" align="center">
              No todos yet! Add one above to get started.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Data state */}
      {!isLoading && !isError && todos.length > 0 && (
        <Card>
          <List>
            {todos.map(todo => <TodoItem key={todo.id} todo={todo} />)}
          </List>
        </Card>
      )}
    </Container>
  );
}
```

**Anti-Pattern**:
```javascript
// Bad - Ternary nesting
{
  isLoading ? (
    <CircularProgress />
  ) : isError ? (
    <Alert>{error.message}</Alert>
  ) : todos.length === 0 ? (
    <Typography>No todos</Typography>
  ) : (
    <List>{todos.map(...)}</List>
  )
}
// Hard to read, hard to modify
```

**Related Files**:
- `packages/frontend/src/App.js` - All conditional UI states

**References**:
- Session: Incremental Frontend Implementation (Step 5-3) - 2026-05-05

---

### Pattern: Edit Mode Toggle with Local State

**Context**: Implementing inline editing for list items without form library

**Problem**: Need to switch between view and edit modes, preserve original value for cancel

**Solution**: Use local state for editingId and editingTitle to track edit mode per item

**Why**:
- Simple use case doesn't justify form library overhead
- Local state keeps edit mode scoped and independent
- Cancel functionality requires preserving original value
- One item can be edited at a time (clear UX)

**Example**:
```javascript
function TodoApp() {
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  const updateTodoMutation = useMutation({
    mutationFn: async ({ id, title }) => {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setEditingId(null); // Exit edit mode
      setEditingTitle('');
    },
  });

  const handleEditStart = (todo) => {
    setEditingId(todo.id);
    setEditingTitle(todo.title); // Preserve original for editing
  };

  const handleEditSave = (id) => {
    if (editingTitle.trim()) {
      updateTodoMutation.mutate({ id, title: editingTitle });
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingTitle(''); // Reset without saving
  };

  return (
    <List>
      {todos.map(todo => (
        <ListItem key={todo.id}>
          {editingId === todo.id ? (
            // Edit mode
            <>
              <TextField
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
              />
              <IconButton onClick={() => handleEditSave(todo.id)} aria-label="save">
                <SaveIcon />
              </IconButton>
              <IconButton onClick={handleEditCancel} aria-label="cancel">
                <CancelIcon />
              </IconButton>
            </>
          ) : (
            // View mode
            <>
              <Typography>{todo.title}</Typography>
              <IconButton onClick={() => handleEditStart(todo)} aria-label="edit">
                <EditIcon />
              </IconButton>
            </>
          )}
        </ListItem>
      ))}
    </List>
  );
}
```

**Key Points**:
- **editingId**: Tracks which item is being edited (null = none)
- **editingTitle**: Stores the edited value (separate from original)
- **handleEditStart**: Sets edit mode with original value
- **handleEditSave**: Submits if valid, clears state on success
- **handleEditCancel**: Exits edit mode without saving

**Related Files**:
- `packages/frontend/src/App.js` - Edit mode implementation

**References**:
- Session: Incremental Frontend Implementation (Step 5-3) - 2026-05-05

---

### Pattern: Playwright Selector Stability

**Context**: Writing UI tests that don't break when multiple elements exist

**Problem**: Playwright strict mode fails when selectors match multiple elements, especially with test state accumulation

**Solution**: Use accessible selectors (aria-label, role) and .first() for duplicate handling

**Why**:
- Accessible selectors align with how users interact (screen readers, keyboards)
- .first() safely handles duplicates from test isolation issues
- Simpler selectors are more maintainable than complex DOM navigation
- Matches testing-library philosophy (test like users interact)

**Example**:
```javascript
// Good - Stable, accessible selectors
class TodoPage {
  async deleteTodo(title) {
    const todoItem = this.page.getByText(title).first(); // Handle duplicates
    const listItem = todoItem.locator('..');  // One parent up
    const deleteButton = listItem.getByLabel('delete'); // Accessible selector
    await deleteButton.click();
  }

  async getTodos() {
    return this.page.getByText(title).first(); // Always get first match
  }
}

// Test assertions
test('user can create todo', async ({ page }) => {
  await todoPage.addTodo('Buy groceries');
  
  // Use .first() to avoid strict mode violations
  await expect(page.getByText('Buy groceries').first()).toBeVisible();
});
```

**Anti-Pattern**:
```javascript
// Bad - Complex DOM navigation, brittle
const deleteButton = page
  .getByText(title)
  .locator('../..')  // Navigate up two levels
  .getByRole('button')  // Matches ALL buttons in subtree
  .filter({ has: page.locator('[data-testid="DeleteIcon"]') });
// Strict mode violation when multiple todos exist!

// Bad - Selector without .first()
await expect(page.getByText('Todo')).toBeVisible();
// Fails if 2+ todos with same title exist
```

**Best Practices**:
- **Selector priority**: getByRole > getByLabel > getByTestId > locator()
- **Use .first()** when duplicates expected from test accumulation
- **Keep navigation minimal**: One .locator('..') max
- **Prefer aria-labels** over traversing DOM structure

**Related Files**:
- `packages/frontend/tests/ui/pages/TodoPage.js` - Page object with stable selectors
- `packages/frontend/tests/ui/e2e.spec.js` - Test assertions using .first()

**References**:
- Session: Incremental Frontend Implementation (Step 5-3) - 2026-05-05
- Playwright best practices: https://playwright.dev/docs/best-practices

**Related Files**:
- `packages/backend/src/app.js` - All API endpoints
- `packages/backend/__tests__/app.test.js` - Status code assertions

**References**:
- Session: Fix Backend Tests with TDD (Step 5-1) - 2026-05-05
- Commit: 0fb7ead

---

### Pattern: Separation of Concerns - Update vs. Toggle

**Context**: API endpoints that modify resource state

**Problem**: Should one endpoint handle all updates, or separate data changes from state changes?

**Solution**: Separate data updates (PUT) from state toggles (PATCH)

**Why**:
- Clear separation prevents accidental state changes
- PUT for data: updates title, description, etc.
- PATCH for state: toggles completed, archived, etc.
- Each endpoint has single responsibility
- Tests can verify isolation (PUT doesn't change completion)

**Example**:
```javascript
// Good - Separate endpoints for different concerns
app.put('/api/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id === parseInt(id));
  if (!todo) return res.status(404).json({ error: 'Not found' });
  
  // ONLY update data fields, preserve state
  todo.title = req.body.title;
  // DO NOT touch todo.completed here
  
  res.json(todo);
});

app.patch('/api/todos/:id/toggle', (req, res) => {
  const todo = todos.find(t => t.id === parseInt(id));
  if (!todo) return res.status(404).json({ error: 'Not found' });
  
  // ONLY toggle completion state
  todo.completed = !todo.completed;
  // DO NOT allow data changes here
  
  res.json(todo);
});
```

**Anti-Pattern**:
```javascript
// Bad - One endpoint does everything, state can change accidentally
app.put('/api/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id === parseInt(id));
  
  // Allows both data AND state changes
  if (req.body.title) todo.title = req.body.title;
  if (req.body.completed !== undefined) todo.completed = req.body.completed;
  
  // Risk: Updating title could accidentally change completion state
  res.json(todo);
});
```

**Related Files**:
- `packages/backend/src/app.js` - PUT /api/todos/:id and PATCH /api/todos/:id/toggle
- `packages/backend/__tests__/app.test.js` - Test verifying PUT doesn't change completed status

**References**:
- Session: Fix Backend Tests with TDD (Step 5-1) - 2026-05-05
- Commit: 0fb7ead

---

### Pattern: Toggle Implementation

**Context**: Implementing boolean state toggles

**Problem**: How to toggle a boolean value reliably?

**Solution**: Use logical NOT operator (`!`) on current value, never hardcode the target state

**Why**:
- `!value` always toggles correctly regardless of current state
- Hardcoding `true` or `false` doesn't toggle, just sets
- Self-documenting - clearly shows intent to flip state
- Prevents logic bugs

**Example**:
```javascript
// Good - Toggle using logical NOT
app.patch('/api/todos/:id/toggle', (req, res) => {
  const todo = todos.find(t => t.id === parseInt(id));
  if (!todo) return res.status(404).json({ error: 'Not found' });
  
  todo.completed = !todo.completed; // Toggles: false→true, true→false
  
  res.json(todo);
});
```

**Anti-Pattern**:
```javascript
// Bad - Hardcoding always sets to true (doesn't toggle!)
app.patch('/api/todos/:id/toggle', (req, res) => {
  const todo = todos.find(t => t.id === parseInt(id));
  if (!todo) return res.status(404).json({ error: 'Not found' });
  
  todo.completed = true; // BUG: Always sets to true, never toggles back
  
  res.json(todo);
});
```

**Related Files**:
- `packages/backend/src/app.js` - PATCH /api/todos/:id/toggle endpoint
- `packages/backend/__tests__/app.test.js` - Tests for both toggle directions

**References**:
- Session: Fix Backend Tests with TDD (Step 5-1) - 2026-05-05
- Bug found and fixed in commit: 0fb7ead

---

### Pattern: Simple Counter IDs for In-Memory Storage

**Context**: Generating unique IDs for in-memory data stores (development/testing)

**Problem**: Need unique IDs but don't have database auto-increment or UUIDs

**Solution**: Use simple counter variable with post-increment

**Why**:
- Sufficient for in-memory bootcamp/learning contexts
- Predictable IDs make testing easier
- Simple to implement and understand
- Auto-incrementing ensures uniqueness within session

**Trade-offs**:
- NOT suitable for production (no persistence, no distribution)
- IDs reset on server restart
- Cannot handle concurrent requests safely
- For production, use database auto-increment or UUIDs

**Example**:
```javascript
// Good - Simple counter for in-memory storage
let todos = [];
let nextId = 1; // Counter starts at 1

app.post('/api/todos', (req, res) => {
  const todo = {
    id: nextId++, // Assigns current value, then increments
    title: req.body.title,
    completed: false,
    createdAt: new Date().toISOString()
  };
  todos.push(todo);
  res.status(201).json(todo);
});
```

**Production Alternative**:
```javascript
// For production - Use UUIDs
const { v4: uuidv4 } = require('uuid');

app.post('/api/todos', (req, res) => {
  const todo = {
    id: uuidv4(), // e.g., "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
    title: req.body.title,
    completed: false,
    createdAt: new Date().toISOString()
  };
  todos.push(todo);
  res.status(201).json(todo);
});
```

**Related Files**:
- `packages/backend/src/app.js` - nextId counter and POST endpoint

**References**:
- Session: Fix Backend Tests with TDD (Step 5-1) - 2026-05-05
- Commit: 0fb7ead

---

### Pattern: ESLint Disable Comments for Legitimate Exceptions

**Context**: Dealing with ESLint warnings for code that is intentionally correct

**Problem**: Legitimate code triggers ESLint warnings (e.g., console.log for server startup)

**Solution**: Use `// eslint-disable-next-line <rule-name>` comments sparingly for genuine exceptions

**Why**:
- Preserves valuable code (like console logs for debugging)
- Maintains clean lint status
- Documents intent - shows the warning is intentional, not overlooked
- Keeps ESLint strict for real issues

**When to Use**:
- Server startup logging (user needs to see port number)
- Development-only debug code
- Third-party library patterns that trigger false positives

**When NOT to Use**:
- Actual code smells (unused variables, unused imports)
- Code that should be refactored
- Lazy quick fixes

**Example**:
```javascript
// Good - Legitimate exception with explanation
app.listen(PORT, () => {
  // Server startup - using console for development server
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
});
```

**Anti-Pattern**:
```javascript
// Bad - Disabling lint for actual code smell
// eslint-disable-next-line no-unused-vars
const unusedDebugFlag = true; // Should just remove this!

// Bad - Blanket disable without explanation
/* eslint-disable */ // Disables ALL rules - too permissive!
```

**Best Practice**:
- Add explanatory comment above the disable comment
- Use `eslint-disable-next-line` (single line) not `eslint-disable` (file-wide)
- Specify the exact rule name, don't disable all rules
- Document WHY the exception is legitimate

**Related Files**:
- `packages/backend/src/index.js` - Server startup console.log

**References**:
- Session: Resolve ESLint Errors (Step 5-2) - 2026-05-05
- Commit: c9eb471

---

### Pattern: Systematic Lint Resolution Workflow

**Context**: Addressing multiple ESLint errors efficiently

**Problem**: How to fix many lint errors without breaking code or missing issues?

**Solution**: Categorize → Batch Fix → Validate workflow

**Why**:
- Systematic approach prevents mistakes
- Batching similar fixes is more efficient
- Validation after each batch catches regressions early
- Clear progress tracking

**Workflow Steps**:
1. **Run lint and capture all errors**
2. **Categorize by type** (unused vars, console statements, etc.)
3. **Fix one category at a time** (safest to most complex)
4. **Run tests after each batch**
5. **Re-run lint to verify**
6. **Repeat until zero errors**

**Example**:
```bash
# 1. Identify errors
npm run lint
# Output: 5 no-unused-vars, 3 no-console, 2 missing-dependencies

# 2. Fix easiest category first (unused vars)
# (Remove unused imports/variables)

# 3. Validate
npm test  # Ensure nothing broke
npm run lint  # Verify category fixed

# 4. Fix next category (console statements)
# (Add disable comments or remove)

# 5. Validate again
npm test
npm run lint

# 6. Continue until clean
```

**Order of Operations** (safest first):
1. Unused imports/variables (safe to remove)
2. Console statements (add exceptions or remove)
3. Missing dependencies (add to useEffect arrays)
4. Style issues (formatting, naming)
5. Complex refactors (logic changes)

**Related Files**:
- Any project with ESLint configured

**References**:
- Session: Resolve ESLint Errors (Step 5-2) - 2026-05-05
- Commits: c9eb471

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
