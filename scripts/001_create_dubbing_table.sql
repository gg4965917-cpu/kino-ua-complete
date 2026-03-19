-- Ukrainian dubbing/voiceover database
CREATE TABLE IF NOT EXISTS dubbing (
  id SERIAL PRIMARY KEY,
  tmdb_id INTEGER NOT NULL UNIQUE,
  title_ua TEXT NOT NULL,
  title_en TEXT,
  has_ua_voiceover BOOLEAN DEFAULT false,
  voiceover_studio TEXT,
  voiceover_quality TEXT CHECK (voiceover_quality IN ('professional', 'amateur', 'one_voice', 'multi_voice')),
  has_ua_subtitles BOOLEAN DEFAULT false,
  video_source TEXT,
  embed_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast TMDB lookups
CREATE INDEX IF NOT EXISTS idx_dubbing_tmdb_id ON dubbing(tmdb_id);

-- Insert some Ukrainian movies with dubbing info
INSERT INTO dubbing (tmdb_id, title_ua, title_en, has_ua_voiceover, voiceover_studio, voiceover_quality, has_ua_subtitles) VALUES
(530915, 'Захар Беркут', 'Zakhar Berkut', true, 'Оригінал', 'professional', true),
(465136, 'Кіборги', 'Cyborgs', true, 'Оригінал', 'professional', true),
(610201, 'Атлантида', 'Atlantis', true, 'Оригінал', 'professional', true),
(467531, 'Ціна правди', 'Mr. Jones', true, 'Студія Гармата', 'professional', true),
(746969, 'Стоп-Земля', 'Stop-Earth', true, 'Оригінал', 'professional', true),
(572154, 'Додому', 'Homeward', true, 'Оригінал', 'professional', true),
(857041, 'Бліндаж', 'Blindage', true, 'Оригінал', 'professional', true),
(737173, 'Толока', 'Toloka', true, 'Оригінал', 'professional', true),
(192210, 'Поводир', 'The Guide', true, 'Оригінал', 'professional', true),
(619592, 'Чорний ворон', 'Black Raven', true, 'Оригінал', 'professional', true)
ON CONFLICT (tmdb_id) DO NOTHING;
