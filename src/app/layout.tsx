import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Chat by the Fire - Deep Conversations for Transformation',
  description: 'Deep conversations that spark insight, clarity, and transformation. Choose your journey and discover what\'s possible when you take time to reflect.',
  keywords: 'purpose, coaching, self-discovery, personal development, values, strengths, clarity, relationships, career',
  authors: [{ name: 'Chat by the Fire' }],
  openGraph: {
    title: 'Chat by the Fire',
    description: 'Deep conversations that spark insight, clarity, and transformation.',
    url: 'https://chatbythefire.com',
    siteName: 'Chat by the Fire',
    images: [
      {
        url: '/og-image.jpg', // You'll want to add this image
        width: 1200,
        height: 630,
        alt: 'Chat by the Fire - Deep Conversations for Transformation',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chat by the Fire',
    description: 'Deep conversations that spark insight, clarity, and transformation.',
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