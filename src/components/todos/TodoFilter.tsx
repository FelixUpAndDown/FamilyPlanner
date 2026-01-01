import type { TodoFilterType } from '../../lib/types';

// Props for the TodoFilter component:
// - filter: the currently active filter ('open' | 'all' | 'done')
// - setFilter: function to change the active filter
interface TodoFilterProps {
  filter: TodoFilterType;
  setFilter: (f: TodoFilterType) => void;
}

export default function TodoFilter({ filter, setFilter }: TodoFilterProps) {
  // Available filter options shown as buttons (open, all, done)
  const filterOptions: TodoFilterType[] = ['open', 'all', 'done'];

  return (
    <div className="flex gap-2 mb-4">
      {/* Render a button for each filter option; the active one is highlighted */}
      {filterOptions.map((f) => (
        <button
          key={f}
          onClick={() => setFilter(f)}
          className={`px-3 py-1 rounded ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          {/* Labels */}
          {f === 'open' ? 'Offene Todos' : f === 'all' ? 'Alle' : 'Erledigt'}
        </button>
      ))}
    </div>
  );
}
