'use client'

import React, { useState } from 'react'
import { ExternalLink, Download, Filter, Calendar, User, FileText, ChevronDown } from 'lucide-react'

// Simulated results data
const simulatedResults = [
  {
    id: '1',
    userName: 'Sarah Johnson',
    userEmail: 'sarah.johnson@company.com',
    tool: 'Trust Audit',
    toolId: 'trust-audit',
    completedAt: '2024-01-08T14:30:00',
    shareUrl: '/trust-audit/share/abc123',
    score: 85,
    status: 'completed'
  },
  {
    id: '2',
    userName: 'Michael Chen',
    userEmail: 'michael.chen@company.com',
    tool: 'Burnout Assessment',
    toolId: 'burnout-assessment',
    completedAt: '2024-01-08T10:15:00',
    shareUrl: '/burnout-assessment/share/def456',
    score: 72,
    status: 'completed'
  },
  {
    id: '3',
    userName: 'Emily Rodriguez',
    userEmail: 'emily.rodriguez@company.com',
    tool: 'Team Charter',
    toolId: 'team-charter',
    completedAt: '2024-01-07T16:45:00',
    shareUrl: '/team-charter/share/ghi789',
    status: 'completed'
  },
  {
    id: '4',
    userName: 'David Kim',
    userEmail: 'david.kim@company.com',
    tool: 'Change Style Profile',
    toolId: 'change-style',
    completedAt: '2024-01-07T09:20:00',
    shareUrl: '/change-style/share/jkl012',
    status: 'completed'
  },
  {
    id: '5',
    userName: 'Jessica Thompson',
    userEmail: 'jessica.thompson@company.com',
    tool: 'Decision Making Audit',
    toolId: 'decision-audit',
    completedAt: '2024-01-06T13:10:00',
    shareUrl: '/decision-making-audit/share/mno345',
    score: 78,
    status: 'completed'
  },
  {
    id: '6',
    userName: 'Robert Martinez',
    userEmail: 'robert.martinez@company.com',
    tool: 'User Guide',
    toolId: 'user-guide',
    completedAt: '2024-01-06T11:30:00',
    shareUrl: '/user-guide/share/pqr678',
    status: 'completed'
  },
  {
    id: '7',
    userName: 'Lisa Anderson',
    userEmail: 'lisa.anderson@company.com',
    tool: 'HR Partnership Assessment',
    toolId: 'hr-partnership',
    completedAt: '2024-01-05T15:00:00',
    shareUrl: '/hr-partnership/share/stu901',
    score: 91,
    status: 'completed'
  },
  {
    id: '8',
    userName: 'James Wilson',
    userEmail: 'james.wilson@company.com',
    tool: 'Expectations Reflection',
    toolId: 'expectations-reflection',
    completedAt: '2024-01-05T10:45:00',
    shareUrl: '/expectations-reflection/share/vwx234',
    status: 'completed'
  },
  {
    id: '9',
    userName: 'Sarah Johnson',
    userEmail: 'sarah.johnson@company.com',
    tool: 'Focus Finder',
    toolId: 'focus-finder',
    completedAt: '2024-01-04T14:20:00',
    shareUrl: '/accountability-builder/share/yza567',
    status: 'completed'
  },
  {
    id: '10',
    userName: 'Michael Chen',
    userEmail: 'michael.chen@company.com',
    tool: 'Drivers Reflection',
    toolId: 'drivers-reflection',
    completedAt: '2024-01-04T09:00:00',
    shareUrl: '/drivers-reflection/share/bcd890',
    status: 'completed'
  },
  {
    id: '11',
    userName: 'Amanda Taylor',
    userEmail: 'amanda.taylor@company.com',
    tool: 'Coaching Cards',
    toolId: 'coaching-cards',
    completedAt: '2024-01-03T16:30:00',
    shareUrl: '/coaching-cards/share/efg123',
    status: 'completed'
  },
  {
    id: '12',
    userName: 'Christopher Lee',
    userEmail: 'christopher.lee@company.com',
    tool: 'Change Readiness Assessment',
    toolId: 'change-readiness',
    completedAt: '2024-01-03T11:15:00',
    shareUrl: '/change-readiness-assessment/share/hij456',
    score: 68,
    status: 'completed'
  },
  {
    id: '13',
    userName: 'Jennifer Brown',
    userEmail: 'jennifer.brown@company.com',
    tool: 'Trust Audit',
    toolId: 'trust-audit',
    completedAt: '2024-01-02T13:45:00',
    shareUrl: '/trust-audit/share/klm789',
    score: 82,
    status: 'completed'
  },
  {
    id: '14',
    userName: 'Daniel Garcia',
    userEmail: 'daniel.garcia@company.com',
    tool: 'Team Charter',
    toolId: 'team-charter',
    completedAt: '2024-01-02T10:00:00',
    shareUrl: '/team-charter/share/nop012',
    status: 'completed'
  },
  {
    id: '15',
    userName: 'Michelle Davis',
    userEmail: 'michelle.davis@company.com',
    tool: 'Burnout Assessment',
    toolId: 'burnout-assessment',
    completedAt: '2024-01-01T15:20:00',
    shareUrl: '/burnout-assessment/share/qrs345',
    score: 65,
    status: 'completed'
  },
  {
    id: '16',
    userName: 'Kevin Zhang',
    userEmail: 'kevin.zhang@company.com',
    tool: 'Change Reflection',
    toolId: 'change-reflection',
    completedAt: '2024-01-01T09:30:00',
    shareUrl: '/change-reflection/share/tuv678',
    status: 'completed'
  },
  {
    id: '17',
    userName: 'Rachel Green',
    userEmail: 'rachel.green@company.com',
    tool: 'Decision Making Audit',
    toolId: 'decision-audit',
    completedAt: '2023-12-29T14:00:00',
    shareUrl: '/decision-making-audit/share/wxy901',
    score: 75,
    status: 'completed'
  },
  {
    id: '18',
    userName: 'Thomas White',
    userEmail: 'thomas.white@company.com',
    tool: 'HR Partnership Assessment',
    toolId: 'hr-partnership',
    completedAt: '2023-12-29T10:30:00',
    shareUrl: '/hr-partnership/share/zab234',
    score: 88,
    status: 'completed'
  }
]

