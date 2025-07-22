import { generateToolMetadata } from '@/lib/toolMetadata'

export const metadata = generateToolMetadata('team-charter')

export default function TeamCanvasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}