/*
  # Add Profile Photo Support

  1. New Columns
    - `profile_photo_url` (text) - URL to user's profile photo in Supabase Storage
  
  2. Changes
    - Added profile_photo_url column to profiles table
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'profile_photo_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN profile_photo_url text DEFAULT NULL;
  END IF;
END $$;
