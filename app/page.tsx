'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Filter, SlidersHorizontal, RefreshCw, Sparkles, Film, TrendingUp, Star } from 'lucide-react';
import { useMovieStore } from '@/lib/store';
import {
  staticMovies,
  genres,
  Movie,
  fetchPopularTMDB,
  fetchTopRatedTMDB,
  fetchNowPlayingTMDB,
  searchTMDB,
  fetchMovieDetails,
} from '@/lib/movies';
import { getDubbingByTmdbId, Dubbing } from '@/lib/dubbing';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import MovieCarousel from '@/components/MovieCarousel';
import MovieCard from '@/components/MovieCard';
import MovieModal from '@/components/MovieModal';
import VideoPlayer from '@/components/VideoPlayer';
import { HeroSkeleton, CarouselSkeleton, GridSkeleton } from '@/components/Skeleton';

export default function HomePage() {
  const {
    favorites,
    selectedGenre,
    setSelectedGenre,
    sortBy,
    setSortBy,
    voiceoverOnly,
    toggleVoiceoverOnly,
    searchQuery,
    activeCategory,
    selectedMovie,
    setSelectedMovie,
    isPlaying,
    setIsPlaying,
    addToHistory,
    userRatings,
    continueWatching,
    tmdbKey,
    setTmdbKey,
    allMovies,
    setAllMovies,
    addNotification,
  } = useMovieStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMovies, setIsFetchingMovies] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [movieDetailsCache, setMovieDetailsCache] = useState<Record<number, Partial<Movie>>>({});
  const [dubbingCache, setDubbingCache] = useState<Record<number, Dubbing | null>>({});
  const [isCollecting, setIsCollecting] = useState(false);

  const movies = allMovies.length > 0 ? allMovies : staticMovies;

  // Load TMDB movies
  const loadTMDB = useCallback(
    async (category: string, key: string) => {
      if (!key) return;
      setIsFetchingMovies(true);
      try {
        let fetched: Movie[] = [];
        if (category === 'Фільми' || category === 'Головна') {
          fetched = await fetchPopularTMDB(key);
        } else if (category === 'Топ') {
          fetched = await fetchTopRatedTMDB(key);
        } else if (category === 'Новинки') {
          fetched = await fetchNowPlayingTMDB(key);
        } else {
          fetched = await fetchPopularTMDB(key);
        }
        if (fetched.length) setAllMovies(fetched);
      } catch (e: any) {
        addNotification('TMDB: ' + e.message, 'error');
      } finally {
        setIsFetchingMovies(false);
      }
    },
    [setAllMovies, addNotification]
  );

  // Load movie details
  const loadMovieDetails = useCallback(
    async (movie: Movie) => {
      if (!tmdbKey || !movie.tmdbId || movieDetailsCache[movie.id]) return;
      try {
        const details = await fetchMovieDetails(movie.tmdbId, tmdbKey);
        setMovieDetailsCache((prev) => ({ ...prev, [movie.id]: details }));
      } catch {}
    },
    [tmdbKey, movieDetailsCache]
  );

  // Load dubbing info
  const loadDubbing = useCallback(
    async (tmdbId: number) => {
      if (dubbingCache[tmdbId] !== undefined) return dubbingCache[tmdbId];
      const info = await getDubbingByTmdbId(tmdbId);
      setDubbingCache((prev) => ({ ...prev, [tmdbId]: info }));
      return info;
    },
    [dubbingCache]
  );

  // Initial load
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    if (apiKey && !tmdbKey) {
      setTmdbKey(apiKey);
    }
    return () => clearTimeout(timer);
  }, [tmdbKey, setTmdbKey]);

  // Load movies when category changes
  useEffect(() => {
    if (tmdbKey) loadTMDB(activeCategory, tmdbKey);
  }, [activeCategory, tmdbKey, loadTMDB]);

  // Search movies
  useEffect(() => {
    if (!searchQuery || !tmdbKey) return;
    const timeout = setTimeout(async () => {
      try {
        const results = await searchTMDB(searchQuery, tmdbKey);
        if (results.length) setAllMovies(results);
      } catch {}
    }, 600);
    return () => clearTimeout(timeout);
  }, [searchQuery, tmdbKey, setAllMovies]);

  // Collect movies with AI
  const collectMovies = async () => {
    setIsCollecting(true);
    try {
      const response = await fetch('/api/collect-movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: 'popular', limit: 10 }),
      });
      const data = await response.json();
      if (data.success) {
        addNotification(
          `Зібрано ${data.summary.processed} фільмів з UA дубляжем`,
          'success'
        );
        // Refresh movies from database
        const dbResponse = await fetch('/api/movies-with-dubbing');
        const dbData = await dbResponse.json();
        if (dbData.movies?.length) {
          setAllMovies(dbData.movies);
        }
      }
    } catch (error) {
      addNotification('Помилка збору фільмів', 'error');
    } finally {
      setIsCollecting(false);
    }
  };

  // Filter movies
  const filteredMovies = useMemo(() => {
    let list = [...movies];

    if (activeCategory === 'Мій список') {
      return list.filter((m) => favorites.includes(m.id)).sort((a, b) => b.rating - a.rating);
    }
    if (activeCategory === 'Переглянуті') {
      const ids = continueWatching.map((c) => c.movieId);
      return list.filter((m) => ids.includes(m.id));
    }
    if (activeCategory === 'Топ') {
      list = list.filter((m) => m.rating >= 7.5);
    }
    if (activeCategory === 'Новинки') {
      list = list.filter((m) => m.year >= new Date().getFullYear() - 2);
    }
    if (voiceoverOnly) {
      list = list.filter((m) => m.hasVoiceover);
    }
    if (selectedGenre !== 'all') {
      list = list.filter((m) => m.genre.includes(selectedGenre));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.titleEn.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'year':
          return b.year - a.year;
        case 'title':
          return a.title.localeCompare(b.title, 'uk');
        case 'trending':
          return (b.viewCount || 0) - (a.viewCount || 0);
        case 'myrating':
          return (userRatings[b.id] || 0) - (userRatings[a.id] || 0);
      }
      return 0;
    });

    return list;
  }, [
    movies,
    voiceoverOnly,
    selectedGenre,
    searchQuery,
    sortBy,
    favorites,
    activeCategory,
    userRatings,
    continueWatching,
  ]);

  // Movie sections
  const trendingMovies = useMemo(
    () => movies.filter((m) => m.isTrending || (m.viewCount || 0) > 50000).slice(0, 15),
    [movies]
  );
  const topRatedMovies = useMemo(
    () => [...movies].sort((a, b) => b.rating - a.rating).slice(0, 15),
    [movies]
  );
  const newMovies = useMemo(
    () =>
      [...movies]
        .filter((m) => m.year >= new Date().getFullYear() - 2)
        .sort((a, b) => b.year - a.year)
        .slice(0, 15),
    [movies]
  );

  // Movie handlers
  const openMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    addToHistory(movie.id);
    loadMovieDetails(movie);
    if (movie.tmdbId) loadDubbing(movie.tmdbId);
  };

  const playMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsPlaying(true);
    addToHistory(movie.id);
  };

  const closeModal = () => {
    setSelectedMovie(null);
    setIsPlaying(false);
  };

  const detailsOf = (m: Movie) => ({
    ...m,
    ...(movieDetailsCache[m.id] || {}),
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onMovieSelect={openMovie} />
        <HeroSkeleton />
        <CarouselSkeleton />
        <CarouselSkeleton />
      </div>
    );
  }

  const showGridView = searchQuery || activeCategory === 'Мій список' || activeCategory === 'Переглянуті';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar onMovieSelect={openMovie} />

      {/* Hero Section */}
      {!showGridView && (
        <HeroSection movies={trendingMovies} onPlay={playMovie} onInfo={openMovie} />
      )}

      {/* Main Content */}
      <main className={showGridView ? 'pt-24' : ''}>
        {/* AI Collection Button */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">
                {activeCategory === 'Головна' ? 'Дивіться з UA дубляжем' : activeCategory}
              </h1>
              {activeCategory === 'Головна' && (
                <button
                  onClick={collectMovies}
                  disabled={isCollecting}
                  className="flex items-center gap-2 text-sm bg-primary/20 hover:bg-primary/30 text-primary px-4 py-2 rounded-full transition-colors disabled:opacity-50"
                >
                  {isCollecting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {isCollecting ? 'Збираємо...' : 'AI Пошук'}
                </button>
              )}
            </div>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                showFilters ? 'bg-primary/20 border-primary/30 text-primary' : 'border-border hover:bg-muted/30'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Фільтри
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 rounded-xl glass animate-fadeIn">
              <div className="flex flex-wrap gap-4">
                {/* Genre Filter */}
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm text-muted-foreground mb-2 block">Жанр</label>
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  >
                    {genres.map((g) => (
                      <option key={g} value={g}>
                        {g === 'all' ? 'Всі жанри' : g}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm text-muted-foreground mb-2 block">Сортування</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="rating">За рейтингом</option>
                    <option value="year">За роком</option>
                    <option value="title">За назвою</option>
                    <option value="trending">За популярністю</option>
                  </select>
                </div>

                {/* Voiceover Filter */}
                <div className="flex items-end">
                  <button
                    onClick={toggleVoiceoverOnly}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      voiceoverOnly
                        ? 'bg-primary/20 border-primary/30 text-primary'
                        : 'border-border hover:bg-muted/30'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    Тільки з озвучкою
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Grid View for Search/Favorites */}
        {showGridView ? (
          <div className="max-w-7xl mx-auto px-4 md:px-6 pb-12">
            {filteredMovies.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredMovies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={detailsOf(movie)}
                    onPlay={playMovie}
                    onInfo={openMovie}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Film className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Нічого не знайдено</h3>
                <p className="text-muted-foreground">
                  Спробуйте змінити параметри пошуку або фільтри
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Carousel View */
          <div className="space-y-2 pb-12">
            {/* Trending */}
            <MovieCarousel
              title="ЗАРАЗ У ТРЕНДІ"
              movies={trendingMovies}
              onPlay={playMovie}
              onInfo={openMovie}
              isLoading={isFetchingMovies}
            />

            {/* Top Rated */}
            <MovieCarousel
              title="ТОП РЕЙТИНГ"
              movies={topRatedMovies}
              onPlay={playMovie}
              onInfo={openMovie}
              isLoading={isFetchingMovies}
            />

            {/* New Releases */}
            <MovieCarousel
              title="НОВИНКИ"
              movies={newMovies}
              onPlay={playMovie}
              onInfo={openMovie}
              isLoading={isFetchingMovies}
            />

            {/* Continue Watching */}
            {continueWatching.length > 0 && (
              <MovieCarousel
                title="ПРОДОВЖИТИ ПЕРЕГЛЯД"
                movies={movies.filter((m) =>
                  continueWatching.some((c) => c.movieId === m.id)
                )}
                onPlay={playMovie}
                onInfo={openMovie}
              />
            )}

            {/* All Movies */}
            {filteredMovies.length > 0 && (
              <MovieCarousel
                title="ВСІ ФІЛЬМИ"
                movies={filteredMovies.slice(0, 20)}
                onPlay={playMovie}
                onInfo={openMovie}
                isLoading={isFetchingMovies}
              />
            )}
          </div>
        )}
      </main>

      {/* Movie Modal */}
      {selectedMovie && !isPlaying && (
        <MovieModal
          movie={detailsOf(selectedMovie)}
          onClose={closeModal}
          onPlay={() => setIsPlaying(true)}
          dubbingInfo={
            selectedMovie.tmdbId
              ? dubbingCache[selectedMovie.tmdbId]
              : null
          }
        />
      )}

      {/* Video Player */}
      {selectedMovie && isPlaying && (
        <VideoPlayer movie={detailsOf(selectedMovie)} onClose={closeModal} />
      )}
    </div>
  );
}
