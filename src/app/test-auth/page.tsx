'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'

export default function TestAuthPage() {
  const { user, isLoaded } = useUser()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (isLoaded && user) {
      // Fetch profile to see if names were saved
      fetch('/api/user/profile')
        .then(res => res.json())
        .then(data => {
          setProfile(data.profile)
          setLoading(false)
        })
        .catch(err => {
          console.error('Error fetching profile:', err)
          setLoading(false)
        })
    } else if (isLoaded) {
      setLoading(false)
    }
  }, [isLoaded, user])
  
  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold mb-4">Test Auth Flow</h1>
          <p className="text-gray-600 mb-4">Not signed in</p>
          <a 
            href="/auth"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go to Sign In
          </a>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-6">Auth Flow Test Results</h1>
        
        <div className="space-y-6">
          {/* Clerk User Data */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-2 text-purple-600">Clerk User Data</h2>
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="font-medium w-32">User ID:</span>
                <span className="text-gray-700">{user.id}</span>
              </div>
              <div className="flex">
                <span className="font-medium w-32">Email:</span>
                <span className="text-gray-700">{user.emailAddresses[0]?.emailAddress}</span>
              </div>
              <div className="flex">
                <span className="font-medium w-32">First Name:</span>
                <span className={`${user.firstName ? 'text-green-600' : 'text-red-600'} font-medium`}>
                  {user.firstName || '❌ NOT SET'}
                </span>
              </div>
              <div className="flex">
                <span className="font-medium w-32">Last Name:</span>
                <span className={`${user.lastName ? 'text-green-600' : 'text-red-600'} font-medium`}>
                  {user.lastName || '❌ NOT SET'}
                </span>
              </div>
              <div className="flex">
                <span className="font-medium w-32">Full Name:</span>
                <span className="text-gray-700">{user.fullName || 'Not available'}</span>
              </div>
            </div>
          </div>
          
          {/* Profile Data */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-2 text-purple-600">Database Profile Data</h2>
            {profile ? (
              <div className="space-y-2 text-sm">
                <div className="flex">
                  <span className="font-medium w-32">Profile ID:</span>
                  <span className="text-gray-700">{profile.id}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-32">Email:</span>
                  <span className="text-gray-700">{profile.email}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-32">First Name:</span>
                  <span className={`${profile.firstName ? 'text-green-600' : 'text-red-600'} font-medium`}>
                    {profile.firstName || '❌ NOT SET'}
                  </span>
                </div>
                <div className="flex">
                  <span className="font-medium w-32">Last Name:</span>
                  <span className={`${profile.lastName ? 'text-green-600' : 'text-red-600'} font-medium`}>
                    {profile.lastName || '❌ NOT SET'}
                  </span>
                </div>
                <div className="flex">
                  <span className="font-medium w-32">Onboarding:</span>
                  <span className="text-gray-700">{profile.onboardingComplete ? 'Complete' : 'Incomplete'}</span>
                </div>
              </div>
            ) : (
              <p className="text-red-600">No profile found in database</p>
            )}
          </div>
          
          {/* Test Result */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Test Result</h2>
            {user.firstName && user.lastName && profile?.firstName && profile?.lastName ? (
              <div className="text-green-600 font-medium">
                ✅ SUCCESS: Names are properly set in both Clerk and Database!
              </div>
            ) : (
              <div className="text-red-600 font-medium">
                ❌ ISSUE: Names are missing in {!user.firstName || !user.lastName ? 'Clerk' : 'Database'}
                <div className="text-sm mt-2 text-gray-600">
                  {!user.firstName && <div>• Clerk firstName is missing</div>}
                  {!user.lastName && <div>• Clerk lastName is missing</div>}
                  {profile && !profile.firstName && <div>• Database firstName is missing</div>}
                  {profile && !profile.lastName && <div>• Database lastName is missing</div>}
                </div>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Refresh
            </button>
            <a
              href="/dashboard"
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}