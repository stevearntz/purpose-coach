import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Team Building Tools - The Campfire Hub',
  description: 'Access our complete toolkit of team building resources and tools.',
  openGraph: {
    title: 'Team Building Tools - The Campfire Hub',
    description: 'Access our complete toolkit of team building resources and tools.',
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
    title: 'Team Building Tools - The Campfire Hub',
    description: 'Access our complete toolkit of team building resources and tools.',
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