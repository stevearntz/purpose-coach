'use client'

import { useState, useEffect } from 'react'
import { Download, RefreshCw, Filter, Lock, Users, Calendar, Building2, AlertCircle, Target, Heart, Shield, Trash2, Search } from 'lucide-react'
import Link from 'next/link'

interface HRAssessment {
  id: string
  name: string
  email: string
  department: string
  teamSize: string
  selectedCategories: string[]
  categoryDetails: {
    [key: string]: {
      challenges: string[]
      details: string
    }
  }
  skillGaps: string[]
  skillDetails: string
  supportNeeds: string[]
  supportDetails: string
  selectedPriorities: string[]
  customPriority?: string
  teamPriorities: string
  hrSupport: string
  cultureNeeds: string[]
  cultureDetails: string
  additionalInsights: string
  aiFollowUp?: string
  createdAt: string
  domain: string
}

interface AssessmentStats {
  total: number
  uniqueDomains: number
  today: number
}

const categoryLabels: { [key: string]: string } = {
  performance: 'Individual Performance',
  teamDynamics: 'Team Dynamics',
  communication: 'Communication',
  workModels: 'Work Norms',
  leadership: 'Leadership Skills',
  change: 'Change & Alignment',
  systems: 'Systems & Operations',
  collaboration: 'Cross-functional Collaboration',
  compliance: 'Compliance & Risk'
}

