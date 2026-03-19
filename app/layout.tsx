import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import ToastNotifications from '@/components/ToastNotifications'

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'UKRFLIX - Українське Кіно Онлайн',
  description: 'Дивіться найкраще кіно з українським дубляжем. Фільми, серіали та новинки з професійною українською озвучкою.',
  keywords: ['українське кіно', 'фільми онлайн', 'український дубляж', 'кіно україна', 'дивитися фільми'],
  authors: [{ name: 'UKRFLIX' }],
  openGraph: {
    title: 'UKRFLIX - Українське Кіно Онлайн',
    description: 'Дивіться найкраще кіно з українським дубляжем',
    type: 'website',
    locale: 'uk_UA',
  },
}

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased font-sans">
        {children}
        <ToastNotifications />
      </body>
    </html>
  )
}
