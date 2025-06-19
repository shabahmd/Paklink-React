-- Add parent_id to comments table for reply functionality
ALTER TABLE comments
ADD COLUMN parent_id UUID REFERENCES comments(id) ON DELETE CASCADE;

-- Create comment_likes table
CREATE TABLE comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(comment_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX comment_likes_comment_id_idx ON comment_likes(comment_id);
CREATE INDEX comment_likes_user_id_idx ON comment_likes(user_id);
CREATE INDEX comments_parent_id_idx ON comments(parent_id);

-- Add RLS policies for comment_likes
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view any comment likes"
  ON comment_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can like comments"
  ON comment_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
  ON comment_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add function to count likes
CREATE OR REPLACE FUNCTION get_comment_likes_count(comment_row comments)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM comment_likes
  WHERE comment_id = comment_row.id;
$$; 