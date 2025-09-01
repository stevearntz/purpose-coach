'use client'

import { useState } from 'react'
import { X, Mail, CheckCircle, AlertCircle } from 'lucide-react'
import { useAnalytics } from '@/hooks/useAnalytics'
import { validateEmail, validateEmailRealtime, EmailValidationResult } from '@/utils/emailValidation'
import OptimizedImage from './OptimizedImage'

interface EmailGateModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (email: string, name?: string) => void
  onSkip: () => void
}

export default function EmailGateModal({ isOpen, onClose, onSubmit, onSkip }: EmailGateModalProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailValidation, setEmailValidation] = useState<EmailValidationResult>({ isValid: true })
  const [showSuggestion, setShowSuggestion] = useState(false)
  const analytics = useAnalytics()

  if (!isOpen) return null

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setEmail(newEmail)
    
    // Real-time validation (less strict)
    const validation = validateEmailRealtime(newEmail)
    setEmailValidation(validation)
    setShowSuggestion(!!validation.suggestion)
  }

  const handleSuggestionClick = () => {
    if (emailValidation.suggestion) {
      setEmail(emailValidation.suggestion)
      setEmailValidation({ isValid: true })
      setShowSuggestion(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Final validation before submission
    const finalValidation = validateEmail(email)
    setEmailValidation(finalValidation)
    
    if (!finalValidation.isValid) {
      setShowSuggestion(!!finalValidation.suggestion)
      return
    }
    
    setIsLoading(true)
    
    // Track conversion
    analytics.trackAction('Email Gate Submitted', { 
      email_provided: true,
      name_provided: !!name 
    })
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    onSubmit(email, name)
    setIsLoading(false)
  }

  const handleSkip = () => {
    analytics.trackAction('Email Gate Skipped')
    onSkip()
  }

  return (
    <>
      {/* Backdrop with blur */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[70] overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative animate-fade-in">
          {/* Success illustration */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <OptimizedImage 
              src="/smore.png" 
              alt="S'more" 
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
            />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-2 sm:mb-3">
            Your Personalized Development Plan is Ready!
          </h2>
          
          <p className="text-center text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
            Enter your email to unlock your custom recommendations and save your results.
          </p>

          {/* Benefits list */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Your personalized tool recommendations</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Curated development programs for your challenges</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">PDF download of your complete plan</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Weekly leadership insights tailored to you</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="First name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-iris-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={handleEmailChange}
                required
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                  emailValidation.isValid 
                    ? 'border-gray-300 focus:ring-iris-500' 
                    : 'border-red-300 focus:ring-red-500'
                }`}
              />
              {!emailValidation.isValid && (
                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
              )}
            </div>
            
            {/* Validation feedback */}
            {!emailValidation.isValid && emailValidation.error && (
              <div className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {emailValidation.error}
              </div>
            )}
            
            {/* Suggestion button */}
            {showSuggestion && emailValidation.suggestion && (
              <button
                type="button"
                onClick={handleSuggestionClick}
                className="text-sm text-iris-600 hover:text-iris-700 mt-1 underline"
              >
                Use suggested email: {emailValidation.suggestion}
              </button>
            )}

            <button
              type="submit"
              disabled={!email || isLoading || !emailValidation.isValid}
              className="w-full py-3 bg-iris-500 text-white rounded-lg font-semibold hover:bg-iris-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Unlocking...' : 'Get My Plan'}
            </button>
          </form>

          <button
            onClick={handleSkip}
            className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Continue without saving →
          </button>

          <p className="text-xs text-center text-gray-400 mt-3 sm:mt-4">
            We respect your privacy. Unsubscribe anytime.
          </p>
          </div>
        </div>
      </div>
    </>
  )
}