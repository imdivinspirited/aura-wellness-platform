
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Add embedding column to aol_content
ALTER TABLE public.aol_content 
ADD COLUMN IF NOT EXISTS embedding vector(768);

-- Create index for fast vector similarity search
CREATE INDEX IF NOT EXISTS idx_aol_content_embedding 
ON public.aol_content 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 20);

-- Create hybrid search function combining tsvector + vector similarity
CREATE OR REPLACE FUNCTION public.hybrid_search_aol_content(
  query_text text,
  query_embedding vector(768),
  content_types text[] DEFAULT NULL,
  only_upcoming boolean DEFAULT false,
  match_limit integer DEFAULT 10,
  keyword_weight float DEFAULT 0.4,
  vector_weight float DEFAULT 0.6
)
RETURNS TABLE(
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
  combined_score float
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
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
    (
      keyword_weight * COALESCE(ts_rank_cd(c.search_vector, websearch_to_tsquery('english', query_text)), 0)::float +
      vector_weight * CASE 
        WHEN c.embedding IS NOT NULL THEN (1.0 - (c.embedding <=> query_embedding))::float 
        ELSE 0.0 
      END
    ) AS combined_score
  FROM public.aol_content c
  WHERE c.is_active = true
    AND (content_types IS NULL OR c.content_type = ANY(content_types))
    AND (NOT only_upcoming OR c.start_date IS NULL OR c.start_date >= CURRENT_DATE)
    AND (
      c.search_vector @@ websearch_to_tsquery('english', query_text)
      OR c.title ILIKE '%' || query_text || '%'
      OR c.description ILIKE '%' || query_text || '%'
      OR c.category ILIKE '%' || query_text || '%'
      OR (c.embedding IS NOT NULL AND (c.embedding <=> query_embedding) < 0.8)
    )
  ORDER BY
    CASE WHEN c.start_date IS NOT NULL AND c.start_date >= CURRENT_DATE THEN 0 ELSE 1 END,
    combined_score DESC,
    c.start_date ASC NULLS LAST
  LIMIT match_limit;
END;
$$;
