import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { searchDubbingWithAI } from '@/lib/ai-dubbing';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMG = 'https://image.tmdb.org/t/p';

interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  popularity: number;
  genre_ids: number[];
  runtime?: number;
}

const GENRE_MAP: Record<number, string> = {
  28: 'Бойовик', 12: 'Пригоди', 16: 'Анімація', 35: 'Комедія',
  80: 'Кримінал', 99: 'Документальний', 18: 'Драма', 10751: 'Сімейний',
  14: 'Фентезі', 36: 'Історичний', 27: 'Жахи', 10402: 'Музика',
  9648: 'Містика', 10749: 'Романтика', 878: 'Sci-Fi', 53: 'Трилер',
  10752: 'Військовий', 37: 'Вестерн',
};

async function fetchTMDBMovies(endpoint: string, pages: number = 2): Promise<TMDBMovie[]> {
  if (!TMDB_API_KEY) return [];
  
  const movies: TMDBMovie[] = [];
  
  for (let page = 1; page <= pages; page++) {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}&language=uk-UA&page=${page}`,
        { next: { revalidate: 3600 } }
      );
      
      if (response.ok) {
        const data = await response.json();
        movies.push(...(data.results || []));
      }
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error);
    }
  }
  
  return movies;
}

// Collect and process movies from TMDB
export async function POST(req: NextRequest) {
  try {
    const { category = 'popular', limit = 20 } = await req.json();
    
    if (!TMDB_API_KEY) {
      return NextResponse.json(
        { error: 'TMDB_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const supabase = await createServiceClient();

    // Fetch movies from TMDB based on category
    let endpoint = '/movie/popular';
    if (category === 'now_playing') endpoint = '/movie/now_playing';
    else if (category === 'top_rated') endpoint = '/movie/top_rated';
    else if (category === 'upcoming') endpoint = '/movie/upcoming';

    const tmdbMovies = await fetchTMDBMovies(endpoint, Math.ceil(limit / 20));
    const moviesToProcess = tmdbMovies.slice(0, limit);

    const processed: any[] = [];
    const skipped: any[] = [];
    const errors: any[] = [];

    for (const movie of moviesToProcess) {
      try {
        // Check if movie already has dubbing
        const { data: existingDubbing } = await supabase
          .from('dubbing')
          .select('tmdb_id')
          .eq('tmdb_id', movie.id)
          .single();

        if (existingDubbing) {
          skipped.push({ tmdbId: movie.id, title: movie.title, reason: 'Already has dubbing' });
          continue;
        }

        const year = movie.release_date 
          ? new Date(movie.release_date).getFullYear() 
          : new Date().getFullYear();

        // Use AI to check for Ukrainian dubbing
        const dubbingInfo = await searchDubbingWithAI(
          movie.title, 
          movie.original_title, 
          year
        );

        if (dubbingInfo && dubbingInfo.hasUkrainianDubbing && dubbingInfo.confidence >= 0.6) {
          // Get movie details for runtime
          let runtime = null;
          try {
            const detailsRes = await fetch(
              `${TMDB_BASE_URL}/movie/${movie.id}?api_key=${TMDB_API_KEY}&language=uk-UA`
            );
            if (detailsRes.ok) {
              const details = await detailsRes.json();
              runtime = details.runtime ? `${details.runtime} хв` : null;
            }
          } catch {}

          // Add movie to database
          const { error: movieError } = await supabase
            .from('movies')
            .upsert([{
              tmdb_id: movie.id,
              title: movie.title || movie.original_title,
              title_en: movie.original_title,
              description: movie.overview || '',
              rating: Math.round((movie.vote_average || 0) * 10) / 10,
              year,
              duration: runtime,
              genres: movie.genre_ids?.map(id => GENRE_MAP[id]).filter(Boolean) || [],
              poster_url: movie.poster_path 
                ? `${TMDB_IMG}/w500${movie.poster_path}` 
                : null,
              backdrop_url: movie.backdrop_path 
                ? `${TMDB_IMG}/w1280${movie.backdrop_path}` 
                : null,
              has_voiceover: true,
              is_trending: (movie.popularity || 0) > 100,
              view_count: Math.round((movie.popularity || 0) * 100),
            }], { onConflict: 'tmdb_id' });

          if (movieError) {
            errors.push({ tmdbId: movie.id, title: movie.title, error: movieError.message });
            continue;
          }

          // Add dubbing information
          const { error: dubbingError } = await supabase
            .from('dubbing')
            .upsert([{
              tmdb_id: movie.id,
              title_uk: dubbingInfo.titleUk || movie.title,
              studio: dubbingInfo.studio || 'Невідомо',
              quality: dubbingInfo.quality || 'HD',
              has_subtitles: dubbingInfo.hasSubtitles || false,
              voice_actors: dubbingInfo.voiceActors || null,
            }], { onConflict: 'tmdb_id' });

          if (dubbingError) {
            errors.push({ tmdbId: movie.id, title: movie.title, error: dubbingError.message });
            continue;
          }

          processed.push({
            tmdbId: movie.id,
            title: movie.title,
            titleUk: dubbingInfo.titleUk,
            studio: dubbingInfo.studio,
            confidence: dubbingInfo.confidence,
          });
        } else {
          skipped.push({ 
            tmdbId: movie.id, 
            title: movie.title, 
            reason: 'No Ukrainian dubbing found',
            confidence: dubbingInfo?.confidence || 0,
          });
        }

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error: any) {
        errors.push({ tmdbId: movie.id, title: movie.title, error: error.message });
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: moviesToProcess.length,
        processed: processed.length,
        skipped: skipped.length,
        errors: errors.length,
      },
      processed,
      skipped,
      errors,
    });
  } catch (error: any) {
    console.error('Movie collection error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get collection status
export async function GET() {
  try {
    const supabase = await createServiceClient();

    // Get counts
    const [moviesResult, dubbingResult, queueResult] = await Promise.all([
      supabase.from('movies').select('id', { count: 'exact', head: true }),
      supabase.from('dubbing').select('id', { count: 'exact', head: true }),
      supabase.from('ai_dubbing_queue').select('status'),
    ]);

    const queueStats = { pending: 0, processing: 0, completed: 0, failed: 0 };
    queueResult.data?.forEach((item: any) => {
      if (queueStats[item.status as keyof typeof queueStats] !== undefined) {
        queueStats[item.status as keyof typeof queueStats]++;
      }
    });

    // Get recently added movies with dubbing
    const { data: recentMovies } = await supabase
      .from('movies')
      .select(`
        tmdb_id,
        title,
        title_en,
        poster_url,
        year,
        rating,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      stats: {
        totalMovies: moviesResult.count || 0,
        totalDubbings: dubbingResult.count || 0,
        queue: queueStats,
      },
      recentMovies: recentMovies || [],
    });
  } catch (error: any) {
    console.error('Collection status error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
