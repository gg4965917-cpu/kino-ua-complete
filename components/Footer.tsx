'use client';

import { Film, Heart, Github, Twitter, Mail, ExternalLink, Zap, Globe, Monitor } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="relative bg-[#0a0a0f] border-t border-white/5 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5 group">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/40 blur-lg" />
                <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                  <Film className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <span className="text-2xl font-black tracking-tight">
                <span className="text-blue-400">UKR</span>
                <span className="text-white">FLIX</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-md">
              Найкращий український кіно-портал. Дивіться фільми з українською озвучкою, 
              відкривайте новинки та класику кінематографу.
            </p>
            <div className="flex items-center gap-2">
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 transition-all border border-white/5 hover:border-blue-500/30">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 transition-all border border-white/5 hover:border-blue-500/30">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 transition-all border border-white/5 hover:border-blue-500/30">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          {/* Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Навігація</h4>
            <ul className="space-y-2">
              {['Головна', 'Фільми', 'Серіали', 'Мій список'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-500 hover:text-blue-400 transition-colors text-sm flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-gray-700 group-hover:bg-blue-400 rounded-full transition-colors" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Players Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Плеєри</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5 text-sm text-gray-500">
                <div className="p-1.5 rounded-md bg-violet-500/20">
                  <Zap className="w-3.5 h-3.5 text-violet-400" />
                </div>
                <span>Collaps - UA озвучка</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-gray-500">
                <div className="p-1.5 rounded-md bg-cyan-500/20">
                  <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <span>Ashdi - HD якість</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-gray-500">
                <div className="p-1.5 rounded-md bg-orange-500/20">
                  <Globe className="w-3.5 h-3.5 text-orange-400" />
                </div>
                <span>VidSrc - Резервний</span>
              </li>
            </ul>
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                Сервіс працює
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm flex items-center gap-1">
            &copy; {currentYear} UKRFLIX. Зроблено з 
            <Heart className="w-4 h-4 text-red-400 fill-red-400 inline mx-1" /> 
            в Україні
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-1">
              TMDB API <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-gray-700">|</span>
            <span>v3.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
