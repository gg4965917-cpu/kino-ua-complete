import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch movies with their dubbing information
    const { data: movies, error } = await supabase
      .from('movies')
      .select(`
        *,
        dubbing:dubbing(*)
      `)
      .order('is_trending', { ascending: false })
      .order('view_count', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ movies: [] });
    }

    // Enhance movies with dubbing info
    const enrichedMovies = (movies || []).map((movie: any) => ({
      ...movie,
      has_dubbing: movie.dubbing && movie.dubbing.length > 0,
      dubbing_info: movie.dubbing?.[0] || null,
    }));

    return NextResponse.json({ movies: enrichedMovies });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ movies: [] });
  }
}
