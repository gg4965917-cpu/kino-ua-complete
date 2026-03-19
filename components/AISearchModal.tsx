'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Search, Sparkles, Loader2, Film, Volume2, Check, AlertCircle, Star, Calendar } from 'lucide-react';
import Image from 'next/image';
import { Movie, tmdbToMovie } from '@/lib/movies';
import { useMovieStore } from '@/lib/store';

interface AISearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMovieSelect: (movie: Movie) => void;
}

interface SearchResult extends Movie {
  dubbingInfo?: {
    hasUkrainianDubbing: boolean;
    studio?: string;
    quality?: string;
    confidence: number;
  };
  isSearchingDubbing?: boolean;
}

export default function AISearchModal({ isOpen, onClose, onMovieSelect }: AISearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchedIds, setSearchedIds] = useState<Set<number>>(new Set());
  const { addNotification } = useMovieStore();

  // Close on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Search TMDB
  const searchMovies = useCallback(async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setResults([]);
    
    try {
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      if (!apiKey) {
        addNotification('TMDB API ключ не налаштовано', 'error');
        return;
      }

      // Search in Ukrainian first, then in English
      const [ukRes, enRes] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=uk-UA&query=${encodeURIComponent(query)}&page=1`),
        fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=en-US&query=${encodeURIComponent(query)}&page=1`),
      ]);

      const [ukData, enData] = await Promise.all([ukRes.json(), enRes.json()]);
      
      // Merge results, prefer Ukrainian data
      const mergedResults = new Map<number, any>();
      
      // Add English results first
      (enData.results || []).forEach((movie: any) => {
        mergedResults.set(movie.id, { ...movie, titleEn: movie.title });
      });
      
      // Override with Ukrainian data
      (ukData.results || []).forEach((movie: any) => {
        const existing = mergedResults.get(movie.id);
        if (existing) {
          mergedResults.set(movie.id, {
            ...existing,
            ...movie,
            title: movie.title || existing.title,
            overview: movie.overview || existing.overview,
            titleEn: existing.titleEn || movie.original_title,
          });
        } else {
          mergedResults.set(movie.id, { ...movie, titleEn: movie.original_title });
        }
      });

      const movies: SearchResult[] = Array.from(mergedResults.values())
        .slice(0, 15)
        .map((m) => ({
          ...tmdbToMovie(m),
          title: m.title || m.original_title,
          titleEn: m.titleEn || m.original_title,
          description: m.overview || '',
        }));

      setResults(movies);
      setSearchedIds(new Set());
    } catch (error) {
      console.error('Search error:', error);
      addNotification('Помилка пошуку', 'error');
    } finally {
      setIsSearching(false);
    }
  }, [query, addNotification]);

  // Search dubbing with AI for a specific movie
  const searchDubbing = async (movie: SearchResult) => {
    if (!movie.tmdbId || searchedIds.has(movie.tmdbId)) return;

    setResults((prev) =>
      prev.map((m) =>
        m.id === movie.id ? { ...m, isSearchingDubbing: true } : m
      )
    );

    try {
      const response = await fetch('/api/ai-dubbing-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tmdbId: movie.tmdbId,
          title: movie.title,
        }),
      });

      const data = await response.json();
      
      setResults((prev) =>
        prev.map((m) =>
          m.id === movie.id
            ? {
                ...m,
                isSearchingDubbing: false,
                hasVoiceover: data.data ? true : false,
                dubbingInfo: data.aiInfo || data.data ? {
                  hasUkrainianDubbing: !!data.data,
                  studio: data.data?.studio || data.aiInfo?.studio,
                  quality: data.data?.quality || data.aiInfo?.quality,
                  confidence: data.aiInfo?.confidence || 0.8,
                } : undefined,
              }
            : m
        )
      );

      setSearchedIds((prev) => new Set([...prev, movie.tmdbId!]));

      if (data.data) {
        addNotification(`Знайдено дубляж: ${data.data.studio || 'UA'}`, 'success');
      }
    } catch (error) {
      setResults((prev) =>
        prev.map((m) =>
          m.id === movie.id ? { ...m, isSearchingDubbing: false } : m
        )
      );
    }
  };

  // Auto-search dubbing for all results
  const searchAllDubbing = async () => {
    for (const movie of results) {
      if (!searchedIds.has(movie.tmdbId!)) {
        await searchDubbing(movie);
        await new Promise((r) => setTimeout(r, 500)); // Rate limit
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchMovies();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 md:pt-32 p-4 animate-fadeIn">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/90 backdrop-blur-xl" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-3xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">AI Пошук з UA дубляжем</h2>
                <p className="text-sm text-muted-foreground">Знаходить фільми з українським озвучуванням</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Введіть назву фільму українською або англійською..."
                className="w-full pl-12 pr-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                autoFocus
              />
            </div>
            <button
              onClick={searchMovies}
              disabled={isSearching || !query.trim()}
              className="px-6 bg-primary hover:bg-primary/80 text-primary-foreground rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSearching ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              <span className="hidden sm:inline">Шукати</span>
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {results.length > 0 && (
            <div className="p-2 border-b border-border bg-muted/30 flex items-center justify-between">
              <span className="text-sm text-muted-foreground px-2">
                Знайдено {results.length} фільмів
              </span>
              <button
                onClick={searchAllDubbing}
                className="text-sm text-primary hover:underline flex items-center gap-1 px-2"
              >
                <Sparkles className="w-4 h-4" />
                Перевірити всі на UA дубляж
              </button>
            </div>
          )}

          {results.length === 0 && !isSearching && query && (
            <div className="p-12 text-center">
              <Film className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Нічого не знайдено</p>
              <p className="text-sm text-muted-foreground mt-1">Спробуйте інший запит</p>
            </div>
          )}

          {results.length === 0 && !isSearching && !query && (
            <div className="p-12 text-center">
              <Sparkles className="w-12 h-12 text-primary/50 mx-auto mb-3" />
              <p className="text-muted-foreground">Почніть пошук фільму</p>
              <p className="text-sm text-muted-foreground mt-1">AI автоматично знайде українське озвучування</p>
            </div>
          )}

          <div className="divide-y divide-border">
            {results.map((movie) => (
              <div
                key={movie.id}
                className="p-4 hover:bg-muted/30 transition-colors cursor-pointer group"
                onClick={() => onMovieSelect(movie)}
              >
                <div className="flex gap-4">
                  {/* Poster */}
                  <div className="w-16 md:w-20 aspect-[2/3] rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                    {movie.posterUrl ? (
                      <Image
                        src={movie.posterUrl}
                        alt={movie.title}
                        width={80}
                        height={120}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                          {movie.title}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">{movie.titleEn}</p>
                      </div>
                      
                      {/* Dubbing Status */}
                      {movie.isSearchingDubbing ? (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground px-2 py-1 bg-muted/50 rounded-full">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Пошук...
                        </div>
                      ) : movie.dubbingInfo ? (
                        movie.dubbingInfo.hasUkrainianDubbing ? (
                          <div className="flex items-center gap-1 text-xs text-primary px-2 py-1 bg-primary/20 rounded-full">
                            <Check className="w-3 h-3" />
                            UA Дубляж
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground px-2 py-1 bg-muted/50 rounded-full">
                            <AlertCircle className="w-3 h-3" />
                            Без дубляжу
                          </div>
                        )
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            searchDubbing(movie);
                          }}
                          className="flex items-center gap-1 text-xs text-primary hover:bg-primary/20 px-2 py-1 rounded-full transition-colors"
                        >
                          <Sparkles className="w-3 h-3" />
                          Перевірити
                        </button>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-3 mt-2 text-sm">
                      <span className="flex items-center gap-1 text-primary">
                        <Star className="w-4 h-4 fill-primary" />
                        {movie.rating}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {movie.year}
                      </span>
                      {movie.hasVoiceover && (
                        <span className="flex items-center gap-1 text-primary">
                          <Volume2 className="w-4 h-4" />
                          UA
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {movie.description || 'Опис відсутній'}
                    </p>

                    {/* Dubbing Info */}
                    {movie.dubbingInfo?.hasUkrainianDubbing && movie.dubbingInfo.studio && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Студія: <span className="text-foreground">{movie.dubbingInfo.studio}</span>
                        {movie.dubbingInfo.quality && (
                          <> | Якість: <span className="text-foreground">{movie.dubbingInfo.quality}</span></>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        {results.length > 0 && (
          <div className="p-4 border-t border-border bg-muted/30 text-center text-sm text-muted-foreground">
            Клікніть на фільм для перегляду деталей
          </div>
        )}
      </div>
    </div>
  );
}
