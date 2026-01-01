import { useEffect, useState } from 'react';
import type { Todo, TodoFilterType } from '../../lib/types';
import { getTodosForFamily, addTodo, toggleTodo, deleteTodo } from '../../lib/todos';
import { TodoItem, TodoAddForm, TodoFilter } from './index';

// Props for the TodoList component:
// - familyId: id of the family to load todos for
// - currentUserId/currentProfileId: ids used when creating or marking todos done
// - users: list of users available for assignment
interface TodoListProps {
  familyId: string;
  currentUserId: string;
  currentProfileId: string;
  users: { id: string; name: string }[];
}

// TodoList: fetches and displays todos for a family with simple filtering and CRUD actions.
export default function TodoList({
  familyId,
  currentUserId,
  currentProfileId,
  users,
}: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<TodoFilterType>('open');
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch todos for the given family and filter; sets an empty array if no data returned.
  const fetchTodos = async () => {
    const data = await getTodosForFamily(familyId, filter);
    setTodos(data ?? []);
  };

  // Load todos when the familyId or the filter changes (initial load + family switch + filter changes)
  useEffect(() => {
    fetchTodos();
  }, [familyId, filter]);

  // Handler to add a new todo. Calls API then refreshes the list and hides the add form.
  const handleAdd = async (
    task: string,
    assignedTo: string | null,
    comment: string,
    dueDate: string | null
  ) => {
    try {
      await addTodo(
        familyId,
        task,
        assignedTo,
        currentProfileId || currentUserId,
        comment,
        dueDate
      );
      await fetchTodos();
      setShowAddForm(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || JSON.stringify(err));
    }
  };

  // Toggle completion state for a todo, passing the id of the user marking it done when appropriate.
  const handleToggle = async (todo: Todo) => {
    try {
      const doneById = !todo.isDone ? currentProfileId || currentUserId : null;
      await toggleTodo(todo.id, !todo.isDone, doneById);
      await fetchTodos();
    } catch (err: any) {
      console.error(err);
      alert(err.message || JSON.stringify(err));
    }
  };

  // Delete a todo and refresh the list
  const handleDelete = async (id: string) => {
    try {
      await deleteTodo(id);
      await fetchTodos();
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  // Apply the selected filter to the loaded todos (open, done, or all)
  const filteredTodos = todos.filter((t) => {
    if (filter === 'open') return !t.isDone;
    if (filter === 'done') return t.isDone;
    return true;
  });

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Todo Liste</h2>
        {/* Show a button to reveal the add form when it is hidden */}
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-lg font-bold"
          >
            +
          </button>
        )}
      </div>

      {/* Add form: shown when the user clicks + */}
      {showAddForm && (
        <TodoAddForm
          currentProfileId={currentProfileId}
          currentUserId={currentUserId}
          users={users}
          onAdd={handleAdd}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Filter control (open/all/done) */}
      <TodoFilter filter={filter} setFilter={setFilter} />

      {/* List of todos matching the selected filter */}
      <ul className="flex flex-col gap-3">
        {filteredTodos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} onToggle={handleToggle} onDelete={handleDelete} />
        ))}
      </ul>
    </div>
  );
}
