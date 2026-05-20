-- 1. Drop the misleading "Only service role can read applications" SELECT policy
-- Service role bypasses RLS anyway, so this policy just adds confusion
DROP POLICY IF EXISTS "Only service role can read applications" ON public.applications;

-- 2. Add explicit deny policies for storage.objects on 'applications' bucket
-- Block SELECT (no one should download via client-side)
CREATE POLICY "Block all client downloads from applications bucket"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  CASE WHEN bucket_id = 'applications' THEN false ELSE true END
);

-- Block UPDATE on applications bucket
CREATE POLICY "Block all client updates on applications bucket"
ON storage.objects
FOR UPDATE
TO anon, authenticated
USING (
  CASE WHEN bucket_id = 'applications' THEN false ELSE true END
);

-- Block DELETE on applications bucket  
CREATE POLICY "Block all client deletes on applications bucket"
ON storage.objects
FOR DELETE
TO anon, authenticated
USING (
  CASE WHEN bucket_id = 'applications' THEN false ELSE true END
);