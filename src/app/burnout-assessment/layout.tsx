import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Campfire Burnout Assessment',
  description: 'Evaluate your current state across multiple dimensions to identify early signs of burnout and get personalized strategies for maintaining your well-being.',
}

export default function BurnoutAssessmentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}