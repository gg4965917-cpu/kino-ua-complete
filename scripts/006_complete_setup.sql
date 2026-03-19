-- Complete database setup for UKRFLIX
-- Creates all tables with proper RLS policies

-- Movies table
CREATE TABLE IF NOT EXISTS movies (
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
  director TEXT,
  cast_members TEXT[] DEFAULT '{}',
  has_voiceover BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  is_trending BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dubbing table
CREATE TABLE IF NOT EXISTS dubbing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id INTEGER UNIQUE NOT NULL,
  title_uk TEXT NOT NULL,
  studio TEXT NOT NULL,
  quality TEXT DEFAULT 'HD',
  has_subtitles BOOLEAN DEFAULT false,
  voice_actors TEXT,
  video_url TEXT,
  source_site TEXT,
  release_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Queue table
CREATE TABLE IF NOT EXISTS ai_dubbing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  result JSONB,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id ON movies(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_movies_year ON movies(year);
CREATE INDEX IF NOT EXISTS idx_movies_rating ON movies(rating DESC);
CREATE INDEX IF NOT EXISTS idx_movies_trending ON movies(is_trending) WHERE is_trending = true;
CREATE INDEX IF NOT EXISTS idx_dubbing_tmdb_id ON dubbing(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_ai_queue_status ON ai_dubbing_queue(status);

-- Enable RLS
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE dubbing ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_dubbing_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for movies
DROP POLICY IF EXISTS "Allow public read access to movies" ON movies;
CREATE POLICY "Allow public read access to movies" ON movies
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert to movies" ON movies;
CREATE POLICY "Allow public insert to movies" ON movies
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update to movies" ON movies;
CREATE POLICY "Allow public update to movies" ON movies
  FOR UPDATE USING (true);

-- RLS Policies for dubbing
DROP POLICY IF EXISTS "Allow public read access to dubbing" ON dubbing;
CREATE POLICY "Allow public read access to dubbing" ON dubbing
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert to dubbing" ON dubbing;
CREATE POLICY "Allow public insert to dubbing" ON dubbing
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update to dubbing" ON dubbing;
CREATE POLICY "Allow public update to dubbing" ON dubbing
  FOR UPDATE USING (true);

-- RLS Policies for ai_dubbing_queue
DROP POLICY IF EXISTS "Allow public read access to ai_queue" ON ai_dubbing_queue;
CREATE POLICY "Allow public read access to ai_queue" ON ai_dubbing_queue
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert to ai_queue" ON ai_dubbing_queue;
CREATE POLICY "Allow public insert to ai_queue" ON ai_dubbing_queue
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update to ai_queue" ON ai_dubbing_queue;
CREATE POLICY "Allow public update to ai_queue" ON ai_dubbing_queue
  FOR UPDATE USING (true);
