import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Toolkit - The Campfire Hub',
  description: 'Access our complete toolkit of leadership development resources and tools.',
  openGraph: {
    title: 'Toolkit - The Campfire Hub',
    description: 'Access our complete toolkit of leadership development resources and tools.',
    images: [
      {
        url: 'https://tools.getcampfire.com/og-toolkit.png',
        width: 1200,
        height: 630,
        alt: 'The Campfire Toolkit',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Toolkit - The Campfire Hub',
    description: 'Access our complete toolkit of leadership development resources and tools.',
    images: ['https://tools.getcampfire.com/og-toolkit.png'],
  },
}

export default function ToolkitLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}