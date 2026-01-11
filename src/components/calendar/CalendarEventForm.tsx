// CalendarEventForm handles creation and editing of calendar events.
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { addCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from '../../lib/calendar';
import { formatTime, getNextFullHour } from './calendarUtils';
import type { CalendarEvent } from '../../lib/types';

// Props for CalendarEventForm:
// - event: event to edit (optional)
// - initialDate: date to prefill (optional)
// - onSubmit: callback after submit
// - onCancel: callback for cancel
// - onSuccess: callback for success message (optional)
interface CalendarEventFormProps {
  event?: CalendarEvent | null;
  initialDate?: Date | null;
  onSubmit: () => void;
  onCancel: () => void;
  onSuccess?: (message: string) => void;
}

type ReadonlyCalendarEventFormProps = Readonly<CalendarEventFormProps>;

export default function CalendarEventForm({
  event,
  initialDate,
  onSubmit,
  onCancel,
  onSuccess,
}: ReadonlyCalendarEventFormProps) {
  // Get user and family info from auth hook
  const { user, familyId: userFamilyId } = useAuth();
  const familyId = userFamilyId || '';
  const userId = user?.id || '';

  // State for form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');

  // Prefill form fields when editing or creating
  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setEventDate(event.event_date);
      setEventTime(formatTime(event.event_time) || '');
    } else if (initialDate) {
      // Normalize the date to local timezone (midnight)
      const normalizedDate = new Date(
        initialDate.getFullYear(),
        initialDate.getMonth(),
        initialDate.getDate()
      );
      const year = normalizedDate.getFullYear();
      const month = String(normalizedDate.getMonth() + 1).padStart(2, '0');
      const day = String(normalizedDate.getDate()).padStart(2, '0');
      setEventDate(`${year}-${month}-${day}`);
    }
  }, [event, initialDate]);

  // Handle form submit for add/edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventDate) return;

    try {
      if (event) {
        await updateCalendarEvent(event.id, title, eventDate, eventTime, description);
        onSuccess?.('Termin aktualisiert ✓');
      } else {
        await addCalendarEvent(familyId, title, eventDate, eventTime, description, userId);
        onSuccess?.('Termin hinzugefügt ✓');
      }
      onSubmit();
    } catch (err: any) {
      alert(err.message || JSON.stringify(err));
    }
  };

  // Handle delete event
  const handleDelete = async () => {
    if (!event) return;
    if (!confirm('Termin wirklich löschen?')) return;

    try {
      await deleteCalendarEvent(event.id);
      onSubmit();
    } catch (err: any) {
      alert(err.message || JSON.stringify(err));
    }
  };

  // Render the form UI
  return (
    <div className="max-w-2xl mx-auto pb-24">
      {/* Header with back button */}
      <div className="sticky top-0 bg-white border-b z-10 px-4 py-3 flex items-center gap-3 shadow-sm mb-4">
        {/* Cancel/back button */}
        <button
          onClick={onCancel}
          className="text-gray-600 hover:text-gray-800 text-2xl"
          type="button"
          aria-label="Zurück"
        >
          ←
        </button>
        {/* Title for form mode */}
        <h3 className="text-lg font-bold flex-1">{event ? 'Termin bearbeiten' : 'Neuer Termin'}</h3>
      </div>

      {/* Form Content */}
      <form id="calendar-event-form" onSubmit={handleSubmit} className="px-4 space-y-4">
        {/* Title input */}
        <div>
          <label htmlFor="event-title" className="block text-sm font-medium mb-1">
            Titel <span className="text-red-500">*</span>
          </label>
          <input
            id="event-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded p-2"
            required
          />
        </div>

        {/* Date input */}
        <div>
          <label htmlFor="event-date" className="block text-sm font-medium mb-1">
            Datum <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              id="event-date"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="flex-1 border border-gray-300 rounded p-2"
              required
            />
            {eventDate && (
              <button
                type="button"
                onClick={() => setEventDate('')}
                className="px-3 py-2 border border-gray-300 rounded bg-gray-100 hover:bg-gray-200 text-sm"
                title="Löschen"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Time input */}
        <div>
          <label htmlFor="event-time" className="block text-sm font-medium mb-1">
            Uhrzeit
          </label>
          <div className="flex gap-2">
            <input
              id="event-time"
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              onFocus={(e) => {
                if (!e.target.value) {
                  setEventTime(getNextFullHour());
                }
              }}
              step="3600"
              className="flex-1 border border-gray-300 rounded p-2"
            />
            {eventTime && (
              <button
                type="button"
                onClick={() => setEventTime('')}
                className="px-3 py-2 border border-gray-300 rounded bg-gray-100 hover:bg-gray-200 text-sm"
                title="Löschen"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Description input */}
        <div>
          <label htmlFor="event-description" className="block text-sm font-medium mb-1">
            Beschreibung
          </label>
          <textarea
            id="event-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded p-2"
            rows={3}
          />
        </div>
      </form>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-3 flex gap-2">
        {/* Delete button for edit mode */}
        {event && (
          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded text-sm"
          >
            Löschen
          </button>
        )}
        {/* Cancel button */}
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded text-sm"
        >
          Abbrechen
        </button>
        {/* Submit button */}
        <button
          type="submit"
          form="calendar-event-form"
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded text-sm"
        >
          {event ? 'Speichern' : 'Hinzufügen'}
        </button>
      </div>
    </div>
  );
}
