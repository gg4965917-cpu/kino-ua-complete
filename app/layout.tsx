import './globals.css'
import type { Metadata, Viewport } from 'next'
import ToastNotifications from '@/components/ToastNotifications'

export const metadata: Metadata = {
  title: 'KINO.UA - Український Кіно-Портал',
  description: 'Дивіться найкраще українське кіно онлайн. Фільми з українською озвучкою, класика та новинки українського кінематографу.',
  keywords: ['кіно', 'фільми', 'українське кіно', 'дивитися онлайн', 'українська озвучка'],
  openGraph: {
    title: 'KINO.UA - Український Кіно-Портал',
    description: 'Найкраще українське кіно онлайн',
    type: 'website',
    locale: 'uk_UA',
  },
}

export const viewport: Viewport = {
  themeColor: '#f59e0b',
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
      <body className="antialiased bg-black text-white min-h-screen">
        {children}
        <ToastNotifications />
      </body>
    </html>
  )
}
