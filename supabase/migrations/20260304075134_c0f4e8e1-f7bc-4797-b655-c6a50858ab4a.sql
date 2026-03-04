-- Replace overly permissive upload policy with restricted one
DROP POLICY IF EXISTS "Anyone can upload application files" ON storage.objects;

-- Allow uploads only for valid file types in correct folders
CREATE POLICY "Restricted application file uploads"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'applications' AND
  (
    (
      (storage.foldername(name))[1] = 'resumes' AND
      lower(storage.extension(name)) = 'pdf'
    )
    OR
    (
      (storage.foldername(name))[1] = 'photos' AND
      lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png')
    )
  )
);