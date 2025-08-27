import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manager Dashboard - Campfire',
  description: 'Personal development dashboard for managers with assessment results, AI recommendations, resources, and expert support.',
  openGraph: {
    title: 'Manager Dashboard - Campfire',
    description: 'Personal development dashboard for managers with assessment results, AI recommendations, resources, and expert support.',
    type: 'website',
  },
}

export default function ManagersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}