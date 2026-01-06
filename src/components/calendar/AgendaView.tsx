import { useState } from 'react';
import type { CalendarEvent, Todo, Contact, AgendaItem } from '../../lib/types';
import { getEventIcon, getEventColorClasses, formatTime } from './calendarUtils';

interface AgendaViewProps {
  items: AgendaItem[];
  onEditEvent: (event: CalendarEvent) => void;
}

export default function AgendaView({ items, onEditEvent }: AgendaViewProps) {
  const [selectedItem, setSelectedItem] = useState<AgendaItem | null>(null);

  // Show detail view if item is selected
  if (selectedItem) {
    return <ItemDetailView item={selectedItem} onClose={() => setSelectedItem(null)} />;
  }
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-4xl mb-2">📅</div>
        <p>Keine Termine vorhanden</p>
      </div>
    );
  }

  const groupedItems: { [key: string]: AgendaItem[] } = {};

  items.forEach((item) => {
    const dateKey = item.date.toLocaleDateString('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    if (!groupedItems[dateKey]) {
      groupedItems[dateKey] = [];
    }
    groupedItems[dateKey].push(item);
  });

  return (
    <div className="space-y-6">
      {Object.keys(groupedItems).map((dateKey) => {
        const dayItems = groupedItems[dateKey];
        const itemDate = dayItems[0].date;
        const isToday = itemDate.toDateString() === new Date().toDateString();
        const isPast = itemDate < new Date() && !isToday;

        return (
          <div key={dateKey}>
            <div
              className={`sticky top-0 z-10 py-2 px-3 mb-2 rounded font-semibold ${
                isToday
                  ? 'bg-blue-500 text-white'
                  : isPast
                  ? 'bg-gray-300 text-gray-600'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {isToday ? `🔵 Heute · ${dateKey}` : dateKey}
            </div>

            <div className="space-y-2">
              {dayItems.map((item) => {
                const icon = getEventIcon(item.type, item.data);

                // Map color classes to border classes
                const borderColorMap: Record<string, string> = {
                  'bg-blue-100 text-blue-900': 'bg-blue-50 border-blue-200',
                  'bg-green-100 text-green-900': 'bg-green-50 border-green-200',
                  'bg-pink-100 text-pink-900': 'bg-pink-50 border-pink-200',
                  'bg-orange-100 text-orange-900': 'bg-orange-50 border-orange-200',
                };
                const colorClass = getEventColorClasses(item.type);
                const bgColor = borderColorMap[colorClass] || 'bg-gray-50 border-gray-200';

                let ageText = '';
                if (item.type === 'birthday') {
                  const contact = item.data as Contact;
                  if (contact.birthdate) {
                    const birthYear = new Date(contact.birthdate).getFullYear();
                    const currentYear = item.date.getFullYear();
                    const age = currentYear - birthYear;
                    ageText = `wird ${age} Jahre alt.`;
                  }
                }

                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    onClick={() => {
                      if (item.type === 'event') {
                        onEditEvent(item.data as CalendarEvent);
                      } else {
                        setSelectedItem(item);
                      }
                    }}
                    className={`border-l-4 ${bgColor} p-4 rounded-r shadow-sm cursor-pointer hover:shadow-md`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{icon}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-lg">{item.title}</div>
                        {item.type === 'birthday' && ageText && (
                          <div className="text-sm text-gray-600 mt-1">🎈 {ageText}</div>
                        )}
                        {item.time && (
                          <div className="text-sm text-gray-600 mt-1">
                            🕐 {formatTime(item.time)}
                          </div>
                        )}
                        {item.description && (
                          <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                        )}
                        {item.type === 'todo' && (item.data as Todo).assigned && (
                          <div className="text-sm text-gray-600 mt-1">
                            👤 {(item.data as Todo).assigned?.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ItemDetailView({ item, onClose }: { item: AgendaItem; onClose: () => void }) {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header with back button */}
      <div className="sticky top-0 bg-white border-b z-10 px-4 py-3 flex items-center gap-3 shadow-sm mb-4">
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-800 text-2xl"
          aria-label="Zurück"
        >
          ←
        </button>
        <h3 className="text-lg font-bold flex-1 truncate">{item.title}</h3>
      </div>

      {/* Content */}
      <div className="px-4 space-y-4">
        <div className="flex items-start gap-3">
          <span className="text-3xl">
            {item.type === 'todo' ? ((item.data as any)?.isDone ? '✅' : '⬜') : '🎂'}
          </span>
          <div className="flex-1">
            <div className="text-sm text-gray-500 mb-2">
              {item.date.toLocaleDateString('de-DE', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </div>
          </div>
        </div>

        {item.type === 'birthday' &&
          (() => {
            const contact = item.data as Contact;
            const birthYear = contact.birthdate ? new Date(contact.birthdate).getFullYear() : null;
            const age = birthYear ? item.date.getFullYear() - birthYear : null;
            return (
              <div className="space-y-3 bg-pink-50 p-4 rounded-lg border border-pink-200">
                {age && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="font-semibold">🎈 Alter:</span>
                    <span>wird {age} Jahre alt</span>
                  </div>
                )}
                {contact.birthdate && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="font-semibold">📅 Geburtstag:</span>
                    <span>{new Date(contact.birthdate).toLocaleDateString('de-DE')}</span>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="font-semibold">📞 Telefon:</span>
                    <span>{contact.phone}</span>
                  </div>
                )}
                {contact.email && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="font-semibold">✉️ Email:</span>
                    <span>{contact.email}</span>
                  </div>
                )}
              </div>
            );
          })()}

        {item.type === 'todo' &&
          (() => {
            const todo = item.data as Todo;
            return (
              <div className="space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
                {item.description && (
                  <div className="text-gray-700">
                    <span className="font-semibold block mb-1">Beschreibung:</span>
                    <p className="text-sm">{item.description}</p>
                  </div>
                )}
                {todo.assigned && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="font-semibold">👤 Zugewiesen:</span>
                    <span>{todo.assigned.name}</span>
                  </div>
                )}
                {todo.due_at && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="font-semibold">⏰ Fällig:</span>
                    <span>
                      {new Date(todo.due_at).toLocaleDateString('de-DE')}{' '}
                      {formatTime(
                        new Date(todo.due_at).toLocaleTimeString('de-DE', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })
                      )}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="font-semibold">Status:</span>
                  <span className={todo.isDone ? 'text-green-600' : 'text-orange-600'}>
                    {todo.isDone ? '✓ Erledigt' : 'Offen'}
                  </span>
                </div>
              </div>
            );
          })()}
      </div>
    </div>
  );
}
