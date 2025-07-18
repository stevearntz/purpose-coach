import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Campfire Change Readiness Assessment',
  description: 'Assess your readiness for change across three key dimensions—People, Purpose, and Principles—to identify where you feel confident and where you need support.',
}

export default function ChangeReadinessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}