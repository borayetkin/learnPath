-- Migration: Add user_badges table and profile fields to users table
-- Run this on an existing database to add the badges system and profile fields

-- Add avatar_url and bio to users table (if not already present)
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;

-- Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE NOT NULL,
  badge_name VARCHAR(200) NOT NULL,
  badge_icon VARCHAR(50) DEFAULT '🏆',
  badge_color VARCHAR(50) DEFAULT '#eab308',
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, path_id)
);

-- Indexes for badges
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_path ON user_badges(path_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned ON user_badges(earned_at DESC);

-- RLS for badges
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Drop policies first if they exist (for idempotency)
DROP POLICY IF EXISTS "Anyone can view badges" ON user_badges;
DROP POLICY IF EXISTS "System can insert badges" ON user_badges;

CREATE POLICY "Anyone can view badges"
  ON user_badges FOR SELECT
  USING (true);

CREATE POLICY "System can insert badges"
  ON user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);
