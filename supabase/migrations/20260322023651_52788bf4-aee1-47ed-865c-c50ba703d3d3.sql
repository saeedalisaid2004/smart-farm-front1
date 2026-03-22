
-- Create avatars storage bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read avatars
CREATE POLICY "Public read access on avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow anyone to upload avatars (since we use external auth)
CREATE POLICY "Allow upload avatars"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'avatars');

-- Allow anyone to update their avatars
CREATE POLICY "Allow update avatars"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'avatars');

-- Allow anyone to delete their avatars
CREATE POLICY "Allow delete avatars"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'avatars');
