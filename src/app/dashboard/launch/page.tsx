'use client'

import ToolsLibrary from '@/components/ToolsLibrary'
import { useRouter } from 'next/navigation'

export default function AssessmentsPage() {
  const router = useRouter()
  
  const handleToolClick = (toolId: string, toolTitle: string, toolPath: string) => {
    router.push(toolPath)
  }
  
  return <ToolsLibrary onToolClick={handleToolClick} />
}