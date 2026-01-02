import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  getCalendarEvents,
  getTodosForCalendar,
  getBirthdaysForCalendar,
} from '../../lib/calendar';
import type { CalendarEvent, Todo, Contact } from '../../lib/types';
import CalendarEventForm from './CalendarEventForm.js';

interface AgendaItem {
  type: 'event' | 'todo' | 'birthday';
  title: string;
  id: string;
  date: Date;
  time?: string;
  description?: string;
  data: CalendarEvent | Todo | Contact;
}

export default function CalendarView() {
  const { familyId: userFamilyId } = useAuth();
  const familyId = userFamilyId || '';

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [birthdays, setBirthdays] = useState<Contact[]>([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'upcoming' | 'all' | 'calendar'>('upcoming');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedItem, setSelectedItem] = useState<AgendaItem | null>(null);

  useEffect(() => {
    if (familyId) {
      fetchData();
    }
  }, [familyId]);

  const fetchData = async () => {
    try {
      const [events, todosData, birthdaysData] = await Promise.all([
        getCalendarEvents(familyId),
        getTodosForCalendar(familyId),
        getBirthdaysForCalendar(familyId),
      ]);
      setCalendarEvents(events);
      setTodos(todosData);
      setBirthdays(birthdaysData);
    } catch (err) {
      console.error(err);
    }
  };

  const getAgendaItems = (): AgendaItem[] => {
    const items: AgendaItem[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Add calendar events
    calendarEvents.forEach((event) => {
      const eventDate = new Date(event.event_date);
      if (viewMode === 'calendar' || viewMode === 'all' || eventDate >= today) {
        items.push({
          type: 'event',
          title: event.title,
          id: event.id,
          date: eventDate,
          time: event.event_time,
          description: event.description,
          data: event,
        });
      }
    });

    // Add todos with due dates
    todos.forEach((todo) => {
      if (todo.due_at) {
        const dueDate = new Date(todo.due_at);
        if (viewMode === 'calendar' || viewMode === 'all' || dueDate >= today) {
          items.push({
            type: 'todo',
            title: todo.task,
            id: todo.id,
            date: dueDate,
            description: todo.description,
            data: todo,
          });
        }
      }
    });

    // Add birthdays for current year
    const currentYear = new Date().getFullYear();
    birthdays.forEach((contact) => {
      if (contact.birthdate) {
        const bdayDate = new Date(contact.birthdate);
        const thisYearBday = new Date(currentYear, bdayDate.getMonth(), bdayDate.getDate());
        if (viewMode === 'calendar' || viewMode === 'all' || thisYearBday >= today) {
          items.push({
            type: 'birthday',
            title: `${contact.first_name} ${contact.last_name}`,
            id: contact.id,
            date: thisYearBday,
            data: contact,
          });
        }
      }
    });

    // Sort by date
    return items.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const handleAddEvent = () => {
    setSelectedDate(new Date());
    setEditEvent(null);
    setShowEventForm(true);
  };

  const handleAddEventForDate = (date: Date) => {
    setSelectedDate(date);
    setEditEvent(null);
    setShowEventForm(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditEvent(event);
    setSelectedDate(null);
    setShowEventForm(true);
  };

  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDay = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dateStr = currentDay.toISOString().split('T')[0];
      const isCurrentMonth = currentDay.getMonth() === month;
      const dayEvents: AgendaItem[] = [];

      // Add calendar events
      calendarEvents.forEach((event) => {
        if (event.event_date === dateStr) {
          dayEvents.push({
            type: 'event',
            title: event.title,
            id: event.id,
            date: new Date(event.event_date),
            time: event.event_time,
            data: event,
          });
        }
      });

      // Add todos
      todos.forEach((todo) => {
        if (todo.due_at && todo.due_at.startsWith(dateStr)) {
          dayEvents.push({
            type: 'todo',
            title: todo.task,
            id: todo.id,
            date: new Date(todo.due_at),
            data: todo,
          });
        }
      });

      // Add birthdays
      birthdays.forEach((contact) => {
        if (contact.birthdate) {
          const bdayDate = new Date(contact.birthdate);
          if (
            bdayDate.getMonth() === currentDay.getMonth() &&
            bdayDate.getDate() === currentDay.getDate()
          ) {
            const age = year - bdayDate.getFullYear();
            dayEvents.push({
              type: 'birthday',
              title: `${contact.first_name} ${contact.last_name}`,
              id: contact.id,
              date: new Date(currentDay),
              description: `wird ${age}`,
              data: contact,
            });
          }
        }
      });

      days.push({
        date: new Date(currentDay),
        isCurrentMonth,
        events: dayEvents,
      });

      currentDay.setDate(currentDay.getDate() + 1);
    }

    return days;
  };

  const agendaItems = getAgendaItems();
  const groupedItems: { [key: string]: AgendaItem[] } = {};

  agendaItems.forEach((item) => {
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
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Kalender</h1>
        <button
          onClick={handleAddEvent}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow"
        >
          + Termin
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewMode('upcoming')}
          className={`flex-1 py-2 px-3 rounded font-medium text-sm ${
            viewMode === 'upcoming'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Anstehend
        </button>
        <button
          onClick={() => setViewMode('all')}
          className={`flex-1 py-2 px-3 rounded font-medium text-sm ${
            viewMode === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Alle
        </button>
        <button
          onClick={() => setViewMode('calendar')}
          className={`flex-1 py-2 px-3 rounded font-medium text-sm ${
            viewMode === 'calendar'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Kalender
        </button>
      </div>

      {showEventForm && (
        <CalendarEventForm
          event={editEvent}
          initialDate={selectedDate}
          onSubmit={async () => {
            await fetchData();
            setShowEventForm(false);
            setEditEvent(null);
            setSelectedDate(null);
          }}
          onCancel={() => {
            setShowEventForm(false);
            setEditEvent(null);
            setSelectedDate(null);
          }}
        />
      )}

      {viewMode === 'calendar' ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() =>
                setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
              }
              className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded font-bold"
            >
              ←
            </button>
            <h2 className="text-lg font-semibold capitalize">
              {currentMonth.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() =>
                setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
              }
              className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded font-bold"
            >
              →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="text-center font-semibold text-xs p-1 bg-gray-100 rounded">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {getCalendarDays().map((day, idx) => {
              const isToday = day.date.toDateString() === new Date().toDateString();
              return (
                <div
                  key={idx}
                  className={`min-h-[80px] border rounded p-1 ${
                    day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                  } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span
                      className={`text-xs font-semibold ${
                        day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                      } ${
                        isToday
                          ? 'bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]'
                          : ''
                      }`}
                    >
                      {day.date.getDate()}
                    </span>
                    {day.isCurrentMonth && (
                      <button
                        onClick={() => handleAddEventForDate(day.date)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-bold"
                      >
                        +
                      </button>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    {day.events.map((event) => (
                      <div
                        key={`${event.type}-${event.id}`}
                        className={`text-[10px] p-0.5 rounded cursor-pointer ${
                          event.type === 'event'
                            ? 'bg-blue-100 hover:bg-blue-200 text-blue-900'
                            : event.type === 'todo'
                            ? 'bg-green-100 hover:bg-green-200 text-green-900'
                            : 'bg-pink-100 hover:bg-pink-200 text-pink-900'
                        }`}
                        onClick={() => {
                          if (event.type === 'event') {
                            handleEditEvent(event.data as CalendarEvent);
                          } else {
                            setSelectedItem(event);
                          }
                        }}
                      >
                        <div className="truncate">
                          {event.type === 'birthday' ? '🎂' : event.type === 'todo' ? '✅' : '📅'}{' '}
                          {event.title}
                        </div>
                        {event.description && (
                          <div className="text-[9px] opacity-75 truncate">{event.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : agendaItems.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-2">📅</div>
          <p>Keine Termine vorhanden</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.keys(groupedItems).map((dateKey) => {
            const items = groupedItems[dateKey];
            const itemDate = items[0].date;
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
                  {isToday ? '🔵 Heute' : dateKey}
                </div>

                <div className="space-y-2">
                  {items.map((item) => {
                    const icon = item.type === 'event' ? '📅' : item.type === 'todo' ? '✅' : '🎂';
                    const bgColor =
                      item.type === 'event'
                        ? 'bg-blue-50 border-blue-200'
                        : item.type === 'todo'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-pink-50 border-pink-200';

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
                            handleEditEvent(item.data as CalendarEvent);
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
                              <div className="text-sm text-gray-600 mt-1">🕐 {item.time}</div>
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
      )}

      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">{selectedItem.type === 'todo' ? '✅' : '🎂'}</span>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1">{selectedItem.title}</h2>
                <div className="text-sm text-gray-500">
                  {selectedItem.date.toLocaleDateString('de-DE', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>
            </div>

            {selectedItem.type === 'birthday' &&
              (() => {
                const contact = selectedItem.data as Contact;
                const birthYear = contact.birthdate
                  ? new Date(contact.birthdate).getFullYear()
                  : null;
                const age = birthYear ? selectedItem.date.getFullYear() - birthYear : null;
                return (
                  <div className="space-y-2">
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

            {selectedItem.type === 'todo' &&
              (() => {
                const todo = selectedItem.data as Todo;
                return (
                  <div className="space-y-2">
                    {selectedItem.description && (
                      <div className="text-gray-700">
                        <span className="font-semibold block mb-1">Beschreibung:</span>
                        <p className="text-sm">{selectedItem.description}</p>
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
                        <span>{new Date(todo.due_at).toLocaleString('de-DE')}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="font-semibold">Status:</span>
                      <span className={todo.isDone ? 'text-green-600' : 'text-orange-600'}>
                        {todo.isDone ? '✓ Erledigt' : '○ Offen'}
                      </span>
                    </div>
                  </div>
                );
              })()}

            <button
              onClick={() => setSelectedItem(null)}
              className="w-full mt-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
            >
              Schließen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
