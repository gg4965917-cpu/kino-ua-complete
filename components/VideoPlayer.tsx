'use client';

import { useState, useEffect } from 'react';
import { 
  Play, Tv, Film, Volume2, Maximize, RefreshCw, 
  ChevronRight, Sparkles, Zap, Monitor, X
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
  bgGradient: string;
  description: string;
  getUrl: (tmdbId: number) => string;
}

const PLAYERS: PlayerConfig[] = [
  {
    id: 'collaps',
    name: 'Collaps',
    icon: <Zap className="w-4 h-4" />,
    color: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-500/20 to-pink-500/20',
    description: 'Швидкий стрім',
    getUrl: (tmdbId) => `https://api.collaps.cc/embed/movie/${tmdbId}?player=11`,
  },
  {
    id: 'ashdi',
    name: 'Ashdi',
    icon: <Monitor className="w-4 h-4" />,
    color: 'from-cyan-500 to-blue-500',
    bgGradient: 'from-cyan-500/20 to-blue-500/20',
    description: 'HD якість',
    getUrl: (tmdbId) => `https://ashdi.vip/video/${tmdbId}`,
  },
  {
    id: 'vidsrc',
    name: 'VidSrc',
    icon: <Film className="w-4 h-4" />,
    color: 'from-orange-500 to-red-500',
    bgGradient: 'from-orange-500/20 to-red-500/20',
    description: 'Резервний',
    getUrl: (tmdbId) => `https://vidsrc.xyz/embed/movie/${tmdbId}`,
  },
];

export default function VideoPlayer({ tmdbId, title, onClose }: VideoPlayerProps) {
  const [activePlayer, setActivePlayer] = useState<PlayerSource>('collaps');
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);

  const currentPlayer = PLAYERS.find(p => p.id === activePlayer)!;

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 1500);
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
      {/* Player Selector - Stylish Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 bg-gradient-to-r from-gray-900/80 to-gray-800/80 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2 sm:mb-0">
          <Tv className="w-4 h-4 text-kino-yellow-400" />
          <span className="font-semibold">Плеєр:</span>
        </div>
        
        <div className="flex gap-2 flex-1">
          {PLAYERS.map((player) => (
            <button
              key={player.id}
              onClick={() => setActivePlayer(player.id)}
              className={`
                relative flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl 
                font-semibold text-sm transition-all duration-300 overflow-hidden
                ${activePlayer === player.id
                  ? `bg-gradient-to-r ${player.color} text-white shadow-lg scale-[1.02]`
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white border border-gray-700/50'
                }
              `}
            >
              {/* Animated background for active */}
              {activePlayer === player.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer" />
              )}
              
              <span className="relative z-10 flex items-center gap-2">
                {player.icon}
                <span className="hidden sm:inline">{player.name}</span>
              </span>
              
              {activePlayer === player.id && (
                <span className="relative z-10 hidden md:flex items-center gap-1 text-xs opacity-80">
                  <ChevronRight className="w-3 h-3" />
                  {player.description}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Video Player Container */}
      <div className="relative group">
        {/* Decorative Frame */}
        <div className={`absolute -inset-1 bg-gradient-to-r ${currentPlayer.color} rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-500`} />
        
        <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-gray-800">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 z-20 bg-gray-900/95 flex flex-col items-center justify-center">
              <div className="relative">
                <div className={`absolute inset-0 bg-gradient-to-r ${currentPlayer.color} rounded-full blur-xl opacity-50 animate-pulse`} />
                <div className={`relative bg-gradient-to-r ${currentPlayer.color} p-4 rounded-full animate-bounce`}>
                  <Play className="w-8 h-8 text-white fill-white" />
                </div>
              </div>
              <p className="mt-4 text-gray-400 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Завантаження {currentPlayer.name}...
              </p>
              <div className="mt-2 flex gap-1">
                {[0, 1, 2].map(i => (
                  <div 
                    key={i} 
                    className={`w-2 h-2 bg-gradient-to-r ${currentPlayer.color} rounded-full animate-bounce`}
                    style={{ animationDelay: `${i * 150}ms` }}
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

          {/* Custom Controls Overlay */}
          <div 
            className={`
              absolute bottom-0 left-0 right-0 p-4 
              bg-gradient-to-t from-black/90 via-black/50 to-transparent
              transform transition-all duration-300
              ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
            `}
            onMouseEnter={() => setShowControls(true)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r ${currentPlayer.bgGradient} border border-white/10`}>
                  {currentPlayer.icon}
                  <span className="text-sm font-semibold text-white">{currentPlayer.name}</span>
                </div>
                <span className="text-sm text-gray-400 truncate max-w-[200px]">{title}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleRefresh}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors group/btn"
                  title="Перезавантажити"
                >
                  <RefreshCw className="w-4 h-4 text-gray-300 group-hover/btn:rotate-180 transition-transform duration-500" />
                </button>
                <button 
                  onClick={handleFullscreen}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  title="На весь екран"
                >
                  <Maximize className="w-4 h-4 text-gray-300" />
                </button>
                {onClose && (
                  <button 
                    onClick={onClose}
                    className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
                    title="Закрити"
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Player Info Bar */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-gradient-to-r ${currentPlayer.bgGradient} border border-white/10`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gradient-to-r ${currentPlayer.color}`}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Поточний плеєр: {currentPlayer.name}</p>
            <p className="text-xs text-gray-400">
              {activePlayer === 'collaps' 
                ? 'Швидке завантаження, підтримка субтитрів' 
                : 'Висока якість, стабільний стрім'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Volume2 className="w-4 h-4" />
          <span>Українська озвучка доступна</span>
        </div>
      </div>

      {/* Alternative Player Hint */}
      <p className="text-center text-xs text-gray-500">
        Не працює? Спробуйте інший плеєр або натисніть кнопку оновлення
      </p>
    </div>
  );
}
