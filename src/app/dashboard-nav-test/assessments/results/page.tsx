'use client'

import { User, Calendar, CheckCircle, Clock, ChevronDown, TrendingUp, AlertCircle } from 'lucide-react'
import { useState } from 'react'

export default function ResultsTestPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null)
  
  const results = [
    {
      id: 1,
      participant: 'Steve Arntz',
      email: 'steve@getcampfire.com',
      assessment: 'HR Partnership',
      campaign: 'Q4 HR Partnership Assessment',
      status: 'Completed',
      completedAt: '2025-08-28 14:30',
      score: 85,
      insights: {
        challenges: ['Resource constraints', 'Communication gaps'],
        skills: ['Strategic planning', 'Data analysis'],
        priorities: ['Team performance', 'Culture initiatives']
      }
    },
    {
      id: 2,
      participant: 'Jane Smith',
      email: 'jane@example.com',
      assessment: 'Trust Audit',
      campaign: 'Trust Audit - Engineering Team',
      status: 'Completed',
      completedAt: '2025-08-27 10:15',
      score: 72,
      insights: {
        challenges: ['Team alignment', 'Decision transparency'],
        skills: ['Active listening', 'Conflict resolution'],
        priorities: ['Communication', 'Collaboration']
      }
    },
    {
      id: 3,
      participant: 'John Doe',
      email: 'john@example.com',
      assessment: 'HR Partnership',
      campaign: 'Q4 HR Partnership Assessment',
      status: 'In Progress',
      completedAt: null,
      score: null,
      insights: null
    }
  ]
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Assessment Results</h1>
          <p className="text-white/60 mt-1">Individual and aggregate assessment data</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition-colors">
            Export CSV
          </button>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
            View Analytics
          </button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-white/50" />
            <span className="text-xs text-green-400">+12%</span>
          </div>
          <p className="text-2xl font-bold text-white">47</p>
          <p className="text-xs text-white/60">Total Assessments</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-white/50" />
            <span className="text-xs text-green-400">78%</span>
          </div>
          <p className="text-2xl font-bold text-white">37</p>
          <p className="text-xs text-white/60">Completed</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-white/50" />
            <span className="text-xs text-yellow-400">22%</span>
          </div>
          <p className="text-2xl font-bold text-white">10</p>
          <p className="text-xs text-white/60">In Progress</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-white/50" />
            <span className="text-xs text-green-400">Good</span>
          </div>
          <p className="text-2xl font-bold text-white">76</p>
          <p className="text-xs text-white/60">Avg Score</p>
        </div>
      </div>
      
      {/* Results Table */}
      <div className="space-y-4">
        {results.map(result => (
          <div key={result.id} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
            <div 
              className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => setExpandedId(expandedId === result.id ? null : result.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {result.participant.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-white">{result.participant}</p>
                      <p className="text-sm text-white/60">{result.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-white/60">{result.assessment}</span>
                    <span className="text-white/60">{result.campaign}</span>
                    {result.completedAt && (
                      <span className="text-white/60">{result.completedAt}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {result.score !== null && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{result.score}</p>
                      <p className="text-xs text-white/60">Score</p>
                    </div>
                  )}
                  <span className={`px-3 py-1 rounded text-sm font-medium ${
                    result.status === 'Completed' 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {result.status}
                  </span>
                  {result.insights && (
                    <ChevronDown className={`w-5 h-5 text-white/50 transition-transform ${
                      expandedId === result.id ? 'rotate-180' : ''
                    }`} />
                  )}
                </div>
              </div>
            </div>
            
            {expandedId === result.id && result.insights && (
              <div className="px-6 pb-6 border-t border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">Challenge Areas</h4>
                    <div className="space-y-1">
                      {result.insights.challenges.map((challenge, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <AlertCircle className="w-3 h-3 text-red-400" />
                          <span className="text-sm text-white/70">{challenge}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">Skills to Develop</h4>
                    <div className="space-y-1">
                      {result.insights.skills.map((skill, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <TrendingUp className="w-3 h-3 text-blue-400" />
                          <span className="text-sm text-white/70">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">Focus Areas</h4>
                    <div className="space-y-1">
                      {result.insights.priorities.map((priority, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          <span className="text-sm text-white/70">{priority}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}