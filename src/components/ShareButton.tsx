'use client'

import { useState } from 'react'
import { Share2, Loader2 } from 'lucide-react'

interface ShareButtonProps {
  onShare?: () => Promise<string> | string // Either return a URL or handle sharing internally
  shareUrl?: string // Direct URL to share (if already available)
  variant?: 'primary' | 'secondary' | 'icon' // Different button styles
  className?: string // Additional custom classes
  children?: React.ReactNode // Custom content
  showIcon?: boolean // Whether to show the share icon
}

export default function ShareButton({ 
  onShare, 
  shareUrl, 
  variant = 'primary',
  className = '',
  children,
  showIcon = true
}: ShareButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'copied' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleShare = async () => {
    try {
      setStatus('loading')
      setErrorMessage('')

      let urlToCopy = shareUrl

      // If onShare is provided, call it to get the URL
      if (onShare && !shareUrl) {
        const result = await onShare()
        urlToCopy = result
      }

      if (!urlToCopy) {
        throw new Error('No URL to share')
      }

      // Try to copy to clipboard
      try {
        await navigator.clipboard.writeText(urlToCopy)
        setStatus('copied')
      } catch (clipboardError) {
        // Fallback for browsers that block clipboard access
        // Create a temporary input element
        const textArea = document.createElement('textarea')
        textArea.value = urlToCopy
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.select()
        
        try {
          document.execCommand('copy')
          setStatus('copied')
        } catch (fallbackError) {
          // If both methods fail, show the URL in a prompt
          prompt('Copy this link:', urlToCopy)
          setStatus('copied') // Still mark as copied since user can manually copy
        } finally {
          document.body.removeChild(textArea)
        }
      }

      // Reset status after 2 seconds
      setTimeout(() => {
        setStatus('idle')
      }, 2000)
    } catch (error) {
      console.error('Share error:', error)
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to share')
      
      // Reset error status after 3 seconds
      setTimeout(() => {
        setStatus('idle')
        setErrorMessage('')
      }, 3000)
    }
  }

  // Button content based on status
  const getButtonContent = () => {
    if (children && status === 'idle') {
      return children
    }

    switch (status) {
      case 'loading':
        return (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Creating Link...</span>
          </>
        )
      case 'copied':
        return (
          <>
            {showIcon && <Share2 className="w-5 h-5" />}
            <span>Link Copied!</span>
          </>
        )
      case 'error':
        return <span>Error: {errorMessage}</span>
      default:
        return (
          <>
            {showIcon && <Share2 className="w-5 h-5" />}
            <span>Share</span>
          </>
        )
    }
  }

  // Button styles based on variant and status
  const getButtonClasses = () => {
    const baseClasses = 'font-medium transition-all duration-200 flex items-center gap-2 justify-center'
    
    let variantClasses = ''
    let statusClasses = ''

    switch (variant) {
      case 'secondary':
        variantClasses = 'px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50'
        break
      case 'icon':
        variantClasses = 'p-3 border-2 border-gray-400 text-gray-700 rounded-lg hover:border-gray-600 hover:bg-gray-100'
        break
      case 'primary':
      default:
        variantClasses = 'px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 shadow-lg'
    }

    // Status-specific styles
    switch (status) {
      case 'copied':
        statusClasses = variant === 'primary' 
          ? 'bg-green-600 hover:bg-green-600' 
          : 'border-green-500 text-green-600 bg-green-50'
        break
      case 'error':
        statusClasses = variant === 'primary'
          ? 'bg-red-600 hover:bg-red-600'
          : 'border-red-500 text-red-600 bg-red-50'
        break
      case 'loading':
        statusClasses = 'opacity-75 cursor-wait'
        break
    }

    return `${baseClasses} ${variantClasses} ${statusClasses} ${className}`
  }

  return (
    <button
      onClick={handleShare}
      className={getButtonClasses()}
      disabled={status === 'loading'}
    >
      {getButtonContent()}
    </button>
  )
}