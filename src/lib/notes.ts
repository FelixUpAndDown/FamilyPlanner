/**
 * Notes library
 *
 * Minimal set of helpers to interact with a `notes` table in Supabase. The table is expected to
 * have at least: id, family_id, title, content, created_by_id (FK to profiles.id), created_at, updated_at.
 */
import { supabase } from './supabaseClient';

export type Note = {
  id: string;
  family_id: string;
  title: string;
  content: string;
  created_by_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  creator?: { id: string; name: string } | null;
};

export async function getNotesForFamily(familyId: string) {
  // Fetch notes with creator profile relation
  const { data, error } = await supabase
    .from('notes')
    .select(
      'id,family_id,title,content,created_by_id,created_at,updated_at,creator:created_by_id(id,name)'
    )
    .eq('family_id', familyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  // Normalize creator: if it's an array (shouldn't happen but handle it), take first item or null
  const notes =
    (data as any[])?.map((n) => ({
      ...n,
      creator: Array.isArray(n.creator) ? n.creator[0] || null : n.creator,
    })) || [];
  return notes as Note[];
}

export async function addNote(
  familyId: string,
  title: string,
  content: string,
  createdById?: string
) {
  const { data, error } = await supabase
    .from('notes')
    .insert([{ family_id: familyId, title, content, created_by_id: createdById }])
    .select(
      'id,family_id,title,content,created_by_id,created_at,updated_at,creator:created_by_id(id,name)'
    )
    .single();

  if (error) throw error;
  // Normalize creator if it's an array
  const note = data as any;
  return {
    ...note,
    creator: Array.isArray(note.creator) ? note.creator[0] || null : note.creator,
  } as Note;
}

export async function deleteNote(id: string) {
  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) throw error;
}

export async function updateNote(id: string, title: string, content: string) {
  const { data, error } = await supabase
    .from('notes')
    .update({ title, content })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Note;
}
