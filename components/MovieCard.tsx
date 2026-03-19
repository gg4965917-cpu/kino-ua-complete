'use client';

import { useState } from 'react';
import { Play, Star, Volume2, Heart, Plus, Info } from 'lucide-react';
import Image from 'next/image';
import { Movie } from '@/lib/movies';
import { useMovieStore } from '@/lib/store';

interface MovieCardProps {
  movie: Movie;
  onPlay: (movie: Movie) => void;
  onInfo: (movie: Movie) => void;
  size?: 'small' | 'medium' | 'large';
}

export default function MovieCard({ movie, onPlay, onInfo, size = 'medium' }: MovieCardProps) {
  const [imageError, setImageError] = useState(false);
  const { favorites, toggleFavorite } = useMovieStore();
  const isFavorite = favorites.includes(movie.id);

  const sizeClasses = {
    small: 'w-32 md:w-36',
    medium: 'w-40 md:w-44',
    large: 'w-48 md:w-56',
  };

  const aspectClasses = {
    small: 'aspect-[2/3]',
    medium: 'aspect-[2/3]',
    large: 'aspect-[2/3]',
  };

  return (
    <div className={`${sizeClasses[size]} flex-shrink-0 group`}>
      <div className={`relative ${aspectClasses[size]} rounded-lg overflow-hidden movie-card cursor-pointer`}>
        {/* Poster */}
        {movie.posterUrl && !imageError ? (
          <Image
            src={movie.posterUrl}
            alt={movie.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 160px, 200px"
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: movie.poster || 'linear-gradient(135deg, #1a1a2e, #0f3460)',
            }}
          >
            <span className="text-foreground/20 text-4xl font-bold">
              {movie.title.charAt(0)}
            </span>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Rating Badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
          <Star className="w-3 h-3 text-primary fill-primary" />
          <span className="text-xs font-semibold">{movie.rating}</span>
        </div>

        {/* UA Dubbing Badge */}
        {movie.hasVoiceover && (
          <div className="absolute top-2 left-2 bg-primary/90 backdrop-blur-sm p-1.5 rounded-full">
            <Volume2 className="w-3 h-3 text-primary-foreground" />
          </div>
        )}

        {/* Hover Actions */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlay(movie);
              }}
              className="bg-primary hover:bg-primary/80 p-2 rounded-full transition-colors"
            >
              <Play className="w-4 h-4 fill-primary-foreground text-primary-foreground" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(movie.id);
              }}
              className={`p-2 rounded-full transition-colors ${
                isFavorite
                  ? 'bg-destructive/80 hover:bg-destructive'
                  : 'bg-foreground/20 hover:bg-foreground/30'
              }`}
            >
              {isFavorite ? (
                <Heart className="w-4 h-4 fill-destructive-foreground text-destructive-foreground" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onInfo(movie);
              }}
              className="bg-foreground/20 hover:bg-foreground/30 p-2 rounded-full transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Title & Meta */}
      <div className="mt-2 px-1">
        <h3 className="text-sm font-medium truncate group-hover:text-primary transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
          <span>{movie.year}</span>
          {movie.genre[0] && (
            <>
              <span className="text-border">|</span>
              <span className="truncate">{movie.genre[0]}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