// Tool color mapping
const toolGradients: Record<string, string> = {
  'trust-audit': 'from-[#FFA62A] to-[#DB4839]',
  'burnout-assessment': 'from-[#74DEDE] to-[#30B859]',
  'team-charter': 'from-[#FF6B6B] to-[#4ECDC4]',
  'change-style': 'from-[#F595B6] to-[#BF4C74]',
  'decision-audit': 'from-[#6DC7FF] to-[#3C36FF]',
  'user-guide': 'from-[#30C7C7] to-[#2A74B9]',
  'hr-partnership': 'from-[#30C7C7] to-[#2A74B9]',
  'expectations-reflection': 'from-[#C67AF4] to-[#3E37FF]',
  'focus-finder': 'from-[#C67AF4] to-[#3E37FF]',
  'drivers-reflection': 'from-[#FBBF24] to-[#F59E0B]',
  'coaching-cards': 'from-[#D4F564] to-[#87AE05]',
  'change-readiness': 'from-[#F595B6] to-[#BF4C74]',
  'change-reflection': 'from-[#F595B6] to-[#BF4C74]'
}

export default function ResultsTab() {
  const [filterTool, setFilterTool] = useState<string>('all')
  const [filterUser, setFilterUser] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'user' | 'tool'>('date')
  const [showFilters, setShowFilters] = useState(false)

  // Get unique tools and users for filters
  const uniqueTools = Array.from(new Set(simulatedResults.map(r => r.tool)))
  const uniqueUsers = Array.from(new Set(simulatedResults.map(r => r.userName)))

  // Filter and sort results
  let filteredResults = [...simulatedResults]
  
  if (filterTool !== 'all') {
    filteredResults = filteredResults.filter(r => r.tool === filterTool)
  }
  
  if (filterUser !== 'all') {
    filteredResults = filteredResults.filter(r => r.userName === filterUser)
  }

  // Sort results
  filteredResults.sort((a, b) => {
    switch (sortBy) {
      case 'user':
        return a.userName.localeCompare(b.userName)
      case 'tool':
        return a.tool.localeCompare(b.tool)
      case 'date':
      default:
        return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    }
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      if (diffHours === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60))
        return `${diffMins} minutes ago`
      }
      return `${diffHours} hours ago`
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
  }

  const getInitials = (name: string) => {
    const parts = name.split(' ')
    return parts.map(p => p[0]).join('').toUpperCase()
  }

  return (
    <div>
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Assessment Results</h2>
            <p className="text-white/70">
              View and share completed assessments from your team
            </p>
          </div>
          
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Filter by Tool
                </label>
                <select
                  value={filterTool}
                  onChange={(e) => setFilterTool(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="all">All Tools</option>
                  {uniqueTools.map(tool => (
                    <option key={tool} value={tool}>{tool}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Filter by User
                </label>
                <select
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="all">All Users</option>
                  {uniqueUsers.map(user => (
                    <option key={user} value={user}>{user}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'user' | 'tool')}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="date">Most Recent</option>
                  <option value="user">User Name</option>
                  <option value="tool">Tool Name</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="flex items-center gap-6 text-sm text-white/60">
          <span>{filteredResults.length} results</span>
          <span>•</span>
          <span>{uniqueUsers.length} users</span>
          <span>•</span>
          <span>{uniqueTools.length} tools used</span>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {filteredResults.map((result) => (
          <div
            key={result.id}
            className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200"
          >
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                {/* User Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {getInitials(result.userName)}
                </div>

                {/* Result Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-white font-medium">{result.userName}</span>
                    <span className="text-white/40">•</span>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${toolGradients[result.toolId] || 'from-gray-500 to-gray-600'} text-white`}>
                      {result.tool}
                    </span>
                    {result.score && (
                      <>
                        <span className="text-white/40">•</span>
                        <span className={`text-sm font-medium ${
                          result.score >= 80 ? 'text-green-400' :
                          result.score >= 60 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          Score: {result.score}%
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-white/60">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(result.completedAt)}
                    </span>
                    <span className="text-white/40">•</span>
                    <span className="truncate">{result.userEmail}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-4">
                <a
                  href={result.shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors group"
                  title="View Results"
                >
                  <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </a>
                <button
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors group"
                  title="Download PDF"
                >
                  <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredResults.length === 0 && (
        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
          <FileText className="w-12 h-12 text-white/40 mx-auto mb-3" />
          <p className="text-white/60">No results found matching your filters</p>
        </div>
      )}
    </div>
  )
}