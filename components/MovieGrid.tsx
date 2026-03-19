'use client';

import { useState } from 'react';
import { Star, Play, Sparkles } from 'lucide-react';
import { Movie } from '@/lib/movies';

interface MovieGridProps {
  title: string;
  movies: Movie[];
  onMovieClick?: (movie: Movie) => void;
  isLoading?: boolean;
}

export default function MovieGrid({
  title,
  movies,
  onMovieClick,
  isLoading = false,
}: MovieGridProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div className="w-full px-4 md:px-8 lg:px-16 py-12">
      <div className="space-y-8">
        {/* Section Title */}
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-ukr-blue" />
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">
            {title}
          </h2>
        </div>

        {/* Movie Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {isLoading
            ? Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[2/3] bg-gray-800 rounded-xl animate-pulse"
                />
              ))
            : movies.map((movie) => (
                <div
                  key={movie.id}
                  className="group cursor-pointer"
                  onMouseEnter={() => setHoveredId(movie.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => onMovieClick?.(movie)}
                >
                  <div
                    className={`relative overflow-hidden rounded-xl aspect-[2/3] transition-all duration-300 ${
                      hoveredId === movie.id
                        ? 'ring-2 ring-ukr-blue shadow-2xl shadow-ukr-blue/20'
                        : 'ring-1 ring-white/10'
                    }`}
                  >
                    {/* Poster Image */}
                    {movie.posterUrl ? (
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <Sparkles className="w-12 h-12 text-white/20" />
                      </div>
                    )}

                    {/* Overlay on Hover */}
                    {hoveredId === movie.id && (
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-4 animate-fadeIn">
                        <div className="p-3 bg-ukr-blue rounded-full">
                          <Play className="w-6 h-6 text-white fill-white" />
                        </div>
                        <p className="text-sm font-semibold text-center px-2">
                          {movie.title}
                        </p>
                      </div>
                    )}

                    {/* Rating Badge */}
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/80 backdrop-blur px-2 py-1 rounded-lg">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-bold text-white">
                        {movie.rating}
                      </span>
                    </div>

                    {/* Quality Badge */}
                    {hoveredId === movie.id && (
                      <div className="absolute top-2 right-2 bg-ukr-blue/80 backdrop-blur px-2 py-1 rounded-lg animate-scaleIn">
                        <span className="text-xs font-bold text-white">
                          {Math.random() > 0.5 ? '4K' : 'HD'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Title Below */}
                  <div className="mt-2 space-y-1">
                    <h3 className="text-sm font-semibold line-clamp-1 group-hover:text-ukr-blue transition-colors">
                      {movie.title}
                    </h3>
                    <p className="text-xs text-gray-500">{movie.year}</p>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
