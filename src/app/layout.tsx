import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Campfire Guides - Deep Conversations for Transformation',
  description: 'At Campfire, we empower every employee with the direction, support, and skills they need to thrive. Transform your workplace culture and elevate your team\'s success today.',
  keywords: 'purpose, coaching, self-discovery, personal development, values, strengths, clarity, relationships, career',
  authors: [{ name: 'Campfire Guides' }],
  openGraph: {
    title: 'Campfire Guides',
    description: 'At Campfire, we empower every employee with the direction, support, and skills they need to thrive.',
    url: 'https://chatbythefire.com',
    siteName: 'Campfire Guides',
    images: [
      {
        url: '/og-image.jpg', // You'll want to add this image
        width: 1200,
        height: 630,
        alt: 'Campfire Guides - Deep Conversations for Transformation',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Campfire Guides',
    description: 'At Campfire, we empower every employee with the direction, support, and skills they need to thrive.',
    images: ['/og-image.jpg'],
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
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}