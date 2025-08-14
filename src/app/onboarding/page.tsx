'use client'

import { useState, useEffect } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Building, Users, Sparkles, ArrowRight, Check } from 'lucide-react'
import ViewportContainer from '@/components/ViewportContainer'

type OnboardingStep = 'welcome' | 'company' | 'team' | 'complete'

export default function OnboardingPage() {
  const { user, isLoaded } = useUser()
  const { session } = useClerk()
  const router = useRouter()
  const [step, setStep] = useState<OnboardingStep>('welcome')
  const [companyData, setCompanyData] = useState({
    name: '',
    size: '',
    industry: ''
  })
  const [teamEmails, setTeamEmails] = useState<string[]>([''])
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in')
    }
    
    // Check if user already has a company
    if (user?.publicMetadata?.companyId) {
      router.push('/dashboard')
    }
  }, [isLoaded, user, router])

  const handleCreateCompany = async () => {
    setIsCreating(true)
    try {
      // Create company in database
      const response = await fetch('/api/companies/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: companyData.name,
          size: companyData.size,
          industry: companyData.industry,
          adminEmail: user?.primaryEmailAddress?.emailAddress,
          adminName: user?.fullName
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 409) {
          alert(`A company named "${companyData.name}" already exists. Please choose a different name.`)
          return
        }
        throw new Error(data.error || 'Failed to create company')
      }

      // Metadata is updated on the server side
      // Reload the user to get updated metadata
      await user?.reload()

      setStep('team')
    } catch (error) {
      console.error('Failed to create company:', error)
      alert('Failed to create company. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleInviteTeam = async () => {
    const validEmails = teamEmails.filter(email => email.trim())
    
    if (validEmails.length > 0) {
      try {
        await fetch('/api/team/invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emails: validEmails,
            companyId: user?.publicMetadata?.companyId
          })
        })
      } catch (error) {
        console.error('Failed to invite team:', error)
      }
    }

    await completeOnboarding()
  }

  const completeOnboarding = async () => {
    // Mark onboarding complete via API
    try {
      await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      // Reload user to get updated metadata
      await user?.reload()
    } catch (error) {
      console.error('Failed to mark onboarding complete:', error)
    }

    setStep('complete')
  }

  const renderWelcomeStep = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
        <Sparkles className="w-10 h-10 text-white" />
      </div>
      
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to Campfire, {user?.firstName}! 🔥
        </h1>
        <p className="text-lg text-gray-600">
          Let's get your leadership development platform set up in 2 minutes
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 text-left space-y-4">
        <h3 className="font-semibold text-gray-900">You'll be able to:</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-500 mt-0.5" />
            <span className="text-gray-700">Access 12+ leadership assessment tools</span>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-500 mt-0.5" />
            <span className="text-gray-700">Invite your team to collaborate</span>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-500 mt-0.5" />
            <span className="text-gray-700">Track progress and growth over time</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => setStep('company')}
        className="w-full py-4 bg-[#BF4C74] text-white rounded-lg font-semibold hover:bg-[#A63D5F] transition-colors flex items-center justify-center gap-2"
      >
        Get Started
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  )

  const renderCompanyStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Tell us about your company
        </h2>
        <p className="text-gray-600">
          This helps us personalize your experience
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Name *
          </label>
          <input
            type="text"
            value={companyData.name}
            onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BF4C74]"
            placeholder="Acme Corporation"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Size
          </label>
          <select
            value={companyData.size}
            onChange={(e) => setCompanyData({ ...companyData, size: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BF4C74]"
          >
            <option value="">Select size</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-500">201-500 employees</option>
            <option value="500+">500+ employees</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Industry
          </label>
          <input
            type="text"
            value={companyData.industry}
            onChange={(e) => setCompanyData({ ...companyData, industry: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BF4C74]"
            placeholder="e.g., Technology, Healthcare, Finance"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStep('welcome')}
          className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleCreateCompany}
          disabled={!companyData.name || isCreating}
          className="flex-1 py-3 bg-[#BF4C74] text-white rounded-lg font-semibold hover:bg-[#A63D5F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isCreating ? 'Creating...' : 'Continue'}
          {!isCreating && <ArrowRight className="w-5 h-5" />}
        </button>
      </div>
    </div>
  )

  const renderTeamStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Invite your team (optional)
        </h2>
        <p className="text-gray-600">
          They'll receive an email invitation to join {companyData.name}
        </p>
      </div>

      <div className="space-y-3">
        {teamEmails.map((email, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                const newEmails = [...teamEmails]
                newEmails[index] = e.target.value
                setTeamEmails(newEmails)
              }}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BF4C74]"
              placeholder="colleague@company.com"
            />
            {index === teamEmails.length - 1 && teamEmails.length < 10 && (
              <button
                onClick={() => setTeamEmails([...teamEmails, ''])}
                className="px-4 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Add +
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> You can always invite more team members later from your dashboard
        </p>
      </div>

      <div className="flex gap-4 pt-2">
        <button
          onClick={() => completeOnboarding()}
          className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-lg"
        >
          Skip for now
        </button>
        <button
          onClick={() => handleInviteTeam()}
          className="flex-1 py-4 bg-[#BF4C74] text-white rounded-lg font-semibold hover:bg-[#A63D5F] transition-colors flex items-center justify-center gap-2 text-lg"
        >
          Send Invites
          <ArrowRight className="w-5 h-5 ml-1" />
        </button>
      </div>
    </div>
  )

  const renderCompleteStep = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <Check className="w-12 h-12 text-green-600" />
      </div>
      
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          You're all set! 🎉
        </h1>
        <p className="text-lg text-gray-600">
          {companyData.name} is ready to start the leadership journey
        </p>
      </div>

      <button
        onClick={async () => {
          // Reload the session to get updated metadata
          await session?.reload()
          // Use router push for proper navigation
          router.push('/dashboard')
        }}
        className="w-full py-4 bg-[#BF4C74] text-white rounded-lg font-semibold hover:bg-[#A63D5F] transition-colors flex items-center justify-center gap-2"
      >
        Go to Dashboard
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  )

  if (!isLoaded) {
    return (
      <ViewportContainer className="bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </ViewportContainer>
    )
  }

  return (
    <ViewportContainer className="bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${step === 'welcome' ? 'bg-[#BF4C74]' : 'bg-gray-300'}`} />
            <div className={`w-3 h-3 rounded-full ${step === 'company' ? 'bg-[#BF4C74]' : 'bg-gray-300'}`} />
            <div className={`w-3 h-3 rounded-full ${step === 'team' ? 'bg-[#BF4C74]' : 'bg-gray-300'}`} />
            <div className={`w-3 h-3 rounded-full ${step === 'complete' ? 'bg-[#BF4C74]' : 'bg-gray-300'}`} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 'welcome' && renderWelcomeStep()}
          {step === 'company' && renderCompanyStep()}
          {step === 'team' && renderTeamStep()}
          {step === 'complete' && renderCompleteStep()}
        </div>
      </div>
    </ViewportContainer>
  )
}