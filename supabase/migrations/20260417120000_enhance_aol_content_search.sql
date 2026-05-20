-- Richer full-text coverage (deep pages, long bodies, URLs) + higher hybrid recall

CREATE OR REPLACE FUNCTION public.aol_content_search_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.slug, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.summary, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.raw_content, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.category, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.venue, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.city, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'B') ||
    setweight(to_tsvector('english', coalesce(replace(coalesce(NEW.source_url, ''), '/', ' '), '')), 'D');
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- Refresh vectors for existing rows (one-time)
UPDATE public.aol_content SET updated_at = now();

CREATE OR REPLACE FUNCTION public.hybrid_search_aol_content(
  query_text text,
  query_embedding vector(768),
  content_types text[] DEFAULT NULL,
  only_upcoming boolean DEFAULT false,
  match_limit integer DEFAULT 10,
  keyword_weight float DEFAULT 0.35,
  vector_weight float DEFAULT 0.65
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
      OR c.summary ILIKE '%' || query_text || '%'
      OR c.raw_content ILIKE '%' || left(query_text, 400) || '%'
      OR c.source_url ILIKE '%' || left(query_text, 200) || '%'
      OR c.slug ILIKE '%' || left(query_text, 120) || '%'
      OR (c.embedding IS NOT NULL AND (c.embedding <=> query_embedding) < 1.12)
    )
  ORDER BY
    CASE WHEN c.start_date IS NOT NULL AND c.start_date >= CURRENT_DATE THEN 0 ELSE 1 END,
    combined_score DESC,
    c.start_date ASC NULLS LAST
  LIMIT match_limit;
END;
$$;

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
      OR c.summary ILIKE '%' || search_query || '%'
      OR c.raw_content ILIKE '%' || left(search_query, 400) || '%'
      OR c.source_url ILIKE '%' || left(search_query, 200) || '%'
      OR c.slug ILIKE '%' || left(search_query, 120) || '%'
    )
  ORDER BY
    CASE WHEN c.start_date IS NOT NULL AND c.start_date >= CURRENT_DATE THEN 0 ELSE 1 END,
    c.start_date ASC NULLS LAST,
    rank DESC
  LIMIT result_limit;
END;
$$;
