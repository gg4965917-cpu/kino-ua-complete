export interface Movie {
  id: number;
  title: string;
  titleEn: string;
  description: string;
  rating: number;
  year: number;
  duration: string;
  genre: string[];
  backdrop?: string;
  poster?: string;
  posterUrl?: string;
  backdropUrl?: string;
  director?: string;
  cast?: string[];
  hasVoiceover: boolean;
  trailer?: string;
  viewCount?: number;
  isTrending?: boolean;
  tmdbId?: number;
}

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG  = 'https://image.tmdb.org/t/p';

const GENRE_MAP: Record<number, string> = {
  28: 'Бойовик', 12: 'Пригоди', 16: 'Анімація', 35: 'Комедія',
  80: 'Кримінал', 99: 'Документальний', 18: 'Драма', 10751: 'Сімейний',
  14: 'Фентезі', 36: 'Історичний', 27: 'Жахи', 10402: 'Музика',
  9648: 'Містика', 10749: 'Романтика', 878: 'Sci-Fi', 53: 'Трилер',
  10752: 'Військовий', 37: 'Вестерн',
};

function mapGenres(ids: number[]): string[] {
  return ids.map(id => GENRE_MAP[id] || '').filter(Boolean).slice(0, 3);
}

const GRADIENTS = [
  'linear-gradient(135deg,#1a1a2e,#0f3460)',
  'linear-gradient(135deg,#0f2027,#2c5364)',
  'linear-gradient(135deg,#4a148c,#8e24aa)',
  'linear-gradient(135deg,#1f4037,#667db6)',
  'linear-gradient(135deg,#283048,#b8c6db)',
  'linear-gradient(135deg,#355c7d,#c06c84)',
  'linear-gradient(135deg,#fc4a1a,#ffd700)',
  'linear-gradient(135deg,#4b6cb7,#0a0e27)',
  'linear-gradient(135deg,#ee0979,#ffa726)',
  'linear-gradient(135deg,#232526,#667db6)',
];

export function tmdbToMovie(m: any): Movie {
  const year = m.release_date ? parseInt(m.release_date.split('-')[0]) : 0;
  const g = GRADIENTS[m.id % GRADIENTS.length];
  return {
    id: m.id,
    tmdbId: m.id,
    title: m.title || m.original_title || '',
    titleEn: m.original_title || '',
    description: m.overview || '',
    rating: Math.round((m.vote_average || 0) * 10) / 10,
    year,
    duration: m.runtime ? `${m.runtime} хв` : '',
    genre: mapGenres(m.genre_ids || []),
    poster: g, backdrop: g,
    posterUrl:  m.poster_path   ? `${TMDB_IMG}/w342${m.poster_path}`   : undefined,
    backdropUrl: m.backdrop_path ? `${TMDB_IMG}/w1280${m.backdrop_path}` : undefined,
    hasVoiceover: false,
    viewCount: m.popularity ? Math.round(m.popularity * 100) : 0,
    isTrending: (m.popularity || 0) > 100,
  };
}

async function tmdbGet(path: string, apiKey: string, timeout = 8000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const sep = path.includes('?') ? '&' : '?';
    const res = await fetch(`${TMDB_BASE}${path}${sep}api_key=${apiKey}&language=uk-UA`, {
      signal: controller.signal,
    });
    
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.status_message || `TMDB помилка ${res.status}`);
    }
    return res.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchPopularTMDB(apiKey: string): Promise<Movie[]> {
  if (!apiKey) return [];
  try {
    const data = await tmdbGet('/movie/popular?page=1', apiKey);
    return (data.results || []).map(tmdbToMovie);
  } catch (error) {
    console.warn('Помилка завантаження популярних фільмів:', error);
    return [];
  }
}

export async function fetchTopRatedTMDB(apiKey: string): Promise<Movie[]> {
  if (!apiKey) return [];
  try {
    const data = await tmdbGet('/movie/top_rated?page=1', apiKey);
    return (data.results || []).map(tmdbToMovie);
  } catch (error) {
    console.warn('Помилка завантаження топ фільмів:', error);
    return [];
  }
}

export async function fetchNowPlayingTMDB(apiKey: string): Promise<Movie[]> {
  if (!apiKey) return [];
  try {
    const data = await tmdbGet('/movie/now_playing?page=1', apiKey);
    return (data.results || []).map(tmdbToMovie);
  } catch (error) {
    console.warn('Помилка завантаження нових фільмів:', error);
    return [];
  }
}

export async function searchTMDB(query: string, apiKey: string): Promise<Movie[]> {
  if (!apiKey || !query.trim()) return [];
  try {
    const data = await tmdbGet(`/search/movie?query=${encodeURIComponent(query)}&page=1`, apiKey);
    return (data.results || []).slice(0, 20).map(tmdbToMovie);
  } catch (error) {
    console.warn('Помилка пошуку:', error);
    return [];
  }
}

export async function fetchMovieDetails(tmdbId: number, apiKey: string): Promise<Partial<Movie>> {
  if (!apiKey || !tmdbId) return {};
  try {
    const [details, credits] = await Promise.all([
      tmdbGet(`/movie/${tmdbId}`, apiKey),
      tmdbGet(`/movie/${tmdbId}/credits`, apiKey),
    ]);
    return {
      duration: details.runtime ? `${details.runtime} хв` : '',
      director: credits.crew?.find((c: any) => c.job === 'Director')?.name,
      cast: credits.cast?.slice(0, 5).map((c: any) => c.name) || [],
    };
  } catch (error) {
    console.warn('Помилка завантаження деталей фільму:', error);
    return {};
  }
}

