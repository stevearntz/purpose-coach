'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useUser, UserButton, useOrganization } from '@clerk/nextjs'
import { Flame, UserPlus } from 'lucide-react'
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
  const { organization } = useOrganization()
  
  const tabs = [
    { id: 'start', label: 'Start', href: '/dashboard/start' },
    { id: 'onboarding', label: 'Onboarding', href: '/dashboard/onboarding' },
    { id: 'participants', label: 'Participants', href: '/dashboard/participants' },
    { id: 'assessments', label: 'Assessments', href: '/dashboard/assessments' },
    { id: 'campaigns', label: 'Campaigns', href: '/dashboard/campaigns' },
    { id: 'results', label: 'Results', href: '/dashboard/results' },
    { id: 'recommendations', label: 'Recommendations', href: '/dashboard/recommendations' },
    { id: 'users', label: 'Users', href: '/dashboard/users' },
  ]

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
                {/* Invite Admins Button */}
                <button
                  onClick={() => router.push('/invite')}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="text-sm font-medium">Invite Admins</span>
                </button>
                
                {/* User Account Management */}
                <div className="flex items-center gap-3 pl-4 border-l border-white/20">
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

            {/* Tab Navigation */}
            <nav className="flex gap-8 overflow-x-auto">
              {tabs.map((tab) => {
                const isActive = pathname === tab.href
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