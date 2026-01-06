import { useState } from 'react';
import type { CalendarEvent } from '../../lib/types';

export function useEventForm() {
  const [showEventForm, setShowEventForm] = useState(false);
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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

  const openForEdit = (event: CalendarEvent) => {
    setEditEvent(event);
    setSelectedDate(null);
    setShowEventForm(true);
  };

  const close = () => {
    setShowEventForm(false);
    setEditEvent(null);
    setSelectedDate(null);
  };

  return {
    showEventForm,
    editEvent,
    selectedDate,
    openForNew,
    openForEdit,
    close,
  };
}
