-- Enable Row Level Security
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE dubbing ENABLE ROW LEVEL SECURITY;

-- Allow public read access to movies and dubbing (no auth required for viewing)
CREATE POLICY "Allow public read access to movies" ON movies
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to dubbing" ON dubbing
  FOR SELECT USING (true);

-- Allow inserts for the API
CREATE POLICY "Allow public insert to movies" ON movies
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to movies" ON movies
  FOR UPDATE USING (true);

CREATE POLICY "Allow public insert to dubbing" ON dubbing
  FOR INSERT WITH CHECK (true);
