import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '../App';

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

// Mock fetch for tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
);

const renderApp = (initialTodos = []) => {
  global.fetch.mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(initialTodos),
    })
  );

  const testQueryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testQueryClient}>
      <App />
    </QueryClientProvider>
  );
};

test('renders TODO App heading', async () => {
  renderApp();
  const headingElement = await screen.findByText(/TODO App/i);
  expect(headingElement).toBeInTheDocument();
});

// Feature 1: Stats Calculation
describe('Stats display', () => {
  test('shows correct count of incomplete todos', async () => {
    const todos = [
      { id: 1, title: 'Todo 1', completed: false },
      { id: 2, title: 'Todo 2', completed: false },
      { id: 3, title: 'Todo 3', completed: true },
    ];
    renderApp(todos);

    await waitFor(() => {
      expect(screen.getByText('2 items left')).toBeInTheDocument();
    });
  });

  test('shows correct count of completed todos', async () => {
    const todos = [
      { id: 1, title: 'Todo 1', completed: false },
      { id: 2, title: 'Todo 2', completed: true },
      { id: 3, title: 'Todo 3', completed: true },
    ];
    renderApp(todos);

    await waitFor(() => {
      expect(screen.getByText('2 completed')).toBeInTheDocument();
    });
  });

  test('shows zero when no todos', async () => {
    renderApp([]);

    // Wait for one element, then assert both
    await screen.findByText('0 items left');
    expect(screen.getByText('0 completed')).toBeInTheDocument();
  });
});

// Feature 2: Empty State Message
describe('Empty state', () => {
  test('displays message when no todos exist', async () => {
    renderApp([]);

    await waitFor(() => {
      expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
    });
  });

  test('does not display message when todos exist', async () => {
    const todos = [{ id: 1, title: 'Todo 1', completed: false }];
    renderApp(todos);

    await waitFor(() => {
      expect(screen.queryByText(/no todos yet/i)).not.toBeInTheDocument();
    });
  });
});

// Feature 3: Delete Functionality
describe('Delete todo', () => {
  test('calls delete API when delete button clicked', async () => {
    const todos = [{ id: 1, title: 'Todo 1', completed: false }];
    renderApp(todos);

    // Wait for todo to render
    await screen.findByText('Todo 1');

    // Mock the delete call
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    // Click delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);

    // Verify delete API was called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/todos/1',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });
});

// Feature 4: Error Handling
describe('Error handling', () => {
  test('displays error message when fetch fails', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.reject(new Error('Network error'))
    );

    renderApp();

    await waitFor(() => {
      expect(screen.getByText(/error loading todos/i)).toBeInTheDocument();
    });
  });

  test('displays error message when response is not ok', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server error' }),
      })
    );

    renderApp();

    await waitFor(() => {
      expect(screen.getByText(/error loading todos/i)).toBeInTheDocument();
    });
  });
});

// Feature 5: Edit Functionality
describe('Edit todo', () => {
  test('enables edit mode when edit button clicked', async () => {
    const todos = [{ id: 1, title: 'Todo 1', completed: false }];
    renderApp(todos);

    await screen.findByText('Todo 1');

    const editButton = screen.getByRole('button', { name: /edit/i });
    await userEvent.click(editButton);

    // Should show input field with current title
    expect(screen.getByDisplayValue('Todo 1')).toBeInTheDocument();
  });

  test('saves edited todo when save button clicked', async () => {
    const todos = [{ id: 1, title: 'Todo 1', completed: false }];
    renderApp(todos);

    await screen.findByText('Todo 1');

    // Click edit
    const editButton = screen.getByRole('button', { name: /edit/i });
    await userEvent.click(editButton);

    // Change title
    const input = screen.getByDisplayValue('Todo 1');
    await userEvent.clear(input);
    await userEvent.type(input, 'Updated Todo');

    // Mock the update call
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 1, title: 'Updated Todo', completed: false }),
      })
    );

    // Click save
    const saveButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveButton);

    // Verify update API was called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/todos/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ title: 'Updated Todo' }),
        })
      );
    });
  });

  test('cancels edit when cancel button clicked', async () => {
    const todos = [{ id: 1, title: 'Todo 1', completed: false }];
    renderApp(todos);

    await screen.findByText('Todo 1');

    // Click edit
    const editButton = screen.getByRole('button', { name: /edit/i });
    await userEvent.click(editButton);

    // Click cancel
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);

    // Should return to normal view
    expect(screen.queryByDisplayValue('Todo 1')).not.toBeInTheDocument();
    expect(screen.getByText('Todo 1')).toBeInTheDocument();
  });
});

afterEach(() => {
  jest.clearAllMocks();
});
