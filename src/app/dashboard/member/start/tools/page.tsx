'use client'

import MemberToolsLibrary from '@/components/MemberToolsLibrary'
import { useRouter } from 'next/navigation'

export default function ToolsPage() {
  const router = useRouter()
  
  const handleToolClick = (toolId: string, toolTitle: string, toolPath: string) => {
    router.push(toolPath)
  }
  
  return <MemberToolsLibrary onToolClick={handleToolClick} />
}