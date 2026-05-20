
-- Content storage table for RAG system
CREATE TABLE public.aol_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL DEFAULT 'program',
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  summary text NOT NULL DEFAULT '',
  venue text,
  city text,
  start_date date,
  end_date date,
  donation text,
  eligibility text,
  registration_link text,
  category text,
  tags text[] DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  source_url text,
  raw_content text NOT NULL DEFAULT '',
  metadata jsonb DEFAULT '{}',
  search_vector tsvector,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for full-text search
CREATE INDEX idx_aol_content_search ON public.aol_content USING gin(search_vector);

-- Index for date filtering
CREATE INDEX idx_aol_content_dates ON public.aol_content (start_date, end_date) WHERE is_active = true;

-- Index for content type
CREATE INDEX idx_aol_content_type ON public.aol_content (content_type) WHERE is_active = true;

-- Auto-update search_vector trigger
CREATE OR REPLACE FUNCTION public.aol_content_search_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.summary, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.category, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.venue, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.city, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'B');
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_aol_content_search
  BEFORE INSERT OR UPDATE ON public.aol_content
  FOR EACH ROW
  EXECUTE FUNCTION public.aol_content_search_update();

-- Search function for RAG queries
CREATE OR REPLACE FUNCTION public.search_aol_content(
  search_query text,
  content_types text[] DEFAULT NULL,
  only_upcoming boolean DEFAULT false,
  result_limit integer DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  content_type text,
  title text,
  description text,
  summary text,
  venue text,
  city text,
  start_date date,
  end_date date,
  donation text,
  eligibility text,
  registration_link text,
  category text,
  tags text[],
  source_url text,
  metadata jsonb,
  rank real
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.content_type,
    c.title,
    c.description,
    c.summary,
    c.venue,
    c.city,
    c.start_date,
    c.end_date,
    c.donation,
    c.eligibility,
    c.registration_link,
    c.category,
    c.tags,
    c.source_url,
    c.metadata,
    ts_rank_cd(c.search_vector, websearch_to_tsquery('english', search_query)) AS rank
  FROM public.aol_content c
  WHERE c.is_active = true
    AND (content_types IS NULL OR c.content_type = ANY(content_types))
    AND (NOT only_upcoming OR c.start_date IS NULL OR c.start_date >= CURRENT_DATE)
    AND (
      c.search_vector @@ websearch_to_tsquery('english', search_query)
      OR c.title ILIKE '%' || search_query || '%'
      OR c.description ILIKE '%' || search_query || '%'
      OR c.category ILIKE '%' || search_query || '%'
    )
  ORDER BY
    CASE WHEN c.start_date IS NOT NULL AND c.start_date >= CURRENT_DATE THEN 0 ELSE 1 END,
    c.start_date ASC NULLS LAST,
    rank DESC
  LIMIT result_limit;
END;
$$;

-- RLS: public read via function (SECURITY DEFINER), service role for writes
ALTER TABLE public.aol_content ENABLE ROW LEVEL SECURITY;

-- Only service role can insert/update/delete
CREATE POLICY "Service role manages content"
  ON public.aol_content
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
