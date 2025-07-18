import { useCallback } from 'react'
import { 
  trackEvent, 
  trackToolEvent, 
  setUserProperties,
  identifyUser 
} from '@/lib/amplitude'

export function useAnalytics() {
  // Track tool start
  const trackToolStart = useCallback((toolName: string, context?: Record<string, any>) => {
    trackToolEvent(toolName, 'Started', {
      timestamp: new Date().toISOString(),
      ...context,
    })
  }, [])

  // Track tool completion
  const trackToolComplete = useCallback((toolName: string, data?: Record<string, any>) => {
    trackToolEvent(toolName, 'Completed', {
      timestamp: new Date().toISOString(),
      completion_time: data?.completionTime,
      ...data,
    })
  }, [])

  // Track tool progress
  const trackToolProgress = useCallback((toolName: string, stage: string, progress: number) => {
    trackToolEvent(toolName, 'Progress', {
      stage,
      progress_percentage: progress,
      timestamp: new Date().toISOString(),
    })
  }, [])

  // Track tool abandonment
  const trackToolAbandon = useCallback((toolName: string, stage: string, timeSpent?: number) => {
    trackToolEvent(toolName, 'Abandoned', {
      stage,
      time_spent_seconds: timeSpent,
      timestamp: new Date().toISOString(),
    })
  }, [])

  // Track user actions
  const trackAction = useCallback((action: string, properties?: Record<string, any>) => {
    trackEvent(`User ${action}`, {
      timestamp: new Date().toISOString(),
      ...properties,
    })
  }, [])

  // Track share events
  const trackShare = useCallback((contentType: string, method: string = 'link') => {
    trackEvent('Content Shared', {
      content_type: contentType,
      share_method: method,
      timestamp: new Date().toISOString(),
    })
  }, [])

  // Track download events
  const trackDownload = useCallback((fileType: string, toolName?: string) => {
    trackEvent('File Downloaded', {
      file_type: fileType,
      tool_name: toolName,
      timestamp: new Date().toISOString(),
    })
  }, [])

  // Track error events
  const trackError = useCallback((errorType: string, errorMessage: string, context?: Record<string, any>) => {
    trackEvent('Error Occurred', {
      error_type: errorType,
      error_message: errorMessage,
      timestamp: new Date().toISOString(),
      ...context,
    })
  }, [])

  // Track challenge selection
  const trackChallengeSelection = useCallback((challenges: string[], role: string) => {
    trackEvent('Challenges Selected', {
      challenges,
      challenge_count: challenges.length,
      role,
      timestamp: new Date().toISOString(),
    })
  }, [])

  // Track tool recommendation
  const trackToolRecommendation = useCallback((recommendedTools: string[], basedOnChallenges: string[]) => {
    trackEvent('Tools Recommended', {
      recommended_tools: recommendedTools,
      tool_count: recommendedTools.length,
      based_on_challenges: basedOnChallenges,
      timestamp: new Date().toISOString(),
    })
  }, [])

  return {
    // Core tracking functions
    trackEvent,
    trackAction,
    identifyUser,
    setUserProperties,
    
    // Tool-specific tracking
    trackToolStart,
    trackToolComplete,
    trackToolProgress,
    trackToolAbandon,
    
    // Feature-specific tracking
    trackShare,
    trackDownload,
    trackError,
    trackChallengeSelection,
    trackToolRecommendation,
  }
}