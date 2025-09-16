'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUserPermissions } from '@/hooks/useUserPermissions'
import { Home, Users, ClipboardList, Target, UserCircle, BarChart, Settings, Loader2 } from 'lucide-react'

const iconMap: Record<string, React.ReactNode> = {
  'Dashboard': <Home className="w-5 h-5" />,
  'Users': <Users className="w-5 h-5" />,
  'Assessments': <ClipboardList className="w-5 h-5" />,
  'Recommendations': <Target className="w-5 h-5" />,
  'Tools': <Target className="w-5 h-5" />,
  'Results': <BarChart className="w-5 h-5" />,
  'Profile': <UserCircle className="w-5 h-5" />,
  'My Assessments': <ClipboardList className="w-5 h-5" />
}

export default function DynamicNavigation() {
  const pathname = usePathname()
  const { navigation, loading, userType } = useUserPermissions()
  
  if (loading) {
    return (
      <nav className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-white/60 animate-spin" />
        </div>
      </nav>
    )
  }
  
  if (!navigation || navigation.length === 0) {
    return null
  }
  
  return (
    <nav className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
      <div className="mb-4">
        <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">
          {userType === 'ADMIN' && 'Admin Menu'}
          {userType === 'MANAGER' && 'Manager Menu'}
          {userType === 'TEAM_MEMBER' && 'Team Member Menu'}
        </p>
      </div>
      
      <ul className="space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const icon = iconMap[item.label] || <Settings className="w-5 h-5" />
          
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-white/20 text-white font-medium'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {icon}
                <span>{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
      
      {userType && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-xs text-white/40">
            Access Level: <span className="text-white/60 font-medium">{userType.replace('_', ' ')}</span>
          </p>
        </div>
      )}
    </nav>
  )
}