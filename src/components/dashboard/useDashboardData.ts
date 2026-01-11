// Custom React hook for loading dashboard data (counts, family name, etc.)
// Only comments are changed, no user-facing German content is modified
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { getTodosForFamily } from '../../lib/todos';
import { getNotesForFamily } from '../../lib/notes';
import { getCalendarEvents } from '../../lib/calendar';

// useDashboardData provides state and logic for dashboard summary info
export function useDashboardData(familyId: string) {
  // State for todos, notes, today's events, loading, and family name
  const [openCount, setOpenCount] = useState<number | null>(null);
  const [noteCount, setNoteCount] = useState<number | null>(null);
  const [todayEventsCount, setTodayEventsCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [familyName, setFamilyName] = useState<string | null>(null);

  // Load all dashboard data (todos, notes, events)
  const load = async () => {
    setLoading(true);
    try {
      const todos = await getTodosForFamily(familyId, 'open');
      setOpenCount(todos.length);

      try {
        const notes = await getNotesForFamily(familyId);
        setNoteCount(notes.length);
      } catch (error) {
        console.log('Error loading notes:', error);
        setNoteCount(null);
      }

      try {
        const events = await getCalendarEvents(familyId);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const todayEvents = events.filter((event) => {
          const eventDate = new Date(event.event_date);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate.getTime() === today.getTime();
        });
        setTodayEventsCount(todayEvents.length);
      } catch (error) {
        console.log('Error loading events:', error);
        setTodayEventsCount(null);
      }
    } catch (error) {
      console.log('Error loading todos or dashboard data:', error);
      setOpenCount(null);
      setNoteCount(null);
      setTodayEventsCount(null);
    } finally {
      setLoading(false);
    }
  };

  // Load family name from database
  const loadFamilyName = async () => {
    try {
      const { data } = await supabase
        .from('families')
        .select('name')
        .eq('id', familyId)
        .maybeSingle();
      setFamilyName((data as any)?.name ?? null);
    } catch (error) {
      console.log('Error loading family name:', error);
    }
  };

  // Refetch all dashboard data and family name
  const refetch = async () => {
    await Promise.all([load(), loadFamilyName()]);
  };

  // Refetch data when familyId changes
  useEffect(() => {
    refetch();
  }, [familyId]);

  // Return dashboard state and refetch function
  return { openCount, noteCount, todayEventsCount, loading, familyName, refetch };
}
