// React hook to manage and fetch calendar-related data for a family
import { useState, useEffect } from 'react';
import {
  getCalendarEvents,
  getTodosForCalendar,
  getBirthdaysForCalendar,
  getShoppingItemsForCalendar,
} from '../../lib/calendar';
import type { CalendarEvent, Todo, Contact, ShoppingItem } from '../../lib/types';

export function useCalendarData(familyId: string) {
  // State for calendar events, todos, birthdays, shopping items, and loading status
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [birthdays, setBirthdays] = useState<Contact[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all calendar data for the given familyId
  const fetchData = async () => {
    if (!familyId) return;
    
    setLoading(true);
    try {
      // Fetch events, todos, birthdays, and shopping items in parallel
      const [events, todosData, birthdaysData, shoppingData] = await Promise.all([
        getCalendarEvents(familyId),
        getTodosForCalendar(familyId),
        getBirthdaysForCalendar(familyId),
        getShoppingItemsForCalendar(familyId),
      ]);
      setCalendarEvents(events);
      setTodos(todosData);
      setBirthdays(birthdaysData);
      setShoppingItems(shoppingData);
    } catch (err) {
      console.error('Error fetching calendar data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Refetch data whenever the familyId changes
  useEffect(() => {
    fetchData();
  }, [familyId]);

  // Return all calendar data and loading state
  return { calendarEvents, todos, birthdays, shoppingItems, loading, fetchData };
}
