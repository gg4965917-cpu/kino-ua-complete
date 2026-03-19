'use client';

import { Film, Star, Play, Sparkles } from 'lucide-react';
import { Movie, staticMovies } from '@/lib/movies';
import { useMovieStore } from '@/lib/store';

interface RelatedMoviesProps {
  currentMovie: Movie;
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
}

export default function RelatedMovies({ currentMovie, movies, onSelectMovie }: RelatedMoviesProps) {
  const { addToHistory, setIsPlaying } = useMovieStore();

  const allMovies = movies.length > 0 ? movies : staticMovies;
  
  const related = allMovies
    .filter(m => m.id !== currentMovie.id && m.genre.some(g => currentMovie.genre.includes(g)))
    .sort((a, b) => {
      const aShared = a.genre.filter(g => currentMovie.genre.includes(g)).length;
      const bShared = b.genre.filter(g => currentMovie.genre.includes(g)).length;
      return bShared - aShared || b.rating - a.rating;
    })
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <div className="pt-6 border-t border-white/10">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-xl bg-ukr-blue-500/20 border border-ukr-blue-500/30">
          <Sparkles className="w-4 h-4 text-ukr-blue-400" />
        </div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Схожі фільми
        </h3>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {related.map(m => (
          <div
            key={m.id}
            className="group cursor-pointer"
            onClick={() => {
              onSelectMovie(m);
              setIsPlaying(false);
              addToHistory(m.id);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="relative overflow-hidden rounded-xl aspect-[2/3] mb-3 bg-ukr-dark-700 border border-white/5 group-hover:border-ukr-blue-500/50 transition-all duration-300 card-premium">
              {/* Poster Image */}
              {m.posterUrl ? (
                <img 
                  src={m.posterUrl} 
                  alt={m.title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div 
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: m.poster || m.backdrop }}
                >
                  <Film className="w-10 h-10 text-white/10" />
                </div>
              )}
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-ukr-dark-900 via-ukr-dark-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="bg-ukr-blue-500 rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform shadow-xl shadow-ukr-blue-500/50">
                  <Play className="w-6 h-6 text-white fill-white" />
                </div>
              </div>
              
              {/* Rating Badge */}
              <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 border border-ukr-accent-gold/20">
                <Star className="w-3 h-3 text-ukr-accent-gold fill-ukr-accent-gold" />
                <span className="text-xs font-bold text-white">{m.rating}</span>
              </div>
            </div>
            
            {/* Movie Info */}
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white line-clamp-1 group-hover:text-ukr-blue-400 transition-colors">
                {m.title}
              </p>
              <p className="text-xs text-gray-500">{m.year} - {m.genre[0]}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
