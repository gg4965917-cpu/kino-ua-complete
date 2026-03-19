import { createClient } from '@/lib/supabase/client';

export interface Dubbing {
  id?: string;
  tmdb_id: number;
  title_uk: string;
  studio: string;
  quality: string;
  has_subtitles: boolean;
  voice_actors?: string | null;
  video_url?: string | null;
  source_site?: string | null;
  release_date?: string;
  created_at?: string;
}

export async function getDubbingByTmdbId(tmdbId: number): Promise<Dubbing | null> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('dubbing')
      .select('*')
      .eq('tmdb_id', tmdbId)
      .single();

    if (error || !data) return null;
    return data as Dubbing;
  } catch (e) {
    console.error('Error getting dubbing:', e);
    return null;
  }
}

export async function getAllDubbings(): Promise<Dubbing[]> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('dubbing')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return [];
    return (data || []) as Dubbing[];
  } catch (e) {
    console.error('Error getting all dubbings:', e);
    return [];
  }
}

export async function addDubbing(dubbing: Omit<Dubbing, 'id' | 'release_date' | 'created_at'>): Promise<Dubbing | null> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('dubbing')
      .insert([{
        ...dubbing,
        release_date: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error || !data) return null;
    return data as Dubbing;
  } catch (e) {
    console.error('Error adding dubbing:', e);
    return null;
  }
}

// Search for Ukrainian dubbing for a movie using AI
export async function searchAndAddDubbing(tmdbId: number, title: string): Promise<Dubbing | null> {
  try {
    const response = await fetch('/api/ai-dubbing-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tmdbId, title }),
    });

    if (!response.ok) {
      return null;
    }

    const { data } = await response.json();
    return data as Dubbing;
  } catch (e) {
    console.error('Error searching dubbing:', e);
    return null;
  }
}
