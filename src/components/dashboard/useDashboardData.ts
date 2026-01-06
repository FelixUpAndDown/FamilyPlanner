import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { getTodosForFamily } from '../../lib/todos';
import { getNotesForFamily } from '../../lib/notes';
import { getCalendarEvents } from '../../lib/calendar';

export function useDashboardData(familyId: string) {
  const [openCount, setOpenCount] = useState<number | null>(null);
  const [noteCount, setNoteCount] = useState<number | null>(null);
  const [todayEventsCount, setTodayEventsCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [familyName, setFamilyName] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const todos = await getTodosForFamily(familyId, 'open');
        if (!mounted) return;
        setOpenCount(todos.length);

        try {
          const notes = await getNotesForFamily(familyId);
          if (!mounted) return;
          setNoteCount(notes.length);
        } catch (notesErr) {
          if (!mounted) return;
          setNoteCount(null);
        }

        try {
          const events = await getCalendarEvents(familyId);
          if (!mounted) return;
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
        } catch (eventsErr) {
          if (!mounted) return;
          setTodayEventsCount(null);
        }
      } catch (err) {
        if (!mounted) return;
        setOpenCount(null);
        setNoteCount(null);
        setTodayEventsCount(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const loadFamilyName = async () => {
      try {
        const { data } = await supabase
          .from('families')
          .select('name')
          .eq('id', familyId)
          .maybeSingle();
        if (mounted) setFamilyName((data as any)?.name ?? null);
      } catch (err) {
        // Silent fail
      }
    };

    load();
    loadFamilyName();

    return () => {
      mounted = false;
    };
  }, [familyId]);

  return { openCount, noteCount, todayEventsCount, loading, familyName };
}
