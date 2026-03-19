'use client';

import { Film, Play, X, Clock, ChevronRight } from 'lucide-react';
import { useMovieStore } from '@/lib/store';
import { staticMovies } from '@/lib/movies';

export default function ContinueWatching() {
  const { continueWatching, removeFromContinueWatching, setSelectedMovie, setIsPlaying, addToHistory, allMovies } = useMovieStore();

  if (continueWatching.length === 0) return null;

  const movies = allMovies.length > 0 ? allMovies : staticMovies;
  const sorted = [...continueWatching].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="bg-ukr-dark-900 py-10 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-ukr-blue-500/20 border border-ukr-blue-500/30">
              <Play className="w-5 h-5 text-ukr-blue-400" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black font-bebas gradient-text-blue">
                Продовжити перегляд
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {sorted.length} {sorted.length === 1 ? 'фільм' : 'фільми'}
              </p>
            </div>
          </div>
          <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-ukr-blue-400 transition-colors">
            Всі <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Row */}
        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
          {sorted.map(({ movieId, progress }) => {
            const movie = movies.find(m => m.id === movieId);
            if (!movie) return null;

            const minutes = Math.round((progress / 100) * parseInt(movie.duration || '0'));
            const totalMinutes = parseInt(movie.duration || '0');

            return (
              <div
                key={movieId}
                className="relative flex-shrink-0 w-44 md:w-52 group cursor-pointer"
                onClick={() => {
                  setSelectedMovie(movie);
                  setIsPlaying(true);
                  addToHistory(movie.id);
                }}
              >
                <div
                  className="relative overflow-hidden rounded-2xl aspect-[2/3] bg-ukr-dark-700 border border-white/5 group-hover:border-ukr-blue-500/50 transition-all duration-300 card-premium"
                >
                  {/* Poster Image */}
                  {movie.posterUrl ? (
                    <img 
                      src={movie.posterUrl} 
                      alt={movie.title} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div 
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ background: movie.poster || movie.backdrop }}
                    >
                      <Film className="w-12 h-12 text-white/10" />
                    </div>
                  )}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ukr-dark-900 via-ukr-dark-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-ukr-blue-500 rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform shadow-2xl shadow-ukr-blue-500/50">
                      <Play className="w-7 h-7 text-white fill-white" />
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-ukr-dark-800/90">
                    <div
                      className="h-full bg-gradient-to-r from-ukr-blue-500 to-ukr-blue-400 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromContinueWatching(movieId);
                    }}
                    className="absolute top-3 right-3 p-2 bg-black/70 backdrop-blur-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/80 border border-white/10"
                    aria-label="Видалити"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Movie Info */}
                <div className="mt-3 space-y-1.5">
                  <h4 className="font-semibold text-sm text-white line-clamp-1 group-hover:text-ukr-blue-400 transition-colors">
                    {movie.title}
                  </h4>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{minutes > 0 ? `${minutes} / ${totalMinutes} хв` : 'Переглянуто'}</span>
                    </span>
                    <span className="text-ukr-blue-400 font-bold">{progress}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
