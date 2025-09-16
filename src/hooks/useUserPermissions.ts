'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { UserType } from '@prisma/client'
import { hasPermission, getUserPermissions, canAccessTool, navigationByUserType, Permission } from '@/lib/permissions'

interface UserPermissionsState {
  userType: UserType | null
  permissions: Permission[]
  navigation: typeof navigationByUserType[UserType]
  loading: boolean
  hasPermission: (permission: Permission) => boolean
  canAccessTool: (toolId: string) => boolean
}

export function useUserPermissions(): UserPermissionsState {
  const { user, isLoaded } = useUser()
  const [userType, setUserType] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (!isLoaded) return
    
    const fetchUserType = async () => {
      if (!user) {
        setUserType(null)
        setLoading(false)
        return
      }
      
      try {
        const response = await fetch('/api/user/type', {
          credentials: 'include'
        })
        
        if (response.ok) {
          const data = await response.json()
          setUserType(data.userType || 'TEAM_MEMBER')
        } else {
          // Default to TEAM_MEMBER if no profile found
          setUserType('TEAM_MEMBER')
        }
      } catch (error) {
        console.error('Error fetching user type:', error)
        setUserType('TEAM_MEMBER')
      } finally {
        setLoading(false)
      }
    }
    
    fetchUserType()
  }, [user, isLoaded])
  
  const permissions = userType ? getUserPermissions(userType) : []
  const navigation = userType ? navigationByUserType[userType] : []
  
  return {
    userType,
    permissions,
    navigation,
    loading,
    hasPermission: (permission: Permission) => userType ? hasPermission(userType, permission) : false,
    canAccessTool: (toolId: string) => userType ? canAccessTool(userType, toolId) : false
  }
}