'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

interface CampaignWrapperProps {
  children: React.ReactNode
}

export default function CampaignWrapper({ children }: CampaignWrapperProps) {
  const searchParams = useSearchParams()
  const { user, isLoaded, isSignedIn } = useUser()
  const [isRegistering, setIsRegistering] = useState(false)
  const [hasRegistered, setHasRegistered] = useState(false)
  
  const campaignCode = searchParams.get('campaign')
  
  useEffect(() => {
    const registerForCampaign = async () => {
      if (!campaignCode || !isLoaded || !isSignedIn || !user || hasRegistered || isRegistering) {
        return
      }
      
      setIsRegistering(true)
      
      try {
        console.log('[CampaignWrapper] Registering for campaign:', campaignCode)
        
        const response = await fetch('/api/campaigns/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            campaignCode,
            email: user.emailAddresses?.[0]?.emailAddress,
            firstName: user.firstName,
            lastName: user.lastName
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('[CampaignWrapper] Registration successful:', data)
          setHasRegistered(true)
        } else {
          console.error('[CampaignWrapper] Registration failed:', await response.text())
        }
      } catch (error) {
        console.error('[CampaignWrapper] Error registering for campaign:', error)
      } finally {
        setIsRegistering(false)
      }
    }
    
    registerForCampaign()
  }, [campaignCode, isLoaded, isSignedIn, user, hasRegistered, isRegistering])
  
  return <>{children}</>
}