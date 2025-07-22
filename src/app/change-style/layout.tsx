import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Change Style Assessment - Discover Your Change Persona',
  description: 'Understand how you naturally respond to change at work and get personalized strategies for navigating transitions more effectively.',
  openGraph: {
    title: 'Change Style Assessment - Discover Your Change Persona',
    description: 'Understand how you naturally respond to change at work and get personalized strategies for navigating transitions more effectively.',
    images: ['/og-image.png'],
  },
}

export default function ChangeStyleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}