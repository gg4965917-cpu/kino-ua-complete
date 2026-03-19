'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  Languages,
  Subtitles,
  Loader2,
  RotateCcw,
  Check,
} from 'lucide-react';
import Image from 'next/image';
import { Movie } from '@/lib/movies';
import { useMovieStore } from '@/lib/store';

interface VideoPlayerProps {
  movie: Movie;
  onClose: () => void;
  videoUrl?: string;
}

// Demo video sources that work globally (including Ukraine)
const DEMO_VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
];

type AudioTrack = {
  id: string;
  label: string;
  language: string;
  isDefault?: boolean;
};

type Quality = {
  id: string;
  label: string;
  height: number;
};

export default function VideoPlayer({ movie, onClose, videoUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'quality' | 'audio' | 'subtitles'>('quality');
  
  // Audio and quality options
  const [audioTracks] = useState<AudioTrack[]>([
    { id: 'ua', label: 'Українська (Дубляж)', language: 'uk', isDefault: true },
    { id: 'en', label: 'English (Original)', language: 'en' },
  ]);
  const [selectedAudio, setSelectedAudio] = useState('ua');
  
  const [qualities] = useState<Quality[]>([
    { id: 'auto', label: 'Авто', height: 0 },
    { id: '1080p', label: '1080p HD', height: 1080 },
    { id: '720p', label: '720p', height: 720 },
    { id: '480p', label: '480p', height: 480 },
    { id: '360p', label: '360p', height: 360 },
  ]);
  const [selectedQuality, setSelectedQuality] = useState('auto');
  
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);

  const { updateProgress } = useMovieStore();

  // Get demo video based on movie id
  const getVideoSource = useCallback(() => {
    if (videoUrl) return videoUrl;
    return DEMO_VIDEOS[movie.id % DEMO_VIDEOS.length];
  }, [videoUrl, movie.id]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      switch (e.key) {
        case 'Escape':
          if (isFullscreen) {
            toggleFullscreen();
          } else {
            onClose();
          }
          break;
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'm':
          toggleMute();
          break;
        case 'ArrowLeft':
          skip(-10);
          break;
        case 'ArrowRight':
          skip(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          adjustVolume(0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          adjustVolume(-0.1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, onClose]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Auto-hide controls
  useEffect(() => {
    if (!showControls || !isPlaying) return;

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, isPlaying]);

  // Video event handlers
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      updateProgress(movie.id, progress);
    }
  };

  const handleProgress = () => {
    if (videoRef.current && videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setBuffered((bufferedEnd / videoRef.current.duration) * 100);
    }
  };

  const handleError = () => {
    setError('Помилка завантаження відео. Спробуйте пізніше.');
    setIsLoading(false);
  };

  const handleWaiting = () => setIsLoading(true);
  const handleCanPlay = () => setIsLoading(false);

  // Controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const adjustVolume = (delta: number) => {
    if (videoRef.current) {
      const newVolume = Math.max(0, Math.min(1, volume + delta));
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleVolumeChange = (value: number) => {
    if (videoRef.current) {
      videoRef.current.volume = value;
      setVolume(value);
      setIsMuted(value === 0);
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
    }
  };

  const handleSeek = (value: number) => {
    if (videoRef.current) {
      const time = (value / 100) * duration;
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return '0:00';
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      onMouseMove={handleMouseMove}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        src={getVideoSource()}
        poster={movie.backdropUrl}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onProgress={handleProgress}
        onError={handleError}
        onWaiting={handleWaiting}
        onCanPlay={handleCanPlay}
        onEnded={() => setIsPlaying(false)}
        onClick={togglePlay}
        playsInline
        crossOrigin="anonymous"
      />

      {/* Loading Spinner */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
          <div className="text-center p-8">
            <div className="text-red-500 mb-4 text-6xl">!</div>
            <p className="text-xl mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setIsLoading(true);
                videoRef.current?.load();
              }}
              className="flex items-center gap-2 bg-primary hover:bg-primary/80 px-6 py-3 rounded-lg transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Спробувати знову
            </button>
          </div>
        </div>
      )}

      {/* Play/Pause Center Overlay */}
      {!isPlaying && !error && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <button
            onClick={togglePlay}
            className="p-6 rounded-full bg-primary/90 hover:bg-primary transition-colors animate-pulse-glow pointer-events-auto"
          >
            <Play className="w-12 h-12 fill-primary-foreground text-primary-foreground" />
          </button>
        </div>
      )}

      {/* Top Bar */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-start justify-between max-w-7xl mx-auto">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl md:text-2xl font-bold truncate">{movie.title}</h2>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-sm text-muted-foreground truncate">{movie.titleEn}</p>
              {movie.hasVoiceover && (
                <span className="flex items-center gap-1 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                  <Languages className="w-3 h-3" />
                  UA Дубляж
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-foreground/10 hover:bg-foreground/20 transition-colors ml-4"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Bottom Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-7xl mx-auto space-y-3">
          {/* Progress Bar */}
          <div className="group relative h-1.5 bg-foreground/20 rounded-full overflow-hidden cursor-pointer">
            {/* Buffered */}
            <div
              className="absolute h-full bg-foreground/30 rounded-full"
              style={{ width: `${buffered}%` }}
            />
            {/* Progress */}
            <div
              className="absolute h-full bg-primary rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
            {/* Seek Handle */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${progressPercent}% - 8px)` }}
            />
            <input
              type="range"
              min="0"
              max="100"
              value={progressPercent}
              onChange={(e) => handleSeek(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {/* Time Display */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="p-2 md:p-3 rounded-full hover:bg-foreground/10 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 md:w-7 md:h-7" />
                ) : (
                  <Play className="w-6 h-6 md:w-7 md:h-7 fill-current" />
                )}
              </button>

              {/* Skip Back */}
              <button
                onClick={() => skip(-10)}
                className="p-2 rounded-full hover:bg-foreground/10 transition-colors hidden sm:block"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              {/* Skip Forward */}
              <button
                onClick={() => skip(10)}
                className="p-2 rounded-full hover:bg-foreground/10 transition-colors hidden sm:block"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2 group">
                <button
                  onClick={toggleMute}
                  className="p-2 rounded-full hover:bg-foreground/10 transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <div className="w-0 overflow-hidden group-hover:w-24 transition-all duration-300">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="w-full h-1 bg-foreground/20 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Settings */}
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-2 rounded-full transition-colors ${
                    showSettings ? 'bg-foreground/20' : 'hover:bg-foreground/10'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                </button>

                {/* Settings Menu */}
                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-2 w-72 bg-card/95 backdrop-blur-xl rounded-xl border border-border shadow-2xl overflow-hidden animate-scaleIn">
                    {/* Tabs */}
                    <div className="flex border-b border-border">
                      <button
                        onClick={() => setSettingsTab('quality')}
                        className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                          settingsTab === 'quality' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Якість
                      </button>
                      <button
                        onClick={() => setSettingsTab('audio')}
                        className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                          settingsTab === 'audio' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Аудіо
                      </button>
                      <button
                        onClick={() => setSettingsTab('subtitles')}
                        className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                          settingsTab === 'subtitles' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Субтитри
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-2 max-h-64 overflow-y-auto">
                      {settingsTab === 'quality' && (
                        <div className="space-y-1">
                          {qualities.map((q) => (
                            <button
                              key={q.id}
                              onClick={() => setSelectedQuality(q.id)}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                                selectedQuality === q.id
                                  ? 'bg-primary/20 text-primary'
                                  : 'hover:bg-muted/50'
                              }`}
                            >
                              <span>{q.label}</span>
                              {selectedQuality === q.id && <Check className="w-4 h-4" />}
                            </button>
                          ))}
                        </div>
                      )}

                      {settingsTab === 'audio' && (
                        <div className="space-y-1">
                          {audioTracks.map((track) => (
                            <button
                              key={track.id}
                              onClick={() => setSelectedAudio(track.id)}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                                selectedAudio === track.id
                                  ? 'bg-primary/20 text-primary'
                                  : 'hover:bg-muted/50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Languages className="w-4 h-4" />
                                <span>{track.label}</span>
                              </div>
                              {selectedAudio === track.id && <Check className="w-4 h-4" />}
                            </button>
                          ))}
                        </div>
                      )}

                      {settingsTab === 'subtitles' && (
                        <div className="space-y-1">
                          <button
                            onClick={() => setSubtitlesEnabled(false)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                              !subtitlesEnabled
                                ? 'bg-primary/20 text-primary'
                                : 'hover:bg-muted/50'
                            }`}
                          >
                            <span>Вимкнено</span>
                            {!subtitlesEnabled && <Check className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => setSubtitlesEnabled(true)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                              subtitlesEnabled
                                ? 'bg-primary/20 text-primary'
                                : 'hover:bg-muted/50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Subtitles className="w-4 h-4" />
                              <span>Українські</span>
                            </div>
                            {subtitlesEnabled && <Check className="w-4 h-4" />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-full hover:bg-foreground/10 transition-colors"
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard Hints */}
      <div
        className={`absolute bottom-28 left-1/2 -translate-x-1/2 transition-opacity duration-300 ${
          showControls && !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="glass px-4 py-2 rounded-full text-xs text-muted-foreground flex items-center gap-4">
          <span><kbd className="px-1.5 py-0.5 bg-muted rounded">Space</kbd> Пауза</span>
          <span><kbd className="px-1.5 py-0.5 bg-muted rounded">F</kbd> Повний екран</span>
          <span><kbd className="px-1.5 py-0.5 bg-muted rounded">M</kbd> Звук</span>
        </div>
      </div>
    </div>
  );
}
