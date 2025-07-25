import { generateToolMetadata } from '@/lib/toolMetadata'

export const metadata = generateToolMetadata('burnout-assessment')

export default function BurnoutAssessmentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}