import { generateToolMetadata } from '@/lib/toolMetadata'

export const metadata = generateToolMetadata('hopes-fears-expectations')

export default function HopesFearsExpectationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}