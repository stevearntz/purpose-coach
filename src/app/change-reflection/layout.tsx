import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Change Reflection - 1:1 Conversation Prep | Chat by the Fire',
  description: 'Prepare for meaningful conversations about change with your team members. A thoughtful tool for managers navigating organizational transitions.',
  openGraph: {
    title: 'Change Reflection - 1:1 Conversation Prep',
    description: 'Prepare for meaningful conversations about change with your team members',
    images: ['/og-image.png'],
  },
}

export default function ChangeReflectionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}