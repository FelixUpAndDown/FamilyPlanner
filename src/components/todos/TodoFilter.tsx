import type { TodoFilterType } from '../../lib/types';

interface TodoFilterProps {
  filter: TodoFilterType;
  setFilter: (f: TodoFilterType) => void;
}

export default function TodoFilter({ filter, setFilter }: TodoFilterProps) {
  const filterOptions: TodoFilterType[] = ['open', 'all', 'done'];

  return (
    <div className="flex gap-2 mb-4">
      {filterOptions.map((f) => (
        <button
          key={f}
          onClick={() => setFilter(f)}
          className={`px-3 py-1 rounded ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          {f === 'open' ? 'Offene Todos' : f === 'all' ? 'Alle' : 'Erledigt'}
        </button>
      ))}
    </div>
  );
}
