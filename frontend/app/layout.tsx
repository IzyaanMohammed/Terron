import type { Metadata, Viewport } from 'next'
import { DM_Sans, Playfair_Display, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { ProjectProvider } from '@/context/project-context'

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Terron | Environmental Intelligence for Construction',
  description: 'Before You Build, Nature Decides. AI-powered environmental analysis for sustainable construction.',
  generator: 'Terron',
  keywords: ['environmental intelligence', 'sustainable construction', 'green building', 'carbon footprint', 'biodiversity'],
}

export const viewport: Viewport = {
  themeColor: '#0d2b1a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfair.variable} ${jetbrainsMono.variable} bg-background`}>
      <body className="font-sans antialiased min-h-screen">
        <ProjectProvider>
          <div className="noise-overlay" aria-hidden="true" />
          {children}
        </ProjectProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
