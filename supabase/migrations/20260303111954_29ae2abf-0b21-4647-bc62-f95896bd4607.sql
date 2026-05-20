
-- Create storage bucket for applications
INSERT INTO storage.buckets (id, name, public)
VALUES ('applications', 'applications', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload to applications bucket
CREATE POLICY "Anyone can upload application files"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'applications');

-- Allow public read access to application files
CREATE POLICY "Public read access for application files"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'applications');
