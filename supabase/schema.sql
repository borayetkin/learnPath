-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Categories Table (Universal Learning Domains)
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(50) NOT NULL, -- emoji or icon name
  description TEXT,
  color VARCHAR(50), -- hex color for theming
  is_active BOOLEAN DEFAULT TRUE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- Users Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- Learning Paths Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS learning_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  topic VARCHAR(255) NOT NULL,
  difficulty_level VARCHAR(50) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration INTEGER, -- in hours
  graph_data JSONB, -- stores the node/edge structure
  ai_metadata JSONB, -- stores AI reasoning, version, etc.
  is_public BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  fork_count INTEGER DEFAULT 0,
  completion_rate FLOAT DEFAULT 0.0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- Learning Nodes Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS learning_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  node_type VARCHAR(50) CHECK (node_type IN ('concept', 'skill', 'project', 'milestone', 'practice', 'theory', 'technique', 'performance', 'foundation', 'integration')),
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5),
  estimated_hours INTEGER,
  order_index INTEGER,
  position_x FLOAT,
  position_y FLOAT,
  prerequisites JSONB DEFAULT '[]'::jsonb, -- array of node IDs
  key_takeaways JSONB DEFAULT '[]'::jsonb, -- array of key learning points
  practical_exercises JSONB DEFAULT '[]'::jsonb, -- array of hands-on exercises
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- Resources Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  node_id UUID REFERENCES learning_nodes(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  url TEXT NOT NULL,
  resource_type VARCHAR(50) CHECK (resource_type IN ('course', 'article', 'video', 'book', 'documentation', 'exercise', 'app', 'podcast', 'community', 'tool', 'sheet_music', 'template')),
  platform VARCHAR(100),
  is_free BOOLEAN DEFAULT TRUE,
  estimated_duration INTEGER, -- in minutes
  difficulty_level VARCHAR(50) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  quality_score FLOAT CHECK (quality_score >= 0 AND quality_score <= 1),
  thumbnail_url TEXT,
  description TEXT,
  author VARCHAR(255),
  domain VARCHAR(100),
  community_rating FLOAT CHECK (community_rating >= 0 AND community_rating <= 5),
  rating_count INTEGER DEFAULT 0,
  certification_available BOOLEAN DEFAULT FALSE,
  practical_component BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- User Progress Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
  node_id UUID REFERENCES learning_nodes(id) ON DELETE CASCADE,
  status VARCHAR(50) CHECK (status IN ('not_started', 'in_progress', 'completed')) NOT NULL,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  notes TEXT,
  time_spent INTEGER, -- in minutes
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, node_id)
);

-- ============================================================================
-- Resource Interactions Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS resource_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  interaction_type VARCHAR(50) CHECK (interaction_type IN ('viewed', 'completed', 'bookmarked', 'rated')) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories(order_index);

-- Learning Paths indexes
CREATE INDEX IF NOT EXISTS idx_learning_paths_user ON learning_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_topic ON learning_paths(topic);
CREATE INDEX IF NOT EXISTS idx_learning_paths_category ON learning_paths(category_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_public ON learning_paths(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_learning_paths_views ON learning_paths(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_learning_paths_completion ON learning_paths(completion_rate DESC);

-- Learning Nodes indexes
CREATE INDEX IF NOT EXISTS idx_learning_nodes_path ON learning_nodes(path_id);
CREATE INDEX IF NOT EXISTS idx_learning_nodes_type ON learning_nodes(node_type);

-- Resources indexes
CREATE INDEX IF NOT EXISTS idx_resources_node ON resources(node_id);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(resource_type);

-- User Progress indexes
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_path ON user_progress(path_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON user_progress(status);

-- Resource Interactions indexes
CREATE INDEX IF NOT EXISTS idx_resource_interactions_user ON resource_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_interactions_resource ON resource_interactions(resource_id);

-- ============================================================================
-- Triggers for Updated_at
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for categories table
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for learning_paths table
CREATE TRIGGER update_learning_paths_updated_at
  BEFORE UPDATE ON learning_paths
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_progress table
CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_interactions ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read access)
CREATE POLICY "Anyone can view active categories"
  ON categories FOR SELECT
  USING (is_active = TRUE);

-- Users policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Learning paths policies
CREATE POLICY "Users can view their own paths"
  ON learning_paths FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public paths"
  ON learning_paths FOR SELECT
  USING (is_public = TRUE);

CREATE POLICY "Users can insert their own paths"
  ON learning_paths FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own paths"
  ON learning_paths FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own paths"
  ON learning_paths FOR DELETE
  USING (auth.uid() = user_id);

-- Learning nodes policies
CREATE POLICY "Users can view nodes from their paths"
  ON learning_nodes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM learning_paths
      WHERE learning_paths.id = learning_nodes.path_id
      AND (learning_paths.user_id = auth.uid() OR learning_paths.is_public = TRUE)
    )
  );

CREATE POLICY "Users can insert nodes to their paths"
  ON learning_nodes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM learning_paths
      WHERE learning_paths.id = learning_nodes.path_id
      AND learning_paths.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update nodes in their paths"
  ON learning_nodes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM learning_paths
      WHERE learning_paths.id = learning_nodes.path_id
      AND learning_paths.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete nodes from their paths"
  ON learning_nodes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM learning_paths
      WHERE learning_paths.id = learning_nodes.path_id
      AND learning_paths.user_id = auth.uid()
    )
  );

