import { useState, useEffect } from 'react';
import AssignedSelect from '../shared/AssignedSelect';

// Props for the add form component:
// - currentProfileId: id of the current profile
// - currentUserId: id of the current user
// - users: list of users for assignment
// - onAdd: function to add a new task entry
// - onCancel: function to cancel adding
type TodoPriority = '' | 'low' | 'medium' | 'high';
interface TodoAddFormProps {
  currentProfileId: string;
  currentUserId: string;
  users: { id: string; name: string }[];
  onAdd: (
    task: string,
    assignedTo: string | null,
    description: string,
    dueDate: string | null,
    priority?: TodoPriority
  ) => void;
  onCancel: () => void;
}

// Make all props readonly to prevent accidental mutation
type ReadonlyTodoAddFormProps = Readonly<TodoAddFormProps>;

export default function TodoAddForm({
  currentProfileId,
  currentUserId,
  users,
  onAdd,
  onCancel,
}: ReadonlyTodoAddFormProps) {
  // State for the new task title
  const [newTask, setNewTask] = useState('');
  // State for the assigned user
  const [assignedTo, setAssignedTo] = useState<string | null>(currentProfileId || currentUserId);
  // State for the new description
  const [newDescription, setNewDescription] = useState('');
  // State for the new due date
  const [newDueDate, setNewDueDate] = useState('');
  // State for priority
  const [priority, setPriority] = useState<TodoPriority>('');

  // Update assigned user when profile or user changes
  useEffect(() => {
    setAssignedTo(currentProfileId || currentUserId);
  }, [currentProfileId, currentUserId]);

  // Handler for adding a new task entry
  const handleAdd = () => {
    if (!newTask) return;
    onAdd(newTask, assignedTo, newDescription, newDueDate || null, priority);
    setNewTask('');
    setNewDescription('');
    setAssignedTo(currentProfileId || currentUserId);
    setNewDueDate('');
    setPriority('');
  };

  // Render the add form UI
  return (
    <div className="flex flex-col gap-2 mb-6 border rounded p-3 bg-gray-50">
      <input
        type="text"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="Neue Aufgabe / Titel"
        className="border p-2 rounded"
      />

      <textarea
        value={newDescription}
        onChange={(e) => setNewDescription(e.target.value)}
        placeholder="Beschreibung (optional)"
        className="border p-2 rounded"
      />

      <div>
        <label htmlFor="due-date" className="text-sm font-medium mb-1 block">
          Fällig am: (optional)
        </label>
        <div className="flex gap-2">
          <input
            id="due-date"
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="flex-1 border p-2 rounded"
          />
          {newDueDate && (
            <button
              type="button"
              onClick={() => setNewDueDate('')}
              className="px-3 py-2 border rounded bg-gray-100 hover:bg-gray-200 text-sm"
              title="Löschen"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Priority select */}
      <div>
        <label htmlFor="priority" className="text-sm font-medium mb-1 block">
          Priorität (optional)
        </label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as TodoPriority)}
          className="border p-2 rounded w-full"
        >
          <option value="">Keine</option>
          <option value="low">Niedrig</option>
          <option value="medium">Mittel</option>
          <option value="high">Hoch</option>
        </select>
      </div>

      <AssignedSelect
        label="Zugewiesen an: (optional)"
        value={assignedTo}
        users={users}
        onChange={setAssignedTo}
      />

      <div className="flex gap-2 mt-2">
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          Hinzufügen
        </button>
        <button onClick={onCancel} className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400">
          Abbrechen
        </button>
      </div>
    </div>
  );
}
