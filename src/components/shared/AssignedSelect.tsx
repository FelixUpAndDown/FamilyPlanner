import type { ReactNode } from 'react';

interface AssignedSelectProps {
  label?: ReactNode;
  value: string | null;
  users: { id: string; name: string }[];
  onChange: (value: string | null) => void;
}

type ReadonlyAssignedSelectProps = Readonly<AssignedSelectProps>;

export default function AssignedSelect({
  label,
  value,
  users,
  onChange,
}: ReadonlyAssignedSelectProps) {
  // Render a select dropdown for assigning a user
  return (
    <div>
      {/* Optional label for the select */}
      {label && <label className="text-sm font-medium mb-1 block">{label}</label>}
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)}
        className="border p-2 rounded w-full"
      >
        {/* Option for no assignment */}
        <option value="">Ohne Zuweisung</option>
        {/* Options for each user */}
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>
    </div>
  );
}
