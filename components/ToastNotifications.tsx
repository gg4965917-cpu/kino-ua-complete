'use client';

import { useMovieStore } from '@/lib/store';
import { X, CheckCircle, AlertCircle, Info, Sparkles } from 'lucide-react';
import { useEffect } from 'react';

export default function ToastNotifications() {
  const { notifications, removeNotification } = useMovieStore();

  return (
    <div className="fixed top-24 right-4 z-50 space-y-3 max-w-md">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          id={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={removeNotification}
        />
      ))}
    </div>
  );
}

interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: (id: string) => void;
}

function Toast({ id, message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), 4000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <Sparkles className="w-5 h-5" />
  };

  const styles = {
    success: {
      bg: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      icon: 'bg-emerald-500/20'
    },
    error: {
      bg: 'bg-gradient-to-r from-red-500/20 to-rose-500/20',
      border: 'border-red-500/30',
      text: 'text-red-400',
      icon: 'bg-red-500/20'
    },
    info: {
      bg: 'bg-gradient-to-r from-ukr-blue-500/20 to-cyan-500/20',
      border: 'border-ukr-blue-500/30',
      text: 'text-ukr-blue-400',
      icon: 'bg-ukr-blue-500/20'
    }
  };

  const style = styles[type];

  return (
    <div
      className={`flex items-center gap-4 ${style.bg} ${style.border} border backdrop-blur-xl px-5 py-4 rounded-2xl shadow-2xl animate-slideInRight`}
    >
      <div className={`p-2 rounded-xl ${style.icon}`}>
        <span className={style.text}>{icons[type]}</span>
      </div>
      <span className={`flex-1 text-sm font-medium ${style.text}`}>{message}</span>
      <button
        onClick={() => onClose(id)}
        className={`${style.text} hover:opacity-70 transition-opacity p-1`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
