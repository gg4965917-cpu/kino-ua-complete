import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Get all movies that have Ukrainian dubbing
export async function GET(req: NextRequest) {
  try {
    const supabase = await createServiceClient();
    const { searchParams } = new URL(req.url);
    
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sort') || 'created_at';
    const genre = searchParams.get('genre');
    const year = searchParams.get('year');
    const search = searchParams.get('search');
    const trending = searchParams.get('trending');

    // Build query for movies with dubbing
    let query = supabase
      .from('movies')
      .select(`
        *,
        dubbing:dubbing(*)
      `, { count: 'exact' });

    // Apply filters
    if (genre && genre !== 'all') {
      query = query.contains('genres', [genre]);
    }
    
    if (year) {
      query = query.eq('year', parseInt(year));
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,title_en.ilike.%${search}%`);
    }

    if (trending === 'true') {
      query = query.eq('is_trending', true);
    }

    // Apply sorting
    if (sortBy === 'rating') {
      query = query.order('rating', { ascending: false });
    } else if (sortBy === 'year') {
      query = query.order('year', { ascending: false });
    } else if (sortBy === 'title') {
      query = query.order('title', { ascending: true });
    } else if (sortBy === 'popularity') {
      query = query.order('view_count', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: movies, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ movies: [], total: 0, hasMore: false });
    }

    // Transform to match frontend Movie interface
    const transformedMovies = (movies || []).map((m: any) => ({
      id: m.tmdb_id,
      tmdbId: m.tmdb_id,
      title: m.title,
      titleEn: m.title_en,
      description: m.description || '',
      rating: m.rating || 0,
      year: m.year || 0,
      duration: m.duration || '',
      genre: m.genres || [],
      posterUrl: m.poster_url,
      backdropUrl: m.backdrop_url,
      director: m.director,
      cast: m.cast_members || [],
      hasVoiceover: true,
      viewCount: m.view_count || 0,
      isTrending: m.is_trending || false,
      dubbing: m.dubbing?.[0] ? {
        studio: m.dubbing[0].studio,
        quality: m.dubbing[0].quality,
        hasSubtitles: m.dubbing[0].has_subtitles,
        voiceActors: m.dubbing[0].voice_actors,
      } : null,
    }));

    return NextResponse.json({
      movies: transformedMovies,
      total: count || transformedMovies.length,
      hasMore: transformedMovies.length === limit,
    });
  } catch (error: any) {
    console.error('Movies API error:', error);
    return NextResponse.json(
      { movies: [], total: 0, hasMore: false, error: error.message },
      { status: 500 }
    );
  }
}
