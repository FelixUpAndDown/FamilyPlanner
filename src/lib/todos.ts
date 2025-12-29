import { supabase } from './supabaseClient';

// Load all todos for a given family
export const getTodosForFamily = async (familyId: string) => {
  const { data, error } = await supabase
    .from('todos')
    .select(
      `
      id,
      task,
      isDone,
      comment,
      assigned_to_id,
      created_by_id
    `
    )
    .eq('family_id', familyId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
};

// Add a new todo for a family
export const addTodo = async (
  familyId: string,
  task: string,
  assignedToId: string,
  createdById: string,
  comment?: string
) => {
  const { data, error } = await supabase
    .from('todos')
    .insert([
      {
        family_id: familyId,
        task,
        assigned_to_id: assignedToId,
        created_by_id: createdById,
        comment: comment || '',
        isDone: false,
      },
    ])
    .select();

  if (error) throw error;
  return data;
};

// Toggle todo completion status
export const toggleTodo = async (id: string, isDone: boolean) => {
  const { data, error } = await supabase
    .from('todos')
    .update({ isDone: isDone })
    .eq('id', id)
    .select();
  if (error) throw error;
  return data;
};
