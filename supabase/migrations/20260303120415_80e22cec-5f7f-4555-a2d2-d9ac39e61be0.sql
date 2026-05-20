
-- 1. Make applications storage bucket private
UPDATE storage.buckets SET public = false WHERE id = 'applications';

-- 2. Drop overly permissive public read policy
DROP POLICY IF EXISTS "Public read access for application files" ON storage.objects;
