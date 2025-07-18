import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Working with Me - Personal User Guide',
  description: 'Build a shareable guide that helps others understand your work style, communication preferences, and how to collaborate effectively with you.',
}

export default function UserGuideLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}