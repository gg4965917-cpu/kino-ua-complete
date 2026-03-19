import './globals.css'
import type { Metadata, Viewport } from 'next'
import ToastNotifications from '@/components/ToastNotifications'

export const metadata: Metadata = {
  title: 'UKRFLIX - Український Кіно-Стрімінг',
  description: 'Преміальний український стрімінг сервіс. Дивіться найкраще кіно з українською озвучкою онлайн у найвищій якості 4K та HD.',
  keywords: ['кіно', 'фільми', 'українське кіно', 'дивитися онлайн', 'українська озвучка', 'стрімінг', '4K', 'HD'],
  openGraph: {
    title: 'UKRFLIX - Український Кіно-Стрімінг',
    description: 'Преміальний український стрімінг сервіс',
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
      <body className="antialiased bg-ukr-dark-900 text-white min-h-screen font-inter">
        {children}
        <ToastNotifications />
      </body>
    </html>
  )
}
