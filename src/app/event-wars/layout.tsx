import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Event Wars - Prioritize Your Guest List | Chat by the Fire',
  description: 'Tournament-style game to quickly prioritize event attendees. Upload your guest list CSV and battle attendees head-to-head to identify your top 25 priority invites.',
  openGraph: {
    title: 'Event Wars - Prioritize Your Guest List',
    description: 'Tournament-style game to quickly prioritize event attendees.',
    images: ['/og-image.png'],
  },
}

export default function EventWarsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}