'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useUser, UserButton, useOrganization } from '@clerk/nextjs'
import { Flame } from 'lucide-react'
import ViewportContainer from '@/components/ViewportContainer'
import Footer from '@/components/Footer'
import Link from 'next/link'

// Primary navigation structure with secondary nav items
const navigationStructure = [
  {
    id: 'start',
    label: 'Start',
    href: '/dashboard-nav-test/start',
    secondary: [
      { id: 'onboarding', label: 'Onboarding', href: '/dashboard-nav-test/start/onboarding' }
    ]
  },
  {
    id: 'users',
    label: 'Users',
    href: '/dashboard-nav-test/users',
    secondary: [
      { id: 'users-list', label: 'Users', href: '/dashboard-nav-test/users' },
      { id: 'add-users', label: 'Add Users', href: '/dashboard-nav-test/users/add' }
    ]
  },
  {
    id: 'assessments',
    label: 'Assessments',
    href: '/dashboard-nav-test/assessments',
    secondary: [
      { id: 'assessments-list', label: 'Assessments', href: '/dashboard-nav-test/assessments' },
      { id: 'campaigns', label: 'Campaigns', href: '/dashboard-nav-test/assessments/campaigns' },
      { id: 'results', label: 'Results', href: '/dashboard-nav-test/assessments/results' }
    ]
  },
  {
    id: 'recommendations',
    label: 'Recommendations',
    href: '/dashboard-nav-test/recommendations',
    secondary: [] // No secondary nav for recommendations
  }
]

export default function DashboardNavTestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useUser()
  const { organization } = useOrganization()
  const [activePrimary, setActivePrimary] = useState<string>('start')
  
  useEffect(() => {
    // Determine active primary nav based on pathname
    const path = pathname.replace('/dashboard-nav-test/', '')
    const primarySection = path.split('/')[0]
    
    if (primarySection) {
      const navItem = navigationStructure.find(item => 
        item.id === primarySection || item.href.includes(primarySection)
      )
      if (navItem) {
        setActivePrimary(navItem.id)
      }
    }
  }, [pathname])
  
  // Get secondary navigation items for active primary
  const activeNavItem = navigationStructure.find(item => item.id === activePrimary)
  const secondaryNav = activeNavItem?.secondary || []

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
            <div className="flex items-center justify-between mb-6">
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
            <nav className="flex gap-8 overflow-x-auto mb-4">
              {navigationStructure.map((item) => {
                const isActive = activePrimary === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActivePrimary(item.id)
                      router.push(item.href)
                    }}
                    className={`pb-3 px-1 font-medium transition-colors relative whitespace-nowrap ${
                      isActive
                        ? 'text-white'
                        : 'text-white/60 hover:text-white/80'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
                    )}
                  </button>
                )
              })}
            </nav>

            {/* Secondary Navigation */}
            {secondaryNav.length > 0 && (
              <nav className="flex gap-6 border-t border-white/10 pt-3">
                {secondaryNav.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`text-sm font-medium transition-colors ${
                        isActive
                          ? 'text-purple-400'
                          : 'text-white/50 hover:text-white/70'
                      }`}
                    >
                      {item.label}
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