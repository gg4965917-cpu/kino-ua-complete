import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// This endpoint automatically searches for Ukrainian dubbing for movies without it
// Can be called by a cron job (e.g., Vercel Crons) to run periodically
export async function GET() {
  try {
    const supabase = await createClient();

    // Get movies that don't have dubbing yet
    const { data: moviesWithoutDubbing, error: fetchError } = await supabase
      .from('movies')
      .select('id, tmdb_id, title, title_en')
      .not('tmdb_id', 'in', '(SELECT DISTINCT tmdb_id FROM dubbing)')
      .limit(5); // Process 5 at a time

    if (fetchError) {
      console.error('Error fetching movies:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch movies', processed: 0 },
        { status: 500 }
      );
    }

    if (!moviesWithoutDubbing || moviesWithoutDubbing.length === 0) {
      return NextResponse.json({ message: 'No movies to process', processed: 0 });
    }

    // Process each movie
    const results = await Promise.allSettled(
      moviesWithoutDubbing.map((movie: any) =>
        fetch(
          new URL(
            '/api/ai-dubbing-search',
            process.env.NEXTAUTH_URL || 'http://localhost:3000'
          ),
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tmdbId: movie.tmdb_id,
              title: movie.title_en || movie.title,
            }),
          }
        )
      )
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`Dubbing search completed: ${successful} successful, ${failed} failed`);

    return NextResponse.json({
      processed: moviesWithoutDubbing.length,
      successful,
      failed,
      message: 'Dubbing search completed',
    });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error', processed: 0 },
      { status: 500 }
    );
  }
}
