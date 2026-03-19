import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { searchDubbingWithAI } from '@/lib/ai-dubbing';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Search for Ukrainian dubbing using AI
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

    // Check if dubbing already exists in database
    const { data: existing } = await supabase
      .from('dubbing')
      .select('*')
      .eq('tmdb_id', tmdbId)
      .single();

    if (existing && !forceRefresh) {
      return NextResponse.json({ data: existing, cached: true });
    }

    // Fetch movie details from TMDB
    let movieData: any = null;
    if (TMDB_API_KEY) {
      try {
        const response = await fetch(
          `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&language=uk-UA`
        );
        if (response.ok) {
          movieData = await response.json();
        }
      } catch (e) {
        console.error('TMDB fetch error:', e);
      }
    }

    const movieTitle = movieData?.title || title;
    const movieTitleEn = movieData?.original_title || title;
    const year = movieData?.release_date 
      ? new Date(movieData.release_date).getFullYear() 
      : new Date().getFullYear();

    // Add to processing queue
    const { data: queueItem, error: queueError } = await supabase
      .from('ai_dubbing_queue')
      .insert([{
        tmdb_id: tmdbId,
        title: title,
        status: 'processing',
      }])
      .select()
      .single();

    if (queueError && queueError.code !== '23505') {
      console.error('Queue insert error:', queueError);
    }

    // Use AI to search for dubbing information
    const dubbingInfo = await searchDubbingWithAI(movieTitle, movieTitleEn, year);

    if (dubbingInfo && dubbingInfo.hasUkrainianDubbing && dubbingInfo.confidence >= 0.6) {
      // Ensure movie exists in database
      const posterUrl = movieData?.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}`
        : null;
      
      const backdropUrl = movieData?.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${movieData.backdrop_path}`
        : null;

      await supabase
        .from('movies')
        .upsert([{
          tmdb_id: tmdbId,
          title: movieTitle,
          title_en: movieTitleEn,
          description: movieData?.overview || '',
          rating: movieData?.vote_average || 0,
          year: year,
          duration: movieData?.runtime ? `${movieData.runtime} хв` : null,
          poster_url: posterUrl,
          backdrop_url: backdropUrl,
          genres: movieData?.genres?.map((g: any) => g.name) || [],
          has_voiceover: true,
          is_trending: (movieData?.popularity || 0) > 100,
        }], { onConflict: 'tmdb_id' });

      // Save dubbing information
      const { data: dubbing, error: dubbingError } = await supabase
        .from('dubbing')
        .upsert([{
          tmdb_id: tmdbId,
          title_uk: dubbingInfo.titleUk || movieTitle,
          studio: dubbingInfo.studio || 'Невідомо',
          quality: dubbingInfo.quality || 'HD',
          has_subtitles: dubbingInfo.hasSubtitles || false,
          voice_actors: dubbingInfo.voiceActors || null,
        }], { onConflict: 'tmdb_id' })
        .select()
        .single();

      if (dubbingError) {
        console.error('Dubbing insert error:', dubbingError);
      }

      // Update queue status
      if (queueItem?.id) {
        await supabase
          .from('ai_dubbing_queue')
          .update({
            status: 'completed',
            result: dubbing,
            processed_at: new Date().toISOString(),
          })
          .eq('id', queueItem.id);
      }

      return NextResponse.json({ 
        data: dubbing, 
        isNew: true,
        aiInfo: dubbingInfo 
      });
    } else {
      // Update queue status to failed
      if (queueItem?.id) {
        await supabase
          .from('ai_dubbing_queue')
          .update({
            status: 'failed',
            error: 'No Ukrainian dubbing found or low confidence',
            processed_at: new Date().toISOString(),
          })
          .eq('id', queueItem.id);
      }

      return NextResponse.json(
        { 
          error: 'No Ukrainian dubbing found for this movie',
          aiInfo: dubbingInfo 
        },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error('AI dubbing search error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get queue status and process pending items
export async function GET() {
  try {
    const supabase = await createClient();

    // Get queue statistics
    const { data: stats } = await supabase
      .from('ai_dubbing_queue')
      .select('status')
      .then(res => {
        const counts = { pending: 0, processing: 0, completed: 0, failed: 0 };
        res.data?.forEach((item: any) => {
          if (counts[item.status as keyof typeof counts] !== undefined) {
            counts[item.status as keyof typeof counts]++;
          }
        });
        return { data: counts };
      });

    // Get recent completions
    const { data: recent } = await supabase
      .from('ai_dubbing_queue')
      .select('*')
      .eq('status', 'completed')
      .order('processed_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      stats,
      recentCompletions: recent || [],
    });
  } catch (error: any) {
    console.error('Queue status error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
