'use client';

import { Film, Play, X, Clock } from 'lucide-react';
import { useMovieStore } from '@/lib/store';
import { staticMovies } from '@/lib/movies';

export default function ContinueWatching() {
  const { continueWatching, removeFromContinueWatching, setSelectedMovie, setIsPlaying, addToHistory, allMovies } = useMovieStore();

  if (continueWatching.length === 0) return null;

  const movies = allMovies.length > 0 ? allMovies : staticMovies;
  const sorted = [...continueWatching].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="bg-[#0a0a0f] py-8 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Продовжити перегляд
            </h2>
            <div className="h-0.5 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mt-2" />
          </div>
          <span className="text-xs text-gray-600">{sorted.length} {sorted.length === 1 ? 'фільм' : 'фільми'}</span>
        </div>

        <div className="flex space-x-4 overflow-x-auto pb-3 scrollbar-hide">
          {sorted.map(({ movieId, progress }) => {
            const movie = movies.find(m => m.id === movieId);
            if (!movie) return null;

            const minutes = Math.round((progress / 100) * parseInt(movie.duration || '0'));
            const totalMinutes = parseInt(movie.duration || '0');

            return (
              <div
                key={movieId}
                className="relative flex-shrink-0 w-40 md:w-48 group cursor-pointer"
                onClick={() => {
                  setSelectedMovie(movie);
                  setIsPlaying(true);
                  addToHistory(movie.id);
                }}
              >
                <div
                  className="relative overflow-hidden rounded-xl aspect-[2/3] border border-white/5 group-hover:border-blue-500/40 transition-all duration-300 card-premium"
                  style={{ background: movie.posterUrl ? 'transparent' : (movie.poster || movie.backdrop) }}
                >
                  {/* Poster image */}
                  {movie.posterUrl && (
                    <img 
                      src={movie.posterUrl} 
                      alt={movie.title} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  )}
                  
                  {/* Fallback */}
                  {!movie.posterUrl && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Film className="w-10 h-10 text-white/10" />
                    </div>
                  )}
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-blue-500 rounded-xl p-3 transform scale-90 group-hover:scale-100 transition-transform shadow-lg shadow-blue-500/30">
                      <Play className="w-5 h-5 text-white fill-white" />
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromContinueWatching(movieId);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80 border border-white/10"
                    aria-label="Видалити"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>

                <div className="mt-2.5 space-y-1">
                  <h4 className="font-semibold text-sm text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
                    {movie.title}
                  </h4>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{minutes > 0 ? `${minutes} / ${totalMinutes} хв` : 'Переглянуто'}</span>
                    </span>
                    <span className="text-blue-400 font-semibold">{progress}%</span>
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
