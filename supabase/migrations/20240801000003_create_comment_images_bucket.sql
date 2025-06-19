-- Create a new storage bucket for comment images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'comment-images',
  'comment-images',
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for the storage bucket
-- Allow users to view their own files and public files
CREATE POLICY "Users can view their own comment images"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'comment-images' AND 
    (auth.uid() = owner OR owner IS NULL)
  );

-- Allow users to upload files to the comment-images bucket
CREATE POLICY "Users can upload comment images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'comment-images' AND 
    auth.uid() = owner
  );

-- Allow users to update their own files
CREATE POLICY "Users can update their own comment images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'comment-images' AND 
    auth.uid() = owner
  );

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own comment images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'comment-images' AND 
    auth.uid() = owner
  ); 