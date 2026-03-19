'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Search } from 'lucide-react';
import Link from 'next/link';

interface NavigationProps {
  onSearchChange?: (query: string) => void;
  categories?: Array<{ name: string; icon: any }>;
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export default function Navigation({
  onSearchChange,
  categories = [],
  activeCategory,
  onCategoryChange,
}: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearchChange?.(e.target.value);
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'glass-nav' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="text-3xl font-black tracking-tighter">
              <span className="text-white">UKR</span>
              <span className="gradient-text">FLIX</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => onCategoryChange?.(cat.name)}
                className={`text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                  activeCategory === cat.name
                    ? 'text-ukr-blue'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:border-ukr-blue/50 transition-colors">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="ПОШУК"
              value={searchQuery}
              onChange={handleSearch}
              className="bg-transparent outline-none text-sm w-32 placeholder-gray-600"
            />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-3 animate-slideInDown">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => {
                  onCategoryChange?.(cat.name);
                  setIsOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                {cat.name}
              </button>
            ))}
            <div className="px-4 py-2">
              <input
                type="text"
                placeholder="ПОШУК"
                value={searchQuery}
                onChange={handleSearch}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-ukr-blue"
              />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
