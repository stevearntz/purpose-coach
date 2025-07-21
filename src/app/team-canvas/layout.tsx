import { generateToolMetadata } from '@/lib/toolMetadata'

export const metadata = generateToolMetadata('team-canvas')

export default function TeamCanvasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}