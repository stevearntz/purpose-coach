import { generateToolMetadata } from '@/lib/toolMetadata'

export const metadata = generateToolMetadata('change-readiness')

export default function ChangeReadinessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}