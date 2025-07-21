import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Campfire Catalog',
  description: 'Explore our library of evidence-based workshops designed to address your biggest leadership and team challenges.',
  openGraph: {
    title: 'Campfire Catalog',
    description: 'Explore our library of evidence-based workshops designed to address your biggest leadership and team challenges.',
    url: 'https://tools.getcampfire.com/courses',
    siteName: 'Campfire',
    images: [
      {
        url: 'https://tools.getcampfire.com/campfire-logo-new.png', // Using existing logo for now
        width: 1200,
        height: 630,
        alt: 'Campfire Catalog - Leadership Development Workshops',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Campfire Catalog',
    description: 'Explore our library of evidence-based workshops designed to address your biggest leadership and team challenges.',
    images: ['https://tools.getcampfire.com/campfire-logo-new.png'],
    site: '@campfire',
  },
  alternates: {
    canonical: 'https://tools.getcampfire.com/courses',
  },
  metadataBase: new URL('https://tools.getcampfire.com'),
}

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}