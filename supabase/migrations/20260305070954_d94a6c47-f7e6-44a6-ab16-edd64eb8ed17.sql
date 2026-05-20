
-- Drop the overly permissive restrictive policy on aol_content
-- Default deny (RLS enabled + no policies) achieves the same security effect
-- Only service role can access, which is the intended behavior
DROP POLICY IF EXISTS "Service role manages content" ON public.aol_content;
