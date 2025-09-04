'use client'

import dynamic from 'next/dynamic'

// Load the profile component only on the client side
const ProfileClient = dynamic(() => import('./ProfileClient'), {
  ssr: false,
  loading: () => (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 max-w-2xl">
        <div className="h-32 bg-white/5 rounded-lg border border-white/10 animate-pulse" />
      </div>
    </div>
  )
})

export default function ProfilePage() {
  return <ProfileClient />
}