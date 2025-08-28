'use client'

import { CheckCircle, Circle, Users, Target, Lightbulb, Rocket } from 'lucide-react'

export default function OnboardingTestPage() {
  const tasks = [
    { 
      title: 'Add Users', 
      description: 'Invite your team members to get started',
      completed: true,
      icon: Users
    },
    { 
      title: 'Launch First Assessment', 
      description: 'Create your first assessment campaign',
      completed: false,
      icon: Target
    },
    { 
      title: 'Review Results', 
      description: 'See insights from completed assessments',
      completed: false,
      icon: Lightbulb
    },
    { 
      title: 'Get Recommendations', 
      description: 'AI-powered insights and actions',
      completed: false,
      icon: Rocket
    }
  ]
  
  return (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h1 className="text-2xl font-bold text-white mb-2">Welcome to Campfire!</h1>
        <p className="text-white/70">Let's get your team set up for success.</p>
      </div>
      
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h2 การดำเนินงาน text-lg font-semibold text-white mb-4">Getting Started Checklist</h2>
        <div className="space-y-3">
          {tasks.map((task, index) => {
            const Icon = task.icon
            return (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                {task.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-white/40 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className={`font-medium ${task.completed ? 'text-white/60' : 'text-white'}`}>
                    {task.title}
                  </h3>
                  <p className="text-sm text-white/50">{task.description}</p>
                </div>
                <Icon className={`w-5 h-5 ${task.completed ? 'text-white/30' : 'text-white/50'}`} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}