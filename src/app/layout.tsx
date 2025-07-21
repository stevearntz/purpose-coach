import type { Metadata } from 'next'
import { League_Spartan } from 'next/font/google'
import './globals.css'
import '../styles/print.css'
import AmplitudeProvider from '@/components/AmplitudeProvider'

const leagueSpartan = League_Spartan({ 
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-league-spartan'
})

export const metadata: Metadata = {
  title: 'The Campfire Hub',
  description: 'Solve your biggest leadership and team challenges—starting now. Get instant access to tools, workshops, and personalized recommendations to help you lead better, align your team, and build a culture that performs.',
  keywords: 'purpose, coaching, self-discovery, personal development, values, strengths, clarity, relationships, career',
  authors: [{ name: 'Campfire' }],
  metadataBase: new URL('https://tools.getcampfire.com'),
  openGraph: {
    title: 'The Campfire Hub',
    description: 'Solve your biggest leadership and team challenges—starting now. Get instant access to tools, workshops, and personalized recommendations.',
    url: 'https://tools.getcampfire.com',
    siteName: 'Campfire',
    images: [
      {
        url: 'https://tools.getcampfire.com/campfire-logo-new.png',
        width: 1200,
        height: 630,
        alt: 'The Campfire Hub - Leadership Development Tools',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Campfire Hub',
    description: 'Solve your biggest leadership and team challenges—starting now. Get instant access to tools, workshops, and personalized recommendations.',
    images: ['https://tools.getcampfire.com/campfire-logo-new.png'],
    site: '@campfire',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#7c3aed" />
      </head>
      <body className={`${leagueSpartan.className} antialiased`}>
        <AmplitudeProvider>
          {children}
        </AmplitudeProvider>
      </body>
    </html>
  )
}