export const staticMovies: Movie[] = [
  { id:1001, tmdbId:530915, title:'Захар Беркут',  titleEn:'Zakhar Berkut',  description:'Епічна боротьба карпатських горян проти монгольської навали.',    rating:8.2, year:2019, duration:'120 хв', genre:['Історичний','Драма','Бойовик'],   backdrop:GRADIENTS[0], poster:GRADIENTS[0], director:'Ахтем Сеітаблаєв', hasVoiceover:true,  viewCount:125000, isTrending:true  },
  { id:1002, tmdbId:465136, title:'Кіборги',       titleEn:'Cyborgs',        description:'Героїчна оборона Донецького аеропорту. Мужність та братерство.',    rating:8.5, year:2017, duration:'112 хв', genre:['Бойовик','Військовий','Драма'],   backdrop:GRADIENTS[3], poster:GRADIENTS[3], director:'Ахтем Сеітаблаєв', hasVoiceover:true,  viewCount:145000, isTrending:true  },
  { id:1003, tmdbId:610201, title:'Атлантида',     titleEn:'Atlantis',       description:'Постапокаліптична драма про ветерана у зруйнованому Донбасі.',       rating:7.8, year:2020, duration:'106 хв', genre:['Драма','Sci-Fi','Військовий'],    backdrop:GRADIENTS[1], poster:GRADIENTS[1], director:'Валентин Васянович', hasVoiceover:true,  viewCount:98000,  isTrending:true  },
  { id:1004, tmdbId:467531, title:'Ціна правди',   titleEn:'Mr. Jones',      description:'Журналіст розкриває правду про Голодомор в Україні.',               rating:8.1, year:2019, duration:'119 хв', genre:['Історичний','Драма','Біографія'], backdrop:GRADIENTS[4], poster:GRADIENTS[4], director:'Агнєшка Холланд',   hasVoiceover:true,  viewCount:112000, isTrending:true  },
  { id:1005, tmdbId:746969, title:'Стоп-Земля',    titleEn:'Stop-Earth',     description:'Фантастична драма про дівчину, яка може зупиняти час.',              rating:7.8, year:2020, duration:'105 хв', genre:['Sci-Fi','Драма'],                 backdrop:GRADIENTS[6], poster:GRADIENTS[6], director:'Катерина Горностай',hasVoiceover:true,  viewCount:83000,  isTrending:true  },
  { id:1006, tmdbId:572154, title:'Додому',        titleEn:'Home',           description:'Зворушлива драма про повернення. Родинні зв\'язки та пробачення.',   rating:7.9, year:2019, duration:'110 хв', genre:['Драма'],                          backdrop:GRADIENTS[5], poster:GRADIENTS[5], director:'Наріман Алієв',      hasVoiceover:true,  viewCount:76000,  isTrending:false },
  { id:1007, tmdbId:857041, title:'Бліндаж',       titleEn:'Blindage',       description:'Люди у прифронтовій зоні — їхня стійкість та надія на майбутнє.',    rating:8.0, year:2021, duration:'92 хв',  genre:['Драма','Військовий'],            backdrop:GRADIENTS[7], poster:GRADIENTS[7], director:'Олександр Течинський',hasVoiceover:true, viewCount:92000,  isTrending:true  },
  { id:1008, tmdbId:737173, title:'Толока',        titleEn:'Toloka',         description:'Містична історія: реальність переплітається з українським фольклором.',rating:7.5, year:2020, duration:'95 хв',  genre:['Трилер','Містика','Драма'],      backdrop:GRADIENTS[2], poster:GRADIENTS[2], director:'Михайло Іллєнко',    hasVoiceover:true,  viewCount:87000,  isTrending:false },
  { id:1009, tmdbId:192210, title:'Поводир',       titleEn:'The Guide',      description:'Американець в Україні 30-х під час Голодомору. Трагедія та стійкість.',rating:7.6, year:2014, duration:'99 хв',  genre:['Історичний','Драма'],            backdrop:GRADIENTS[8], poster:GRADIENTS[8], director:'Олесь Санін',        hasVoiceover:true,  viewCount:68000,  isTrending:false },
  { id:1010, tmdbId:619592, title:'Чорний ворон',  titleEn:'Black Raven',    description:'Атмосферний трилер — таємниці карпатських лісів та древні легенди.', rating:7.3, year:2019, duration:'87 хв',  genre:['Трилер','Містика'],              backdrop:GRADIENTS[9], poster:GRADIENTS[9], director:'Тарас Химич',        hasVoiceover:true,  viewCount:54000,  isTrending:false },
];

export const genres = [
  'all','Драма','Бойовик','Історичний','Sci-Fi','Трилер',
  'Містика','Військовий','Комедія','Фентезі','Романтика',
  'Біографія','Кримінал','Пригоди','Анімація','Жахи',
];

export const moviesData = staticMovies;

// Fetch movies with dubbing from Supabase
export async function fetchMoviesWithDubbing() {
  try {
    const response = await fetch('/api/movies-with-dubbing');
    if (!response.ok) return staticMovies;
    
    const { movies } = await response.json();
    if (!movies || movies.length === 0) return staticMovies;
    
    return movies.map((m: any) => ({
      id: m.id,
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
      backdrop: m.backdrop_url ? '' : GRADIENTS[m.tmdb_id % GRADIENTS.length],
      poster: m.poster_url ? '' : GRADIENTS[m.tmdb_id % GRADIENTS.length],
      hasVoiceover: true,
      viewCount: m.view_count || 0,
      isTrending: m.is_trending || false,
    }));
  } catch (error) {
    console.warn('Error fetching movies from database:', error);
    return staticMovies;
  }
}
