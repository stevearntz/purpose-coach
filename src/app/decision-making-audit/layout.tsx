import { generateToolMetadata } from '@/lib/toolMetadata'

export const metadata = generateToolMetadata('decision-making-audit')

export default function DecisionMakingAuditLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}