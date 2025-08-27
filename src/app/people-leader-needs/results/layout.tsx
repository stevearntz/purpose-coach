import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'HR Partnership Assessment Results | Chat by the Fire',
  description: 'View and manage HR Partnership Assessment results by company domain',
  robots: 'noindex, nofollow', // Prevent search engines from indexing this page
}

export default function HRResultsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}