import { generateToolMetadata } from '@/lib/toolMetadata'

export const metadata = generateToolMetadata('hr-partnership')

export default function HRPartnershipLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}