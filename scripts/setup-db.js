import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSchema() {
  try {
    console.log('Creating movies table...');
    const { error: moviesError } = await supabase.rpc('exec', {
      sql: `
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
      `
    });

    if (moviesError) {
      console.error('Movies table error:', moviesError);
    } else {
      console.log('✓ Movies table created');
    }

    console.log('Creating dubbing table...');
    const { error: dubbingError } = await supabase.rpc('exec', {
      sql: `
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
      `
    });

    if (dubbingError) {
      console.error('Dubbing table error:', dubbingError);
    } else {
      console.log('✓ Dubbing table created');
    }

    console.log('Creating ai_dubbing_queue table...');
    const { error: queueError } = await supabase.rpc('exec', {
      sql: `
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
      `
    });

    if (queueError) {
      console.error('Queue table error:', queueError);
    } else {
      console.log('✓ AI Queue table created');
    }

    console.log('Creating indexes...');
    const { error: indexError } = await supabase.rpc('exec', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id ON public.movies(tmdb_id);
        CREATE INDEX IF NOT EXISTS idx_dubbing_tmdb_id ON public.dubbing(tmdb_id);
        CREATE INDEX IF NOT EXISTS idx_ai_queue_status ON public.ai_dubbing_queue(status);
      `
    });

    if (indexError) {
      console.error('Index error:', indexError);
    } else {
      console.log('✓ Indexes created');
    }

    console.log('\n✓ Schema setup complete!');
  } catch (error) {
    console.error('Setup error:', error);
    process.exit(1);
  }
}

createSchema();
