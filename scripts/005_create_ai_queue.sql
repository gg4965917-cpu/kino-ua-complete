-- Create AI dubbing queue for automatic search
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

CREATE INDEX IF NOT EXISTS idx_ai_queue_status ON ai_dubbing_queue(status);

ALTER TABLE ai_dubbing_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to ai_queue" ON ai_dubbing_queue
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert to ai_queue" ON ai_dubbing_queue
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to ai_queue" ON ai_dubbing_queue
  FOR UPDATE USING (true);
