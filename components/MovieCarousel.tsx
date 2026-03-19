'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from '@/lib/movies';
import MovieCard from './MovieCard';
import { MovieCardSkeleton } from './Skeleton';

interface MovieCarouselProps {
  title: string;
  movies: Movie[];
  onPlay: (movie: Movie) => void;
  onInfo: (movie: Movie) => void;
  isLoading?: boolean;
  cardSize?: 'small' | 'medium' | 'large';
}

export default function MovieCarousel({
  title,
  movies,
  onPlay,
  onInfo,
  isLoading = false,
  cardSize = 'medium',
}: MovieCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const scrollAmount = direction === 'left' ? -400 : 400;
    carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <h2 className="text-xl md:text-2xl font-bold mb-4">{title}</h2>
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!movies.length) return null;

  return (
    <section className="py-6 group/carousel">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
          <div className="flex items-center gap-2 opacity-0 group-hover/carousel:opacity-100 transition-opacity">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto carousel-container pb-4 -mb-4"
        >
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onPlay={onPlay}
              onInfo={onInfo}
              size={cardSize}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