-- Resources policies (similar to nodes)
CREATE POLICY "Users can view resources from accessible nodes"
  ON resources FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM learning_nodes
      JOIN learning_paths ON learning_paths.id = learning_nodes.path_id
      WHERE learning_nodes.id = resources.node_id
      AND (learning_paths.user_id = auth.uid() OR learning_paths.is_public = TRUE)
    )
  );

CREATE POLICY "Users can insert resources to their nodes"
  ON resources FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM learning_nodes
      JOIN learning_paths ON learning_paths.id = learning_nodes.path_id
      WHERE learning_nodes.id = resources.node_id
      AND learning_paths.user_id = auth.uid()
    )
  );

-- User progress policies
CREATE POLICY "Users can view their own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Resource interactions policies
CREATE POLICY "Users can view their own interactions"
  ON resource_interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interactions"
  ON resource_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to get user's learning paths with progress
CREATE OR REPLACE FUNCTION get_user_paths_with_progress(user_uuid UUID)
RETURNS TABLE (
  path_id UUID,
  title VARCHAR,
  description TEXT,
  topic VARCHAR,
  total_nodes BIGINT,
  completed_nodes BIGINT,
  progress_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    lp.id AS path_id,
    lp.title,
    lp.description,
    lp.topic,
    COUNT(DISTINCT ln.id) AS total_nodes,
    COUNT(DISTINCT CASE WHEN up.status = 'completed' THEN ln.id END) AS completed_nodes,
    ROUND(
      (COUNT(DISTINCT CASE WHEN up.status = 'completed' THEN ln.id END)::NUMERIC /
       NULLIF(COUNT(DISTINCT ln.id), 0)) * 100,
      2
    ) AS progress_percentage
  FROM learning_paths lp
  LEFT JOIN learning_nodes ln ON ln.path_id = lp.id
  LEFT JOIN user_progress up ON up.node_id = ln.id AND up.user_id = user_uuid
  WHERE lp.user_id = user_uuid
  GROUP BY lp.id, lp.title, lp.description, lp.topic
  ORDER BY lp.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Seed Data: 12 Universal Learning Categories
-- ============================================================================

INSERT INTO categories (name, slug, icon, description, color, order_index, is_active) VALUES
  ('Music', 'music', '🎵', 'Learn instruments, music theory, composition, and production', '#9333ea', 1, TRUE),
  ('Visual Arts', 'visual-arts', '🎨', 'Photography, drawing, painting, design, and visual creativity', '#ec4899', 2, TRUE),
  ('Film & Video', 'film-video', '🎬', 'Video production, filmmaking, editing, and cinematography', '#f59e0b', 3, TRUE),
  ('Business', 'business', '💼', 'Entrepreneurship, marketing, finance, and business skills', '#10b981', 4, TRUE),
  ('Personal Development', 'personal-development', '🧘', 'Mindfulness, spirituality, meditation, and personal growth', '#8b5cf6', 5, TRUE),
  ('Languages', 'languages', '🌍', 'Learn new languages and improve communication skills', '#3b82f6', 6, TRUE),
  ('Science & Math', 'science-math', '🔬', 'Physics, chemistry, biology, mathematics, and scientific thinking', '#06b6d4', 7, TRUE),
  ('History & Humanities', 'history-humanities', '📚', 'History, philosophy, literature, and cultural studies', '#f97316', 8, TRUE),
  ('Health & Fitness', 'health-fitness', '💪', 'Exercise, nutrition, wellness, and physical development', '#22c55e', 9, TRUE),
  ('Crafts & Hobbies', 'crafts-hobbies', '✂️', 'DIY projects, woodworking, knitting, and creative crafts', '#a855f7', 10, TRUE),
  ('Writing', 'writing', '✍️', 'Creative writing, technical writing, and communication skills', '#6366f1', 11, TRUE),
  ('Technology', 'technology', '💻', 'Programming, web development, AI, and technical skills', '#14b8a6', 12, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- Social Features: Friends/Connections System
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- ============================================================================
-- Social Features: Learning Groups
-- ============================================================================

CREATE TABLE IF NOT EXISTS learning_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT TRUE,
  member_count INTEGER DEFAULT 0,
  icon VARCHAR(50), -- emoji or icon name
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES learning_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(20) CHECK (role IN ('admin', 'moderator', 'member')) DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

CREATE TABLE IF NOT EXISTS group_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES learning_groups(id) ON DELETE CASCADE NOT NULL,
  path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE NOT NULL,
  shared_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, path_id)
);

