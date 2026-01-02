import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  getCalendarEvents,
  getTodosForCalendar,
  getBirthdaysForCalendar,
} from '../../lib/calendar';
import type { CalendarEvent, Todo, Contact, AgendaItem } from '../../lib/types';
import CalendarEventForm from './CalendarEventForm.js';
import CalendarGrid from './CalendarGrid';
import AgendaView from './AgendaView';
import EventDetailModal from './EventDetailModal';
import { createAgendaItems, createCalendarDays } from './calendarUtils';

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

  const agendaItems = createAgendaItems(calendarEvents, todos, birthdays, viewMode);
  const calendarDays = createCalendarDays(currentMonth, calendarEvents, todos, birthdays);

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
        <CalendarGrid
          days={calendarDays}
          currentMonth={currentMonth}
          onPreviousMonth={() =>
            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
          }
          onNextMonth={() =>
            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
          }
          onAddEvent={handleAddEventForDate}
          onEditEvent={handleEditEvent}
          onSelectItem={setSelectedItem}
        />
      ) : (
        <AgendaView
          items={agendaItems}
          onEditEvent={handleEditEvent}
          onSelectItem={setSelectedItem}
        />
      )}

      <EventDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
