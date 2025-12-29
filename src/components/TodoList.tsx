import { useEffect, useState } from 'react';
import { getTodosForFamily, addTodo, toggleTodo } from '../lib/todos';

interface Todo {
  id: string;
  task: string;
  isDone: boolean;
  comment: string;
  assigned_to_id: string;
  created_by_id: string;
}

interface TodoListProps {
  familyId: string;
  currentUserId: string;
  currentProfileId: string;
}

export default function TodoList({ familyId, currentUserId, currentProfileId }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState('');
  const [assignedTo, setAssignedTo] = useState(currentProfileId || currentUserId);

  // keep assignedTo in sync if profileId becomes available after mount
  useEffect(() => {
    setAssignedTo(currentProfileId || currentUserId);
  }, [currentProfileId, currentUserId]);

  const fetchTodos = async () => {
    const data = await getTodosForFamily(familyId);
    setTodos(data || []);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleAdd = async () => {
    if (!newTask) return;
    // Use profile id for created_by_id when available
    const createdById = currentProfileId || currentUserId;
    try {
      await addTodo(familyId, newTask, assignedTo, createdById);
      setNewTask('');
      await fetchTodos();
    } catch (err: any) {
      console.error('addTodo failed', err);
      alert(err.message || JSON.stringify(err));
    }
  };

  const handleToggle = async (id: string, done: boolean) => {
    try {
      await toggleTodo(id, !done);
      await fetchTodos();
    } catch (err: any) {
      console.error('toggleTodo failed', err);
      alert(err.message || JSON.stringify(err));
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded">
      <h2 className="text-2xl font-bold mb-4">Family Todo</h2>

      <div className="flex mb-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Neue Aufgabe"
          className="border p-2 flex-1 rounded mr-2"
        />
        <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded">
          Add
        </button>
      </div>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id} className="flex flex-col mb-3 p-2 border rounded">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={todo.isDone}
                onChange={() => handleToggle(todo.id, todo.isDone)}
                className="mr-2"
              />
              <span className={todo.isDone ? 'line-through' : ''}>{todo.task}</span>
            </div>
            {todo.comment && <p className="text-gray-500 text-sm">{todo.comment}</p>}
            <div className="text-xs text-gray-400">
              assigned_to: {todo.assigned_to_id} | created_by: {todo.created_by_id}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
