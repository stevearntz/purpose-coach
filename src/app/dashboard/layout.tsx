'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useUser, UserButton, useOrganization, useOrganizationList } from '@clerk/nextjs'
import { Flame, Eye, Shield } from 'lucide-react'
import ViewportContainer from '@/components/ViewportContainer'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useUser()
  const { organization, membership, isLoaded } = useOrganization()
  const { userMemberships } = useOrganizationList({
    userMemberships: {
      infinite: false,
    },
  })
  
  // Get current user's role in the organization
  const userRole = membership?.role
  const isAdmin = userRole === 'org:admin'
  const isMember = userRole === 'org:member'
  
  // State for view mode (admin users can switch between admin and member view)
  const [viewMode, setViewMode] = useState<'admin' | 'member'>('admin')
  
  // Handle view mode switch with immediate navigation
  const handleViewModeChange = (newMode: 'admin' | 'member') => {
    setViewMode(newMode)
    // Navigate to appropriate default page
    if (newMode === 'member') {
      router.push('/dashboard/member/start/dashboard')
    } else {
      router.push('/dashboard/start')
    }
  }
  
  // Determine effective role based on view mode
  // If admin is viewing in member mode, treat them as a member for navigation
  const effectiveRole = isAdmin && viewMode === 'member' ? 'org:member' : userRole
  const showAsAdmin = effectiveRole === 'org:admin'
  const showAsMember = effectiveRole === 'org:member'
  
  // Different navigation for admins vs members
  const adminTabs = [
    { 
      id: 'start', 
      label: 'Start', 
      href: '/dashboard/start',
      secondary: [
        { id: 'onboarding', label: 'Onboarding', href: '/dashboard/onboarding' }
      ]
    },
    { 
      id: 'users', 
      label: 'Users', 
      href: '/dashboard/users',
      secondary: [
        { id: 'add-users', label: 'Add Users', href: '/dashboard/users/add' }
      ]
    },
    { 
      id: 'assessments', 
      label: 'Assessments', 
      href: '/dashboard/launch',
      secondary: [
        { id: 'launch', label: 'Launch', href: '/dashboard/launch' },
        { id: 'campaigns', label: 'Campaigns', href: '/dashboard/campaigns' },
        { id: 'results', label: 'Results', href: '/dashboard/results' }
      ]
    },
    { 
      id: 'recommendations', 
      label: 'Recommendations', 
      href: '/dashboard/recommendations',
      secondary: []
    },
  ]
  
  const memberTabs = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      href: '/dashboard/member/start/dashboard',
      secondary: []
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      href: '/dashboard/member/start',
      secondary: [
        { id: 'onboarding', label: 'Onboarding', href: '/dashboard/member/start/onboarding' },
        { id: 'myprofile', label: 'My Profile', href: '/dashboard/member/start/profile' },
        { id: 'myteam', label: 'My Team', href: '/dashboard/member/start/team' }
      ]
    },
    { 
      id: 'results', 
      label: 'Results', 
      href: '/dashboard/member/start/results',
      secondary: [
        { id: 'personal', label: 'Personal', href: '/dashboard/member/start/results' },
        { id: 'team', label: 'Team', href: '/dashboard/member/start/results/team' }
      ]
    },
    { 
      id: 'tools', 
      label: 'Tools', 
      href: '/dashboard/member/start/tools',
      secondary: []
    },
    { 
      id: 'recommendations', 
      label: 'Recommendations', 
      href: '/dashboard/member/recommendations',
      secondary: []
    },
  ]
  
  // Select tabs based on effective role (considering view mode for admins)
  const primaryTabs = !isLoaded 
    ? [] // Show nothing while loading
    : showAsMember 
    ? memberTabs
    : adminTabs
  
  // Determine active primary tab based on pathname
  const getActivePrimary = () => {
    // When showing as member (either actual member or admin in member view)
    if (showAsMember) {
      if (pathname.includes('/dashboard/member/start/dashboard')) {
        return 'dashboard'
      }
      if (pathname.includes('/dashboard/member/start/results')) {
        return 'results'
      }
      if (pathname.includes('/dashboard/member/start/tools')) {
        return 'tools'
      }
      if (pathname.includes('/dashboard/member/recommendations')) {
        return 'recommendations'
      }
      if (pathname.includes('/dashboard/member/start')) {
        return 'profile'
      }
      // Default for members
      return 'dashboard'
    }
    
    // Admin paths (only when showing as admin)
    if (pathname.includes('/dashboard/start') || pathname.includes('/dashboard/onboarding')) {
      return 'start'
    }
    if (pathname.includes('/dashboard/users')) {
      return 'users'
    }
    if (pathname.includes('/dashboard/launch') || pathname.includes('/dashboard/campaigns') || pathname.includes('/dashboard/results')) {
      return 'assessments'
    }
    if (pathname.includes('/dashboard/recommendations')) {
      return 'recommendations'
    }
    
    // Default for admins
    return 'start'
  }
  
  const activePrimary = getActivePrimary()
  const activeTab = primaryTabs.find(tab => tab.id === activePrimary)
  const secondaryTabs = activeTab?.secondary || []

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
                    <Flame className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">{organization?.name || 'Your Company'}</h1>
                    <p className="text-xs text-white/60">Powered by Campfire</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* View Mode Toggle - Only for Admins */}
                {isAdmin && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-lg border border-white/20">
                    <button
                      onClick={() => handleViewModeChange('admin')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        viewMode === 'admin'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                          : 'text-white/60 hover:text-white/80 hover:bg-white/10'
                      }`}
                    >
                      <Shield className="w-4 h-4" />
                      Admin
                    </button>
                    <button
                      onClick={() => handleViewModeChange('member')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        viewMode === 'member'
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                          : 'text-white/60 hover:text-white/80 hover:bg-white/10'
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                      Member
                    </button>
                  </div>
                )}
                
                {/* User Account Management */}
                <div className="flex items-center gap-3">
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "w-10 h-10",
                        userButtonPopoverCard: "shadow-xl",
                        userButtonPopoverActionButton: "hover:bg-gray-100",
                        userButtonPopoverActionButtonText: "text-gray-700",
                        userButtonPopoverActionButtonIcon: "text-gray-500",
                        userButtonPopoverFooter: "hidden"
                      }
                    }}
                    afterSignOutUrl="/sign-in"
                  />
                </div>
              </div>
            </div>

            {/* Primary Navigation */}
            <nav className={`flex gap-8 overflow-x-auto pb-3 ${secondaryTabs.length > 0 ? 'border-b border-white/10' : ''}`}>
              {primaryTabs.map((tab) => {
                const isActive = tab.id === activePrimary
                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    className={`pb-3 px-1 font-medium transition-colors relative whitespace-nowrap ${
                      isActive
                        ? 'text-white'
                        : 'text-white/60 hover:text-white/80'
                    }`}
                  >
                    {tab.label}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
                    )}
                  </Link>
                )
              })}
            </nav>
            
            {/* Secondary Navigation */}
            {secondaryTabs.length > 0 && (
              <nav className="flex gap-6 pt-3">
                {secondaryTabs.map((tab) => {
                  const isActive = pathname === tab.href
                  return (
                    <Link
                      key={tab.id}
                      href={tab.href}
                      className={`text-sm font-medium transition-colors ${
                        isActive
                          ? 'text-purple-400'
                          : 'text-white/50 hover:text-white/70'
                      }`}
                    >
                      {tab.label}
                    </Link>
                  )
                })}
              </nav>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 py-8 max-w-7xl mx-auto">
          {children}
        </div>
      </div>

      <Footer />
    </ViewportContainer>
  )
}