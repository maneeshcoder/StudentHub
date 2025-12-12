import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  college_name: string;
  skills: string[];
  interests: string[];
  profile_photo_url?: string;
  created_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  description: string;
  file_url: string;
  subject: string;
  created_at: string;
  profiles?: Profile;
}

export interface College {
  id: string;
  name: string;
  description: string;
  created_by: string;
  created_at: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  created_by: string;
  created_at: string;
  member_count?: number;
}

export interface TeamFinderPost {
  id: string;
  user_id: string;
  title: string;
  description: string;
  required_skills: string[];
  team_size: number;
  created_at: string;
  profiles?: Profile;
}

export interface AnonymousPost {
  id: string;
  content: string;
  created_at: string;
  comment_count?: number;
}

export interface AnonymousComment {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
}
