import { createClient } from '@/lib/supabase/client';

export interface Dubbing {
  id: string;
  tmdb_id: number;
  title_uk: string;
  studio: string;
  quality: string;
  has_subtitles: boolean;
  voice_actors: string | null;
  release_date: string;
}

export async function getDubbingByTmdbId(tmdbId: number): Promise<Dubbing | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('dubbing')
    .select('*')
    .eq('tmdb_id', tmdbId)
    .single();

  if (error || !data) return null;
  return data as Dubbing;
}

export async function getAllDubbings(): Promise<Dubbing[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('dubbing')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return [];
  return (data || []) as Dubbing[];
}

export async function addDubbing(dubbing: Omit<Dubbing, 'id' | 'release_date'>): Promise<Dubbing | null> {
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
}
