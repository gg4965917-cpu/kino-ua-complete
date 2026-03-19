'use client';

import { Play, Info } from 'lucide-react';
import { Movie } from '@/lib/movies';

interface HeroSectionProps {
  movie?: Movie;
  onPlay?: () => void;
  onInfo?: () => void;
}

export default function HeroSection({ movie, onPlay, onInfo }: HeroSectionProps) {
  const backgroundImage = movie?.backdrop || movie?.posterUrl || '/placeholder-hero.jpg';

  return (
    <div className="relative w-full h-screen mt-20 md:mt-24 overflow-hidden group">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${backgroundImage}')`,
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-4 md:px-8 lg:px-16 max-w-4xl">
        <div className="space-y-6 animate-fadeInUp">
          {/* Title */}
          {movie && (
            <>
              <div>
                <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-tight">
                  {movie.title}
                </h1>
                {movie.subtitle && (
                  <p className="text-2xl md:text-3xl text-gray-300 mt-2 font-light">
                    {movie.subtitle}
                  </p>
                )}
              </div>

              {/* Description */}
              <p className="text-lg text-gray-300 max-w-2xl line-clamp-3">
                {movie.description}
              </p>

              {/* Meta Info */}
              <div className="flex items-center gap-6 text-sm md:text-base">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400 font-bold text-lg">★</span>
                  <span className="text-white font-semibold">{movie.rating}</span>
                </div>
                <div className="text-gray-400">{movie.year}</div>
                <div className="text-gray-400">{movie.duration} хв</div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={onPlay}
                  className="group/btn flex items-center gap-3 bg-ukr-blue hover:bg-ukr-blue-light px-8 py-3 md:px-10 md:py-4 rounded-lg font-bold text-black transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-2xl"
                >
                  <Play className="w-5 h-5 md:w-6 md:h-6 fill-black" />
                  <span className="text-sm md:text-base">ДИВИТИСЯ</span>
                </button>

                <button
                  onClick={onInfo}
                  className="flex items-center gap-3 border-2 border-white/30 hover:border-ukr-blue px-8 py-3 md:px-10 md:py-4 rounded-lg font-bold text-white transition-all duration-200 hover:bg-white/5"
                >
                  <Info className="w-5 h-5 md:w-6 md:h-6" />
                  <span className="text-sm md:text-base">ІНФО</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-black pointer-events-none" />
    </div>
  );
}
