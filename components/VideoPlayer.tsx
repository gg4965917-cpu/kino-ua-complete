'use client';

import { useState, useEffect } from 'react';
import { 
  Play, Tv, Film, Volume2, Maximize, RefreshCw, 
  ChevronRight, Sparkles, Zap, Monitor, X, Database,
  Check, AlertCircle, Settings
} from 'lucide-react';

interface VideoPlayerProps {
  tmdbId: number;
  title: string;
  onClose?: () => void;
}

type PlayerSource = 'videodb' | 'collaps' | 'ashdi' | 'vidsrc';

interface PlayerConfig {
  id: PlayerSource;
  name: string;
  fullName: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  borderColor: string;
  description: string;
  features: string[];
  getUrl: (tmdbId: number) => string;
}

const PLAYERS: PlayerConfig[] = [
  {
    id: 'videodb',
    name: 'VideoDB',
    fullName: 'VideoDB Pro',
    icon: <Database className="w-4 h-4" />,
    color: 'from-emerald-500 to-teal-500',
    bgGradient: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'border-emerald-500/40',
    description: 'Найкраща якість',
    features: ['4K HDR', 'Dolby Atmos', 'UA субтитри'],
    getUrl: (tmdbId) => `https://videodb.cc/movie/${tmdbId}`,
  },
  {
    id: 'collaps',
    name: 'Collaps',
    fullName: 'Videocdn Collaps',
    icon: <Zap className="w-4 h-4" />,
    color: 'from-violet-500 to-purple-500',
    bgGradient: 'from-violet-500/20 to-purple-500/20',
    borderColor: 'border-violet-500/40',
    description: 'Швидкий стрім',
    features: ['HD 1080p', 'Multi-audio', 'Швидкість'],
    getUrl: (tmdbId) => `https://api.collaps.cc/embed/movie/${tmdbId}?player=11`,
  },
  {
    id: 'ashdi',
    name: 'Ashdi',
    fullName: 'Ashdi Premium',
    icon: <Monitor className="w-4 h-4" />,
    color: 'from-cyan-500 to-blue-500',
    bgGradient: 'from-cyan-500/20 to-blue-500/20',
    borderColor: 'border-cyan-500/40',
    description: 'HD якість',
    features: ['HD 1080p', 'UA озвучка', 'Стабільний'],
    getUrl: (tmdbId) => `https://ashdi.vip/video/${tmdbId}`,
  },
  {
    id: 'vidsrc',
    name: 'VidSrc',
    fullName: 'VidSrc Backup',
    icon: <Film className="w-4 h-4" />,
    color: 'from-orange-500 to-red-500',
    bgGradient: 'from-orange-500/20 to-red-500/20',
    borderColor: 'border-orange-500/40',
    description: 'Резервний',
    features: ['HD 720p', 'EN Audio', 'Backup'],
    getUrl: (tmdbId) => `https://vidsrc.xyz/embed/movie/${tmdbId}`,
  },
];

