export interface Profile {
  id: string;
  user_id: string;
  family_id: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  profile?: Profile | null;
}

export interface Todo {
  id: string;
  task: string;
  description?: string;
  isDone: boolean;
  assigned_to_id?: string | null;
  created_by_id: string;
  done_by_id?: string | null;
  done_at?: string | null;
  due_at?: string | null;

  // Optional: relational data
  assigned?: Profile | null;
  creator?: Profile | null;
  done_by?: Profile | null;

  created_at?: string;
}

export type TodoFilterType = 'open' | 'done' | 'all';
