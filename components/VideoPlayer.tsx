'use client';

import { useEffect, useState } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, Settings } from 'lucide-react';
import Image from 'next/image';
import { Movie } from '@/lib/movies';
import { useMovieStore } from '@/lib/store';

interface VideoPlayerProps {
  movie: Movie;
  onClose: () => void;
}

export default function VideoPlayer({ movie, onClose }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const { updateProgress } = useMovieStore();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Simulate playback progress
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((p) => {
        const newProgress = Math.min(p + 0.5, 100);
        updateProgress(movie.id, newProgress);
        return newProgress;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, movie.id, updateProgress]);

  // Hide controls after inactivity
  useEffect(() => {
    if (!showControls) return;
    const timeout = setTimeout(() => setShowControls(false), 3000);
    return () => clearTimeout(timeout);
  }, [showControls]);

  const handleMouseMove = () => setShowControls(true);

  const formatTime = (percent: number) => {
    const totalMinutes = 120; // Assume 2 hour movie
    const currentMinutes = Math.floor((percent / 100) * totalMinutes);
    const hours = Math.floor(currentMinutes / 60);
    const minutes = currentMinutes % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      onMouseMove={handleMouseMove}
      onClick={() => setIsPlaying((p) => !p)}
    >
      {/* Video/Backdrop */}
      <div className="relative w-full h-full">
        {movie.backdropUrl ? (
          <Image
            src={movie.backdropUrl}
            alt={movie.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: movie.backdrop || 'linear-gradient(135deg, #0a0a0a, #1a1a2e)',
            }}
          />
        )}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Play/Pause Overlay */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity ${
          isPlaying ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsPlaying(true);
          }}
          className="p-6 rounded-full bg-primary/90 hover:bg-primary transition-colors animate-pulse-glow"
        >
          <Play className="w-12 h-12 fill-primary-foreground text-primary-foreground" />
        </button>
      </div>

      {/* Top Bar */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent transition-opacity ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h2 className="text-xl font-bold">{movie.title}</h2>
            <p className="text-sm text-muted-foreground">{movie.titleEn}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-2 rounded-full bg-foreground/10 hover:bg-foreground/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Bottom Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent transition-opacity ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-7xl mx-auto space-y-3">
          {/* Progress Bar */}
          <div className="group relative">
            <div className="h-1 bg-foreground/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsPlaying((p) => !p)}
                className="p-2 rounded-full hover:bg-foreground/10 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 fill-current" />
                )}
              </button>
              <button className="p-2 rounded-full hover:bg-foreground/10 transition-colors">
                <SkipBack className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-full hover:bg-foreground/10 transition-colors">
                <SkipForward className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsMuted((m) => !m)}
                className="p-2 rounded-full hover:bg-foreground/10 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <span className="text-sm text-muted-foreground">
                {formatTime(progress)} / 2:00:00
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-full hover:bg-foreground/10 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-full hover:bg-foreground/10 transition-colors">
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Notice */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <div className="glass px-6 py-4 rounded-xl">
          <p className="text-sm text-muted-foreground">Демо-режим перегляду</p>
          <p className="text-xs text-muted-foreground mt-1">Натисніть пробіл для паузи, ESC для виходу</p>
        </div>
      </div>
    </div>
  );
}
