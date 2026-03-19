'use client';

import { Film, Heart, Github, Twitter, Mail, ExternalLink, Zap, Globe, Database, Monitor } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="relative bg-gradient-to-b from-ukr-dark-900 to-ukr-dark-950 border-t border-white/5 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-ukr-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-ukr-blue-500/5 rounded-full blur-3xl" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-2 space-y-5">
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-black font-bebas tracking-wider">
                <span className="text-ukr-blue-400">UKR</span>
                <span className="text-white">FLIX</span>
              </h2>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              Преміальний український стрімінг сервіс. Дивіться найкраще кіно з українською озвучкою 
              у найвищій якості 4K та HD. Відкривайте новинки та класику українського кінематографу.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="p-2.5 rounded-xl bg-ukr-dark-700/50 hover:bg-ukr-blue-500/20 hover:text-ukr-blue-400 transition-all border border-white/10 hover:border-ukr-blue-500/40">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-2.5 rounded-xl bg-ukr-dark-700/50 hover:bg-ukr-blue-500/20 hover:text-ukr-blue-400 transition-all border border-white/10 hover:border-ukr-blue-500/40">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="p-2.5 rounded-xl bg-ukr-dark-700/50 hover:bg-ukr-blue-500/20 hover:text-ukr-blue-400 transition-all border border-white/10 hover:border-ukr-blue-500/40">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Links */}
          <div className="space-y-5">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Навігація</h4>
            <ul className="space-y-3">
              {['Головна', 'Фільми', 'Серіали', 'Новинки', 'Мій список'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-ukr-blue-400 transition-colors text-sm flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-ukr-dark-500 group-hover:bg-ukr-blue-500 rounded-full transition-colors" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Players Info */}
          <div className="space-y-5">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Плеєри</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <div className="p-1.5 rounded-lg bg-emerald-500/20">
                  <Database className="w-4 h-4 text-emerald-400" />
                </div>
                <span>VideoDB - 4K HDR</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <div className="p-1.5 rounded-lg bg-violet-500/20">
                  <Zap className="w-4 h-4 text-violet-400" />
                </div>
                <span>Collaps - Швидкий</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <div className="p-1.5 rounded-lg bg-cyan-500/20">
                  <Monitor className="w-4 h-4 text-cyan-400" />
                </div>
                <span>Ashdi - HD 1080p</span>
              </li>
            </ul>
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                Всі плеєри активні
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm flex items-center gap-1.5">
            &copy; {currentYear} UKRFLIX. Зроблено з 
            <Heart className="w-4 h-4 text-red-400 fill-red-400 inline mx-1" /> 
            в Україні
          </p>
          <div className="flex items-center gap-5 text-xs text-gray-500">
            <a href="#" className="hover:text-ukr-blue-400 transition-colors flex items-center gap-1.5">
              TMDB API <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-ukr-dark-600">|</span>
            <span className="text-ukr-blue-400 font-medium">v3.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
