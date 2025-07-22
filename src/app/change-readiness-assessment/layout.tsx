import { generateToolMetadata } from '@/lib/toolMetadata'

export const metadata = generateToolMetadata('change-readiness-assessment')

export default function ChangeReadinessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}