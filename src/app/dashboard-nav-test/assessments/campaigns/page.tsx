'use client'

import { Calendar, Users, Clock, MoreVertical, TrendingUp, Mail } from 'lucide-react'

export default function CampaignsTestPage() {
  const campaigns = [
    {
      id: 1,
      name: 'Q4 HR Partnership Assessment',
      assessment: 'HR Partnership',
      status: 'Active',
      participants: 12,
      completed: 8,
      deadline: '2025-09-15',
      startDate: '2025-09-01'
    },
    {
      id: 2,
      name: 'Trust Audit - Engineering Team',
      assessment: 'Trust Audit',
      status: 'Active',
      participants: 8,
      completed: 3,
      deadline: '2025-09-10',
      startDate: '2025-08-25'
    },
    {
      id: 3,
      name: 'Monthly Burnout Check',
      assessment: 'Burnout Assessment',
      status: 'Completed',
      participants: 15,
      completed: 15,
      deadline: '2025-08-31',
      startDate: '2025-08-15'
    }
  ]
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Campaigns</h1>
          <p className="text-white/60 mt-1">Manage your assessment campaigns</p>
        </div>
        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
          New Campaign
        </button>
      </div>
      
      <div className="space-y-4">
        {campaigns.map(campaign => (
          <div key={campaign.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">{campaign.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    campaign.status === 'Active' 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'bg-gray-500/20 text-gray-300'
                  }`}>
                    {campaign.status}
                  </span>
                </div>
                <p className="text-sm text-white/60 mb-4">{campaign.assessment}</p>
                
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-white/60">
                    <Users className="w-4 h-4" />
                    <span>{campaign.completed}/{campaign.participants} completed</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <Calendar className="w-4 h-4" />
                    <span>{campaign.startDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <Clock className="w-4 h-4" />
                    <span>Due {campaign.deadline}</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/60">Progress</span>
                    <span className="text-xs text-white/60">{Math.round((campaign.completed / campaign.participants) * 100)}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${(campaign.completed / campaign.participants) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <Mail className="w-4 h-4 text-white/50" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <TrendingUp className="w-4 h-4 text-white/50" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <MoreVertical className="w-4 h-4 text-white/50" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}