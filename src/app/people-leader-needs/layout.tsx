import { generateToolMetadata } from '@/lib/toolMetadata'

export const metadata = generateToolMetadata('peopleLeaderNeeds')

export default function PeopleLeaderNeedsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}