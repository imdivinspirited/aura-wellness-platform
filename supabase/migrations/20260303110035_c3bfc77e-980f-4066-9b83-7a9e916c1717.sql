
-- Applications table for Seva & Career system
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  application_type TEXT NOT NULL CHECK (application_type IN ('seva', 'job', 'internship')),
  position TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT NOT NULL DEFAULT 'India',
  education TEXT,
  skills TEXT,
  available_from DATE,
  duration TEXT,
  why_join TEXT NOT NULL,
  resume_url TEXT,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Reviewed', 'Accepted', 'Rejected')),
  sheets_synced BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: public INSERT only, no SELECT/UPDATE/DELETE for anon
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert applications"
  ON public.applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Only service role can read applications"
  ON public.applications
  FOR SELECT
  TO authenticated
  USING (false);
