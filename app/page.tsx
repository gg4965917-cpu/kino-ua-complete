'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search, Film, Star, Play, Info, ChevronLeft, ChevronRight,
  TrendingUp, X, Heart, Filter, SlidersHorizontal, Clock,
  Calendar, Volume2, VolumeX, Share2, ChevronDown, Menu,
  Sparkles, CheckCircle, RefreshCw, Tv, Zap, Globe,
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
  { name: 'СЕРІАЛИ',    icon: Tv        },
  { name: 'ПОШУК',      icon: Search    },
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
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/30 blur-2xl animate-pulse" />
          <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl inline-block">
            <Film className="w-10 h-10 text-white" strokeWidth={2} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-2xl font-bold">
            <span className="text-blue-400">UKR</span>
            <span className="text-white">FLIX</span>
          </div>
          <div className="text-sm text-gray-500 animate-pulse">Завантаження...</div>
        </div>
        <div className="flex justify-center gap-1.5">
          {[0,150,300].map(d => (
            <div key={d} className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay:`${d}ms`}} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Premium Glassmorphic Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled ? 'glass-nav shadow-2xl' : 'bg-gradient-to-b from-[#0a0a0f]/95 to-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <div className="flex items-center space-x-2.5 cursor-pointer group"
                onClick={() => { setActiveCategory('ГОЛОВНА'); resetFilters(); }}>
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/50 blur-lg group-hover:blur-xl transition-all" />
                  <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 p-1.5 rounded-lg group-hover:scale-110 transition-all">
                    <Film className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <span className="text-xl font-black tracking-tight">
                  <span className="text-blue-400">UKR</span>
                  <span className="text-white">FLIX</span>
                </span>
              </div>

              {/* Navigation */}
              <div className="hidden lg:flex items-center gap-1">
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.name || 
                    (cat.name === 'ФІЛЬМИ' && (activeCategory === 'Популярне' || activeCategory === 'Топ')) ||
                    (cat.name === 'ГОЛОВНА' && activeCategory === 'Головна');
                  return (
                    <button key={cat.name}
                      onClick={() => { 
                        if (cat.name === 'ФІЛЬМИ') setActiveCategory('Популярне');
                        else if (cat.name === 'ГОЛОВНА') setActiveCategory('Головна');
                        else if (cat.name === 'СЕРІАЛИ') setActiveCategory('Новинки');
                        else if (cat.name === 'ПОШУК') setIsSearchFocused(true);
                        else setActiveCategory(cat.name);
                        resetFilters(); 
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive 
                          ? 'text-white bg-white/10' 
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}>
                      {cat.name === 'ПОШУК' && <Search className="w-4 h-4" />}
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              {/* Premium Search */}
              <div className="relative">
                <div className={`flex items-center rounded-xl px-3 py-2 transition-all duration-300 ${
                  isSearchFocused
                    ? 'bg-white/10 border border-blue-500/50 w-56 md:w-80 shadow-lg shadow-blue-500/10'
                    : 'bg-white/5 border border-white/10 w-36 md:w-56 hover:bg-white/10'
                }`}>
                  <Search className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    placeholder="Пошук фільмів..."
                    className="bg-transparent outline-none text-white placeholder-gray-500 w-full text-sm"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="ml-1 text-gray-500 hover:text-white transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Search Results Dropdown */}
                {searchQuery && isSearchFocused && suggestions.length > 0 && (
                  <div className="absolute top-full mt-2 w-full md:w-[400px] glass-premium rounded-xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
                    <div className="p-3 text-xs text-gray-500 uppercase tracking-wider border-b border-white/5 flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-blue-400" />Результати пошуку
                    </div>
                    {suggestions.map(m => (
                      <div key={m.id} onClick={() => { openMovie(m); setSearchQuery(''); }}
                        className="p-3 hover:bg-white/5 cursor-pointer flex items-center gap-3 group border-b border-white/5 last:border-0">
                        <div className="w-11 h-16 rounded-lg overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform border border-white/10"
                          style={{ background: m.posterUrl ? 'transparent' : m.poster }}>
                          {m.posterUrl
                            ? <img src={m.posterUrl} alt={m.title} className="w-full h-full object-cover" />
                            : <Film className="w-6 h-6 text-white/20 m-auto mt-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate group-hover:text-blue-400 transition-colors">{m.title}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{m.year} - {m.genre[0]}</div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0 bg-yellow-500/10 px-2 py-1 rounded-lg">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs font-bold text-yellow-400">{m.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* My List Button */}
              <button 
                onClick={() => setActiveCategory('Мій список')}
                className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  activeCategory === 'Мій список' 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                <Heart className={`w-4 h-4 ${activeCategory === 'Мій список' ? 'fill-red-400' : ''}`} />
              </button>

              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 space-y-1 border-t border-white/5 pt-4 animate-fadeIn">
              {['Головна', 'Популярне', 'Топ', 'Новинки', 'Мій список', 'Переглянуті'].map(cat => (
                <button key={cat}
                  onClick={() => { setActiveCategory(cat); setMobileMenuOpen(false); resetFilters(); }}
                  className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all ${
                    activeCategory === cat
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'text-gray-400 hover:bg-white/5 border border-transparent'
                  }`}>
                  <span className="font-medium">{cat}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>



      {/* Premium Hero Section */}
      {currentHero && (
        <div className="relative h-screen overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 transition-all duration-1000"
            style={{ background: currentHero.backdropUrl ? 'none' : currentHero.backdrop }}>
            {currentHero.backdropUrl && (
              <img src={currentHero.backdropUrl} alt="" className="w-full h-full object-cover scale-105" />
            )}
            {/* Premium Gradient Overlays */}
            <div className="absolute inset-0 hero-overlay" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/90 via-[#0a0a0f]/40 to-[#0a0a0f]/60" />
          </div>

          <div className="relative h-full flex items-end pb-32 md:pb-40">
            <div className="max-w-7xl mx-auto px-4 md:px-6 w-full">
              <div className="max-w-2xl space-y-5 md:space-y-6 animate-fadeInUp">
                {/* Title */}
                <div>
                  <h1 className="text-5xl md:text-8xl font-black font-bebas mb-2 leading-[0.9] text-white drop-shadow-2xl">
                    {currentHero.title.split(' ').map((word, i) => (
                      <span key={i} className={i === 0 ? 'text-white' : 'text-white/90'}>
                        {word}{' '}
                      </span>
                    ))}
                  </h1>
                  {currentHero.title.includes('ЧАСТИНА') || currentHero.titleEn.includes('Part') ? null : (
                    <p className="text-gray-400 text-base md:text-xl font-light tracking-wide">
                      {currentHero.titleEn}
                    </p>
                  )}
                </div>

                {/* Metadata Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1.5 bg-yellow-500/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-yellow-500/30">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-bold text-yellow-400">{currentHero.rating}</span>
                  </span>
                  <span className="text-gray-400 text-sm">{currentHero.year}</span>
                  <span className="text-gray-600">|</span>
                  {currentHero.duration && (
                    <span className="text-gray-400 text-sm">{currentHero.duration}</span>
                  )}
                  {currentHero.genre.length > 0 && (
                    <>
                      <span className="text-gray-600">|</span>
                      <span className="text-gray-400 text-sm">{currentHero.genre.slice(0, 2).join(', ')}</span>
                    </>
                  )}
                  {currentHero.hasVoiceover && (
                    <span className="bg-blue-500/20 border border-blue-500/30 text-blue-400 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                      <Volume2 className="w-3 h-3" />UA
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-xl line-clamp-2 md:line-clamp-3">
                  {currentHero.description}
                </p>

                {/* Premium Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button onClick={() => playMovie(currentHero)}
                    className="btn-primary group flex items-center gap-2.5 px-7 md:px-8 py-3.5 md:py-4 rounded-xl font-bold text-sm md:text-base">
                    <Play className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                    ДИВИТИСЯ
                  </button>
                  <button onClick={() => openMovie(currentHero)}
                    className="btn-secondary flex items-center gap-2.5 px-7 md:px-8 py-3.5 md:py-4 rounded-xl font-bold text-sm md:text-base">
                    <Info className="w-5 h-5" />
                    ІНФО
                  </button>
                  <button onClick={() => toggleFavorite(currentHero.id)}
                    className={`p-3.5 md:p-4 rounded-xl border transition-all ${
                      favorites.includes(currentHero.id)
                        ? 'bg-red-500/20 border-red-500/40 text-red-400'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}>
                    <Heart className={`w-5 h-5 ${favorites.includes(currentHero.id) ? 'fill-red-400' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Slider Navigation */}
          <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm border border-white/10 p-3 md:p-4 rounded-full hover:bg-black/50 hover:border-white/20 transition-all group z-10">
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm border border-white/10 p-3 md:p-4 rounded-full hover:bg-black/50 hover:border-white/20 transition-all group z-10">
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {heroMovies.map((_, i) => (
              <button key={i} onClick={() => setCurrentSlide(i)}
                className={`transition-all rounded-full ${
                  i === currentSlide
                    ? 'bg-blue-500 w-8 h-2 shadow-lg shadow-blue-500/50'
                    : 'bg-white/20 w-2 h-2 hover:bg-white/40'
                }`} />
            ))}
          </div>
        </div>
      )}

      {/* Continue Watching */}
      <ContinueWatching />

      {/* Premium Filter Categories */}
      <div className="bg-[#0a0a0f] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {['Комедії', 'Драми', 'Бойовики', 'Новинки', 'Топ тижня', 'UA озвучка'].map(cat => (
              <button 
                key={cat}
                onClick={() => {
                  if (cat === 'UA озвучка') toggleVoiceoverOnly();
                  else if (cat === 'Новинки') setActiveCategory('Новинки');
                  else if (cat === 'Топ тижня') setActiveCategory('Топ');
                  else setSelectedGenre(cat === 'Комедії' ? 'Комедія' : cat === 'Драми' ? 'Драма' : cat === 'Бойовики' ? 'Бойовик' : 'all');
                }}
                className={`category-pill ${
                  (cat === 'UA озвучка' && voiceoverOnly) || 
                  (cat === 'Новинки' && activeCategory === 'Новинки') ||
                  (cat === 'Топ тижня' && activeCategory === 'Топ')
                    ? 'active' : ''
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <select value={selectedGenre} onChange={e => setSelectedGenre(e.target.value)}
                className="bg-white/5 border border-white/10 text-white px-3 py-2 rounded-lg text-sm cursor-pointer hover:bg-white/10 transition-colors focus:outline-none focus:border-blue-500/50">
                <option value="all">Всі жанри</option>
                {genres.slice(1).map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
                className="bg-white/5 border border-white/10 text-white px-3 py-2 rounded-lg text-sm cursor-pointer hover:bg-white/10 transition-colors focus:outline-none focus:border-blue-500/50">
                <option value="rating">За рейтингом</option>
                <option value="year">За роком</option>
                <option value="title">За назвою</option>
                <option value="trending">За популярністю</option>
              </select>
            </div>

            <div className="text-sm text-gray-500 ml-auto flex items-center gap-2">
              {isFetchingMovies && <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />}
              <span>Знайдено: <span className="font-semibold text-white">{filteredMovies.length}</span></span>
            </div>

            {(selectedGenre !== 'all' || sortBy !== 'rating' || searchQuery) && (
              <button onClick={() => { resetFilters(); }}
                className="text-sm text-gray-500 hover:text-blue-400 transition-colors flex items-center gap-1">
                <X className="w-4 h-4" />Скинути
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Premium Movies Grid */}
      <div className="bg-[#0a0a0f] min-h-screen py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Section Header */}
          <div className="mb-6 md:mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                {activeCategory === 'Мій список' ? 'Мій список'
                 : activeCategory === 'Переглянуті' ? 'Переглянуті'
                 : activeCategory === 'Головна' ? 'Рекомендовано для вас'
                 : activeCategory}
              </h2>
              <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
            </div>
            <button 
              onClick={() => loadTMDB(activeCategory, tmdbKey)}
              className="text-sm text-gray-500 hover:text-blue-400 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-4 h-4 ${isFetchingMovies ? 'animate-spin' : ''}`} />
              Оновити
            </button>
          </div>

          {filteredMovies.length === 0 ? (
            <div className="text-center py-20">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-blue-500/20 blur-2xl" />
                <Film className="relative w-16 h-16 mx-auto text-gray-600" />
              </div>
              {activeCategory === 'Мій список' ? (
                <>
                  <h3 className="text-xl font-semibold text-white mb-2">Список порожній</h3>
                  <p className="text-gray-500 mb-6">Натисніть на серце щоб додати фільм</p>
                  <button onClick={() => setActiveCategory('Головна')}
                    className="btn-primary px-6 py-2.5 rounded-xl font-semibold text-sm">
                    Переглянути фільми
                  </button>
                </>
              ) : activeCategory === 'Переглянуті' ? (
                <>
                  <h3 className="text-xl font-semibold text-white mb-2">Ще нічого не переглядали</h3>
                  <p className="text-gray-500 mb-6">Почніть дивитись - фільми з'являться тут</p>
                  <button onClick={() => setActiveCategory('Головна')}
                    className="btn-primary px-6 py-2.5 rounded-xl font-semibold text-sm">
                    До фільмів
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-white mb-2">Нічого не знайдено</h3>
                  <p className="text-gray-500 mb-6">Спробуйте змінити фільтри</p>
                  <button onClick={() => resetFilters()}
                    className="btn-primary px-6 py-2.5 rounded-xl font-semibold text-sm">
                    Скинути фільтри
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
              {filteredMovies.map((movie, idx) => {
                const myRating = userRatings[movie.id];
                const cw = continueWatching.find(c => c.movieId === movie.id);
                const isHD = movie.rating >= 7.5;
                const is4K = movie.rating >= 8.5;
                return (
                  <div key={movie.id} className="group cursor-pointer animate-fadeIn"
                    style={{ animationDelay: `${Math.min(idx, 10) * 30}ms` }}
                    onClick={() => openMovie(movie)}>
                    {/* Premium Card */}
                    <div className="relative overflow-hidden rounded-2xl aspect-[2/3] mb-3 card-premium">
                      {/* Poster */}
                      <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
                        style={{ background: movie.posterUrl ? 'transparent' : movie.poster }}>
                        {movie.posterUrl
                          ? <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" loading="lazy" />
                          : <div className="absolute inset-0 flex items-center justify-center"><Film className="w-12 h-12 text-white/10" /></div>
                        }
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center">
                        <div className="bg-blue-500 p-3 rounded-full mb-2 transform scale-75 group-hover:scale-100 transition-transform shadow-lg shadow-blue-500/50">
                          <Play className="w-6 h-6 text-white fill-white" />
                        </div>
                        <span className="text-xs font-medium text-white/80">Дивитись</span>
                      </div>

                      {/* Quality Badge */}
                      {(is4K || isHD) && (
                        <div className="absolute top-2 left-2">
                          <span className={is4K ? 'badge-4k' : 'badge-hd'}>
                            {is4K ? '4K' : 'HD'}
                          </span>
                        </div>
                      )}

                      {/* Favorite Button */}
                      <button onClick={e => { e.stopPropagation(); toggleFavorite(movie.id); }}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70 border border-white/10">
                        <Heart className={`w-4 h-4 transition-colors ${favorites.includes(movie.id) ? 'fill-red-400 text-red-400' : 'text-white/80 hover:text-red-400'}`} />
                      </button>

                      {/* UA Badge */}
                      {movie.hasVoiceover && (
                        <div className="absolute bottom-2 left-2 bg-violet-500/90 backdrop-blur-sm px-1.5 py-0.5 rounded-md flex items-center gap-1">
                          <Volume2 className="w-3 h-3 text-white" />
                          <span className="text-[10px] font-bold text-white">UA</span>
                        </div>
                      )}

                      {/* Progress Bar */}
                      {cw && cw.progress > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                          <div className="h-full bg-blue-500" style={{ width: `${cw.progress}%` }} />
                        </div>
                      )}
                    </div>

                    {/* Card Info */}
                    <div className="space-y-1.5">
                      {/* Star Rating */}
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map(star => (
                          <Star 
                            key={star} 
                            className={`w-3 h-3 ${star <= Math.round(movie.rating / 2) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}`} 
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">{movie.rating}</span>
                      </div>
                      
                      {/* Title */}
                      <h3 className="font-semibold text-sm text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
                        {movie.title}
                      </h3>
                      
                      {/* Meta */}
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        {movie.year > 0 && <span>{movie.year}</span>}
                        {movie.genre[0] && (
                          <>
                            <span className="w-1 h-1 bg-gray-600 rounded-full" />
                            <span>{movie.genre[0]}</span>
                          </>
                        )}
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
            <div className="bg-[#0d0d14] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl animate-scaleIn">
              {/* Modal Header with Backdrop */}
              <div className="relative h-56 md:h-72 overflow-hidden rounded-t-2xl">
                <div className="absolute inset-0"
                  style={{ background: m.backdropUrl ? 'transparent' : m.backdrop }}>
                  {m.backdropUrl
                    ? <img src={m.backdropUrl} alt="" className="w-full h-full object-cover" />
                    : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d14] via-[#0d0d14]/60 to-transparent" />
                </div>
                <button onClick={() => { setSelectedMovie(null); setIsPlaying(false); }}
                  className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-sm rounded-full hover:bg-black/60 transition-colors border border-white/10">
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <h2 className="text-3xl md:text-5xl font-black font-bebas mb-1 text-white">{m.title}</h2>
                  <p className="text-gray-400">{m.titleEn}</p>
                </div>
              </div>

              <div className="p-6 md:p-8 space-y-6">
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
                      <div className="aspect-video bg-[#0a0a0f] rounded-xl border border-white/10 flex items-center justify-center">
                        <div className="text-center space-y-4 p-8">
                          <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
                            <div className="relative bg-[#0d0d14] p-6 rounded-full border border-white/10">
                              <Film className="w-12 h-12 text-blue-400" />
                            </div>
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-white">Відео недоступне</p>
                            <p className="text-sm text-gray-500 mt-1">Фільм не має TMDB ID</p>
                          </div>
                          <button 
                            onClick={() => setIsPlaying(false)}
                            className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg text-sm transition-colors"
                          >
                            Закрити
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button onClick={() => setIsPlaying(true)}
                    className="w-full aspect-video bg-[#0a0a0f] rounded-xl border border-white/10 flex items-center justify-center group hover:border-blue-500/40 transition-all">
                    <div className="text-center">
                      <div className="relative inline-block mb-3">
                        <div className="absolute inset-0 bg-blue-500/30 blur-xl group-hover:blur-2xl transition-all" />
                        <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-2xl group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/30">
                          <Play className="w-10 h-10 text-white fill-white" />
                        </div>
                      </div>
                      <p className="text-xl font-semibold text-white">Дивитись фільм</p>
                      {m.duration && <p className="text-sm text-gray-500 mt-1">{m.duration}</p>}
                      {continueWatching.find(c => c.movieId === m.id) && (
                        <p className="text-xs text-blue-400 mt-1">
                          Продовжити з {continueWatching.find(c => c.movieId === m.id)?.progress}%
                        </p>
                      )}
                    </div>
                  </button>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-lg">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-bold text-yellow-400">{m.rating}</span>
                  </div>
                  {m.year > 0 && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="w-4 h-4" />{m.year}
                    </div>
                  )}
                  {m.duration && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="w-4 h-4" />{m.duration}
                    </div>
                  )}
                  {(m.hasVoiceover || (m.tmdbId && dubbingCache[m.tmdbId])) && (
                    <div className="flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 rounded-lg text-violet-400">
                      <Volume2 className="w-4 h-4" />
                      {dubbingCache[m.tmdbId || 0]?.studio || 'UA озвучка'}
                    </div>
                  )}
                </div>

                {/* Genres */}
                {m.genre.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Жанри</h3>
                    <div className="flex flex-wrap gap-2">
                      {m.genre.map(g => (
                        <button key={g} onClick={() => { setSelectedGenre(g); setSelectedMovie(null); }}
                          className="bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 px-3 py-1.5 rounded-lg text-sm text-gray-300 border border-white/10 hover:border-blue-500/30 transition-all">
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {m.description && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Опис</h3>
                    <p className="text-gray-300 leading-relaxed">{m.description}</p>
                  </div>
                )}

                {/* Director & Cast */}
                {(m.director || (m.cast && m.cast.length > 0)) && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {m.director && (
                      <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Режисер</h3>
                        <p className="text-white font-medium">{m.director}</p>
                      </div>
                    )}
                    {m.cast && m.cast.length > 0 && (
                      <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">У ролях</h3>
                        <p className="text-gray-400 text-sm">{m.cast.join(', ')}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Dubbing Info */}
                {m.tmdbId && dubbingCache[m.tmdbId] && (() => {
                  const dubbing = dubbingCache[m.tmdbId!]!;
                  return (
                    <div className="bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/20 rounded-xl p-4">
                      <h3 className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-3 flex items-center gap-2">
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

                <div className="pt-2 border-t border-white/5">
                  <UserRating movieId={m.id} />
                </div>

                <div className="pt-2 border-t border-white/5">
                  <RelatedMovies movie={selectedMovie} />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-2 border-t border-white/5">
                  <button onClick={() => toggleFavorite(m.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all border ${
                      favorites.includes(m.id)
                        ? 'bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30'
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                    }`}>
                    <Heart className={`w-5 h-5 ${favorites.includes(m.id) ? 'fill-red-400' : ''}`} />
                    {favorites.includes(m.id) ? 'В обраному' : 'До обраного'}
                  </button>
                  <button onClick={() => handleShare(selectedMovie)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all border ${
                      shareSuccess
                        ? 'bg-green-500/20 border-green-500/30 text-green-400'
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                    }`}>
                    {shareSuccess ? <><CheckCircle className="w-5 h-5" />Скопійовано!</> : <><Share2 className="w-5 h-5" />Поділитися</>}
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
          className="fixed bottom-8 right-8 p-3 bg-blue-500 text-white rounded-xl shadow-2xl shadow-blue-500/30 hover:scale-110 transition-all z-40 animate-fadeIn">
          <ChevronDown className="w-5 h-5 rotate-180" />
        </button>
      )}
    </div>
  );
}
