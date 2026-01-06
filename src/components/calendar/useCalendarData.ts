import { useState, useEffect } from 'react';
import {
  getCalendarEvents,
  getTodosForCalendar,
  getBirthdaysForCalendar,
  getShoppingItemsForCalendar,
} from '../../lib/calendar';
import type { CalendarEvent, Todo, Contact, ShoppingItem } from '../../lib/types';

export function useCalendarData(familyId: string) {
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [birthdays, setBirthdays] = useState<Contact[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!familyId) return;
    
    setLoading(true);
    try {
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
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [familyId]);

  return { calendarEvents, todos, birthdays, shoppingItems, loading, fetchData };
}
