import './globals.css'
import type { Metadata, Viewport } from 'next'
import ToastNotifications from '@/components/ToastNotifications'

export const metadata: Metadata = {
  title: 'UKRFLIX - Український Кіно-Портал',
  description: 'Дивіться найкраще кіно онлайн. Фільми з українською озвучкою, класика та новинки кінематографу. Apple TV естетика.',
  keywords: ['кіно', 'фільми', 'українське кіно', 'дивитися онлайн', 'українська озвучка', 'UKRFLIX'],
  openGraph: {
    title: 'UKRFLIX - Український Кіно-Портал',
    description: 'Найкраще кіно онлайн з українською озвучкою',
    type: 'website',
    locale: 'uk_UA',
  },
}

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk" className="dark">
      <body className="antialiased bg-[#0a0a0f] text-white min-h-screen">
        {children}
        <ToastNotifications />
      </body>
    </html>
  )
}
