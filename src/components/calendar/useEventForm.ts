// React hook to manage the state and actions for the event form (add/edit calendar events)
import { useState } from 'react';
import type { CalendarEvent } from '../../lib/types';

export function useEventForm() {
  const [showEventForm, setShowEventForm] = useState(false);
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Open the event form for creating a new event, optionally with a specific date
  const openForNew = (date?: Date) => {
    const targetDate = date || new Date();
    const normalizedDate = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate()
    );
    setSelectedDate(normalizedDate);
    setEditEvent(null);
    setShowEventForm(true);
  };

  // Open the event form for editing an existing event
  const openForEdit = (event: CalendarEvent) => {
    setEditEvent(event);
    setSelectedDate(null);
    setShowEventForm(true);
  };

  // Close the event form and reset state
  const close = () => {
    setShowEventForm(false);
    setEditEvent(null);
    setSelectedDate(null);
  };

  // Return all state and actions for the event form
  return {
    showEventForm,
    editEvent,
    selectedDate,
    openForNew,
    openForEdit,
    close,
  };
}
