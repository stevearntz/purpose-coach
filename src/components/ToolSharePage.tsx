'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Printer, Share2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Footer from '@/components/Footer'

interface ToolShareData {
  toolName: string
  userName?: string
  results: any
  createdAt: string
  gradient: string
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

export default function ToolSharePage({ shareId, toolPath, toolConfig, renderResults }: ToolSharePageProps) {
  const [data, setData] = useState<ToolShareData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchSharedData = async () => {
      try {
        const response = await fetch(`/api/share?id=${shareId}`)
        if (!response.ok) {
          throw new Error('Failed to load shared content')
        }
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchSharedData()
  }, [shareId])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${toolConfig.gradient} flex items-center justify-center`}>
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${toolConfig.gradient} flex items-center justify-center p-4`}>
        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Share Not Found</h1>
          <p className="text-white/80 mb-6">{error || 'This shared assessment could not be found or may have expired.'}</p>
          <Link
            href={toolPath}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-white/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            TAKE ASSESSMENT
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-section, .print-section * {
            visibility: visible;
          }
          .print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          @page {
            margin: 0.5in;
            size: letter;
          }
        }
      `}</style>
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
              <div className="flex gap-4">
                <button
                  onClick={handlePrint}
                  className="p-3 border-2 border-gray-400 text-gray-700 rounded-lg hover:border-gray-600 hover:bg-gray-100 transition-all"
                  title="Print results"
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button
                  onClick={handleCopyLink}
                  className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-lg font-medium"
                >
                  <Share2 className="w-5 h-5 inline mr-2" />
                  {copied ? 'COPIED!' : 'SHARE'}
                </button>
              </div>
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