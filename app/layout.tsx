import './globals.css'
import type { Metadata } from 'next'
import ToastNotifications from '@/components/ToastNotifications'

export const metadata: Metadata = {
  title: 'KINO.UA - Український Кіно-Портал',
  description: 'Дивіться найкраще українське кіно онлайн. Фільми з українською озвучкою, класика та новинки українського кінематографу.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk">
      <body className="antialiased">
        {children}
        <ToastNotifications />
      </body>
    </html>
  )
}
