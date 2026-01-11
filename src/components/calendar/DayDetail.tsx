import type { AgendaItem, Contact, Todo, CalendarEvent } from '../../lib/types';
import { getEventIcon, getEventBorderClasses, formatTime } from './calendarUtils';

interface DayDetailProps {
  date: Date;
  items: AgendaItem[];
  onClose: () => void;
  onEditEvent?: (event: CalendarEvent) => void;
  compact?: boolean;
}

type ReadonlyDayDetailProps = Readonly<DayDetailProps>;

// DayDetail component displays all agenda items for a specific day, including birthdays, todos, and events.
export default function DayDetail({
  date,
  items,
  onClose,
  onEditEvent,
  compact = false,
}: ReadonlyDayDetailProps) {
  return (
    <div
      className={`p-4 bg-gray-50 border rounded-lg ${
        compact ? 'border-l-4 border-blue-400 rounded-r mt-0 mb-0' : 'mt-6 mb-4'
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className={compact ? 'text-sm font-semibold' : 'text-lg font-semibold'}>
          {compact
            ? 'Details:'
            : date.toLocaleDateString('de-DE', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
        </h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 font-bold">
          ✕
        </button>
      </div>
      {items.length === 0 ? (
        <p className="text-gray-500 text-sm">No appointments for this day</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => {
            // Calculate age text for birthday items
            let ageText = '';
            if (item.type === 'birthday') {
              const contact = item.data as Contact;
              if (contact.birthdate) {
                const birthYear = new Date(contact.birthdate).getFullYear();
                const currentYear = item.date.getFullYear();
                const age = currentYear - birthYear;
                ageText = `will be ${age} years old`;
              }
            }

            return (
              <li
                key={`${item.type}-${item.id}`}
                className={`${compact ? 'p-2' : 'p-3'} rounded border-l-4 ${
                  compact ? 'bg-white' : ''
                } ${getEventBorderClasses(item.type)}`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {getEventIcon(item.type, item.data)} {item.title}
                    </div>
                    {/* Show age for birthday items */}
                    {item.type === 'birthday' && ageText && (
                      <div className="text-xs text-gray-600 mt-1">🎈 {ageText}</div>
                    )}
                    {/* Show description if available */}
                    {item.description && (
                      <div className="text-xs text-gray-600 mt-1">{item.description}</div>
                    )}
                    {/* Show time if available */}
                    {item.time && (
                      <div className="text-xs text-gray-500 mt-1">🕐 {formatTime(item.time)}</div>
                    )}
                    {/* Show assigned person for todos if available */}
                    {item.type === 'todo' && (item.data as Todo).assigned && (
                      <div className="text-xs text-gray-600 mt-1">
                        👤 {(item.data as Todo).assigned?.name}
                      </div>
                    )}
                  </div>
                  {/* Edit button for events */}
                  {item.type === 'event' && onEditEvent && (
                    <button
                      onClick={() => onEditEvent(item.data as CalendarEvent)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium shrink-0"
                    >
                      ✏️
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
