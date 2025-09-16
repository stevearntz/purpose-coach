import { UserType } from '@prisma/client'

export type Permission = 
  | 'view_all_users'
  | 'manage_users'
  | 'create_campaigns'
  | 'view_all_campaigns'
  | 'share_assessments'
  | 'view_team_results'
  | 'view_own_results'
  | 'complete_assessments'
  | 'use_all_tools'
  | 'use_limited_tools'
  | 'manage_organization'
  | 'view_analytics'

const permissions: Record<UserType, Permission[]> = {
  ADMIN: [
    'view_all_users',
    'manage_users',
    'create_campaigns',
    'view_all_campaigns',
    'share_assessments',
    'view_team_results',
    'view_own_results',
    'complete_assessments',
    'use_all_tools',
    'manage_organization',
    'view_analytics'
  ],
  MANAGER: [
    'create_campaigns',
    'share_assessments',
    'view_team_results',
    'view_own_results',
    'complete_assessments',
    'use_all_tools'
  ],
  TEAM_MEMBER: [
    'complete_assessments',
    'view_own_results',
    'use_limited_tools'
  ]
}

export function hasPermission(userType: UserType, permission: Permission): boolean {
  return permissions[userType]?.includes(permission) ?? false
}

export function getUserPermissions(userType: UserType): Permission[] {
  return permissions[userType] ?? []
}

// Navigation configuration based on user type
export const navigationByUserType = {
  ADMIN: [
    { label: 'Dashboard', href: '/dashboard/start' },
    { label: 'Users', href: '/dashboard/users' },
    { label: 'Assessments', href: '/dashboard/launch' },
    { label: 'Recommendations', href: '/dashboard/recommendations' }
  ],
  MANAGER: [
    { label: 'Dashboard', href: '/dashboard/member/start/dashboard' },
    { label: 'Tools', href: '/dashboard/member/start/tools' },
    { label: 'Results', href: '/dashboard/member/start/results' },
    { label: 'Recommendations', href: '/dashboard/member/recommendations' },
    { label: 'Profile', href: '/dashboard/member/start' }
  ],
  TEAM_MEMBER: [
    { label: 'Dashboard', href: '/dashboard/member/start/dashboard' },
    { label: 'My Assessments', href: '/dashboard/member/assessments' },
    { label: 'Profile', href: '/dashboard/member/start/profile' }
  ]
}

// Tool access configuration
export const toolAccessByUserType = {
  ADMIN: 'all', // Access to all tools
  MANAGER: 'all', // Access to all tools
  TEAM_MEMBER: ['trust-audit', 'burnout-assessment', 'user-guide'] // Limited tool access
}

export function canAccessTool(userType: UserType, toolId: string): boolean {
  const access = toolAccessByUserType[userType]
  if (access === 'all') return true
  if (Array.isArray(access)) return access.includes(toolId)
  return false
}