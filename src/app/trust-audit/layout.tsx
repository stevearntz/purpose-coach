import { generateToolMetadata } from '@/lib/toolMetadata'

export const metadata = generateToolMetadata('trust-audit')

export default function TrustAuditLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}