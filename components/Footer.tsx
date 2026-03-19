'use client';

import { Heart, ExternalLink, Zap, Globe, Film } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="relative bg-black border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2 space-y-5">
            <div className="flex items-center">
              <span className="text-2xl font-bold tracking-tight">
                <span className="text-ukr-blue">UKR</span>
                <span className="text-white">FLIX</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-md">
              Найкращий стрімінговий сервіс з українською озвучкою. 
              Дивіться фільми та серіали в HD та 4K якості.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Всі сервіси працюють</span>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="space-y-5">
            <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Навігація</h4>
            <ul className="space-y-3">
              {['Головна', 'Фільми', 'Серіали', 'Новинки', 'Мій список'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Players */}
          <div className="space-y-5">
            <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Доступні плеєри</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-gray-500">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-white text-sm">Collaps</p>
                  <p className="text-xs text-gray-600">Швидкий стрім</p>
                </div>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-500">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <p className="text-white text-sm">Ashdi</p>
                  <p className="text-xs text-gray-600">HD якість</p>
                </div>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-500">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Film className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <p className="text-white text-sm">VidSrc</p>
                  <p className="text-xs text-gray-600">Резервний</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm flex items-center gap-1">
            &copy; {currentYear} UKRFLIX. Зроблено з 
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 mx-1" /> 
            в Україні
          </p>
          <div className="flex items-center gap-6 text-xs text-gray-600">
            <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" 
               className="hover:text-white transition-colors flex items-center gap-1.5">
              Powered by TMDB <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-gray-800">|</span>
            <span>v3.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
