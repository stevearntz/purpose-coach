import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Campfire Decision Making Audit',
  description: 'Evaluate how you make decisions across four key dimensions—People, Purpose, Principles, and Outcomes—to identify your strengths and areas for growth.',
}

export default function DecisionMakingAuditLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}