export default function VideoPlayer({ tmdbId, title, onClose }: VideoPlayerProps) {
  const [activePlayer, setActivePlayer] = useState<PlayerSource>('videodb');
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [playerError, setPlayerError] = useState(false);

  const currentPlayer = PLAYERS.find(p => p.id === activePlayer)!;

  useEffect(() => {
    setIsLoading(true);
    setPlayerError(false);
    const timer = setTimeout(() => setIsLoading(false), 2000);
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

  const handlePlayerSwitch = (playerId: PlayerSource) => {
    setActivePlayer(playerId);
    setPlayerError(false);
  };

  return (
    <div className="space-y-5">
      {/* Premium Player Selector */}
      <div className="bg-ukr-dark-700/50 backdrop-blur-sm rounded-2xl border border-white/10 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-ukr-blue-500/20 to-ukr-blue-600/20 border border-ukr-blue-500/30">
            <Tv className="w-5 h-5 text-ukr-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Виберіть плеєр</h3>
            <p className="text-xs text-gray-500">Оберіть найкращий варіант для вас</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {PLAYERS.map((player) => (
            <button
              key={player.id}
              onClick={() => handlePlayerSwitch(player.id)}
              className={`
                relative flex flex-col items-start p-4 rounded-xl transition-all duration-300 overflow-hidden
                ${activePlayer === player.id
                  ? `bg-gradient-to-br ${player.bgGradient} border-2 ${player.borderColor} shadow-lg`
                  : 'bg-ukr-dark-600/50 border border-white/10 hover:bg-ukr-dark-500/50 hover:border-white/20'
                }
              `}
            >
              {/* Active Indicator */}
              {activePlayer === player.id && (
                <div className="absolute top-3 right-3">
                  <div className={`p-1 rounded-full bg-gradient-to-br ${player.color}`}>
                    <Check className="w-3 h-3 text-white" />
                  </div>
                </div>
              )}
              
              {/* Icon */}
              <div className={`p-2.5 rounded-xl mb-3 ${
                activePlayer === player.id 
                  ? `bg-gradient-to-br ${player.color}`
                  : 'bg-ukr-dark-500'
              }`}>
                {player.icon}
              </div>
              
              {/* Info */}
              <div className="space-y-1">
                <h4 className="font-semibold text-white text-sm">{player.name}</h4>
                <p className="text-xs text-gray-400">{player.description}</p>
              </div>
              
              {/* Features */}
              {activePlayer === player.id && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {player.features.map((feature, i) => (
                    <span 
                      key={i} 
                      className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/80"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Video Player Container */}
      <div className="relative group">
        {/* Decorative Glow */}
        <div className={`absolute -inset-1 bg-gradient-to-r ${currentPlayer.color} rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
        
        <div className="relative aspect-video bg-ukr-dark-900 rounded-2xl overflow-hidden border border-white/10">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 z-20 bg-ukr-dark-900/98 flex flex-col items-center justify-center">
              <div className="relative mb-6">
                <div className={`absolute inset-0 bg-gradient-to-r ${currentPlayer.color} rounded-full blur-2xl opacity-50 animate-pulse`} />
                <div className={`relative bg-gradient-to-br ${currentPlayer.color} p-5 rounded-full`}>
                  <Play className="w-10 h-10 text-white fill-white" />
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-white font-semibold">Завантаження {currentPlayer.fullName}</p>
                <p className="text-gray-500 text-sm">{currentPlayer.description}</p>
              </div>
              
              <div className="mt-6 flex gap-2">
                {[0, 1, 2].map(i => (
                  <div 
                    key={i} 
                    className={`w-2.5 h-2.5 bg-gradient-to-r ${currentPlayer.color} rounded-full animate-bounce`}
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Error State */}
          {playerError && (
            <div className="absolute inset-0 z-20 bg-ukr-dark-900/98 flex flex-col items-center justify-center p-8">
              <div className="bg-red-500/20 p-4 rounded-full mb-4">
                <AlertCircle className="w-10 h-10 text-red-400" />
              </div>
              <p className="text-white font-semibold mb-2">Помилка завантаження</p>
              <p className="text-gray-400 text-sm text-center mb-6">
                Спробуйте оновити плеєр або виберіть інший
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={handleRefresh}
                  className="flex items-center gap-2 bg-ukr-dark-600 hover:bg-ukr-dark-500 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Оновити
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
            title={`${title} - ${currentPlayer.fullName}`}
            onLoad={() => setIsLoading(false)}
            onError={() => setPlayerError(true)}
          />

          {/* Bottom Controls Overlay */}
          <div 
            className={`
              absolute bottom-0 left-0 right-0 p-5 
              bg-gradient-to-t from-ukr-dark-900 via-ukr-dark-900/80 to-transparent
              transform transition-all duration-300
              ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
            `}
            onMouseEnter={() => setShowControls(true)}
          >
            <div className="flex items-center justify-between">
              {/* Current Player Info */}
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${currentPlayer.bgGradient} border ${currentPlayer.borderColor}`}>
                  {currentPlayer.icon}
                  <span className="text-sm font-semibold text-white">{currentPlayer.fullName}</span>
                </div>
                <span className="text-sm text-gray-400 truncate max-w-[250px] hidden md:block">{title}</span>
              </div>
              
              {/* Control Buttons */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleRefresh}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors group/btn"
                  title="Перезавантажити"
                >
                  <RefreshCw className="w-5 h-5 text-gray-300 group-hover/btn:rotate-180 transition-transform duration-500" />
                </button>
                <button 
                  onClick={handleFullscreen}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                  title="На весь екран"
                >
                  <Maximize className="w-5 h-5 text-gray-300" />
                </button>
                {onClose && (
                  <button 
                    onClick={onClose}
                    className="p-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 transition-colors"
                    title="Закрити"
                  >
                    <X className="w-5 h-5 text-red-400" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Player Info Card */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r ${currentPlayer.bgGradient} border ${currentPlayer.borderColor}`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${currentPlayer.color}`}>
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-white">{currentPlayer.fullName}</p>
            <p className="text-sm text-gray-400 mt-0.5">
              {currentPlayer.features.join(' • ')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Volume2 className="w-4 h-4 text-ukr-blue-400" />
          <span>Українська озвучка доступна</span>
        </div>
      </div>

      {/* Help Text */}
      <p className="text-center text-sm text-gray-500 flex items-center justify-center gap-2">
        <Settings className="w-4 h-4" />
        Не працює? Спробуйте інший плеєр або натисніть кнопку оновлення
      </p>
    </div>
  );
}
