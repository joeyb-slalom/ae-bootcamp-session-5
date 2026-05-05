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
    // State-based wait: todo appears in list
    await this.page.getByText(title).waitFor({ state: 'visible' });
  }

  /**
   * Get a todo item by its title
   * @param {string} title - The todo title
   * @returns {Locator} The todo item locator
   */
  getTodoByTitle(title) {
    return this.page.getByText(title);
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
    const listItem = todoItem.locator('../..');
    
    // Find delete button within the list item
    const deleteButton = listItem.getByRole('button').filter({ has: this.page.locator('[data-testid="DeleteIcon"]') });
    await deleteButton.click();
    
    // State-based wait: todo disappears from list
    await this.page.getByText(title).waitFor({ state: 'detached', timeout: 5000 });
  }

  /**
   * Click edit button for a todo
   * @param {string} title - The todo title
   */
  async clickEditTodo(title) {
    const todoItem = this.getTodoByTitle(title);
    const listItem = todoItem.locator('../..');
    
    // Find edit button within the list item
    const editButton = listItem.getByRole('button').filter({ has: this.page.locator('[data-testid="EditIcon"]') });
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
}

module.exports = { TodoPage };
