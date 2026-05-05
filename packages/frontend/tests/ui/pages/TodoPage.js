/**
 * Page Object Model for TODO Application
 * Centralizes selectors and interactions for maintainability
 */
class TodoPage {
  constructor(page) {
    this.page = page;
    
    // Selectors - using accessible, stable selectors
    this.newTodoInput = page.getByPlaceholder(/what needs to be done/i);
    this.addButton = page.getByRole('button', { name: /add/i });
    this.todoList = page.getByRole('list');
  }

  /**
   * Navigate to the TODO application
   */
  async goto() {
    await this.page.goto('http://localhost:3000');
    // State-based wait: ensure page is interactive
    await this.addButton.waitFor({ state: 'visible' });
  }

  /**
   * Add a new todo item
   * @param {string} title - The todo title
   */
  async addTodo(title) {
    await this.newTodoInput.fill(title);
    await this.addButton.click();
    // State-based wait: todo appears in list (use .first() to avoid strict mode with duplicate titles)
    await this.page.getByText(title).first().waitFor({ state: 'visible' });
  }

  /**
   * Get a todo item by its title
   * @param {string} title - The todo title
   * @returns {Locator} The todo item locator
   */
  getTodoByTitle(title) {
    return this.page.getByText(title).first();
  }

  /**
   * Toggle todo completion status
   * @param {string} title - The todo title
   */
  async toggleTodo(title) {
    // Find the todo item and its associated checkbox
    const todoItem = this.getTodoByTitle(title);
    const listItem = todoItem.locator('..');
    const checkbox = listItem.getByRole('checkbox');
    
    await checkbox.click();
    // State-based wait: checkbox state changes
    await this.page.waitForTimeout(100); // Brief wait for state update
  }

  /**
   * Delete a todo item
   * @param {string} title - The todo title
   */
  async deleteTodo(title) {
    const todoItem = this.getTodoByTitle(title);
    const listItem = todoItem.locator('..');
    
    // Use aria-label directly for specificity
    const deleteButton = listItem.getByLabel('delete');
    await deleteButton.click();
    
    // State-based wait: wait for UI to update (brief wait for mutation to complete)
    await this.page.waitForTimeout(500);
  }

  /**
   * Click edit button for a todo
   * @param {string} title - The todo title
   */
  async clickEditTodo(title) {
    const todoItem = this.getTodoByTitle(title);
    const listItem = todoItem.locator('..');
    
    // Use aria-label directly for specificity
    const editButton = listItem.getByLabel('edit');
    await editButton.click();
  }

  /**
   * Check if a todo is marked as completed (has strikethrough)
   * @param {string} title - The todo title
   * @returns {Promise<boolean>} True if todo has strikethrough style
   */
  async isTodoCompleted(title) {
    const todoItem = this.getTodoByTitle(title);
    const textDecoration = await todoItem.evaluate(el => 
      window.getComputedStyle(el).textDecoration
    );
    return textDecoration.includes('line-through');
  }

  /**
   * Get the current count of todos in the list
   * @returns {Promise<number>} Number of todo items
   */
  async getTodoCount() {
    const items = await this.todoList.getByRole('listitem').all();
    return items.length;
  }

  /**
   * Attempt to add todo without entering title (for error testing)
   */
  async attemptAddEmptyTodo() {
    await this.newTodoInput.clear();
    await this.addButton.click();
  }

  /**
   * Check if input field is empty
   * @returns {Promise<boolean>} True if input is empty
   */
  async isInputEmpty() {
    const value = await this.newTodoInput.inputValue();
    return value === '';
  }

  /**
   * Edit a todo title (full flow: click edit, change title, save)
   * @param {string} oldTitle - The current todo title
   * @param {string} newTitle - The new todo title
   */
  async editTodo(oldTitle, newTitle) {
    // Click edit button
    await this.clickEditTodo(oldTitle);
    
    // Wait for edit mode to activate
    await this.page.waitForTimeout(300);
    
    // Find ALL textboxes in the list, get the visible one (edit input)
    const textboxes = await this.todoList.getByRole('textbox').all();
    let editInput = null;
    for (const textbox of textboxes) {
      if (await textbox.isVisible()) {
        editInput = textbox;
        break;
      }
    }
    
    if (!editInput) {
      throw new Error('Could not find edit input textbox');
    }
    
    // Clear and type new title
    await editInput.clear();
    await editInput.fill(newTitle);
    
    // Find and click save button (be explicit)
    const saveButton = this.page.getByLabel('save');
    await saveButton.waitFor({ state: 'visible' });
    await saveButton.click({ force: true });
    
    // Wait for mutation to complete
    await this.page.waitForTimeout(1000);
  }

  /**
   * Cancel editing a todo
   * @param {string} title - The todo title being edited
   */
  async cancelEditTodo(title) {
    // Click edit to enter edit mode first
    await this.clickEditTodo(title);
    
    // Wait for edit input to appear
    const editInput = this.page.getByDisplayValue(title);
    await editInput.waitFor({ state: 'visible' });
    
    // Click cancel button
    const cancelButton = this.page.getByRole('button', { name: /cancel/i });
    await cancelButton.click();
    
    // State-based wait: original title should still be visible (not in edit mode)
    await this.page.waitForTimeout(100);
  }

  /**
   * Get the stats display values
   * @returns {Promise<{incomplete: number, completed: number}>} Stats object
   */
  async getStats() {
    const incompleteChip = this.page.getByText(/items left/i);
    const completedChip = this.page.getByText(/completed/i);
    
    const incompleteText = await incompleteChip.textContent();
    const completedText = await completedChip.textContent();
    
    const incomplete = parseInt(incompleteText.match(/(\d+)/)[1]);
    const completed = parseInt(completedText.match(/(\d+)/)[1]);
    
    return { incomplete, completed };
  }

  /**
   * Check if empty state message is visible
   * @returns {Promise<boolean>} True if empty state is showing
   */
  async hasEmptyState() {
    const emptyMessage = this.page.getByText(/no todos yet/i);
    return await emptyMessage.isVisible().catch(() => false);
  }
}

module.exports = { TodoPage };
