import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  college_name: string | null;
  skills: string[] | null;
  interests: string[] | null;
  profile_photo_url?: string | null;
  bio?: string | null;
  location?: string | null;
  created_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  subject: string | null;
  like_count: number;
  created_at: string;
  profiles?: Profile;
}


export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  college_name: string | null;
  skills: string[] | null;
  interests: string[] | null;
  profile_photo_url?: string | null;
  bio?: string | null;
  location?: string | null;
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
  description: string | null;
  required_skills: string[] | null;
  team_size: number | null;
  comment_count: number;
  created_at: string;
  profiles?: Profile;
}


export interface AnonymousPost {
  id: string;
  content: string;
  comment_count: number;
  created_at: string;
}


export interface AnonymousComment {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
  anonymous_comment_likes?: {
    count: number;
  }[];
}

