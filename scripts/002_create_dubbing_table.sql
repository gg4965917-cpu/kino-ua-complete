-- Create dubbing table for storing Ukrainian dubbing information
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
