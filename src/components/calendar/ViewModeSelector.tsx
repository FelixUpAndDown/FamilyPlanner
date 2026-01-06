type ViewMode = 'upcoming' | 'calendar' | 'week';

interface ViewModeSelectorProps {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export default function ViewModeSelector({ viewMode, onChange }: ViewModeSelectorProps) {
  const modes: { key: ViewMode; label: string }[] = [
    { key: 'upcoming', label: '7 Tage' },
    { key: 'week', label: 'Woche' },
    { key: 'calendar', label: 'Monat' },
  ];

  return (
    <div className="flex gap-2 mb-4">
      {modes.map((mode) => (
        <button
          key={mode.key}
          onClick={() => onChange(mode.key)}
          className={`flex-1 py-2 px-3 rounded font-medium text-sm ${
            viewMode === mode.key
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
