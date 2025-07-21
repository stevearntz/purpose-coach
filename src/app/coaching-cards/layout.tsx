import { generateToolMetadata } from '@/lib/toolMetadata'

export const metadata = generateToolMetadata('coaching-cards')

export default function CoachingCardsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}