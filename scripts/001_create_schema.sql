-- Create movies table
CREATE TABLE IF NOT EXISTS public.movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id INTEGER UNIQUE NOT NULL,
  title TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description TEXT,
  rating DECIMAL(3,1) DEFAULT 0,
  year INTEGER,
  duration TEXT,
  genres TEXT[] DEFAULT '{}',
  poster_url TEXT,
  backdrop_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create dubbing table
CREATE TABLE IF NOT EXISTS public.dubbing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id INTEGER UNIQUE NOT NULL,
  title_uk TEXT NOT NULL,
  studio TEXT NOT NULL,
  quality TEXT DEFAULT 'HD',
  has_subtitles BOOLEAN DEFAULT false,
  voice_actors TEXT,
  video_url TEXT,
  source_site TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ai_dubbing_queue table
CREATE TABLE IF NOT EXISTS public.ai_dubbing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  result JSONB,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id ON public.movies(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_dubbing_tmdb_id ON public.dubbing(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_ai_queue_status ON public.ai_dubbing_queue(status);
