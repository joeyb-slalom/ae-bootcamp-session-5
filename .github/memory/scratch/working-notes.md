# Working Notes - Active Session

**Purpose**: Scratch space for active development work. Use this for thinking, tracking progress, and documenting discoveries during your current session.

**Important**: This file is NOT committed to git. At the end of your session, summarize key findings into `session-notes.md` and extract patterns into `patterns-discovered.md`.

---

## Current Task

[What are you working on right now?]

**Goal**: [What should be accomplished?]

**Acceptance Criteria**:
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

---

## Approach

[How are you tackling this task?]

**Steps**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

---

## Key Findings

[Document discoveries, bugs found, insights gained]

- 

---

## Decisions Made

[Record decisions and their rationale]

**Decision**: [What was decided?]
**Rationale**: [Why this approach?]
**Alternatives Considered**: [What else was considered?]
**Trade-offs**: [What are the pros/cons?]

---

## Blockers

[What's preventing progress?]

- 

---

## Next Steps

[What needs to happen next?]

1. [ ] [Next action]
2. [ ] [Next action]
3. [ ] [Next action]

---

## Notes

[Freeform notes, ideas, questions]

- 

---

## Session Summary (Fill at end of session)

**What worked well**:
- 

**What to improve**:
- 

**Key items to move to session-notes.md**:
- 

**Patterns to document in patterns-discovered.md**:
- 

---

## Example Usage

```markdown
## Current Task

Implement DELETE /api/todos/:id endpoint

**Goal**: Allow users to delete a todo item by ID

**Acceptance Criteria**:
- [x] Returns 204 No Content on successful delete
- [x] Returns 404 if todo doesn't exist
- [x] Actually removes todo from array
- [ ] Add integration test

---

## Approach

Following TDD workflow:
1. Write test for successful delete (expect 204)
2. Write test for 404 case
3. Implement DELETE endpoint
4. Verify all tests pass

---

## Key Findings

- Using `findIndex()` + `splice()` to remove from array
- Empty response body for 204 status is correct
- Need to parse ID from params as integer
- Original test expected wrong status code (200 instead of 204)

---

## Decisions Made

**Decision**: Use 204 No Content instead of 200 OK
**Rationale**: 204 is semantically correct for DELETE with no response body
**Alternatives Considered**: 200 with success message
**Trade-offs**: 204 is more RESTful but requires clients to handle empty response

---

## Next Steps

1. [x] Implement DELETE endpoint
2. [x] Fix test to expect 204
3. [ ] Add integration test for delete
4. [ ] Test manually with UI
```
