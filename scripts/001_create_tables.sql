-- Create movies table for storing Ukrainian dubbed movies
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

-- Create dubbing table for storing Ukrainian dubbing information
CREATE TABLE IF NOT EXISTS dubbing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id INTEGER UNIQUE NOT NULL REFERENCES movies(tmdb_id) ON DELETE CASCADE,
  title_uk TEXT NOT NULL,
  studio TEXT NOT NULL,
  quality TEXT DEFAULT 'HD',
  has_subtitles BOOLEAN DEFAULT false,
  voice_actors TEXT,
  release_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id ON movies(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_movies_rating ON movies(rating DESC);
CREATE INDEX IF NOT EXISTS idx_movies_year ON movies(year DESC);
CREATE INDEX IF NOT EXISTS idx_movies_trending ON movies(is_trending) WHERE is_trending = true;
CREATE INDEX IF NOT EXISTS idx_dubbing_tmdb_id ON dubbing(tmdb_id);

-- Enable Row Level Security
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE dubbing ENABLE ROW LEVEL SECURITY;

-- Allow public read access to movies and dubbing (no auth required for viewing)
CREATE POLICY "Allow public read access to movies" ON movies
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to dubbing" ON dubbing
  FOR SELECT USING (true);