export default function HRPartnershipResultsPage() {
  const [assessments, setAssessments] = useState<HRAssessment[]>([])
  const [stats, setStats] = useState<AssessmentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [selectedDomain, setSelectedDomain] = useState<string>('')
  const [domains, setDomains] = useState<string[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchAssessments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        password: 'G3t.c@mpf1r3.st3v3'
      })
      if (selectedDomain) params.append('domain', selectedDomain)
      
      const response = await fetch(`/api/hr-assessments?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAssessments(data.assessments || [])
        setStats(data.stats || null)
        
        // Extract unique domains
        const uniqueDomains = [...new Set(data.assessments.map((a: HRAssessment) => a.domain))]
        setDomains(uniqueDomains.sort())
      }
    } catch (error) {
      console.error('Failed to fetch assessments:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Check if already authenticated in session
    const auth = sessionStorage.getItem('hr_results_auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchAssessments()
    }
  }, [selectedDomain, isAuthenticated])

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'G3t.c@mpf1r3.st3v3') {
      setIsAuthenticated(true)
      sessionStorage.setItem('hr_results_auth', 'true')
      setError('')
    } else {
      setError('Invalid password')
    }
  }

  const exportCSV = async () => {
    const params = new URLSearchParams({ 
      format: 'csv',
      password: 'G3t.c@mpf1r3.st3v3'
    })
    if (selectedDomain) params.append('domain', selectedDomain)
    
    const response = await fetch(`/api/hr-assessments?${params}`)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hr-assessments-${selectedDomain || 'all'}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const deleteDomainAssessments = async (domain: string) => {
    if (!confirm(`Are you sure you want to delete all assessments for ${domain}? This cannot be undone.`)) {
      return
    }
    
    try {
      const params = new URLSearchParams({
        domain,
        password: 'G3t.c@mpf1r3.st3v3'
      })
      
      const response = await fetch(`/api/hr-assessments?${params}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await fetchAssessments()
      } else {
        alert('Failed to delete assessments')
      }
    } catch (error) {
      console.error('Failed to delete assessments:', error)
      alert('Failed to delete assessments')
    }
  }

  const filteredAssessments = assessments.filter(assessment => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      assessment.name.toLowerCase().includes(search) ||
      assessment.email.toLowerCase().includes(search) ||
      assessment.department.toLowerCase().includes(search)
    )
  })

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">HR Results Access Required</h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter admin password"
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Access HR Results
              </button>
            </form>
            <div className="mt-6 text-center">
              <Link href="/hr-partnership" className="text-sm text-gray-500 hover:text-gray-700">
                ← Back to Assessment
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">HR Partnership Assessment Results</h1>
            <Link
              href="/hr-partnership"
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back to Assessment
            </Link>
          </div>
          
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Assessments</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Unique Companies</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.uniqueDomains}</p>
                  </div>
                  <Building2 className="w-8 h-8 text-gray-400" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Today</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.today}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Companies</option>
                  {domains.map((domain) => (
                    <option key={domain} value={domain}>
                      {domain}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by name, email, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
              
              <button
                onClick={fetchAssessments}
                className="p-2 text-gray-600 hover:text-gray-800"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              {selectedDomain && (
                <button
                  onClick={() => deleteDomainAssessments(selectedDomain)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Domain
                </button>
              )}
              
              <button
                onClick={exportCSV}
                disabled={filteredAssessments.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              Loading assessments...
            </div>
          ) : filteredAssessments.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No assessments found
            </div>
          ) : (
            filteredAssessments.map((assessment) => (
              <div key={assessment.id} className="bg-white rounded-lg shadow">
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedId(expandedId === assessment.id ? null : assessment.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">{assessment.name}</h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {assessment.domain}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                        <p><span className="font-medium">Email:</span> {assessment.email}</p>
                        <p><span className="font-medium">Department:</span> {assessment.department}</p>
                        <p><span className="font-medium">Team Size:</span> {assessment.teamSize}</p>
                      </div>
                      
                      {/* Summary badges */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {assessment.selectedCategories.length > 0 && (
                          <div className="flex items-center gap-1">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <span className="text-sm text-gray-600">
                              {assessment.selectedCategories.length} challenge areas
                            </span>
                          </div>
                        )}
                        {assessment.skillGaps.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Target className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-gray-600">
                              {assessment.skillGaps.length} skills to develop
                            </span>
                          </div>
                        )}
                        {assessment.supportNeeds.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Shield className="w-4 h-4 text-amber-600" />
                            <span className="text-sm text-gray-600">
                              {assessment.supportNeeds.length} support needs
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {new Date(assessment.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                {/* Expanded details */}
                {expandedId === assessment.id && (
                  <div className="px-6 pb-6 border-t">
                    <div className="mt-4 space-y-4">
                      {/* Challenge Areas */}
                      {assessment.selectedCategories.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Challenge Areas</h4>
                          {assessment.selectedCategories.map((catId) => {
                            const categoryData = assessment.categoryDetails[catId]
                            return (
                              <div key={catId} className="mb-3 pl-4 border-l-2 border-gray-200">
                                <p className="font-medium text-gray-700 mb-1">
                                  {categoryLabels[catId] || catId}
                                </p>
                                {categoryData?.challenges.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {categoryData.challenges.map((challenge) => (
                                      <span key={challenge} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                                        {challenge}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {categoryData?.details && (
                                  <p className="text-sm text-gray-600 italic">{categoryData.details}</p>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                      
                      {/* Skills */}
                      {assessment.skillGaps.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Skills to Develop</h4>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {assessment.skillGaps.map((skill) => (
                              <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                {skill}
                              </span>
                            ))}
                          </div>
                          {assessment.skillDetails && (
                            <p className="text-sm text-gray-600 italic">{assessment.skillDetails}</p>
                          )}
                        </div>
                      )}
                      
                      {/* Support Needs */}
                      {assessment.supportNeeds.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Immediate Support Needs</h4>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {assessment.supportNeeds.map((need) => (
                              <span key={need} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                                {need}
                              </span>
                            ))}
                          </div>
                          {assessment.supportDetails && (
                            <p className="text-sm text-gray-600 italic">{assessment.supportDetails}</p>
                          )}
                        </div>
                      )}
                      
                      {/* Priorities */}
                      {(assessment.selectedPriorities.length > 0 || assessment.customPriority) && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Focus Areas</h4>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {assessment.selectedPriorities.map((priority) => (
                              <span key={priority} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                {priority}
                              </span>
                            ))}
                            {assessment.customPriority && (
                              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                {assessment.customPriority}
                              </span>
                            )}
                          </div>
                          {assessment.hrSupport && (
                            <p className="text-sm text-gray-600 italic">{assessment.hrSupport}</p>
                          )}
                        </div>
                      )}
                      
                      {/* Additional Insights */}
                      {assessment.additionalInsights && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Additional Insights</h4>
                          <p className="text-sm text-gray-600">{assessment.additionalInsights}</p>
                          {assessment.aiFollowUp && (
                            <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm text-blue-700">
                                <span className="font-medium">AI Follow-up:</span> {assessment.aiFollowUp}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Logout button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              sessionStorage.removeItem('hr_results_auth')
              setIsAuthenticated(false)
              setPassword('')
            }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}