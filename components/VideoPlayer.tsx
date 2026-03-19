'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Play, Tv, Film, Volume2, Maximize, RefreshCw, 
  ChevronRight, Sparkles, Zap, Monitor, X, 
  ExternalLink, AlertCircle, Check, Loader2
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
  badge?: string;
  getUrl: (tmdbId: number) => string;
}

const PLAYERS: PlayerConfig[] = [
  {
    id: 'collaps',
    name: 'Collaps',
    icon: <Zap className="w-4 h-4" />,
    color: 'from-violet-500 to-purple-600',
    bgGradient: 'from-violet-500/20 to-purple-600/20',
    description: 'UA озвучка',
    badge: 'UA',
    getUrl: (tmdbId) => `https://api.collaps.cc/embed/movie/${tmdbId}?player=11`,
  },
  {
    id: 'ashdi',
    name: 'Ashdi',
    icon: <Monitor className="w-4 h-4" />,
    color: 'from-cyan-400 to-blue-500',
    bgGradient: 'from-cyan-400/20 to-blue-500/20',
    description: 'HD якість',
    badge: 'HD',
    getUrl: (tmdbId) => `https://ashdi.vip/video_embed/${tmdbId}`,
  },
  {
    id: 'vidsrc',
    name: 'VidSrc',
    icon: <Film className="w-4 h-4" />,
    color: 'from-orange-400 to-red-500',
    bgGradient: 'from-orange-400/20 to-red-500/20',
    description: 'Резервний',
    getUrl: (tmdbId) => `https://vidsrc.xyz/embed/movie/${tmdbId}`,
  },
];

