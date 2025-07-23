import { generateToolMetadata } from '@/lib/toolMetadata'

export const metadata = generateToolMetadata('change-style')

export default function ChangeStyleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}