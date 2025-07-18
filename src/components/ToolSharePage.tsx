import Link from 'next/link'
import Footer from '@/components/Footer'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import ShareButtons from './ShareButtons'
import { headers } from 'next/headers'

interface ToolShareData {
  toolName: string
  userName?: string
  results: any
  createdAt: string
}

interface ToolSharePageProps {
  shareId: string
  toolPath: string
  toolConfig: {
    title: string
    gradient: string
  }
  renderResults: (data: any) => React.ReactNode
}

async function getShareData(shareId: string): Promise<ToolShareData | null> {
  try {
    // Get the host from headers in server component
    const headersList = await headers()
    const host = headersList.get('host') || 'localhost:3000'
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const baseUrl = `${protocol}://${host}`
    
    console.log('Fetching share data from:', `${baseUrl}/api/share?id=${shareId}`)
    
    const response = await fetch(`${baseUrl}/api/share?id=${shareId}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      console.error('Share fetch failed:', response.status, response.statusText)
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching share data:', error)
    return null
  }
}

export default async function ToolSharePage({ shareId, toolPath, toolConfig, renderResults }: ToolSharePageProps) {
  const data = await getShareData(shareId)

  if (!data) {
    notFound()
  }

  return (
    <>
      <div className={`min-h-screen bg-gradient-to-br ${toolConfig.gradient}/10 py-16 print-section`}>
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8 no-print">
              <Link
                href={toolPath}
                className="text-gray-700 hover:text-gray-900 flex items-center gap-2 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                TAKE ASSESSMENT
              </Link>
              <ShareButtons />
            </div>
            
            <h1 className="text-4xl font-bold text-nightfall mb-2 text-center">
              {data.toolName || toolConfig.title} Results
            </h1>
            {data.userName && (
              <p className="text-gray-600 mb-2 text-center">
                Assessment for {data.userName}
              </p>
            )}
            <p className="text-gray-500 text-center mb-8">
              Shared on {new Date(data.createdAt).toLocaleDateString()}
            </p>
            
            {renderResults(data.results)}
            
            <div className="flex justify-center mt-8 no-print">
              <Link
                href={toolPath}
                className="px-8 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors shadow-lg"
              >
                TAKE YOUR OWN ASSESSMENT
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}