// Type definition for possible view modes in the calendar
type ViewMode = 'upcoming' | 'calendar' | 'week';

// Props for the ViewModeSelector component
interface ViewModeSelectorProps {
  viewMode: ViewMode; // Currently selected view mode
  onChange: (mode: ViewMode) => void; // Callback when the view mode changes
}

type ReadonlyViewModeSelectorProps = Readonly<ViewModeSelectorProps>;

export default function ViewModeSelector({ viewMode, onChange }: ReadonlyViewModeSelectorProps) {
  const modes: { key: ViewMode; label: string }[] = [
    { key: 'upcoming', label: '7 Tage' }, // Upcoming 7 days view
    { key: 'week', label: 'Woche' }, // Week view
    { key: 'calendar', label: 'Monat' }, // Month view
  ];

  // Render the selector buttons for each view mode
  return (
    <div className="flex gap-2 mb-4">
      {modes.map((mode) => (
        <button
          key={mode.key}
          onClick={() => onChange(mode.key)}
          className={`flex-1 py-2 px-3 rounded font-medium text-sm ${
            viewMode === mode.key
              ? 'bg-blue-500 text-white' // Highlight selected mode
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300' // Default style for unselected modes
          }`}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
