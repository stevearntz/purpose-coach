import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard | Campfire Tools',
  description: 'Access your leadership development tools and assessments',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}