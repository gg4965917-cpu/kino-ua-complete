'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search, Film, Star, Play, Info, ChevronLeft, ChevronRight,
  TrendingUp, X, Heart, Filter, SlidersHorizontal, Clock,
  Calendar, Volume2, VolumeX, Share2, ChevronDown, Menu,
  Sparkles, CheckCircle, RefreshCw, Tv, Monitor, Zap,
} from 'lucide-react';
import { useMovieStore } from '@/lib/store';
import {
  staticMovies, genres, Movie, tmdbToMovie,
  fetchPopularTMDB, fetchTopRatedTMDB, fetchNowPlayingTMDB,
  searchTMDB, fetchMovieDetails,
} from '@/lib/movies';
import { MovieCardSkeleton } from '@/components/Skeleton';
import ContinueWatching from '@/components/ContinueWatching';
import UserRating from '@/components/UserRating';
import RelatedMovies from '@/components/RelatedMovies';
import VideoPlayer from '@/components/VideoPlayer';
import Footer from '@/components/Footer';
import { getDubbingByTmdbId, searchAndAddDubbing, Dubbing } from '@/lib/dubbing';

const CATEGORIES = [
  { name: 'ГОЛОВНА', key: 'Головна', icon: Film },
  { name: 'ФІЛЬМИ', key: 'Популярне', icon: TrendingUp },
  { name: 'СЕРІАЛІ', key: 'Топ', icon: Star },
  { name: 'НОВИНКИ', key: 'Новинки', icon: Sparkles },
];

const QUICK_FILTERS = [
  { name: 'Комедії', genre: 'Комедія' },
  { name: 'Драми', genre: 'Драма' },
  { name: 'Бойовики', genre: 'Бойовик' },
  { name: 'Трилери', genre: 'Трилер' },
  { name: 'Фентезі', genre: 'Фентезі' },
  { name: 'Sci-Fi', genre: 'Sci-Fi' },
];

// Featured movie for hero - Dune: Part Two style
const FEATURED_HERO = {
  id: 693134,
  tmdbId: 693134,
  title: 'ДЮНА',
  subtitle: 'ЧАСТИНА ДРУГА',
  titleEn: 'Dune: Part Two',
  description: 'Пол Атрейдес об\'єднується з Чані та фременами, щоб помститися змовникам, які знищили його родину. Опинившись перед вибором між коханням свого життя та долею всесвіту, він намагається запобігти жахливому майбутньому, яке може передбачити тільки він.',
  rating: 8.5,
  year: 2024,
  duration: '166 хв',
  genre: ['Sci-Fi', 'Пригоди', 'Драма'],
  backdropUrl: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',
  posterUrl: 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
  hasVoiceover: true,
  isTrending: true,
};

