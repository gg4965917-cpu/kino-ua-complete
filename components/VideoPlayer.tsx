'use client';

import { useState, useEffect } from 'react';
import { 
  Play, Tv, Film, Volume2, Maximize, RefreshCw, 
  Zap, Monitor, X
} from 'lucide-react';

interface VideoPlayerProps {
  tmdbId: number;
  title: string;
  onClose?: () => void;
}

type PlayerSource = 'collaps' | 'ashdi' | 'vidsrc';

interface PlayerConfig {
  id: PlayerSource;
  name: string;
  icon: React.ReactNode;
  color: string;
  activeClass: string;
  description: string;
  getUrl: (tmdbId: number) => string;
}

const PLAYERS: PlayerConfig[] = [
  {
    id: 'collaps',
    name: 'Collaps',
    icon: <Zap className="w-4 h-4" />,
    color: 'text-purple-400',
    activeClass: 'bg-purple-500/20 text-purple-400 ring-purple-500/30',
    description: 'Швидкий',
    getUrl: (tmdbId) => `https://api.collaps.cc/embed/movie/${tmdbId}?player=11`,
  },
  {
    id: 'ashdi',
    name: 'Ashdi',
    icon: <Monitor className="w-4 h-4" />,
    color: 'text-cyan-400',
    activeClass: 'bg-cyan-500/20 text-cyan-400 ring-cyan-500/30',
    description: 'HD',
    getUrl: (tmdbId) => `https://ashdi.vip/video/${tmdbId}`,
  },
  {
    id: 'vidsrc',
    name: 'VidSrc',
    icon: <Film className="w-4 h-4" />,
    color: 'text-orange-400',
    activeClass: 'bg-orange-500/20 text-orange-400 ring-orange-500/30',
    description: 'Backup',
    getUrl: (tmdbId) => `https://vidsrc.xyz/embed/movie/${tmdbId}`,
  },
];

export default function VideoPlayer({ tmdbId, title, onClose }: VideoPlayerProps) {
  const [activePlayer, setActivePlayer] = useState<PlayerSource>('collaps');
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);

  const currentPlayer = PLAYERS.find(p => p.id === activePlayer)!;

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, [activePlayer, iframeKey]);

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  const handleFullscreen = () => {
    const iframe = document.querySelector('.video-iframe') as HTMLIFrameElement;
    if (iframe?.requestFullscreen) {
      iframe.requestFullscreen();
    }
  };

  return (
    <div className="space-y-4">
      {/* Player Selector - Clean Minimal Design */}
      <div className="flex items-center justify-between gap-4 p-3 bg-white/5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Tv className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Плеєр</span>
          </div>
          
          <div className="flex gap-1.5">
            {PLAYERS.map((player) => (
              <button
                key={player.id}
                onClick={() => setActivePlayer(player.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl 
                  text-sm font-medium transition-all duration-200
                  ${activePlayer === player.id
                    ? `${player.activeClass} ring-1`
                    : 'text-gray-400 hover:text-white hover:bg-white/8'
                  }
                `}
              >
                {player.icon}
                <span className="hidden sm:inline">{player.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <button 
            onClick={handleRefresh}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            title="Оновити"
          >
            <RefreshCw className={`w-4 h-4 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={handleFullscreen}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            title="Повний екран"
          >
            <Maximize className="w-4 h-4 text-gray-400" />
          </button>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 transition-colors"
              title="Закрити"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-red-400" />
            </button>
          )}
        </div>
      </div>

      {/* Video Player Container */}
      <div className="relative">
        <div className="aspect-video bg-black rounded-2xl overflow-hidden ring-1 ring-white/10">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 z-20 bg-black/95 flex flex-col items-center justify-center">
              <div className="relative mb-4">
                <div className={`absolute inset-0 ${currentPlayer.color} rounded-2xl blur-2xl opacity-30 animate-pulse`} />
                <div className={`relative ${currentPlayer.activeClass} p-5 rounded-2xl`}>
                  <Play className="w-8 h-8 fill-current" />
                </div>
              </div>
              <p className="text-sm text-gray-400">Завантаження {currentPlayer.name}...</p>
              <div className="mt-3 flex gap-1">
                {[0, 1, 2].map(i => (
                  <div 
                    key={i} 
                    className={`w-1.5 h-1.5 ${currentPlayer.color} bg-current rounded-full animate-bounce`}
                    style={{ animationDelay: `${i * 100}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Iframe */}
          <iframe
            key={iframeKey}
            src={currentPlayer.getUrl(tmdbId)}
            className="video-iframe w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            referrerPolicy="origin"
            title={`${title} - ${currentPlayer.name}`}
            onLoad={() => setIsLoading(false)}
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1.5 ${currentPlayer.color}`}>
            {currentPlayer.icon}
            {currentPlayer.name} - {currentPlayer.description}
          </span>
          <span className="flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5" />
            UA озвучка
          </span>
        </div>
        <span className="text-gray-600">
          Не працює? Спробуйте інший плеєр
        </span>
      </div>
    </div>
  );
}
