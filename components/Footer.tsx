'use client';

import { Film, Heart, Github, Twitter, Mail, ExternalLink, Zap, Globe } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="relative bg-gradient-to-b from-kino-dark-900 to-black border-t border-gray-800/50 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-kino-yellow-400/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-kino-yellow-400/5 rounded-full blur-3xl" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2 group">
              <div className="bg-gradient-to-br from-kino-yellow-400 to-kino-yellow-600 p-2 rounded-lg group-hover:scale-110 transition-transform shadow-lg shadow-kino-yellow-500/30">
                <Film className="w-6 h-6 text-black" strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-black font-bebas tracking-tight gradient-text">KINO.UA</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              Найкращий український кіно-портал. Дивіться фільми з українською озвучкою, 
              відкривайте новинки та класику українського кінематографу.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-kino-yellow-400/20 hover:text-kino-yellow-400 transition-all border border-white/10 hover:border-kino-yellow-400/30">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-kino-yellow-400/20 hover:text-kino-yellow-400 transition-all border border-white/10 hover:border-kino-yellow-400/30">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-kino-yellow-400/20 hover:text-kino-yellow-400 transition-all border border-white/10 hover:border-kino-yellow-400/30">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          {/* Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Навігація</h4>
            <ul className="space-y-2">
              {['Головна', 'Популярне', 'Топ', 'Новинки', 'Мій список'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-kino-yellow-400 transition-colors text-sm flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-gray-600 group-hover:bg-kino-yellow-400 rounded-full transition-colors" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Плеєри</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Zap className="w-4 h-4 text-purple-400" />
                <span>Collaps - Швидкий стрім</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Ashdi - HD якість</span>
              </li>
            </ul>
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Сервіс працює
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="pt-8 border-t border-gray-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm flex items-center gap-1">
            &copy; {currentYear} KINO.UA. Зроблено з 
            <Heart className="w-4 h-4 text-red-400 fill-red-400 inline mx-1" /> 
            в Україні
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <a href="#" className="hover:text-kino-yellow-400 transition-colors flex items-center gap-1">
              TMDB API <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-gray-700">|</span>
            <span>v2.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