export default function HomePage() {
  const {
    favorites, toggleFavorite,
    selectedGenre, setSelectedGenre,
    sortBy, setSortBy,
    voiceoverOnly, toggleVoiceoverOnly,
    searchQuery, setSearchQuery,
    activeCategory, setActiveCategory,
    selectedMovie, setSelectedMovie,
    isPlaying, setIsPlaying,
    addToHistory,
    resetFilters,
    userRatings,
    updateProgress,
    continueWatching,
    tmdbKey, setTmdbKey,
    allMovies, setAllMovies,
    addNotification,
  } = useMovieStore();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMovies, setIsFetchingMovies] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);

  const [movieDetailsCache, setMovieDetailsCache] = useState<Record<number, Partial<Movie>>>({});
  const [dubbingCache, setDubbingCache] = useState<Record<number, Dubbing | null>>({});

  const movies = allMovies.length > 0 ? allMovies : staticMovies;

  const loadTMDB = useCallback(async (category: string, key: string) => {
    if (!key) return;
    setIsFetchingMovies(true);
    try {
      let fetched: Movie[] = [];
      if (category === 'Популярне' || category === 'ФІЛЬМИ') fetched = await fetchPopularTMDB(key);
      else if (category === 'Топ' || category === 'СЕРІАЛІ') fetched = await fetchTopRatedTMDB(key);
      else if (category === 'Новинки' || category === 'НОВИНКИ') fetched = await fetchNowPlayingTMDB(key);
      else fetched = await fetchPopularTMDB(key);
      if (fetched.length) setAllMovies(fetched);
    } catch (e: any) {
      addNotification('TMDB: ' + e.message, 'error');
    } finally {
      setIsFetchingMovies(false);
    }
  }, [setAllMovies, addNotification]);

  const loadMovieDetails = useCallback(async (movie: Movie) => {
    if (!tmdbKey || !movie.tmdbId || movieDetailsCache[movie.id]) return;
    try {
      const details = await fetchMovieDetails(movie.tmdbId, tmdbKey);
      setMovieDetailsCache(prev => ({ ...prev, [movie.id]: details }));
    } catch {}
  }, [tmdbKey, movieDetailsCache]);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 800);
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    if (apiKey && !tmdbKey) {
      setTmdbKey(apiKey);
    }
  }, [tmdbKey, setTmdbKey]);

  useEffect(() => {
    if (tmdbKey) loadTMDB(activeCategory, tmdbKey);
  }, [activeCategory, tmdbKey, loadTMDB]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const heroMovies = useMemo(() =>
    movies.filter(m => m.isTrending).slice(0, 3), [movies]);
  const currentHero = heroMovies[currentSlide] || movies[0];

  useEffect(() => {
    if (!heroMovies.length) return;
    const t = setInterval(() =>
      setCurrentSlide(p => (p + 1) % heroMovies.length), 8000);
    return () => clearInterval(t);
  }, [heroMovies.length]);

  useEffect(() => {
    if (!searchQuery || !tmdbKey) return;
    const t = setTimeout(async () => {
      try {
        const results = await searchTMDB(searchQuery, tmdbKey);
        if (results.length) setAllMovies(results);
      } catch {}
    }, 600);
    return () => clearTimeout(t);
  }, [searchQuery, tmdbKey, setAllMovies]);

  const filteredMovies = useMemo(() => {
    let list = [...movies];

    if (activeCategory === 'Мій список') {
      return list
        .filter(m => favorites.includes(m.id))
        .sort((a, b) => b.rating - a.rating);
    }
    if (activeCategory === 'Переглянуті') {
      const ids = continueWatching.map(c => c.movieId);
      return list.filter(m => ids.includes(m.id));
    }
    if (activeCategory === 'Топ' || activeCategory === 'СЕРІАЛІ') {
      list = list.filter(m => m.rating >= 7.5);
    }
    if (activeCategory === 'Новинки' || activeCategory === 'НОВИНКИ') {
      list = list.filter(m => m.year >= new Date().getFullYear() - 2);
    }

    if (voiceoverOnly) list = list.filter(m => m.hasVoiceover);
    
    // Quick filter override
    if (activeQuickFilter) {
      const filterGenre = QUICK_FILTERS.find(f => f.name === activeQuickFilter)?.genre;
      if (filterGenre) {
        list = list.filter(m => m.genre.includes(filterGenre));
      }
    } else if (selectedGenre !== 'all') {
      list = list.filter(m => m.genre.includes(selectedGenre));
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(m =>
        m.title.toLowerCase().includes(q) ||
        m.titleEn.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      switch (sortBy) {
        case 'rating': return b.rating - a.rating;
        case 'year': return b.year - a.year;
        case 'title': return a.title.localeCompare(b.title, 'uk');
        case 'trending': return (b.viewCount || 0) - (a.viewCount || 0);
        case 'myrating': return (userRatings[b.id] || 0) - (userRatings[a.id] || 0);
      }
      return 0;
    });

    return list;
  }, [movies, voiceoverOnly, selectedGenre, searchQuery, sortBy, favorites,
      activeCategory, userRatings, continueWatching, activeQuickFilter]);

  const suggestions = useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return movies.filter(m =>
      m.title.toLowerCase().includes(q) || m.titleEn.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [searchQuery, movies]);

  const loadDubbing = useCallback(async (tmdbId: number, title?: string) => {
    if (dubbingCache[tmdbId] !== undefined) return;
    const info = await getDubbingByTmdbId(tmdbId);
    if (info) {
      setDubbingCache(prev => ({ ...prev, [tmdbId]: info }));
      return;
    }
    if (title) {
      const found = await searchAndAddDubbing(tmdbId, title);
      if (found) {
        setDubbingCache(prev => ({ ...prev, [tmdbId]: found }));
        addNotification('Українське дублювання знайдено!', 'success');
      }
    }
    setDubbingCache(prev => ({ ...prev, [tmdbId]: null }));
  }, [dubbingCache, addNotification]);

  const openMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    addToHistory(movie.id);
    loadMovieDetails(movie);
    if (movie.tmdbId) loadDubbing(movie.tmdbId, movie.title);
  };

  const playMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsPlaying(true);
    addToHistory(movie.id);
  };

  const handleShare = useCallback(async (movie: Movie) => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: movie.title, url });
      else { 
        await navigator.clipboard.writeText(url); 
        setShareSuccess(true); 
        setTimeout(() => setShareSuccess(false), 2500); 
      }
    } catch {}
  }, []);

  const handleQuickFilter = (filterName: string) => {
    if (activeQuickFilter === filterName) {
      setActiveQuickFilter(null);
    } else {
      setActiveQuickFilter(filterName);
    }
  };

  const nextSlide = () => setCurrentSlide(p => (p + 1) % heroMovies.length);
  const prevSlide = () => setCurrentSlide(p => (p - 1 + heroMovies.length) % heroMovies.length);

  const detailsOf = (m: Movie) => ({ ...m, ...(movieDetailsCache[m.id] || {}) });

  // Get quality badge for movie
  const getQualityBadge = (movie: Movie, index: number) => {
    // Simulate 4K for high-rated new movies, HD for others
    if (movie.rating >= 8 && movie.year >= 2022) return '4K';
    if (index % 3 === 0) return '4K';
    if (index % 2 === 0) return 'HD';
    return null;
  };

  if (isLoading) return (
    <div className="min-h-screen bg-ukr-dark-900 flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-ukr-blue-500/30 rounded-2xl blur-2xl animate-pulse" />
          <div className="relative bg-gradient-to-br from-ukr-blue-500 to-ukr-blue-700 p-5 rounded-2xl">
            <Film className="w-10 h-10 text-white" strokeWidth={2} />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black font-bebas tracking-wide">
            <span className="text-ukr-blue-400">UKR</span>
            <span className="text-white">FLIX</span>
          </h1>
          <p className="text-gray-500 text-sm">Завантаження...</p>
        </div>
        <div className="flex justify-center gap-1.5">
          {[0, 150, 300].map(d => (
            <div key={d} className="w-2 h-2 bg-ukr-blue-500 rounded-full animate-bounce" 
              style={{ animationDelay: `${d}ms` }} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ukr-dark-900 text-white">

      {/* Premium Glassmorphic Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled 
          ? 'glass-strong shadow-2xl shadow-black/50' 
          : 'bg-gradient-to-b from-ukr-dark-900/95 via-ukr-dark-900/60 to-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-10">
              <div 
                className="flex items-center gap-2 cursor-pointer group"
                onClick={() => { setActiveCategory('Головна'); resetFilters(); setActiveQuickFilter(null); }}
              >
                <h1 className="text-2xl md:text-3xl font-black font-bebas tracking-wider">
                  <span className="text-ukr-blue-400 group-hover:text-ukr-blue-300 transition-colors">UKR</span>
                  <span className="text-white">FLIX</span>
                </h1>
              </div>

              {/* Main Navigation */}
              <div className="hidden lg:flex items-center gap-8">
                {CATEGORIES.map(cat => (
                  <button 
                    key={cat.key}
                    onClick={() => { setActiveCategory(cat.key); resetFilters(); setActiveQuickFilter(null); }}
                    className={`relative text-sm font-semibold tracking-wide transition-all duration-300 py-2 ${
                      activeCategory === cat.key || activeCategory === cat.name
                        ? 'text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {cat.name}
                    {(activeCategory === cat.key || activeCategory === cat.name) && (
                      <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-ukr-blue-400 to-ukr-blue-600 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Search & Actions */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <div className={`flex items-center rounded-full transition-all duration-300 ${
                  isSearchFocused
                    ? 'bg-ukr-dark-700/90 border border-ukr-blue-500/50 w-64 md:w-80 focus-glow'
                    : 'bg-ukr-dark-700/50 border border-white/10 w-10 md:w-56'
                }`}>
                  <Search className={`w-5 h-5 text-gray-400 transition-all ${
                    isSearchFocused ? 'ml-4' : 'ml-2.5 md:ml-4'
                  }`} />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    placeholder="Пошук..."
                    className={`bg-transparent outline-none text-white placeholder-gray-500 py-2.5 pr-4 transition-all ${
                      isSearchFocused ? 'w-full ml-3' : 'w-0 md:w-full md:ml-3'
                    }`}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="mr-3 text-gray-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Search Suggestions */}
                {searchQuery && isSearchFocused && suggestions.length > 0 && (
                  <div className="absolute top-full mt-3 w-full md:w-96 right-0 glass-strong rounded-2xl overflow-hidden shadow-2xl animate-fadeIn">
                    <div className="p-3 text-xs text-gray-500 uppercase tracking-wider border-b border-white/10 flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-ukr-blue-400" />Результати
                    </div>
                    {suggestions.map(m => (
                      <div key={m.id} onClick={() => { openMovie(m); setSearchQuery(''); }}
                        className="p-4 hover:bg-white/5 cursor-pointer flex items-center gap-4 group transition-colors">
                        <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-ukr-dark-700">
                          {m.posterUrl
                            ? <img src={m.posterUrl} alt={m.title} className="w-full h-full object-cover" />
                            : <Film className="w-6 h-6 text-white/20 m-auto mt-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate group-hover:text-ukr-blue-400 transition-colors">{m.title}</div>
                          <div className="text-sm text-gray-500">{m.year} - {m.genre[0]}</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Star className="w-4 h-4 text-ukr-accent-gold fill-ukr-accent-gold" />
                          <span className="font-bold text-ukr-accent-gold">{m.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Menu */}
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl bg-ukr-dark-700/50 hover:bg-ukr-dark-600 border border-white/10 transition-colors">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 space-y-2 border-t border-white/10 pt-4 animate-fadeIn">
              {CATEGORIES.map(cat => (
                <button key={cat.key}
                  onClick={() => { setActiveCategory(cat.key); setMobileMenuOpen(false); resetFilters(); setActiveQuickFilter(null); }}
                  className={`flex items-center gap-3 w-full p-4 rounded-xl transition-all ${
                    activeCategory === cat.key
                      ? 'bg-ukr-blue-500/20 text-ukr-blue-400 border border-ukr-blue-500/30'
                      : 'text-gray-300 hover:bg-white/5 border border-transparent'
                  }`}>
                  <cat.icon className="w-5 h-5" />
                  <span className="font-semibold">{cat.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section - Dune Style */}
      <div className="relative h-screen min-h-[700px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
            style={{ 
              backgroundImage: currentHero?.backdropUrl 
                ? `url(${currentHero.backdropUrl})` 
                : FEATURED_HERO.backdropUrl 
                  ? `url(${FEATURED_HERO.backdropUrl})`
                  : 'none',
              backgroundColor: '#0a0a0f'
            }}
          />
          {/* Premium Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-ukr-dark-900 via-ukr-dark-900/60 to-ukr-dark-900/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-ukr-dark-900/90 via-transparent to-ukr-dark-900/50" />
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-ukr-dark-900 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 md:px-8 w-full pt-20">
            <div className="max-w-2xl space-y-6 animate-fadeInUp">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-ukr-blue-500/20 border border-ukr-blue-500/40 text-ukr-blue-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />Ексклюзив
                </span>
                <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-4 py-1.5 rounded-full border border-ukr-accent-gold/30">
                  <Star className="w-4 h-4 text-ukr-accent-gold fill-ukr-accent-gold" />
                  <span className="font-bold text-ukr-accent-gold">{currentHero?.rating || FEATURED_HERO.rating}</span>
                </span>
                <span className="badge-4k">4K HDR</span>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-5xl md:text-8xl font-black font-bebas leading-none tracking-tight">
                  <span className="gradient-text drop-shadow-2xl">
                    {currentHero?.title || FEATURED_HERO.title}
                  </span>
                </h1>
                {FEATURED_HERO.subtitle && !currentHero && (
                  <h2 className="text-3xl md:text-5xl font-black font-bebas text-ukr-blue-400 mt-2">
                    {FEATURED_HERO.subtitle}
                  </h2>
                )}
                <p className="text-gray-400 text-lg mt-3">
                  {currentHero?.titleEn || FEATURED_HERO.titleEn} - {currentHero?.year || FEATURED_HERO.year}
                </p>
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-ukr-blue-400" />
                  {currentHero?.duration || FEATURED_HERO.duration}
                </span>
                <span className="text-gray-600">|</span>
                <span>{(currentHero?.genre || FEATURED_HERO.genre).join(' - ')}</span>
              </div>

              {/* Description */}
              <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-xl line-clamp-3">
                {currentHero?.description || FEATURED_HERO.description}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button 
                  onClick={() => playMovie(currentHero || FEATURED_HERO as any)}
                  className="btn-primary flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-white hover:scale-105 transition-transform"
                >
                  <Play className="w-6 h-6 fill-white" />
                  <span className="text-lg">ДИВИТИСЯ</span>
                </button>
                <button 
                  onClick={() => openMovie(currentHero || FEATURED_HERO as any)}
                  className="flex items-center gap-3 glass border border-white/20 px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all"
                >
                  <Info className="w-5 h-5" />
                  <span>ІНФО</span>
                </button>
                <button 
                  onClick={() => toggleFavorite((currentHero || FEATURED_HERO as any).id)}
                  className={`p-4 rounded-xl border transition-all ${
                    favorites.includes((currentHero || FEATURED_HERO as any).id)
                      ? 'bg-red-500/20 border-red-500/40 text-red-400'
                      : 'glass border-white/20 hover:bg-white/10'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${favorites.includes((currentHero || FEATURED_HERO as any).id) ? 'fill-red-400' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Navigation */}
        {heroMovies.length > 1 && (
          <>
            <button onClick={prevSlide} 
              className="absolute left-6 top-1/2 -translate-y-1/2 glass border border-white/20 p-4 rounded-full hover:bg-white/10 transition-all group z-10">
              <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </button>
            <button onClick={nextSlide} 
              className="absolute right-6 top-1/2 -translate-y-1/2 glass border border-white/20 p-4 rounded-full hover:bg-white/10 transition-all group z-10">
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
              {heroMovies.map((_, i) => (
                <button key={i} onClick={() => setCurrentSlide(i)}
                  className={`transition-all rounded-full ${
                    i === currentSlide
                      ? 'bg-ukr-blue-500 w-12 h-2 shadow-lg shadow-ukr-blue-500/50'
                      : 'bg-white/20 w-8 h-2 hover:bg-white/40'
                  }`} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Quick Filter Chips */}
      <div className="bg-ukr-dark-900 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <span className="text-gray-500 text-sm font-medium whitespace-nowrap mr-2">Швидкі фільтри:</span>
            {QUICK_FILTERS.map(filter => (
              <button
                key={filter.name}
                onClick={() => handleQuickFilter(filter.name)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeQuickFilter === filter.name
                    ? 'chip-active'
                    : 'chip'
                }`}
              >
                {filter.name}
              </button>
            ))}
            {activeQuickFilter && (
              <button
                onClick={() => setActiveQuickFilter(null)}
                className="whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Скинути
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Continue Watching */}
      <ContinueWatching />

      {/* Movies Grid Section */}
      <div className="bg-ukr-dark-900 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-black font-bebas gradient-text-blue">
                Рекомендовано для вас
              </h2>
              <div className="h-1 w-20 bg-gradient-to-r from-ukr-blue-500 to-ukr-blue-700 rounded-full mt-2" />
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              {isFetchingMovies && <RefreshCw className="w-4 h-4 animate-spin text-ukr-blue-400" />}
              <span>Знайдено: <span className="font-bold text-ukr-blue-400">{filteredMovies.length}</span></span>
            </div>
          </div>

          {/* Movie Grid - 6 columns on XL */}
          {filteredMovies.length === 0 ? (
            <div className="text-center py-24">
              <Film className="w-24 h-24 mx-auto opacity-10 mb-6" />
              <h3 className="text-2xl font-bold text-gray-400 mb-3">Нічого не знайдено</h3>
              <p className="text-gray-500 mb-6">Спробуйте змінити фільтри або пошуковий запит</p>
              <button onClick={() => { resetFilters(); setActiveQuickFilter(null); }}
                className="btn-primary px-8 py-3 rounded-xl font-bold text-white">
                Скинути фільтри
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
              {filteredMovies.map((movie, idx) => {
                const myRating = userRatings[movie.id];
                const cw = continueWatching.find(c => c.movieId === movie.id);
                const qualityBadge = getQualityBadge(movie, idx);
                
                return (
                  <div 
                    key={movie.id} 
                    className="group cursor-pointer animate-fadeIn card-premium"
                    style={{ animationDelay: `${idx * 30}ms` }}
                    onClick={() => openMovie(movie)}
                  >
                    {/* Poster Container */}
                    <div className="relative overflow-hidden rounded-xl aspect-[2/3] mb-3 bg-ukr-dark-700 border border-white/5 group-hover:border-ukr-blue-500/50">
                      {/* Poster Image */}
                      <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-110">
                        {movie.posterUrl ? (
                          <img 
                            src={movie.posterUrl} 
                            alt={movie.title} 
                            className="w-full h-full object-cover" 
                            loading="lazy" 
                          />
                        ) : (
                          <div 
                            className="absolute inset-0 flex items-center justify-center"
                            style={{ background: movie.poster }}
                          >
                            <Film className="w-16 h-16 text-white/10" />
                          </div>
                        )}
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-ukr-dark-900 via-ukr-dark-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4">
                        <div className="transform scale-75 group-hover:scale-100 transition-transform duration-300">
                          <div className="bg-ukr-blue-500 p-4 rounded-full shadow-2xl shadow-ukr-blue-500/50 mb-4">
                            <Play className="w-8 h-8 text-white fill-white" />
                          </div>
                        </div>
                        <p className="text-xs text-center line-clamp-2 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                          {movie.description}
                        </p>
                      </div>

                      {/* Rating Badge */}
                      <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-ukr-accent-gold/30">
                        <Star className="w-3.5 h-3.5 text-ukr-accent-gold fill-ukr-accent-gold star-rating" />
                        <span className="text-xs font-bold text-white">{movie.rating}</span>
                      </div>

                      {/* Quality Badge */}
                      {qualityBadge && (
                        <div className={`absolute top-3 right-3 ${qualityBadge === '4K' ? 'badge-4k' : 'badge-hd'}`}>
                          {qualityBadge}
                        </div>
                      )}

                      {/* Favorite Button */}
                      <button 
                        onClick={e => { e.stopPropagation(); toggleFavorite(movie.id); }}
                        className="absolute top-12 right-3 p-2 bg-black/60 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 border border-white/10"
                      >
                        <Heart className={`w-4 h-4 ${favorites.includes(movie.id) ? 'fill-red-400 text-red-400' : 'text-white'}`} />
                      </button>

                      {/* UA Badge */}
                      {movie.hasVoiceover && (
                        <div className="absolute bottom-3 left-3 bg-ukr-blue-500/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1.5">
                          <Volume2 className="w-3 h-3 text-white" />
                          <span className="text-xs font-bold text-white">UA</span>
                        </div>
                      )}

                      {/* Trending Badge */}
                      {movie.isTrending && (
                        <div className="absolute bottom-3 right-3 bg-ukr-accent-gold/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-black" />
                          <span className="text-xs font-bold text-black">TOP</span>
                        </div>
                      )}

                      {/* Progress Bar */}
                      {cw && cw.progress > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/80">
                          <div className="h-full bg-gradient-to-r from-ukr-blue-500 to-ukr-blue-400" style={{ width: `${cw.progress}%` }} />
                        </div>
                      )}
                    </div>

                    {/* Movie Info */}
                    <div className="space-y-1">
                      <h3 className="font-semibold text-sm text-white line-clamp-1 group-hover:text-ukr-blue-400 transition-colors">
                        {movie.title}
                      </h3>
                      {/* Star Rating Display */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                              key={star} 
                              className={`w-3 h-3 ${
                                star <= Math.round(movie.rating / 2) 
                                  ? 'text-ukr-accent-gold fill-ukr-accent-gold' 
                                  : 'text-gray-600'
                              }`} 
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">{movie.year}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Movie Modal */}
      {selectedMovie && (() => {
        const m = detailsOf(selectedMovie);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fadeIn">
            <div className="bg-ukr-dark-800 rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl animate-scaleIn">
              {/* Modal Header with Backdrop */}
              <div className="relative h-72 md:h-96 overflow-hidden rounded-t-3xl">
                <div className="absolute inset-0">
                  {m.backdropUrl ? (
                    <img src={m.backdropUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full" style={{ background: m.backdrop }} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ukr-dark-800 via-ukr-dark-800/60 to-transparent" />
                </div>
                
                <button 
                  onClick={() => { setSelectedMovie(null); setIsPlaying(false); }}
                  className="absolute top-6 right-6 p-3 bg-black/60 backdrop-blur-md rounded-full hover:bg-black/80 transition-colors border border-white/20"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h2 className="text-4xl md:text-6xl font-black font-bebas gradient-text">{m.title}</h2>
                  <p className="text-gray-400 text-lg mt-2">{m.titleEn}</p>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-8 space-y-8">
                {/* Video Player */}
                {isPlaying ? (
                  <div className="space-y-4">
                    {m.tmdbId ? (
                      <VideoPlayer 
                        tmdbId={m.tmdbId} 
                        title={m.title} 
                        onClose={() => setIsPlaying(false)}
                      />
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-ukr-dark-700 to-ukr-dark-800 rounded-2xl border border-white/10 flex items-center justify-center">
                        <div className="text-center space-y-4 p-8">
                          <div className="relative">
                            <div className="absolute inset-0 bg-ukr-blue-500/20 rounded-full blur-xl animate-pulse" />
                            <div className="relative bg-ukr-dark-700 p-8 rounded-full border border-white/10">
                              <Film className="w-12 h-12 text-ukr-blue-400" />
                            </div>
                          </div>
                          <div>
                            <p className="text-xl font-semibold text-white">Відео недоступне</p>
                            <p className="text-gray-400 mt-2">Фільм не має TMDB ID для відтворення</p>
                          </div>
                          <button 
                            onClick={() => setIsPlaying(false)}
                            className="bg-ukr-dark-600 hover:bg-ukr-dark-500 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                          >
                            Закрити
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsPlaying(true)}
                    className="w-full aspect-video bg-gradient-to-br from-ukr-dark-700 to-ukr-dark-800 rounded-2xl border border-white/10 flex items-center justify-center group hover:border-ukr-blue-500/50 hover-glow transition-all"
                  >
                    <div className="text-center">
                      <div className="bg-gradient-to-br from-ukr-blue-500 to-ukr-blue-700 p-8 rounded-full mb-4 group-hover:scale-110 transition-transform shadow-2xl shadow-ukr-blue-500/40">
                        <Play className="w-14 h-14 text-white fill-white" />
                      </div>
                      <p className="text-2xl font-bold text-white">Дивитись фільм</p>
                      {m.duration && <p className="text-gray-400 mt-2">{m.duration}</p>}
                      {continueWatching.find(c => c.movieId === m.id) && (
                        <p className="text-ukr-blue-400 text-sm mt-2">
                          Продовжити з {continueWatching.find(c => c.movieId === m.id)?.progress}%
                        </p>
                      )}
                    </div>
                  </button>
                )}

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 bg-ukr-accent-gold/20 border border-ukr-accent-gold/40 px-4 py-2 rounded-xl">
                    <Star className="w-5 h-5 text-ukr-accent-gold fill-ukr-accent-gold" />
                    <span className="font-bold text-ukr-accent-gold text-lg">{m.rating}</span>
                  </div>
                  {m.year > 0 && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="w-5 h-5 text-ukr-blue-400" />{m.year}
                    </div>
                  )}
                  {m.duration && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Clock className="w-5 h-5 text-ukr-blue-400" />{m.duration}
                    </div>
                  )}
                  {(m.hasVoiceover || (m.tmdbId && dubbingCache[m.tmdbId])) && (
                    <div className="flex items-center gap-2 bg-ukr-blue-500/20 border border-ukr-blue-500/40 px-4 py-2 rounded-xl text-ukr-blue-400">
                      <Volume2 className="w-5 h-5" />
                      {dubbingCache[m.tmdbId || 0]?.studio || 'UA озвучка'}
                    </div>
                  )}
                </div>

                {/* Genres */}
                {m.genre.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Жанри</h3>
                    <div className="flex flex-wrap gap-2">
                      {m.genre.map(g => (
                        <button 
                          key={g} 
                          onClick={() => { setSelectedGenre(g); setSelectedMovie(null); }}
                          className="chip px-4 py-2 rounded-full text-sm hover:border-ukr-blue-500/50"
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {m.description && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Опис</h3>
                    <p className="text-gray-300 leading-relaxed text-lg">{m.description}</p>
                  </div>
                )}

                {/* Credits */}
                {(m.director || (m.cast && m.cast.length > 0)) && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {m.director && (
                      <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Режисер</h3>
                        <p className="text-white font-semibold text-lg">{m.director}</p>
                      </div>
                    )}
                    {m.cast && m.cast.length > 0 && (
                      <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">У ролях</h3>
                        <p className="text-gray-300">{m.cast.join(', ')}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Dubbing Info */}
                {m.tmdbId && dubbingCache[m.tmdbId] && (() => {
                  const dubbing = dubbingCache[m.tmdbId!]!;
                  return (
                    <div className="bg-gradient-to-r from-ukr-blue-500/10 to-cyan-500/10 border border-ukr-blue-500/20 rounded-2xl p-6">
                      <h3 className="text-xs font-semibold text-ukr-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Volume2 className="w-4 h-4" />Український дубляж
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-gray-500 text-sm">Студія:</span>
                          <p className="text-white font-medium">{dubbing.studio}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm">Якість:</span>
                          <p className="text-white font-medium">{dubbing.quality}</p>
                        </div>
                        {dubbing.voice_actors && (
                          <div className="col-span-2">
                            <span className="text-gray-500 text-sm">Озвучення:</span>
                            <p className="text-white">{dubbing.voice_actors}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 pt-4">
                  <button 
                    onClick={() => toggleFavorite(m.id)}
                    className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all ${
                      favorites.includes(m.id)
                        ? 'bg-red-500/20 border border-red-500/40 text-red-400'
                        : 'glass border border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${favorites.includes(m.id) ? 'fill-red-400' : ''}`} />
                    {favorites.includes(m.id) ? 'В обраному' : 'Додати в обране'}
                  </button>
                  <button 
                    onClick={() => handleShare(m)}
                    className="flex items-center gap-3 glass border border-white/20 px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all"
                  >
                    <Share2 className="w-5 h-5" />
                    Поділитись
                  </button>
                  <UserRating movieId={m.id} />
                </div>

                {/* Related Movies */}
                <RelatedMovies currentMovie={m} movies={movies} onSelectMovie={openMovie} />
              </div>
            </div>
          </div>
        );
      })()}

      {/* Footer */}
      <Footer />
    </div>
  );
}
