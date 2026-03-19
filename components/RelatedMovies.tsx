'use client';

import { Film, Star, Play } from 'lucide-react';
import { Movie, staticMovies } from '@/lib/movies';
import { useMovieStore } from '@/lib/store';

interface RelatedMoviesProps {
  movie: Movie;
}

export default function RelatedMovies({ movie }: RelatedMoviesProps) {
  const { setSelectedMovie, addToHistory, setIsPlaying, allMovies } = useMovieStore();

  const movies = allMovies.length > 0 ? allMovies : staticMovies;
  
  const related = movies
    .filter(m => m.id !== movie.id && m.genre.some(g => movie.genre.includes(g)))
    .sort((a, b) => {
      const aShared = a.genre.filter(g => movie.genre.includes(g)).length;
      const bShared = b.genre.filter(g => movie.genre.includes(g)).length;
      return bShared - aShared || b.rating - a.rating;
    })
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Схожі фільми
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {related.map(m => (
          <div
            key={m.id}
            className="group cursor-pointer"
            onClick={() => {
              setSelectedMovie(m);
              setIsPlaying(false);
              addToHistory(m.id);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div
              className="relative overflow-hidden rounded-xl aspect-[2/3] mb-2 border border-white/5 group-hover:border-blue-500/40 transition-all duration-300 card-premium"
              style={{ background: m.posterUrl ? 'transparent' : (m.poster || m.backdrop) }}
            >
              {/* Poster image */}
              {m.posterUrl ? (
                <img 
                  src={m.posterUrl} 
                  alt={m.title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Film className="w-8 h-8 text-white/10" />
                </div>
              )}
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="bg-blue-500 p-2 rounded-lg shadow-lg shadow-blue-500/30">
                  <Play className="w-5 h-5 text-white fill-white" />
                </div>
              </div>
              
              {/* Rating badge */}
              <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded-md flex items-center space-x-0.5">
                <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-bold text-white">{m.rating}</span>
              </div>
            </div>
            <p className="text-xs font-semibold text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
              {m.title}
            </p>
            <p className="text-xs text-gray-600">{m.year}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
