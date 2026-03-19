'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search, Film, Star, Play, Info, ChevronLeft, ChevronRight,
  TrendingUp, X, Heart, Filter, SlidersHorizontal, Clock,
  Calendar, Volume2, VolumeX, Share2, ChevronDown, Menu,
  Sparkles, CheckCircle, RefreshCw, Tv,
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
  { name: 'ГОЛОВНА',    icon: Film      },
  { name: 'ФІЛЬМИ',     icon: TrendingUp },
  { name: 'СЕРІАЛИ',    icon: Tv         },
  { name: 'НОВИНКИ',    icon: Sparkles   },
  { name: 'МІЙ СПИСОК', icon: Heart      },
];

// Quick filter tags
const QUICK_FILTERS = [
  { name: 'Комедії', genre: 'Комедія', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { name: 'Драми', genre: 'Драма', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { name: 'Бойовики', genre: 'Бойовик', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { name: 'Фантастика', genre: 'Фантастика', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  { name: 'Жахи', genre: 'Жахи', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { name: '4K', genre: null, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
];

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


  const [movieDetailsCache, setMovieDetailsCache] = useState<Record<number, Partial<Movie>>>({});
  const [dubbingCache, setDubbingCache] = useState<Record<number, Dubbing | null>>({});

  const movies = allMovies.length > 0 ? allMovies : staticMovies;

  const loadTMDB = useCallback(async (category: string, key: string) => {
    if (!key) return;
    setIsFetchingMovies(true);
    try {
      let fetched: Movie[] = [];
      if (category === 'Популярне') fetched = await fetchPopularTMDB(key);
      else if (category === 'Топ')  fetched = await fetchTopRatedTMDB(key);
      else if (category === 'Новинки') fetched = await fetchNowPlayingTMDB(key);
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
    setTimeout(() => setIsLoading(false), 600);
    
    // Auto-load TMDB API key from environment
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
      setCurrentSlide(p => (p + 1) % heroMovies.length), 7000);
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
    if (activeCategory === 'Топ') {
      list = list.filter(m => m.rating >= 7.5);
    }
    if (activeCategory === 'Новинки') {
      list = list.filter(m => m.year >= new Date().getFullYear() - 2);
    }

    if (voiceoverOnly) list = list.filter(m => m.hasVoiceover);
    if (selectedGenre !== 'all') list = list.filter(m => m.genre.includes(selectedGenre));
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
        case 'rating':   return b.rating - a.rating;
        case 'year':     return b.year - a.year;
        case 'title':    return a.title.localeCompare(b.title, 'uk');
        case 'trending': return (b.viewCount||0) - (a.viewCount||0);
        case 'myrating': return (userRatings[b.id]||0) - (userRatings[a.id]||0);
      }
      return 0;
    });

    return list;
  }, [movies, voiceoverOnly, selectedGenre, searchQuery, sortBy, favorites,
      activeCategory, userRatings, continueWatching]);

  const suggestions = useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return movies.filter(m =>
      m.title.toLowerCase().includes(q) || m.titleEn.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [searchQuery, movies]);

  const loadDubbing = useCallback(async (tmdbId: number, title?: string) => {
    if (dubbingCache[tmdbId] !== undefined) return;
    
    // First try to get existing dubbing
    const info = await getDubbingByTmdbId(tmdbId);
    if (info) {
      setDubbingCache(prev => ({ ...prev, [tmdbId]: info }));
      return;
    }
    
    // If not found, try AI search
    if (title) {
      const found = await searchAndAddDubbing(tmdbId, title);
      if (found) {
        setDubbingCache(prev => ({ ...prev, [tmdbId]: found }));
        addNotification('✓ Українське дублювання знайдено!', 'success');
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
      else { await navigator.clipboard.writeText(url); setShareSuccess(true); setTimeout(() => setShareSuccess(false), 2500); }
    } catch {}
  }, []);



  const nextSlide = () => setCurrentSlide(p => (p + 1) % heroMovies.length);
  const prevSlide = () => setCurrentSlide(p => (p - 1 + heroMovies.length) % heroMovies.length);

  const detailsOf = (m: Movie) => ({ ...m, ...(movieDetailsCache[m.id] || {}) });

  if (isLoading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-ukr-blue/30 rounded-2xl blur-3xl animate-pulse" />
          <div className="relative bg-gradient-to-br from-ukr-blue to-ukr-blue-dark p-5 rounded-2xl shadow-2xl">
            <Film className="w-10 h-10 text-white" strokeWidth={2} />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white">
            <span className="text-ukr-blue">UKR</span>FLIX
          </div>
          <p className="text-sm text-gray-500 mt-1">Завантаження...</p>
        </div>
        <div className="flex justify-center gap-1.5">
          {[0,100,200].map(d => (
            <div key={d} className="w-2 h-2 bg-ukr-blue rounded-full animate-bounce" style={{animationDelay:`${d}ms`}} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Navbar - Glassmorphic Apple TV style */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled ? 'glass-nav shadow-2xl'
                 : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-10">
              <div className="flex items-center cursor-pointer group"
                onClick={() => { setActiveCategory('ГОЛОВНА'); resetFilters(); }}>
                <span className="text-2xl font-bold tracking-tight">
                  <span className="text-ukr-blue">UKR</span>
                  <span className="text-white">FLIX</span>
                </span>
              </div>

              {/* Navigation items */}
              <div className="hidden lg:flex items-center gap-8">
                {CATEGORIES.map(cat => (
                  <button key={cat.name}
                    onClick={() => { setActiveCategory(cat.name); resetFilters(); }}
                    className={`text-sm font-medium tracking-wide transition-all duration-300 relative py-2 ${
                      activeCategory === cat.name 
                        ? 'text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}>
                    {cat.name}
                    {activeCategory === cat.name && (
                      <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-ukr-blue to-ukr-accent rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Search & Menu */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={`flex items-center rounded-xl px-4 py-2.5 transition-all duration-300 ${
                  isSearchFocused
                    ? 'bg-white/15 w-64 md:w-96 shadow-lg shadow-ukr-blue/10 ring-2 ring-ukr-blue/50'
                    : 'bg-white/8 w-40 md:w-64 hover:bg-white/12'
                }`}>
                  <Search className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    placeholder="П��шук фільмів..."
                    className="bg-transparent outline-none text-white placeholder-gray-400 w-full text-sm"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="ml-1 text-gray-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {searchQuery && isSearchFocused && suggestions.length > 0 && (
                  <div className="absolute top-full mt-3 w-full md:w-[420px] glass-heavy rounded-2xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
                    <div className="px-4 py-3 text-xs text-gray-400 uppercase tracking-wider border-b border-white/5 flex items-center gap-2">
                      <Search className="w-3 h-3" />Результати пошуку
                    </div>
                    {suggestions.map(m => (
                      <div key={m.id} onClick={() => { openMovie(m); setSearchQuery(''); }}
                        className="px-4 py-3 hover:bg-white/8 cursor-pointer flex items-center gap-4 group transition-colors">
                        <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-white/10"
                          style={{ background: m.posterUrl ? 'transparent' : m.poster }}>
                          {m.posterUrl
                            ? <img src={m.posterUrl} alt={m.title} className="w-full h-full object-cover" />
                            : <Film className="w-6 h-6 text-white/20 m-auto mt-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate group-hover:text-ukr-blue transition-colors">{m.title}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{m.year} - {m.genre[0]}</div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0 bg-kino-yellow-500/20 px-2 py-1 rounded-lg">
                          <Star className="w-3 h-3 text-kino-yellow-400 fill-kino-yellow-400" />
                          <span className="text-xs font-bold text-kino-yellow-400">{m.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>



              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl bg-white/8 hover:bg-white/15 transition-colors">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 space-y-1 border-t border-white/5 pt-4 animate-fadeIn">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                return (
                  <button key={cat.name}
                    onClick={() => { setActiveCategory(cat.name); setMobileMenuOpen(false); resetFilters(); }}
                    className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all ${
                      activeCategory === cat.name
                        ? 'bg-ukr-blue/20 text-ukr-blue'
                        : 'text-gray-300 hover:bg-white/8'
                    }`}>
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </nav>



      {/* Hero - Cinematic Apple TV Style */}
      {currentHero && (
        <div className="relative h-[100vh] overflow-hidden">
          {/* Background Image with Cinematic Gradients */}
          <div className="absolute inset-0 transition-all duration-1000"
            style={{ background: currentHero.backdropUrl ? 'none' : currentHero.backdrop }}>
            {currentHero.backdropUrl && (
              <img src={currentHero.backdropUrl} alt="" className="w-full h-full object-cover scale-105" />
            )}
            {/* Cinematic gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative h-full flex items-end pb-32 md:pb-40">
            <div className="max-w-7xl mx-auto px-4 md:px-8 w-full">
              <div className="max-w-3xl space-y-5 animate-fadeInUp">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  {currentHero.rating >= 7.5 && (
                    <span className="bg-kino-yellow-500/20 backdrop-blur-sm border border-kino-yellow-500/30 text-kino-yellow-400 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                      TOP RATED
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <Star className="w-4 h-4 text-kino-yellow-400 fill-kino-yellow-400" />
                    <span className="font-bold text-white">{currentHero.rating}</span>
                  </span>
                  {currentHero.hasVoiceover && (
                    <span className="bg-ukr-blue/20 backdrop-blur-sm border border-ukr-blue/30 text-ukr-blue px-3 py-1.5 rounded-full text-xs font-bold uppercase flex items-center gap-1.5">
                      <Volume2 className="w-3 h-3" />UA
                    </span>
                  )}
                  <span className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-gray-300">
                    {currentHero.year}
                  </span>
                </div>

                {/* Title - Large Typography */}
                <div>
                  <h1 className="text-5xl md:text-8xl font-bold leading-[0.9] tracking-tight text-white drop-shadow-2xl">
                    {currentHero.title}
                  </h1>
                  <p className="text-gray-400 text-base md:text-xl mt-3 font-light">
                    {currentHero.titleEn}
                  </p>
                </div>

                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                  {currentHero.duration && (
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{currentHero.duration}</span>
                  )}
                  {currentHero.genre.length > 0 && (
                    <span className="flex items-center gap-2">
                      {currentHero.genre.slice(0, 3).map((g, i) => (
                        <span key={g} className="flex items-center gap-2">
                          {i > 0 && <span className="w-1 h-1 bg-gray-600 rounded-full" />}
                          {g}
                        </span>
                      ))}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-2xl line-clamp-2">
                  {currentHero.description}
                </p>

                {/* Premium Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-4">
                  <button onClick={() => playMovie(currentHero)}
                    className="group flex items-center gap-3 bg-ukr-blue hover:bg-ukr-blue-light text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-ukr-blue/30 hover:shadow-ukr-blue/50 hover:scale-[1.02]">
                    <Play className="w-5 h-5 fill-white" />
                    ДИВИТИСЯ
                  </button>
                  <button onClick={() => openMovie(currentHero)}
                    className="flex items-center gap-3 glass border border-white/20 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02]">
                    <Info className="w-5 h-5" />
                    ІНФО
                  </button>
                  <button onClick={() => toggleFavorite(currentHero.id)}
                    className={`p-4 rounded-xl transition-all duration-300 hover:scale-110 ${
                      favorites.includes(currentHero.id)
                        ? 'bg-red-500/20 text-red-400 ring-2 ring-red-500/30'
                        : 'glass hover:bg-white/20'
                    }`}>
                    <Heart className={`w-5 h-5 ${favorites.includes(currentHero.id) ? 'fill-red-400' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button onClick={prevSlide} className="absolute left-6 top-1/2 -translate-y-1/2 glass p-4 rounded-full hover:bg-white/20 transition-all group z-10 opacity-0 hover:opacity-100 focus:opacity-100">
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          <button onClick={nextSlide} className="absolute right-6 top-1/2 -translate-y-1/2 glass p-4 rounded-full hover:bg-white/20 transition-all group z-10 opacity-0 hover:opacity-100 focus:opacity-100">
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {heroMovies.map((_, i) => (
              <button key={i} onClick={() => setCurrentSlide(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === currentSlide
                    ? 'bg-ukr-blue w-8 h-2'
                    : 'bg-white/30 w-2 h-2 hover:bg-white/50'
                }`} />
            ))}
          </div>
        </div>
      )}

      {/* Continue Watching */}
      <ContinueWatching />

      {/* Quick Filter Tags - Apple TV style category bubbles */}
      <div className="bg-black py-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {QUICK_FILTERS.map(filter => (
              <button
                key={filter.name}
                onClick={() => filter.genre ? setSelectedGenre(selectedGenre === filter.genre ? 'all' : filter.genre) : null}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 ${
                  selectedGenre === filter.genre
                    ? filter.color + ' scale-105'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {filter.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters Bar - Minimal */}
      <div className="bg-black/50 backdrop-blur-sm sticky top-[72px] z-30 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
          <div className="flex flex-wrap items-center gap-3">
            {activeCategory !== 'МІЙ СПИСОК' && (
              <button onClick={toggleVoiceoverOnly}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  voiceoverOnly
                    ? 'bg-ukr-blue/20 text-ukr-blue ring-1 ring-ukr-blue/30'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}>
                <Volume2 className="w-4 h-4" />
                UA озвучка
              </button>
            )}

            <select value={selectedGenre} onChange={e => setSelectedGenre(e.target.value)}
              className="bg-white/5 border-0 text-white px-4 py-2 rounded-xl text-sm cursor-pointer hover:bg-white/10 transition-colors focus:ring-2 focus:ring-ukr-blue/50 outline-none">
              <option value="all">Всі жанри</option>
              {genres.slice(1).map(g => <option key={g} value={g}>{g}</option>)}
            </select>

            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
              className="bg-white/5 border-0 text-white px-4 py-2 rounded-xl text-sm cursor-pointer hover:bg-white/10 transition-colors focus:ring-2 focus:ring-ukr-blue/50 outline-none">
              <option value="rating">За рейтингом</option>
              <option value="year">За роком</option>
              <option value="title">За назвою</option>
              <option value="trending">За популярністю</option>
            </select>

            <div className="text-sm text-gray-500 ml-auto flex items-center gap-3">
              {isFetchingMovies && <RefreshCw className="w-4 h-4 animate-spin text-ukr-blue" />}
              <span><span className="font-semibold text-white">{filteredMovies.length}</span> фільмів</span>
            </div>

            {(selectedGenre !== 'all' || sortBy !== 'rating' || searchQuery) && (
              <button onClick={() => { resetFilters(); }}
                className="text-sm text-gray-400 hover:text-ukr-blue transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5">
                <X className="w-4 h-4" />Скинути
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Movies Grid - 6 columns like Apple TV */}
      <div className="bg-black min-h-screen py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Section Header */}
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                {activeCategory === 'МІЙ СПИСОК' ? 'Мій список'
                 : 'Рекомендовано для вас'}
              </h2>
              <p className="text-sm text-gray-500">
                {activeCategory === 'МІЙ СПИСОК' ? 'Ваші збережені фільми' : 'На основі ваших уподобань'}
              </p>
            </div>
          </div>

          {filteredMovies.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center">
                <Film className="w-10 h-10 text-gray-600" />
              </div>
              {activeCategory === 'МІЙ СПИСОК' ? (
                <>
                  <h3 className="text-xl font-semibold text-white mb-2">Список порожній</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">Натисніть на серце на будь-якому фільмі щоб додати до списку</p>
                  <button onClick={() => setActiveCategory('ГОЛОВНА')}
                    className="bg-ukr-blue hover:bg-ukr-blue-light text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                    Переглянути фільми
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-white mb-2">Нічого не знайдено</h3>
                  <p className="text-gray-500 mb-6">Спробуйте змінити фільтри пошуку</p>
                  <button onClick={() => resetFilters()}
                    className="bg-ukr-blue hover:bg-ukr-blue-light text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                    Скинути фільтри
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
              {filteredMovies.map((movie, idx) => {
                const myRating = userRatings[movie.id];
                const cw = continueWatching.find(c => c.movieId === movie.id);
                const is4K = movie.rating >= 8;
                const isHD = movie.rating >= 7;
                return (
                  <div key={movie.id} className="group cursor-pointer animate-fadeIn"
                    style={{ animationDelay: `${Math.min(idx, 12) * 30}ms` }}
                    onClick={() => openMovie(movie)}>
                    {/* Movie Poster Card */}
                    <div className="relative overflow-hidden rounded-xl aspect-[2/3] mb-3 card-hover ring-1 ring-white/10 group-hover:ring-ukr-blue/50">
                      <div className="absolute inset-0"
                        style={{ background: movie.posterUrl ? 'transparent' : movie.poster }}>
                        {movie.posterUrl
                          ? <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                          : <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900"><Film className="w-12 h-12 text-white/10" /></div>
                        }
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                        <div className="bg-ukr-blue/90 backdrop-blur-sm p-4 rounded-full transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-xl">
                          <Play className="w-8 h-8 text-white fill-white" />
                        </div>
                      </div>

                      {/* Quality Badge - 4K or HD */}
                      {(is4K || isHD) && (
                        <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold ${
                          is4K ? 'bg-ukr-blue text-white' : 'bg-white/20 backdrop-blur-sm text-white'
                        }`}>
                          {is4K ? '4K' : 'HD'}
                        </div>
                      )}

                      {/* Rating Badge */}
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                        <div className="flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg">
                          <Star className="w-3 h-3 text-kino-yellow-400 fill-kino-yellow-400" />
                          <span className="text-xs font-bold text-white">{movie.rating}</span>
                        </div>
                        {movie.hasVoiceover && (
                          <div className="bg-ukr-blue/80 backdrop-blur-sm px-2 py-1 rounded-lg">
                            <span className="text-[10px] font-bold text-white">UA</span>
                          </div>
                        )}
                      </div>

                      {/* Progress bar for continue watching */}
                      {cw && cw.progress > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                          <div className="h-full bg-ukr-blue" style={{ width: `${cw.progress}%` }} />
                        </div>
                      )}

                      {/* Favorite button */}
                      <button onClick={e => { e.stopPropagation(); toggleFavorite(movie.id); }}
                        className="absolute top-2 left-2 p-2 bg-black/60 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-black/80">
                        <Heart className={`w-4 h-4 transition-colors ${favorites.includes(movie.id) ? 'fill-red-500 text-red-500' : 'text-white/80'}`} />
                      </button>
                    </div>

                    {/* Movie Info */}
                    <div className="space-y-1">
                      <h3 className="font-semibold text-sm text-white line-clamp-1 group-hover:text-ukr-blue transition-colors">
                        {movie.title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {movie.year > 0 && movie.year}
                        {movie.genre[0] && ` - ${movie.genre[0]}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Movie Modal - Premium Design */}
      {selectedMovie && (() => {
        const m = detailsOf(selectedMovie);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fadeIn">
            <div className="glass-heavy rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl animate-scaleIn">
              {/* Modal Header with Backdrop */}
              <div className="relative h-72 md:h-96 overflow-hidden rounded-t-3xl">
                <div className="absolute inset-0"
                  style={{ background: m.backdropUrl ? 'transparent' : m.backdrop }}>
                  {m.backdropUrl && <img src={m.backdropUrl} alt="" className="w-full h-full object-cover" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-kino-dark-800 via-black/60 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                </div>
                <button onClick={() => { setSelectedMovie(null); setIsPlaying(false); }}
                  className="absolute top-5 right-5 p-3 bg-black/50 backdrop-blur-sm rounded-xl hover:bg-black/70 transition-all">
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                  <h2 className="text-4xl md:text-6xl font-bold mb-2 text-white">{m.title}</h2>
                  <p className="text-gray-400 text-lg">{m.titleEn}</p>
                </div>
              </div>

              <div className="p-8 md:p-10 space-y-8">
                {isPlaying ? (
                  <div className="space-y-4">
                    {m.tmdbId ? (
                      <VideoPlayer 
                        tmdbId={m.tmdbId} 
                        title={m.title} 
                        onClose={() => setIsPlaying(false)}
                      />
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-gray-900 to-black rounded-2xl flex items-center justify-center ring-1 ring-white/10">
                        <div className="text-center space-y-4 p-8">
                          <div className="w-20 h-20 mx-auto rounded-2xl bg-ukr-blue/20 flex items-center justify-center">
                            <Film className="w-10 h-10 text-ukr-blue" />
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-white">Відео недоступне</p>
                            <p className="text-sm text-gray-500 mt-1">Цей фільм ще не доступний для перегляду</p>
                          </div>
                          <button onClick={() => setIsPlaying(false)}
                            className="bg-white/10 hover:bg-white/15 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">
                            Закрити
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button onClick={() => setIsPlaying(true)}
                    className="w-full aspect-video bg-gradient-to-br from-gray-900/50 to-black rounded-2xl ring-1 ring-white/10 flex items-center justify-center group hover:ring-ukr-blue/50 transition-all">
                    <div className="text-center">
                      <div className="bg-ukr-blue p-5 rounded-2xl mb-4 group-hover:scale-110 transition-transform shadow-xl shadow-ukr-blue/30">
                        <Play className="w-10 h-10 text-white fill-white" />
                      </div>
                      <p className="text-xl font-semibold">Дивитись</p>
                      {m.duration && <p className="text-sm text-gray-500 mt-1">{m.duration}</p>}
                      {continueWatching.find(c => c.movieId === m.id) && (
                        <p className="text-xs text-ukr-blue mt-2">
                          Продовжити з {continueWatching.find(c => c.movieId === m.id)?.progress}%
                        </p>
                      )}
                    </div>
                  </button>
                )}

                {/* Movie Meta Info */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 bg-kino-yellow-500/20 px-4 py-2 rounded-xl">
                    <Star className="w-4 h-4 text-kino-yellow-400 fill-kino-yellow-400" />
                    <span className="font-semibold text-kino-yellow-400">{m.rating}</span>
                  </div>
                  {m.year > 0 && (
                    <div className="flex items-center gap-2 text-gray-400 bg-white/5 px-4 py-2 rounded-xl">
                      <Calendar className="w-4 h-4" />{m.year}
                    </div>
                  )}
                  {m.duration && (
                    <div className="flex items-center gap-2 text-gray-400 bg-white/5 px-4 py-2 rounded-xl">
                      <Clock className="w-4 h-4" />{m.duration}
                    </div>
                  )}
                  {(m.hasVoiceover || (m.tmdbId && dubbingCache[m.tmdbId])) && (
                    <div className="flex items-center gap-2 bg-ukr-blue/20 px-4 py-2 rounded-xl text-ukr-blue">
                      <Volume2 className="w-4 h-4" />
                      <span className="font-medium">{dubbingCache[m.tmdbId || 0]?.studio || 'UA озвучка'}</span>
                    </div>
                  )}
                </div>

                {m.genre.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Жанри</h4>
                    <div className="flex flex-wrap gap-2">
                      {m.genre.map(g => (
                        <button key={g} onClick={() => { setSelectedGenre(g); setSelectedMovie(null); }}
                          className="bg-white/8 hover:bg-ukr-blue/20 hover:text-ukr-blue px-4 py-2 rounded-xl text-sm text-gray-300 transition-all">
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {m.description && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Опис</h4>
                    <p className="text-gray-300 leading-relaxed text-[15px]">{m.description}</p>
                  </div>
                )}

                {(m.director || (m.cast && m.cast.length > 0)) && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {m.director && (
                      <div>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Режисер</h3>
                        <p className="text-white font-semibold">{m.director}</p>
                      </div>
                    )}
                    {m.cast && m.cast.length > 0 && (
                      <div>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">У ролях</h3>
                        <p className="text-gray-300 text-sm">{m.cast.join(', ')}</p>
                      </div>
                    )}
                  </div>
                )}

                {m.tmdbId && dubbingCache[m.tmdbId] && (() => {
                  const dubbing = dubbingCache[m.tmdbId!]!;
                  return (
                    <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4">
                      <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Volume2 className="w-4 h-4" />Український дубляж
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Студія:</span>
                          <p className="text-white font-medium">{dubbing.studio}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Якість:</span>
                          <p className="text-white font-medium">{dubbing.quality}</p>
                        </div>
                        {dubbing.voice_actors && (
                          <div className="col-span-2">
                            <span className="text-gray-500">Актори озвучки:</span>
                            <p className="text-white font-medium">{dubbing.voice_actors}</p>
                          </div>
                        )}
                        <div className="col-span-2 flex items-center gap-2">
                          {dubbing.has_subtitles && (
                            <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">Субтитри</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="pt-2 border-t border-gray-800/50">
                  <UserRating movieId={m.id} />
                </div>

                <div className="pt-2 border-t border-gray-800/50">
                  <RelatedMovies movie={selectedMovie} />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-6 border-t border-white/5">
                  <button onClick={() => toggleFavorite(m.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                      favorites.includes(m.id)
                        ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30'
                        : 'bg-white/8 text-white hover:bg-white/12'
                    }`}>
                    <Heart className={`w-5 h-5 ${favorites.includes(m.id) ? 'fill-red-400' : ''}`} />
                    {favorites.includes(m.id) ? 'В обраному' : 'До списку'}
                  </button>
                  <button onClick={() => handleShare(selectedMovie)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                      shareSuccess
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-white/8 text-white hover:bg-white/12'
                    }`}>
                    {shareSuccess ? <><CheckCircle className="w-5 h-5" />Скопійовано</> : <><Share2 className="w-5 h-5" />Поділитися</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Footer */}
      <Footer />

      {scrolled && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 p-4 bg-ukr-blue text-white rounded-2xl shadow-xl shadow-ukr-blue/30 hover:scale-110 transition-all z-40 animate-fadeIn">
          <ChevronDown className="w-5 h-5 rotate-180" />
        </button>
      )}
    </div>
  );
}
