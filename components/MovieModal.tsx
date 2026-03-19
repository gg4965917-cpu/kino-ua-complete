'use client';

import { useEffect } from 'react';
import { X, Play, Heart, Star, Clock, Calendar, Volume2, Users, Film, Languages, Award } from 'lucide-react';
import Image from 'next/image';
import { Movie } from '@/lib/movies';
import { useMovieStore } from '@/lib/store';

interface MovieModalProps {
  movie: Movie;
  onClose: () => void;
  onPlay: () => void;
  dubbingInfo?: {
    studio?: string;
    quality?: string;
    hasSubtitles?: boolean;
    voiceActors?: string;
    title_uk?: string;
  } | null;
}

export default function MovieModal({ movie, onClose, onPlay, dubbingInfo }: MovieModalProps) {
  const { favorites, toggleFavorite } = useMovieStore();
  const isFavorite = favorites.includes(movie.id);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/90 backdrop-blur-lg" />

      {/* Modal Content */}
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl glass-strong animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Backdrop Image */}
        <div className="relative h-64 md:h-80">
          {movie.backdropUrl ? (
            <Image
              src={movie.backdropUrl}
              alt={movie.title}
              fill
              className="object-cover rounded-t-2xl"
              sizes="(max-width: 896px) 100vw, 896px"
            />
          ) : (
            <div
              className="w-full h-full rounded-t-2xl"
              style={{
                background: movie.backdrop || 'linear-gradient(135deg, #1a1a2e, #0f3460)',
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent rounded-t-2xl" />

          {/* Poster Overlay */}
          <div className="absolute bottom-0 left-6 translate-y-1/3 w-32 md:w-40 aspect-[2/3] rounded-lg overflow-hidden shadow-2xl border-4 border-card">
            {movie.posterUrl ? (
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                fill
                className="object-cover"
                sizes="160px"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  background: movie.poster || 'linear-gradient(135deg, #1a1a2e, #0f3460)',
                }}
              >
                <Film className="w-12 h-12 text-foreground/20" />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="pt-20 md:pt-24 px-6 pb-6">
          {/* Title & Actions */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-1">{movie.title}</h2>
              <p className="text-muted-foreground">{movie.titleEn}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onPlay}
                className="flex items-center gap-2 btn-primary px-6 py-3 rounded-lg font-semibold"
              >
                <Play className="w-5 h-5 fill-current" />
                Дивитись
              </button>
              <button
                onClick={() => toggleFavorite(movie.id)}
                className={`p-3 rounded-lg border transition-all ${
                  isFavorite
                    ? 'bg-destructive/20 border-destructive/30 text-destructive'
                    : 'btn-glass'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-destructive' : ''}`} />
              </button>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="flex items-center gap-1.5 bg-primary/20 text-primary px-3 py-1.5 rounded-full text-sm font-medium">
              <Star className="w-4 h-4 fill-primary" />
              {movie.rating}
            </span>
            <span className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full text-sm">
              <Calendar className="w-4 h-4" />
              {movie.year}
            </span>
            {movie.duration && (
              <span className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full text-sm">
                <Clock className="w-4 h-4" />
                {movie.duration}
              </span>
            )}
            {movie.hasVoiceover && (
              <span className="flex items-center gap-1.5 bg-primary/20 text-primary px-3 py-1.5 rounded-full text-sm font-medium">
                <Volume2 className="w-4 h-4" />
                UA Дубляж
              </span>
            )}
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-2 mb-6">
            {movie.genre.map((genre) => (
              <span
                key={genre}
                className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Опис</h3>
            <p className="text-muted-foreground leading-relaxed">{movie.description}</p>
          </div>

          {/* Dubbing Info */}
          {(dubbingInfo || movie.hasVoiceover) && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Languages className="w-5 h-5 text-primary" />
                Український дубляж
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {dubbingInfo?.studio && (
                  <div className="flex flex-col">
                    <span className="text-muted-foreground mb-1 flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Студія
                    </span>
                    <span className="font-medium text-primary">{dubbingInfo.studio}</span>
                  </div>
                )}
                {dubbingInfo?.quality && (
                  <div className="flex flex-col">
                    <span className="text-muted-foreground mb-1">Якість відео</span>
                    <span className="font-medium">{dubbingInfo.quality}</span>
                  </div>
                )}
                {dubbingInfo?.hasSubtitles !== undefined && (
                  <div className="flex flex-col">
                    <span className="text-muted-foreground mb-1">Субтитри UA</span>
                    <span className="font-medium">{dubbingInfo.hasSubtitles ? 'Доступні' : 'Недоступні'}</span>
                  </div>
                )}
                {!dubbingInfo && movie.hasVoiceover && (
                  <div className="flex flex-col col-span-2">
                    <span className="text-muted-foreground mb-1">Статус</span>
                    <span className="font-medium text-primary">Доступний українською</span>
                  </div>
                )}
                {dubbingInfo?.voiceActors && (
                  <div className="col-span-2 md:col-span-4">
                    <span className="text-muted-foreground block mb-1 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Актори озвучки
                    </span>
                    <span className="font-medium">{dubbingInfo.voiceActors}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cast & Director */}
          {(movie.director || movie.cast?.length) && (
            <div className="grid md:grid-cols-2 gap-6">
              {movie.director && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Режисер</h3>
                  <p className="text-muted-foreground">{movie.director}</p>
                </div>
              )}
              {movie.cast && movie.cast.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Актори
                  </h3>
                  <p className="text-muted-foreground">{movie.cast.join(', ')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
