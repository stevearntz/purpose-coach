import { generateToolMetadata } from '@/lib/toolMetadata'

export const metadata = generateToolMetadata('career-drivers')

export default function CareerDriversLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}