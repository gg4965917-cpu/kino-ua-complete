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
