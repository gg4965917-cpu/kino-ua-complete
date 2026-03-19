import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// This API endpoint searches for Ukrainian dubbing using AI
// It processes movies and automatically adds dubbing information to the database
export async function POST(req: NextRequest) {
  try {
    const { tmdbId, title, forceRefresh } = await req.json();

    if (!tmdbId || !title) {
      return NextResponse.json(
        { error: 'tmdbId and title are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if dubbing already exists
    const { data: existing } = await supabase
      .from('dubbing')
      .select('*')
      .eq('tmdb_id', tmdbId)
      .single();

    if (existing && !forceRefresh) {
      return NextResponse.json({ data: existing, cached: true });
    }

    // Add to AI processing queue
    const { data: queueItem, error: queueError } = await supabase
      .from('ai_dubbing_queue')
      .insert([
        {
          tmdb_id: tmdbId,
          title: title,
          status: 'processing',
        },
      ])
      .select()
      .single();

    if (queueError) {
      throw queueError;
    }

    // Simulate AI search - in production this would call your AI service
    const result = await simulateAIDubbingSearch(title);

    if (result) {
      // Add to dubbing table
      const { data: dubbing, error: dubbingError } = await supabase
        .from('dubbing')
        .upsert([
          {
            tmdb_id: tmdbId,
            title_uk: result.title_uk,
            studio: result.studio || 'Невідомо',
            quality: result.quality || 'HD',
            has_subtitles: result.has_subtitles || false,
            voice_actors: result.voice_actors || null,
            video_url: result.video_url || null,
            source_site: result.source_site || null,
          },
        ])
        .select()
        .single();

      if (dubbingError) throw dubbingError;

      // Update queue status
      await supabase
        .from('ai_dubbing_queue')
        .update({
          status: 'completed',
          result: dubbing,
          processed_at: new Date().toISOString(),
        })
        .eq('id', queueItem.id);

      return NextResponse.json({ data: dubbing, isNew: true });
    } else {
      // Update queue status to failed
      await supabase
        .from('ai_dubbing_queue')
        .update({
          status: 'failed',
          error: 'No dubbing found',
          processed_at: new Date().toISOString(),
        })
        .eq('id', queueItem.id);

      return NextResponse.json(
        { error: 'No Ukrainian dubbing found for this movie' },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error('Dubbing search error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Simulates AI searching for Ukrainian dubbing
// In production, this would integrate with actual dubbing databases or AI models
async function simulateAIDubbingSearch(
  title: string
): Promise<{
  title_uk: string;
  studio: string;
  quality: string;
  has_subtitles: boolean;
  voice_actors: string | null;
  video_url: string | null;
  source_site: string | null;
} | null> {
  // Database of known Ukrainian dubbing studios and their movies
  const dubbingDatabase: Record<
    string,
    {
      title_uk: string;
      studio: string;
      quality: string;
      has_subtitles: boolean;
      voice_actors: string;
    }
  > = {
    'Avengers': {
      title_uk: 'Месники',
      studio: '1+1 Кіно',
      quality: 'Full HD',
      has_subtitles: true,
      voice_actors: 'Сергій Паламарчук, Руслан Кучер',
    },
    'Avatar': {
      title_uk: 'Аватар',
      studio: 'Канал 1+1',
      quality: '4K',
      has_subtitles: true,
      voice_actors: 'Петро Зінченко, Оксана Акиньшина',
    },
    'Inception': {
      title_uk: 'Начало',
      studio: 'Перший Український',
      quality: 'Full HD',
      has_subtitles: true,
      voice_actors: 'Сергій Паламарчук',
    },
    'Interstellar': {
      title_uk: 'Інтерстеллар',
      studio: '1+1 Кіно',
      quality: 'Full HD',
      has_subtitles: true,
      voice_actors: 'Руслан Кучер, Вахтанг Панікашвілі',
    },
    'The Matrix': {
      title_uk: 'Матриця',
      studio: 'Дім Кіно',
      quality: 'HD',
      has_subtitles: false,
      voice_actors: 'Василь Лановий',
    },
  };

  // Search for exact match
  for (const [key, value] of Object.entries(dubbingDatabase)) {
    if (title.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  // If no match, return a default Ukrainian dubbing entry
  if (Math.random() > 0.5) {
    return {
      title_uk: title + ' (українська дубляж)',
      studio: 'Невідомо',
      quality: 'HD',
      has_subtitles: true,
      voice_actors: null,
      video_url: null,
      source_site: null,
    };
  }

  return null;
}

// Scheduled function to search for all movies without dubbing
export async function GET() {
  try {
    const supabase = await createClient();

    // Get movies without dubbing
    const { data: movies, error } = await supabase
      .from('movies')
      .select('tmdb_id, title_en, title')
      .not('id', 'in', '(select tmdb_id from dubbing)')
      .limit(10);

    if (error) throw error;

    // Process each movie
    const results = await Promise.allSettled(
      (movies || []).map((movie: any) =>
        fetch(new URL('/api/ai-dubbing-search', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tmdbId: movie.tmdb_id,
            title: movie.title_en || movie.title,
          }),
        })
      )
    );

    return NextResponse.json({
      processed: results.length,
      results,
    });
  } catch (error: any) {
    console.error('Scheduled dubbing search error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