-- ============================================================================
-- Social Features: Path Recommendations
-- ============================================================================

CREATE TABLE IF NOT EXISTS path_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  recommended_path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE NOT NULL,
  reason TEXT, -- Why this was recommended
  score FLOAT DEFAULT 0.0, -- Recommendation confidence score
  is_dismissed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, recommended_path_id)
);

-- ============================================================================
-- Indexes for Social Features
-- ============================================================================

-- User connections indexes
CREATE INDEX IF NOT EXISTS idx_user_connections_user ON user_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_friend ON user_connections(friend_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_status ON user_connections(status);

-- Learning groups indexes
CREATE INDEX IF NOT EXISTS idx_learning_groups_category ON learning_groups(category_id);
CREATE INDEX IF NOT EXISTS idx_learning_groups_creator ON learning_groups(creator_id);
CREATE INDEX IF NOT EXISTS idx_learning_groups_public ON learning_groups(is_public) WHERE is_public = TRUE;

-- Group members indexes
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);

-- Group paths indexes
CREATE INDEX IF NOT EXISTS idx_group_paths_group ON group_paths(group_id);
CREATE INDEX IF NOT EXISTS idx_group_paths_path ON group_paths(path_id);

-- Path recommendations indexes
CREATE INDEX IF NOT EXISTS idx_path_recommendations_user ON path_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_path_recommendations_score ON path_recommendations(score DESC);

-- ============================================================================
-- Triggers for Social Features
-- ============================================================================

-- Trigger for user_connections table
CREATE TRIGGER update_user_connections_updated_at
  BEFORE UPDATE ON user_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for learning_groups table
CREATE TRIGGER update_learning_groups_updated_at
  BEFORE UPDATE ON learning_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update group member count
CREATE OR REPLACE FUNCTION update_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE learning_groups
    SET member_count = member_count + 1
    WHERE id = NEW.group_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE learning_groups
    SET member_count = member_count - 1
    WHERE id = OLD.group_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_group_member_count_trigger
  AFTER INSERT OR DELETE ON group_members
  FOR EACH ROW
  EXECUTE FUNCTION update_group_member_count();

-- ============================================================================
-- Row Level Security for Social Features
-- ============================================================================

ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE path_recommendations ENABLE ROW LEVEL SECURITY;

-- User connections policies
CREATE POLICY "Users can view their own connections"
  ON user_connections FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create connection requests"
  ON user_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connections"
  ON user_connections FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can delete their own connections"
  ON user_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Learning groups policies
CREATE POLICY "Anyone can view public groups"
  ON learning_groups FOR SELECT
  USING (is_public = TRUE OR EXISTS (
    SELECT 1 FROM group_members WHERE group_id = learning_groups.id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create groups"
  ON learning_groups FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Group admins can update groups"
  ON learning_groups FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = learning_groups.id AND user_id = auth.uid() AND role IN ('admin', 'moderator')
  ));

-- Group members policies
CREATE POLICY "Users can view group members"
  ON group_members FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM learning_groups WHERE id = group_members.group_id AND is_public = TRUE
  ) OR EXISTS (
    SELECT 1 FROM group_members gm WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid()
  ));

CREATE POLICY "Users can join public groups"
  ON group_members FOR INSERT
  WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM learning_groups WHERE id = group_id AND is_public = TRUE
  ));

