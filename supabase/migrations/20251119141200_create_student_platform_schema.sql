/*
  # Student Platform Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique, not null)
      - `full_name` (text, not null)
      - `college_name` (text, not null)
      - `skills` (text array)
      - `interests` (text array)
      - `created_at` (timestamptz)
    
    - `notes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text, not null)
      - `description` (text)
      - `file_url` (text, not null)
      - `subject` (text)
      - `created_at` (timestamptz)
    
    - `colleges`
      - `id` (uuid, primary key)
      - `name` (text, unique, not null)
      - `description` (text)
      - `created_by` (uuid, references profiles)
      - `created_at` (timestamptz)
    
    - `communities`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text)
      - `created_by` (uuid, references profiles)
      - `created_at` (timestamptz)
    
    - `community_members`
      - `id` (uuid, primary key)
      - `community_id` (uuid, references communities)
      - `user_id` (uuid, references profiles)
      - `joined_at` (timestamptz)
    
    - `team_finder_posts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text, not null)
      - `description` (text, not null)
      - `required_skills` (text array)
      - `team_size` (integer)
      - `created_at` (timestamptz)
    
    - `anonymous_posts`
      - `id` (uuid, primary key)
      - `content` (text, not null)
      - `created_at` (timestamptz)
    
    - `anonymous_comments`
      - `id` (uuid, primary key)
      - `post_id` (uuid, references anonymous_posts)
      - `content` (text, not null)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Public read access for notes, colleges, communities, team finder, and anonymous posts
    - Strict policies for data modification
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  college_name text NOT NULL,
  skills text[] DEFAULT '{}',
  interests text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  file_url text NOT NULL,
  subject text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view notes"
  ON notes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own notes"
  ON notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON notes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create colleges table
CREATE TABLE IF NOT EXISTS colleges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text DEFAULT '',
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view colleges"
  ON colleges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create colleges"
  ON colleges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "College creators can update their colleges"
  ON colleges FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Create communities table
CREATE TABLE IF NOT EXISTS communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view communities"
  ON communities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create communities"
  ON communities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Community creators can update their communities"
  ON communities FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Create community_members table
CREATE TABLE IF NOT EXISTS community_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid REFERENCES communities(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(community_id, user_id)
);

ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view community members"
  ON community_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join communities"
  ON community_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave communities"
  ON community_members FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create team_finder_posts table
CREATE TABLE IF NOT EXISTS team_finder_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  required_skills text[] DEFAULT '{}',
  team_size integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE team_finder_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view team finder posts"
  ON team_finder_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create team finder posts"
  ON team_finder_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own team finder posts"
  ON team_finder_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own team finder posts"
  ON team_finder_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create anonymous_posts table
CREATE TABLE IF NOT EXISTS anonymous_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE anonymous_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view anonymous posts"
  ON anonymous_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create anonymous posts"
  ON anonymous_posts FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create anonymous_comments table
CREATE TABLE IF NOT EXISTS anonymous_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES anonymous_posts(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE anonymous_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view anonymous comments"
  ON anonymous_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create anonymous comments"
  ON anonymous_comments FOR INSERT
  TO authenticated
  WITH CHECK (true);