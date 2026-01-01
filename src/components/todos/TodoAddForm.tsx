import { useState, useEffect } from 'react';

interface TodoAddFormProps {
  currentProfileId: string;
  currentUserId: string;
  users: { id: string; name: string }[];
  onAdd: (
    task: string,
    assignedTo: string | null,
    description: string,
    dueDate: string | null
  ) => void;
  onCancel: () => void;
}

// A small controlled form used to add a new todo item.
export default function TodoAddForm({
  currentProfileId,
  currentUserId,
  users,
  onAdd,
  onCancel,
}: TodoAddFormProps) {
  // Controlled state for the task title (required)
  const [newTask, setNewTask] = useState('');
  // The id of the user/profile this todo is assigned to (nullable)
  const [assignedTo, setAssignedTo] = useState<string | null>(currentProfileId || currentUserId);
  // Optional description/details for the todo
  const [newDescription, setNewDescription] = useState('');
  // Optional due date in YYYY-MM-DD format (empty string if unset)
  const [newDueDate, setNewDueDate] = useState('');

  // Keep the assignedTo field in sync when the current profile/user changes externally.
  useEffect(() => {
    setAssignedTo(currentProfileId || currentUserId);
  }, [currentProfileId, currentUserId]);

  // Handle creation: validate required fields, call onAdd, then reset the form.
  const handleAdd = () => {
    if (!newTask) return; // don't add empty tasks
    onAdd(newTask, assignedTo, newDescription, newDueDate || null);
    // Reset form to initial state
    setNewTask('');
    setNewDescription('');
    setAssignedTo(currentProfileId || currentUserId);
    setNewDueDate('');
  };

  return (
    <div className="flex flex-col gap-2 mb-6 border rounded p-3 bg-gray-50">
      {/* Task input: required text field for the todo title */}
      <input
        type="text"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="Neue Aufgabe / Titel"
        className="border p-2 rounded"
      />

      {/* description textarea: optional additional details for the todo */}
      <textarea
        value={newDescription}
        onChange={(e) => setNewDescription(e.target.value)}
        placeholder="Kommentar"
        className="border p-2 rounded"
      />

      {/* Due date: optional date picker */}
      <div>
        <label className="text-sm font-medium mb-1 block">Fällig am: (optional)</label>
        <input
          type="date"
          value={newDueDate}
          onChange={(e) => setNewDueDate(e.target.value)}
          className="border p-2 rounded w-full appearance-none sm:appearance-auto"
        />
      </div>

      {/* Assignment selector: choose a user or leave unassigned */}
      <div>
        <label className="text-sm font-medium mb-1 block">Zugewiesen an: (optional)</label>
        <select
          value={assignedTo || ''}
          onChange={(e) => setAssignedTo(e.target.value === '' ? null : e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="">Ohne Zuweisung</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      {/* Action buttons: add (creates todo) and cancel (closes form) */}
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
