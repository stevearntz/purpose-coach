import { generateToolMetadata } from '@/lib/toolMetadata'

export const metadata = generateToolMetadata('expectations-reflection')

export default function HopesFearsExpectationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}