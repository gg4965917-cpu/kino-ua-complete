import './globals.css'
import type { Metadata, Viewport } from 'next'
import ToastNotifications from '@/components/ToastNotifications'

export const metadata: Metadata = {
  title: 'UKRFLIX - Дивись українською',
  description: 'Найкращий стрімінговий сервіс з українською озвучкою. Фільми, серіали та новинки в HD та 4K якості.',
  keywords: ['фільми', 'серіали', 'українська озвучка', 'дивитися онлайн', 'HD', '4K', 'стрімінг'],
  openGraph: {
    title: 'UKRFLIX - Дивись українською',
    description: 'Найкращий стрімінговий сервіс з українською озвучкою',
    type: 'website',
    locale: 'uk_UA',
  },
}

export const viewport: Viewport = {
  themeColor: '#3B82F6',
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
