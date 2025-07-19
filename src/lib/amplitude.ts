import * as amplitude from '@amplitude/analytics-browser'
import { Types } from '@amplitude/analytics-browser'

// Initialize Amplitude with your API key
export const initAmplitude = () => {
  // You'll need to add your Amplitude API key to your environment variables
  const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY
  
  if (!apiKey) {
    console.warn('Amplitude API key not found. Analytics will not be tracked.')
    return
  }

  amplitude.init(apiKey, undefined, {
    // Configuration options
    defaultTracking: {
      pageViews: true,
      sessions: true,
      attribution: true,
      fileDownloads: true,
      formInteractions: true,
    },
    // Disable remote config to prevent network errors
    autocapture: {
      elementInteractions: false,
    },
    // Optional: Set server URL for EU data residency
    // serverUrl: 'https://api.eu.amplitude.com/2/httpapi',
    serverUrl: process.env.NEXT_PUBLIC_AMPLITUDE_SERVER_URL,
    // Disable fetching remote config to prevent network errors
    useBatch: false,
    // Add timeout for network requests
    uploadPeriodMillis: 10000,
    // Retry configuration
    retryClass: {
      maxRetries: 3,
      retryTimeouts: [1000, 2000, 4000],
    },
    // Disable console logging in production
    logLevel: process.env.NODE_ENV === 'production' ? Types.LogLevel.None : Types.LogLevel.Warn,
  })
}

// Track custom events
export const trackEvent = (eventName: string, eventProperties?: Record<string, any>) => {
  if (!process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY) return
  
  amplitude.track(eventName, eventProperties)
}

// Identify user
export const identifyUser = (userId: string, userProperties?: Record<string, any>) => {
  if (!process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY) return
  
  amplitude.setUserId(userId)
  if (userProperties) {
    const identify = new amplitude.Identify()
    Object.entries(userProperties).forEach(([key, value]) => {
      identify.set(key, value)
    })
    amplitude.identify(identify)
  }
}

// Set user properties
export const setUserProperties = (properties: Record<string, any>) => {
  if (!process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY) return
  
  const identify = new amplitude.Identify()
  Object.entries(properties).forEach(([key, value]) => {
    identify.set(key, value)
  })
  amplitude.identify(identify)
}

// Track tool-specific events
export const trackToolEvent = (toolName: string, eventType: string, properties?: Record<string, any>) => {
  trackEvent(`Tool ${eventType}`, {
    tool_name: toolName,
    ...properties,
  })
}

// Track page views manually (if needed beyond default tracking)
export const trackPageView = (pageName: string, properties?: Record<string, any>) => {
  trackEvent('Page View', {
    page_name: pageName,
    page_path: window.location.pathname,
    page_url: window.location.href,
    ...properties,
  })
}

// Revenue tracking (if applicable)
export const trackRevenue = (price: number, quantity: number = 1, productId?: string) => {
  if (!process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY) return
  
  const revenue = new amplitude.Revenue()
    .setPrice(price)
    .setQuantity(quantity)
  
  if (productId) {
    revenue.setProductId(productId)
  }
  
  amplitude.revenue(revenue)
}

// Session management
export const setSessionId = (sessionId: number) => {
  if (!process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY) return
  
  amplitude.setSessionId(sessionId)
}

// Get session ID
export const getSessionId = () => {
  if (!process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY) return null
  
  return amplitude.getSessionId()
}

// Reset when user logs out
export const resetAmplitude = () => {
  if (!process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY) return
  
  amplitude.reset()
}