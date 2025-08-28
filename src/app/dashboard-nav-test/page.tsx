'use client'

import { useState } from 'react'
import { Flame } from 'lucide-react'

// Navigation structure
const navStructure = [
  {
    id: 'start',
    label: 'Start',
    secondary: ['Onboarding']
  },
  {
    id: 'users', 
    label: 'Users',
    secondary: ['Users', 'Add Users']
  },
  {
    id: 'assessments',
    label: 'Assessments', 
    secondary: ['Assessments', 'Campaigns', 'Results']
  },
  {
    id: 'recommendations',
    label: 'Recommendations',
    secondary: []
  }
]

export default function DashboardNavTest() {
  const [activePrimary, setActivePrimary] = useState('assessments')
  const [activeSecondary, setActiveSecondary] = useState('Campaigns')
  
  const currentNav = navStructure.find(item => item.id === activePrimary)
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          {/* Logo Section */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Bonfire</h1>
                <p className="text-xs text-white/60">Powered by Campfire</p>
              </div>
            </div>
          </div>
          
          {/* Primary Nav */}
          <nav className="flex gap-8 border-b border-white/10 pb-4">
            {navStructure.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePrimary(item.id)}
                className={`font-medium transition-colors ${
                  activePrimary === item.id
                    ? 'text-white'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          
          {/* Secondary Nav */}
          {currentNav?.secondary && currentNav.secondary.length > 0 && (
            <nav className="flex gap-6 pt-4">
              {currentNav.secondary.map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveSecondary(item)}
                  className={`text-sm font-medium transition-colors ${
                    activeSecondary === item
                      ? 'text-purple-400'
                      : 'text-white/50 hover:text-white/70'
                  }`}
                >
                  {item}
                </button>
              ))}
            </nav>
          )}
        </div>
        
        {/* Content Preview */}
        <div className="mt-8 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-bold text-white mb-2">
            {activePrimary.charAt(0).toUpperCase() + activePrimary.slice(1)} 
            {activeSecondary && ` / ${activeSecondary}`}
          </h2>
          <p className="text-white/60">Page content would go here...</p>
        </div>
      </div>
    </div>
  )
}