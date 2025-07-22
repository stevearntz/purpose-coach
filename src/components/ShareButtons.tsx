'use client'

import { useState } from 'react'
import { Printer, Share2 } from 'lucide-react'

export default function ShareButtons() {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex gap-4">
      <button
        onClick={handlePrint}
        className="hidden sm:block p-3 border-2 border-gray-400 text-gray-700 rounded-lg hover:border-gray-600 hover:bg-gray-100 transition-all"
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
  )
}