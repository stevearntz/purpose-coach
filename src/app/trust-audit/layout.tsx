import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Campfire Trust Audit',
  description: 'Build stronger work relationships by assessing trust across Integrity, Competence, and Empathy dimensions.',
}

export default function TrustAuditLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}