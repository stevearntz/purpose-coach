/**
 * TEMPORARY: Auth bypass for production
 * This file provides temporary auth bypass while we fix NextAuth
 * TO BE REMOVED once auth is fixed
 */

export function getBypassSession() {
  // Check if we're in production
  const isProduction = process.env.NODE_ENV === 'production'
  
  if (isProduction) {
    // Return hardcoded session for steve@getcampfire.com
    return {
      user: {
        id: 'steve-admin-id-123',
        email: 'steve@getcampfire.com',
        name: 'Steve Arntz',
        companyId: 'cme7wq5ka0000dqdpws8k3uxu',
        companyName: 'Campfire'
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
    }
  }
  
  return null
}

export function isProductionBypass() {
  return process.env.NODE_ENV === 'production'
}