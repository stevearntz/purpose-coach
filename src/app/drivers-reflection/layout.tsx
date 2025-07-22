import { generateToolMetadata } from '@/lib/toolMetadata'

export const metadata = generateToolMetadata('drivers-reflection')

export default function CareerDriversLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}