export default function VideoPlayer({ tmdbId, title, onClose }: VideoPlayerProps) {
  const [activePlayer, setActivePlayer] = useState<PlayerSource>('collaps');
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const [showPlayerSelect, setShowPlayerSelect] = useState(false);

  const currentPlayer = PLAYERS.find(p => p.id === activePlayer)!;

  useEffect(() => {
    setIsLoading(true);
    setLoadError(false);
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [activePlayer, iframeKey]);

  const handleRefresh = useCallback(() => {
    setIframeKey(prev => prev + 1);
  }, []);

  const handleFullscreen = useCallback(() => {
    const iframe = document.querySelector('.video-iframe') as HTMLIFrameElement;
    if (iframe?.requestFullscreen) {
      iframe.requestFullscreen();
    }
  }, []);

  const switchPlayer = useCallback((playerId: PlayerSource) => {
    setActivePlayer(playerId);
    setShowPlayerSelect(false);
  }, []);

  return (
    <div className="space-y-4">
      {/* Premium Player Selector */}
      <div className="relative">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 sm:p-4 glass-premium rounded-2xl">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className={`p-1.5 rounded-lg bg-gradient-to-r ${currentPlayer.color}`}>
              <Tv className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-medium text-white">Плеєр</span>
          </div>
          
          <div className="flex gap-2 flex-1">
            {PLAYERS.map((player) => (
              <button
                key={player.id}
                onClick={() => switchPlayer(player.id)}
                className={`
                  relative flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl 
                  font-semibold text-xs sm:text-sm transition-all duration-300 overflow-hidden group
                  ${activePlayer === player.id
                    ? `bg-gradient-to-r ${player.color} text-white shadow-lg`
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5 hover:border-white/10'
                  }
                `}
              >
                {/* Shimmer effect for active */}
                {activePlayer === player.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                )}
                
                <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                  {player.icon}
                  <span className="hidden xs:inline">{player.name}</span>
                </span>
                
                {/* Badge */}
                {player.badge && activePlayer === player.id && (
                  <span className="relative z-10 hidden md:inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/20">
                    {player.badge}
                  </span>
                )}
                
                {/* Active indicator dot */}
                {activePlayer === player.id && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full border-2 border-[#0a0a0f] animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Video Player Container */}
      <div className="relative group">
        {/* Glow effect */}
        <div className={`absolute -inset-0.5 bg-gradient-to-r ${currentPlayer.color} rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-500`} />
        
        <div className="relative aspect-video bg-[#0a0a0f] rounded-xl overflow-hidden border border-white/10">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 z-20 bg-[#0a0a0f]/98 flex flex-col items-center justify-center">
              <div className="relative mb-6">
                {/* Outer ring */}
                <div className={`absolute inset-0 bg-gradient-to-r ${currentPlayer.color} rounded-full blur-2xl opacity-40 animate-pulse`} />
                
                {/* Player icon */}
                <div className={`relative bg-gradient-to-r ${currentPlayer.color} p-5 rounded-2xl shadow-2xl`}>
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              </div>
              
              <p className="text-white font-medium mb-1">{currentPlayer.name}</p>
              <p className="text-gray-500 text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                Завантаження відео...
              </p>
              
              {/* Loading dots */}
              <div className="flex gap-1 mt-4">
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

          {/* Error State */}
          {loadError && !isLoading && (
            <div className="absolute inset-0 z-20 bg-[#0a0a0f]/98 flex flex-col items-center justify-center p-4">
              <div className="bg-red-500/10 p-4 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-white font-medium mb-1">Помилка завантаження</p>
              <p className="text-gray-500 text-sm text-center mb-4">Спробуйте інший плеєр або оновіть сторінку</p>
              <div className="flex gap-2">
                <button 
                  onClick={handleRefresh}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Оновити
                </button>
                <button 
                  onClick={() => switchPlayer(activePlayer === 'collaps' ? 'ashdi' : 'collaps')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                  Інший плеєр
                </button>
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
            onError={() => setLoadError(true)}
          />

          {/* Bottom Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-gradient-to-r ${currentPlayer.bgGradient} border border-white/10`}>
                  {currentPlayer.icon}
                  <span className="text-xs sm:text-sm font-semibold text-white">{currentPlayer.name}</span>
                  {currentPlayer.badge && (
                    <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${
                      currentPlayer.badge === 'UA' ? 'bg-violet-500' : 'bg-cyan-500'
                    }`}>
                      {currentPlayer.badge}
                    </span>
                  )}
                </div>
                <span className="hidden sm:block text-xs sm:text-sm text-gray-400 truncate max-w-[150px] sm:max-w-[200px]">{title}</span>
              </div>
              
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button 
                  onClick={handleRefresh}
                  className="p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors group/btn"
                  title="Перезавантажити"
                >
                  <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-300 group-hover/btn:rotate-180 transition-transform duration-500" />
                </button>
                <button 
                  onClick={handleFullscreen}
                  className="p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  title="На весь екран"
                >
                  <Maximize className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-300" />
                </button>
                {onClose && (
                  <button 
                    onClick={onClose}
                    className="p-1.5 sm:p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
                    title="Закрити"
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Player Info */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl glass-premium`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gradient-to-r ${currentPlayer.color}`}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white flex items-center gap-2">
              {currentPlayer.name}
              <Check className="w-3.5 h-3.5 text-green-400" />
            </p>
            <p className="text-xs text-gray-500">
              {activePlayer === 'collaps' 
                ? 'Українське озвучення, субтитри' 
                : activePlayer === 'ashdi'
                ? 'Висока якість, стабільний стрім'
                : 'Резервний плеєр, оригінальна мова'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-violet-400" />
            <span>UA озвучка</span>
          </div>
          <div className="w-px h-3 bg-white/10" />
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span>Онлайн</span>
          </div>
        </div>
      </div>

      {/* Help text */}
      <p className="text-center text-xs text-gray-600">
        Не працює? Спробуйте <button onClick={() => switchPlayer(activePlayer === 'collaps' ? 'ashdi' : 'collaps')} className="text-blue-400 hover:text-blue-300 transition-colors">інший плеєр</button> або <button onClick={handleRefresh} className="text-blue-400 hover:text-blue-300 transition-colors">оновіть</button>
      </p>
    </div>
  );
}
