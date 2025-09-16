'use client'

import React from 'react'
import { useUserPermissions } from '@/hooks/useUserPermissions'
import { AlertCircle, Lock } from 'lucide-react'

interface ToolAccessWrapperProps {
  toolId: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function ToolAccessWrapper({ 
  toolId, 
  children, 
  fallback 
}: ToolAccessWrapperProps) {
  const { canAccessTool, loading, userType } = useUserPermissions()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/90 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-600/20 animate-pulse mb-4">
            <Lock className="w-8 h-8 text-purple-400" />
          </div>
          <p className="text-white/80 text-lg">Checking access permissions...</p>
        </div>
      </div>
    )
  }
  
  const hasAccess = canAccessTool(toolId)
  
  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/90 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-500/20 mb-4">
            <AlertCircle className="w-8 h-8 text-orange-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-white/70 mb-4">
            This tool is not available for your account type.
          </p>
          <p className="text-sm text-white/50 mb-6">
            Your current access level: <span className="font-medium text-white/70">{userType?.replace('_', ' ')}</span>
          </p>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
            <p className="text-blue-300 text-sm">
              Contact your organization admin to request access to additional tools.
            </p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }
  
  return <>{children}</>
}