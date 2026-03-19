'use client';

import { useState, useEffect } from 'react';
import { Search, Film, X, Menu, TrendingUp, Star, Sparkles, Heart, Tv, Wand2 } from 'lucide-react';
import { useMovieStore } from '@/lib/store';
import AISearchModal from './AISearchModal';
import { Movie } from '@/lib/movies';

const CATEGORIES = [
  { name: 'Головна', icon: Film },
  { name: 'Фільми', icon: TrendingUp },
  { name: 'Серіали', icon: Tv },
  { name: 'Новинки', icon: Sparkles },
  { name: 'Топ', icon: Star },
  { name: 'Мій список', icon: Heart },
];

interface NavbarProps {
  onMovieSelect?: (movie: Movie) => void;
}

export default function Navbar({ onMovieSelect }: NavbarProps) {
  const {
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    resetFilters,
    setSelectedMovie,
  } = useMovieStore();

  const [scrolled, setScrolled] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAISearch, setShowAISearch] = useState(false);

  const handleAIMovieSelect = (movie: Movie) => {
    setShowAISearch(false);
    if (onMovieSelect) {
      onMovieSelect(movie);
    } else {
      setSelectedMovie(movie);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'glass-strong shadow-2xl' : 'bg-gradient-to-b from-background/90 to-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button
              onClick={() => {
                setActiveCategory('Головна');
                resetFilters();
              }}
              className="flex items-center gap-2 group"
            >
              <div className="bg-primary p-1.5 rounded-lg group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg shadow-primary/30">
                <Film className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold tracking-tight gradient-text">UKRFLIX</span>
            </button>

            <div className="hidden lg:flex items-center gap-6">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.name}
                    onClick={() => {
                      setActiveCategory(cat.name);
                      resetFilters();
                    }}
                    className={`flex items-center gap-1.5 text-sm font-medium transition-all relative group ${
                      activeCategory === cat.name
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    {cat.name}
                    {activeCategory === cat.name && (
                      <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAISearch(true)}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-full text-sm font-medium transition-colors border border-primary/30"
            >
              <Wand2 className="w-4 h-4" />
              <span className="hidden md:inline">AI Пошук</span>
            </button>

            <div className="relative">
              <div
                className={`flex items-center rounded-full px-3 py-1.5 transition-all border ${
                  isSearchFocused
                    ? 'border-primary/50 w-56 md:w-80 bg-background/80 shadow-lg shadow-primary/10'
                    : 'border-border w-36 md:w-56 bg-muted/30'
                }`}
              >
                <Search className="w-4 h-4 text-muted-foreground mr-2 flex-shrink-0" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  placeholder="Пошук..."
                  className="bg-transparent outline-none text-foreground placeholder-muted-foreground w-full text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-muted/30 hover:bg-muted/50 border border-border"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 space-y-2 border-t border-border pt-4 animate-fadeIn">
            <button
              onClick={() => {
                setShowAISearch(true);
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full p-3 rounded-lg bg-primary/20 text-primary border border-primary/30"
            >
              <Wand2 className="w-5 h-5" />
              <span className="font-medium">AI Пошук UA</span>
            </button>

            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.name}
                  onClick={() => {
                    setActiveCategory(cat.name);
                    setMobileMenuOpen(false);
                    resetFilters();
                  }}
                  className={`flex items-center gap-2 w-full p-3 rounded-lg transition-all ${
                    activeCategory === cat.name
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-muted-foreground hover:bg-muted/30 border border-transparent'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{cat.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <AISearchModal
        isOpen={showAISearch}
        onClose={() => setShowAISearch(false)}
        onMovieSelect={handleAIMovieSelect}
      />
    </nav>
  );
}
