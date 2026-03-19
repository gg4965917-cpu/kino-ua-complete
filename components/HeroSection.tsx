'use client';

import { useState, useEffect, useMemo } from 'react';
import { Play, Info, Star, Clock, Volume2, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import Image from 'next/image';
import { Movie } from '@/lib/movies';
import { useMovieStore } from '@/lib/store';

interface HeroSectionProps {
  movies: Movie[];
  onPlay: (movie: Movie) => void;
  onInfo: (movie: Movie) => void;
}

export default function HeroSection({ movies, onPlay, onInfo }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { favorites, toggleFavorite } = useMovieStore();

  const heroMovies = useMemo(
    () => movies.filter((m) => m.isTrending || m.rating >= 7.5).slice(0, 5),
    [movies]
  );

  const currentHero = heroMovies[currentSlide] || movies[0];

  useEffect(() => {
    if (!heroMovies.length) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroMovies.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [heroMovies.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroMovies.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroMovies.length) % heroMovies.length);

  if (!currentHero) return null;

  const isFavorite = favorites.includes(currentHero.id);

  return (
    <div className="relative h-screen min-h-[600px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 transition-all duration-1000">
        {currentHero.backdropUrl ? (
          <Image
            src={currentHero.backdropUrl}
            alt={currentHero.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: currentHero.backdrop || 'linear-gradient(135deg, #0a0a0a, #1a1a2e)',
            }}
          />
        )}
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-background/40" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 md:px-6 w-full">
          <div className="max-w-2xl space-y-5 animate-fadeInUp">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-primary/20 border border-primary/30 text-primary px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                <Volume2 className="w-3 h-3" />
                UA Дубляж
              </span>
              <span className="flex items-center gap-1 bg-background/40 px-3 py-1.5 rounded-full border border-primary/30">
                <Star className="w-4 h-4 text-primary fill-primary" />
                <span className="font-bold text-primary">{currentHero.rating}</span>
              </span>
              <span className="bg-muted/50 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground">
                {currentHero.year}
              </span>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-none mb-2">
                <span className="gradient-text-white drop-shadow-2xl text-balance">
                  {currentHero.title}
                </span>
              </h1>
              <p className="text-muted-foreground text-sm md:text-lg">
                {currentHero.titleEn}
              </p>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {currentHero.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {currentHero.duration}
                </span>
              )}
              {currentHero.genre.length > 0 && (
                <>
                  <span className="text-border">|</span>
                  <span>{currentHero.genre.slice(0, 3).join(', ')}</span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-xl line-clamp-3">
              {currentHero.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onPlay(currentHero)}
                className="group flex items-center gap-2 btn-primary px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold text-sm md:text-base"
              >
                <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                Дивитись
              </button>
              <button
                onClick={() => onInfo(currentHero)}
                className="flex items-center gap-2 btn-glass px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold text-sm md:text-base"
              >
                <Info className="w-5 h-5" />
                Детальніше
              </button>
              <button
                onClick={() => toggleFavorite(currentHero.id)}
                className={`p-3 md:p-4 rounded-lg border transition-all ${
                  isFavorite
                    ? 'bg-destructive/20 border-destructive/30 text-destructive'
                    : 'btn-glass'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-destructive' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {heroMovies.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 glass p-3 rounded-full hover:bg-foreground/10 transition-all opacity-0 md:opacity-100 hover:opacity-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 glass p-3 rounded-full hover:bg-foreground/10 transition-all opacity-0 md:opacity-100 hover:opacity-100"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {heroMovies.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {heroMovies.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1 rounded-full transition-all ${
                index === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-foreground/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
