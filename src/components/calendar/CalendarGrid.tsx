import type { CalendarDay, AgendaItem } from '../../lib/types';
import { getEventIcon, getEventColorClasses } from './calendarUtils';
import NavigationHeader from './NavigationHeader';

// Props for CalendarGrid:
// - days: array of calendar days to display
// - currentMonth: current month being viewed
// - onPreviousMonth: callback for previous month navigation
// - onNextMonth: callback for next month navigation
// - onAddEvent: callback to add event to a day
// - onSelectDay: callback to select a day

interface CalendarGridProps {
  days: CalendarDay[];
  currentMonth: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onAddEvent: (date: Date) => void;
  onSelectDay: (date: Date) => void;
}

type ReadonlyCalendarGridProps = Readonly<CalendarGridProps>;

function DayCell({
  day,
  onSelectDay,
  onAddEvent,
}: Readonly<{
  day: CalendarDay;
  onSelectDay: (date: Date) => void;
  onAddEvent: (date: Date) => void;
}>) {
  const isToday = day.date.toDateString() === new Date().toDateString();
  return (
    <button
      type="button"
      onClick={() => onSelectDay(day.date)}
      className={`min-h-20 border rounded p-1 cursor-pointer hover:bg-blue-50 w-full text-left outline-none focus:ring-2 focus:ring-blue-500 relative ${
        day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
      } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
      aria-current={isToday ? 'date' : undefined}
      tabIndex={0}
    >
      {/* Day number always top left, plus always top right */}
      <div className="flex justify-between items-start mb-1 min-h-5.5">
        <span
          className={`text-xs font-semibold ${
            day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
          } ${
            isToday
              ? 'bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]'
              : ''
          }`}
          style={{ minWidth: 20 }}
        >
          {day.date.getDate()}
        </span>
        {day.isCurrentMonth && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const normalizedDate = new Date(
                day.date.getFullYear(),
                day.date.getMonth(),
                day.date.getDate()
              );
              onAddEvent(normalizedDate);
            }}
            className="text-blue-600 hover:text-blue-800 text-xs font-bold ml-2"
            tabIndex={-1}
            style={{ minWidth: 20 }}
            aria-label="Termin hinzufügen"
          >
            +
          </button>
        )}
      </div>

      {/* Event previews for the day */}
      <div className="space-y-0.5">
        {day.events.slice(0, 2).map((event: AgendaItem) => (
          <div
            key={`${event.type}-${event.id}`}
            className={`text-[10px] p-0.5 rounded ${getEventColorClasses(event.type)}`}
          >
            <div className="truncate">
              {getEventIcon(event.type, event.data)} {event.title}
            </div>
            {/* Show event description if available */}
            {event.description && (
              <div className="text-[9px] opacity-75 truncate">{event.description}</div>
            )}
          </div>
        ))}
        {/* Show more button if more than 2 events */}
        {day.events.length > 2 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectDay(day.date);
            }}
            className="w-full text-[10px] p-0.5 rounded bg-gray-300 text-gray-800 hover:bg-gray-400 font-semibold text-center"
            tabIndex={-1}
          >
            +{day.events.length - 2} mehr
          </button>
        )}
      </div>
    </button>
  );
}

export default function CalendarGrid({
  days,
  currentMonth,
  onPreviousMonth,
  onNextMonth,
  onAddEvent,
  onSelectDay,
}: ReadonlyCalendarGridProps) {
  // Render the calendar grid UI
  return (
    <div>
      {/* Month navigation header */}
      <NavigationHeader
        title={currentMonth.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
        onPrevious={onPreviousMonth}
        onNext={onNextMonth}
      />

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day) => (
          <div key={day} className="text-center font-semibold text-xs p-1 bg-gray-100 rounded">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar day cells */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => (
          <DayCell
            key={day.date.toISOString()}
            day={day}
            onSelectDay={onSelectDay}
            onAddEvent={onAddEvent}
          />
        ))}
      </div>
    </div>
  );
}
