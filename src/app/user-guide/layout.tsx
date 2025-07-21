import { generateToolMetadata } from '@/lib/toolMetadata'

export const metadata = generateToolMetadata('user-guide')

export default function UserGuideLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}