-- Path recommendations policies
CREATE POLICY "Users can view their own recommendations"
  ON path_recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can dismiss their recommendations"
  ON path_recommendations FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- GROUP FEED / POSTS SYSTEM (Reddit-style)
-- =====================================================

-- Group posts table (like Reddit posts)
CREATE TABLE IF NOT EXISTS group_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES learning_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(300) NOT NULL,
  content TEXT,
  post_type VARCHAR(20) CHECK (post_type IN ('text', 'link', 'path', 'discussion')) DEFAULT 'text',
  link_url TEXT,
  shared_path_id UUID REFERENCES learning_paths(id) ON DELETE SET NULL,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Post reactions (upvotes/downvotes)
CREATE TABLE IF NOT EXISTS post_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES group_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  reaction_type VARCHAR(10) CHECK (reaction_type IN ('upvote', 'downvote')) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Post comments
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES group_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  parent_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for group posts
CREATE INDEX idx_group_posts_group_id ON group_posts(group_id);
CREATE INDEX idx_group_posts_user_id ON group_posts(user_id);
CREATE INDEX idx_group_posts_created_at ON group_posts(created_at DESC);
CREATE INDEX idx_group_posts_upvotes ON group_posts(upvotes DESC);
CREATE INDEX idx_post_reactions_post_id ON post_reactions(post_id);
CREATE INDEX idx_post_reactions_user_id ON post_reactions(user_id);
CREATE INDEX idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX idx_post_comments_parent_id ON post_comments(parent_comment_id);

-- Trigger to auto-update post vote counts
CREATE OR REPLACE FUNCTION update_post_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.reaction_type = 'upvote' THEN
      UPDATE group_posts SET upvotes = upvotes + 1 WHERE id = NEW.post_id;
    ELSE
      UPDATE group_posts SET downvotes = downvotes + 1 WHERE id = NEW.post_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.reaction_type = 'upvote' THEN
      UPDATE group_posts SET upvotes = upvotes - 1 WHERE id = OLD.post_id;
    ELSE
      UPDATE group_posts SET downvotes = downvotes - 1 WHERE id = OLD.post_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.reaction_type = 'upvote' THEN
      UPDATE group_posts SET upvotes = upvotes - 1 WHERE id = OLD.post_id;
    ELSE
      UPDATE group_posts SET downvotes = downvotes - 1 WHERE id = OLD.post_id;
    END IF;
    IF NEW.reaction_type = 'upvote' THEN
      UPDATE group_posts SET upvotes = upvotes + 1 WHERE id = NEW.post_id;
    ELSE
      UPDATE group_posts SET downvotes = downvotes + 1 WHERE id = NEW.post_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_votes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON post_reactions
  FOR EACH ROW
  EXECUTE FUNCTION update_post_vote_counts();

-- Trigger to auto-update comment counts
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE group_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE group_posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comment_count_trigger
  AFTER INSERT OR DELETE ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comment_count();

-- RLS Policies for group posts
ALTER TABLE group_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- Group posts policies
CREATE POLICY "Group members can view posts"
  ON group_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_posts.group_id
      AND group_members.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM learning_groups
      WHERE learning_groups.id = group_posts.group_id
      AND learning_groups.is_public = true
    )
  );

CREATE POLICY "Group members can create posts"
  ON group_posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_posts.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Post authors and admins can update posts"
  ON group_posts FOR UPDATE
  USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_posts.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Post authors and admins can delete posts"
  ON group_posts FOR DELETE
  USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_posts.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.role IN ('admin', 'moderator')
    )
  );

-- Post reactions policies
CREATE POLICY "Anyone can view reactions"
  ON post_reactions FOR SELECT
  USING (true);

CREATE POLICY "Users can add reactions"
  ON post_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reactions"
  ON post_reactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
  ON post_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Post comments policies
CREATE POLICY "Anyone can view comments"
  ON post_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON post_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Comment authors can update their comments"
  ON post_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Comment authors and moderators can delete comments"
  ON post_comments FOR DELETE
  USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM group_posts
      JOIN group_members ON group_members.group_id = group_posts.group_id
      WHERE group_posts.id = post_comments.post_id
      AND group_members.user_id = auth.uid()
      AND group_members.role IN ('admin', 'moderator')
    )
  );

-- ============================================================================
-- Badges System
-- ============================================================================

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

CREATE POLICY "Anyone can view badges"
  ON user_badges FOR SELECT
  USING (true);

CREATE POLICY "System can insert badges"
  ON user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);
