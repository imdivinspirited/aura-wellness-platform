
-- Create mood_entries table for mood tracking
CREATE TABLE public.mood_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_id TEXT,
  mood TEXT NOT NULL CHECK (mood IN ('happy', 'calm', 'neutral', 'sad', 'depressed', 'stressed')),
  note TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for analytics queries
CREATE INDEX idx_mood_entries_user ON public.mood_entries(user_id, recorded_at DESC);
CREATE INDEX idx_mood_entries_mood ON public.mood_entries(mood);
CREATE INDEX idx_mood_entries_recorded ON public.mood_entries(recorded_at DESC);

-- Enable RLS
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

-- Users can view their own mood entries
CREATE POLICY "Users can view own mood entries"
ON public.mood_entries
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own mood entries
CREATE POLICY "Users can insert own mood entries"
ON public.mood_entries
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow anonymous inserts (for non-authenticated mood tracking)
CREATE POLICY "Anonymous can insert mood entries"
ON public.mood_entries
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL AND anonymous_id IS NOT NULL);
