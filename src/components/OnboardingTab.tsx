'use client'

import React, { useState, useEffect } from 'react'
import { 
  CheckCircle, Circle, Users, Target, Lightbulb, Calendar, Send,
  ArrowRight, Sparkles, ExternalLink
} from 'lucide-react'

interface OnboardingTask {
  id: string
  title: string
  description: string
  completed: boolean
  action?: () => void
  link?: string
}

interface OnboardingTabProps {
  onNavigate?: (tab: string) => void
}

export default function OnboardingTab({ onNavigate }: OnboardingTabProps) {
  const [tasks, setTasks] = useState<OnboardingTask[]>([
    {
      id: '1',
      title: 'Add Users',
      description: 'Invite your team members to get started with assessments',
      completed: false,
      link: 'users'
    },
    {
      id: '2',
      title: 'Diagnose Needs',
      description: 'Explore available assessments to understand your team',
      completed: false,
      link: 'assessments'
    },
    {
      id: '3',
      title: 'Review Recommendations',
      description: 'See AI-powered insights and suggested actions',
      completed: false,
      link: 'recommendations'
    },
    {
      id: '4',
      title: 'Schedule First Campfire',
      description: 'Set up your initial team meeting or coaching session',
      completed: false,
      link: 'https://tools.getcampfire.com/courses'
    },
    {
      id: '5',
      title: 'Send First Tool',
      description: 'Launch your first assessment campaign to gather insights',
      completed: false,
      link: 'https://tools.getcampfire.com/toolkit'
    }
  ])

  useEffect(() => {
    // Load saved progress from localStorage
    const saved = localStorage.getItem('campfire_onboarding_progress')
    if (saved) {
      try {
        const savedTasks = JSON.parse(saved)
        setTasks(current => 
          current.map(task => ({
            ...task,
            completed: savedTasks[task.id] || false
          }))
        )
      } catch (e) {
        console.error('Failed to load onboarding progress')
      }
    }
  }, [])

  const toggleTask = (taskId: string) => {
    setTasks(current => {
      const updated = current.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
      
      // Save progress to localStorage
      const progress = updated.reduce((acc, task) => ({
        ...acc,
        [task.id]: task.completed
      }), {})
      localStorage.setItem('campfire_onboarding_progress', JSON.stringify(progress))
      
      return updated
    })
  }

  const handleTaskClick = (task: OnboardingTask, event?: React.MouseEvent) => {
    // Check if clicking on the checkmark area
    const target = event?.target as HTMLElement
    if (target?.closest('[data-checkmark]')) {
      toggleTask(task.id)
      return
    }

    // Navigate to the task link
    if (task.link) {
      if (task.link.startsWith('http')) {
        window.open(task.link, '_blank')
      } else if (onNavigate) {
        onNavigate(task.link)
      }
    }
  }

  const completedCount = tasks.filter(t => t.completed).length
  const progressPercentage = (completedCount / tasks.length) * 100

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-3 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-yellow-400" />
          Quick Setup Checklist
        </h2>
        <p className="text-lg text-white/80">
          Let's get your leadership transformation platform configured
        </p>
      </div>

      {/* Progress Bar */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/20">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white font-medium">Getting Started Progress</span>
          <span className="text-white/60">{completedCount} of {tasks.length} complete</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        {completedCount === tasks.length && (
          <p className="mt-3 text-green-400 font-medium">
            🎉 Congratulations! You're all set up!
          </p>
        )}
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            onClick={(e) => handleTaskClick(task, e)}
            className={`bg-white/10 backdrop-blur-sm rounded-xl border transition-all cursor-pointer ${
              task.completed 
                ? 'border-green-500/30 bg-green-500/5' 
                : 'border-white/20 hover:bg-white/15 hover:border-white/30'
            }`}
          >
            <div className="p-6">
              <div className="flex items-center gap-4">
                {/* Number */}
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    task.completed
                      ? 'bg-green-500/20 text-green-400 border-2 border-green-500/30'
                      : 'bg-white/10 text-white/80 border-2 border-white/30'
                  }`}>
                    {index + 1}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold mb-1 flex items-center gap-2 ${
                    task.completed ? 'text-white/60 line-through' : 'text-white'
                  }`}>
                    {task.title}
                    {task.link?.startsWith('http') && (
                      <ExternalLink className="w-4 h-4 opacity-60" />
                    )}
                  </h3>
                  <p className={`text-sm ${
                    task.completed ? 'text-white/40' : 'text-white/70'
                  }`}>
                    {task.description}
                  </p>
                </div>

                {/* Large Checkmark */}
                <div 
                  data-checkmark
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleTask(task.id)
                  }}
                  className="flex-shrink-0 p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {task.completed ? (
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  ) : (
                    <Circle className="w-8 h-8 text-white/30 hover:text-white/50" />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Help Section */}
      <div className="mt-8 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-2">
          Need Help Getting Started?
        </h3>
        <p className="text-white/80 mb-4">
          Our team is here to help you make the most of Campfire. Schedule a quick call to get personalized guidance.
        </p>
        <a 
          href="https://calendly.com/getcampfire/demo"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-2 bg-white text-purple-900 rounded-lg font-medium hover:bg-white/90 transition-colors"
        >
          Schedule Onboarding Call
        </a>
      </div>
    </div>
  )
}