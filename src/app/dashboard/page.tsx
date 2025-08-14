'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { LogOut, Building } from 'lucide-react'
import ViewportContainer from '@/components/ViewportContainer'
import Footer from '@/components/Footer'
import ToolsLibrary from '@/components/ToolsLibrary'
import ResultsTab from '@/components/ResultsTab'
import RecommendationsTab from '@/components/RecommendationsTab'
import CampaignsTab from '@/components/CampaignsTab'
import UsersTab from '@/components/UsersTab'
import StartTab from '@/components/StartTab'
import OnboardingTab from '@/components/OnboardingTab'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useToast } from '@/hooks/useToast'
import { ToastProvider } from '@/hooks/useToast'

interface UserData {
  email: string
  name: string
  company?: string
  companyId?: string
  role?: string
}


function DashboardContent() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const analytics = useAnalytics()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [activeTab, setActiveTab] = useState('start')
  
  // Check URL params for initial tab
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('tab')
    if (tab && ['start', 'users', 'tools', 'campaigns', 'results', 'recommendations'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [])

  useEffect(() => {
    // TEMPORARY: In production, bypass auth for dashboard
    const isProduction = process.env.NODE_ENV === 'production' || 
                        window.location.hostname === 'tools.getcampfire.com'
    
    if (isProduction) {
      // Temporary hardcoded user data for production
      setUserData({
        email: 'steve@getcampfire.com',
        name: 'Steve Arntz',
        company: 'Campfire',
        companyId: 'cme7wq5ka0000dqdpws8k3uxu',
        role: 'ADMIN'
      })
      return
    }
    
    // Use NextAuth session data in development
    if (status === 'loading') return
    
    if (!session) {
      router.push('/login')
      return
    }
    
    // Only set user data if it's different (prevents re-tracking)
    if (userData?.email !== session.user.email) {
      setUserData({
        email: session.user.email || '',
        name: session.user.name || '',
        company: session.user.companyName || '',
        companyId: session.user.companyId || '',
        role: 'admin'
      })
      
      // Track analytics only when user changes
      analytics.trackEvent('Dashboard Viewed', {
        email: session.user.email,
        company: session.user.companyName
      })
    }
  }, [session, status, router, userData?.email])

  const handleToolClick = (toolId: string, toolTitle: string, toolPath: string) => {
    analytics.trackAction('Tool Selected', {
      tool: toolTitle,
      from_page: 'dashboard',
      user_email: userData?.email
    })
    router.push(toolPath)
  }

  const handleLogout = async () => {
    try {
      // Sign out using NextAuth
      await signOut({ redirect: false })
      
      // Clear local storage
      localStorage.removeItem('campfire_user_email')
      localStorage.removeItem('campfire_user_name')
      localStorage.removeItem('campfire_user_company')
      
      // Redirect to login page
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      // Even if API fails, clear local data and redirect
      localStorage.clear()
      router.push('/login')
    }
  }

  const getInitials = (name: string) => {
    if (!name || name === 'undefined undefined' || name.trim() === '') {
      return '??'
    }
    
    const parts = name.split(' ').filter(p => p && p !== 'undefined')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    } else if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase()
    }
    return '??'
  }

  if (!userData) {
    return (
      <ViewportContainer className="bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </ViewportContainer>
    )
  }

  return (
    <ViewportContainer className="bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="px-4 py-6 border-b border-white/10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                {/* Company Logo/Name */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">{userData.company || 'Your Company'}</h1>
                    <p className="text-xs text-white/60">getcampfire.com</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* User Avatar & Logout */}
                <div className="flex items-center gap-3 pl-4 border-l border-white/20">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                    {getInitials(userData.name)}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <nav className="flex gap-8">
              <button
                onClick={() => setActiveTab('start')}
                className={`pb-3 px-1 font-medium transition-colors relative ${
                  activeTab === 'start'
                    ? 'text-white'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                Start
                {activeTab === 'start' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('onboarding')}
                className={`pb-3 px-1 font-medium transition-colors relative ${
                  activeTab === 'onboarding'
                    ? 'text-white'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                Onboarding
                {activeTab === 'onboarding' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`pb-3 px-1 font-medium transition-colors relative ${
                  activeTab === 'users'
                    ? 'text-white'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                Users
                {activeTab === 'users' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('tools')}
                className={`pb-3 px-1 font-medium transition-colors relative ${
                  activeTab === 'tools'
                    ? 'text-white'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                Assessments
                {activeTab === 'tools' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('campaigns')}
                className={`pb-3 px-1 font-medium transition-colors relative ${
                  activeTab === 'campaigns'
                    ? 'text-white'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                Campaigns
                {activeTab === 'campaigns' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className={`pb-3 px-1 font-medium transition-colors relative ${
                  activeTab === 'results'
                    ? 'text-white'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                Results
                {activeTab === 'results' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`pb-3 px-1 font-medium transition-colors relative ${
                  activeTab === 'recommendations'
                    ? 'text-white'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                Recommendations
                {activeTab === 'recommendations' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 py-8 max-w-7xl mx-auto">
          {activeTab === 'start' && (
            <StartTab onNavigate={setActiveTab} />
          )}

          {activeTab === 'onboarding' && (
            <OnboardingTab onNavigate={setActiveTab} />
          )}

          {activeTab === 'users' && (
            <UsersTab />
          )}

          {activeTab === 'tools' && (
            <ToolsLibrary onToolClick={handleToolClick} />
          )}

          {activeTab === 'campaigns' && (
            <CampaignsTab />
          )}

          {activeTab === 'results' && (
            <ResultsTab />
          )}

          {activeTab === 'recommendations' && (
            <RecommendationsTab />
          )}
        </div>
      </div>

      <Footer />
    </ViewportContainer>
  )
}

export default function DashboardPage() {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  )
}