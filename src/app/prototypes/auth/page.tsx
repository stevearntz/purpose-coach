'use client'

import { useState } from 'react'
import { ArrowRight, Mail, User, Check, Loader2 } from 'lucide-react'

export default function AuthPrototype() {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  
  // Flow state
  const [currentStep, setCurrentStep] = useState<'email' | 'names' | 'verify' | 'complete'>('email')
  const [userExists, setUserExists] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sentCode, setSentCode] = useState(false)
  const [resendCount, setResendCount] = useState(0)

  // Simulate email check
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Simulate checking if user exists (emails ending in @existing.com exist)
    const exists = email.endsWith('@existing.com')
    setUserExists(exists)
    
    if (exists) {
      // Existing user - go straight to verification
      setSentCode(true)
      setCurrentStep('verify')
    } else {
      // New user - collect names first
      setCurrentStep('names')
    }
    
    setIsLoading(false)
  }

  // Handle name submission for new users
  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate creating account with names
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Now send verification code
    setSentCode(true)
    setCurrentStep('verify')
    setIsLoading(false)
  }

  // Handle verification
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    await new Promise(resolve => setTimeout(resolve, 800))
    
    setCurrentStep('complete')
    setIsLoading(false)
  }

  // Handle resend code
  const handleResendCode = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    setResendCount(prev => prev + 1)
    setIsLoading(false)
  }

  // Reset to try different flows
  const reset = () => {
    setEmail('')
    setFirstName('')
    setLastName('')
    setVerificationCode('')
    setCurrentStep('email')
    setUserExists(null)
    setSentCode(false)
    setResendCount(0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Auth Flow Prototype
            </h1>
            <p className="text-sm text-gray-500">
              Test email ending in @existing.com for returning user flow
            </p>
            <div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
              <strong>Testing Note:</strong> This collects names BEFORE account creation
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8 space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === 'email' ? 'bg-purple-600 text-white' : 'bg-green-500 text-white'
            }`}>
              {currentStep === 'email' ? '1' : <Check className="w-4 h-4" />}
            </div>
            
            <div className={`w-12 h-1 ${
              currentStep !== 'email' ? 'bg-green-500' : 'bg-gray-200'
            }`} />
            
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === 'names' ? 'bg-purple-600 text-white' : 
              currentStep === 'verify' || currentStep === 'complete' ? 'bg-green-500 text-white' : 
              'bg-gray-200 text-gray-400'
            }`}>
              {currentStep === 'verify' || currentStep === 'complete' ? 
                <Check className="w-4 h-4" /> : '2'}
            </div>
            
            <div className={`w-12 h-1 ${
              currentStep === 'verify' || currentStep === 'complete' ? 'bg-green-500' : 'bg-gray-200'
            }`} />
            
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === 'verify' ? 'bg-purple-600 text-white' :
              currentStep === 'complete' ? 'bg-green-500 text-white' : 
              'bg-gray-200 text-gray-400'
            }`}>
              {currentStep === 'complete' ? <Check className="w-4 h-4" /> : '3'}
            </div>
          </div>

          {/* Step Content */}
          {currentStep === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="name@company.com"
                    required
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Try "user@existing.com" for returning user flow
                </p>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {currentStep === 'names' && (
            <form onSubmit={handleNameSubmit} className="space-y-4">
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>New user detected!</strong> Let's get your name before creating your account.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Jane"
                    required
                    autoFocus
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Create Account & Send Code
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {currentStep === 'verify' && (
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div className="mb-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  {userExists ? (
                    <>
                      <strong>Welcome back!</strong> We've sent a verification code to {email}
                    </>
                  ) : (
                    <>
                      <strong>Account created!</strong> Check {email} for your verification code.
                      <br />
                      <span className="text-xs">Name: {firstName} {lastName}</span>
                    </>
                  )}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Verify & Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isLoading}
                className="w-full text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 
                 resendCount > 0 ? `Code resent ${resendCount} time${resendCount > 1 ? 's' : ''}. Resend again?` : 
                 "Didn't receive code? Resend"}
              </button>
            </form>
          )}

          {currentStep === 'complete' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900">
                Success!
              </h3>
              
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Email:</strong> {email}</p>
                {!userExists && (
                  <p><strong>Name:</strong> {firstName} {lastName}</p>
                )}
                <p><strong>User Type:</strong> {userExists ? 'Existing User' : 'New User'}</p>
              </div>
              
              <div className="pt-4">
                <button
                  onClick={reset}
                  className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                >
                  Try Another Flow
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-white/80 rounded-xl p-4 text-sm text-gray-600">
          <h4 className="font-semibold mb-2">Flow Summary:</h4>
          <ul className="space-y-1">
            <li>• <strong>New users:</strong> Email → Names → Create Account → Verify</li>
            <li>• <strong>Existing users:</strong> Email → Send Code → Verify</li>
            <li>• Names are collected BEFORE account creation</li>
            <li>• Account is created with complete information</li>
          </ul>
        </div>
      </div>
    </div>
  )
}