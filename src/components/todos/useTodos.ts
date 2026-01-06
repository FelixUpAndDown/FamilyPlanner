import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import type { Todo, TodoFilterType } from '../../lib/types';
import { getTodosForFamily, addTodo, toggleTodo, deleteTodo } from '../../lib/todos';

type CommentMeta = Record<
  string,
  { count: number; comments?: { text: string; user_id?: string; created_at?: string }[] }
>;

export function useTodos(
  familyId: string,
  filter: TodoFilterType,
  currentUserId: string,
  currentProfileId: string,
  showToast: (message: string) => void
) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commentMeta, setCommentMeta] = useState<CommentMeta>({});

  const fetchTodos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTodosForFamily(familyId, filter);
      const todosLoaded = data ?? [];
      setTodos(todosLoaded);

      if (todosLoaded.length > 0) {
        const todoIds = todosLoaded.map((t) => t.id);
        const { data: commentsData, error: commentsError } = await supabase
          .from('todo_comments')
          .select('todo_id, text, user_id, created_at')
          .in('todo_id', todoIds)
          .order('created_at', { ascending: false });

        if (commentsError) {
          setCommentMeta({});
        } else if (commentsData) {
          const map: CommentMeta = {};
          for (const c of commentsData as any[]) {
            const id = c.todo_id as string;
            if (!map[id]) {
              map[id] = { count: 0, comments: [] };
            }
            map[id].count += 1;
            map[id].comments?.push({ text: c.text, user_id: c.user_id, created_at: c.created_at });
          }
          setCommentMeta(map);
        }
      } else {
        setCommentMeta({});
      }
    } catch (err: any) {
      setError(err?.message || String(err));
      setTodos([]);
      setCommentMeta({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [familyId, filter]);

  const handleAdd = async (
    task: string,
    assignedTo: string | null,
    description: string,
    dueDate: string | null
  ) => {
    try {
      await addTodo(
        familyId,
        task,
        assignedTo,
        currentProfileId || currentUserId,
        description,
        dueDate
      );
      await fetchTodos();
      showToast('Aufgabe hinzugefügt ✓');
      return true;
    } catch (err: any) {
      alert(err.message || JSON.stringify(err));
      return false;
    }
  };

  const handleToggle = async (todo: Todo) => {
    try {
      const doneById = !todo.isDone ? currentProfileId || currentUserId : null;

      if (!todo.isDone) {
        showToast(`"${todo.task}" erledigt ✓`);
      } else {
        showToast(`"${todo.task}" wieder geöffnet`);
      }

      await toggleTodo(todo.id, !todo.isDone, doneById);
      await fetchTodos();
    } catch (err: any) {
      alert(err.message || JSON.stringify(err));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTodo(id);
      await fetchTodos();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return { todos, loading, error, commentMeta, fetchTodos, handleAdd, handleToggle, handleDelete };
}
