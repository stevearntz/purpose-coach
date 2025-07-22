import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Campfire Workshops',
  description: 'Explore our library of evidence-based workshops designed to address your biggest leadership and team challenges.',
  openGraph: {
    title: 'Campfire Workshops',
    description: 'Explore our library of evidence-based workshops designed to address your biggest leadership and team challenges.',
    url: 'https://tools.getcampfire.com/courses',
    siteName: 'Campfire',
    images: [
      {
        url: 'https://tools.getcampfire.com/og-courses.png',
        width: 1200,
        height: 630,
        alt: 'Campfire Workshops - Leadership Development',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Campfire Workshops',
    description: 'Explore our library of evidence-based workshops designed to address your biggest leadership and team challenges.',
    images: ['https://tools.getcampfire.com/og-courses.png'],
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