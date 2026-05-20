
-- Fix search path on trigger function
CREATE OR REPLACE FUNCTION public.aol_content_search_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
