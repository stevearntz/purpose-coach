'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOrganization } from '@clerk/nextjs'
import StartTab from '@/components/StartTab'

export default function StartPage() {
  const router = useRouter()
  const { membership } = useOrganization()
  const [activeSubTab, setActiveSubTab] = useState('dashboard')
  
  // Check if user is a member (not admin)
  const isMember = membership?.role === 'org:member'
  
  // If member, show the member experience with sub-tabs
  if (isMember) {
    return (
      <div className="p-6">
        {/* Sub-tab navigation */}
        <div className="flex space-x-1 mb-8 bg-white/10 rounded-lg p-1 max-w-2xl">
          <button
            onClick={() => setActiveSubTab('onboarding')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              activeSubTab === 'onboarding'
                ? 'bg-white text-gray-900'
                : 'text-white hover:bg-white/10'
            }`}
          >
            Onboarding
          </button>
          <button
            onClick={() => setActiveSubTab('dashboard')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              activeSubTab === 'dashboard'
                ? 'bg-white text-gray-900'
                : 'text-white hover:bg-white/10'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              activeSubTab === 'profile'
                ? 'bg-white text-gray-900'
                : 'text-white hover:bg-white/10'
            }`}
          >
            Profile
          </button>
        </div>
        
        {/* Sub-tab content */}
        <div className="flex items-center justify-center min-h-[50vh]">
          {activeSubTab === 'onboarding' && (
            <h1 className="text-4xl font-bold text-white">Onboarding Goes Here</h1>
          )}
          {activeSubTab === 'dashboard' && (
            <h1 className="text-4xl font-bold text-white">Dashboard Goes Here</h1>
          )}
          {activeSubTab === 'profile' && (
            <h1 className="text-4xl font-bold text-white">Profile Goes Here</h1>
          )}
        </div>
      </div>
    )
  }
  
  // For admins, show the full Start tab
  const handleNavigate = (tab: string) => {
    if (tab === 'onboarding') {
      router.push('/dashboard/onboarding')
    }
  }
  
  return <StartTab onNavigate={handleNavigate} />
}