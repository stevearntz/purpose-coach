'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  Lightbulb, 
  BookOpen, 
  MessageSquare, 
  User,
  Calendar,
  TrendingUp,
  Clock,
  Search,
  Filter,
  Star,
  CheckCircle,
  ArrowRight,
  Send,
  MessageCircle,
  Heart,
  Target,
  Users,
  Award,
  FileText,
  Download,
  ChevronDown,
  ExternalLink,
  Sparkles,
  AlertCircle
} from 'lucide-react'
import ViewportContainer from '@/components/ViewportContainer'
import Footer from '@/components/Footer'

interface ManagerResult {
  id: string
  assessmentType: string
  completedAt: string
  score: number
  category: string
  status: 'completed'
}

interface Recommendation {
  id: string
  title: string
  type: 'workshop' | 'tool' | 'resource'
  description: string
  relevance: 'high' | 'medium' | 'low'
  timeframe: string
  category: string
}

interface Resource {
  id: string
  title: string
  type: 'article' | 'template' | 'guide' | 'video' | 'book'
  category: string
  duration: string
  description: string
  url: string
  tags: string[]
}

interface HelpRequest {
  id: string
  subject: string
  message: string
  category: string
  submittedAt: string
  status: 'pending' | 'responded'
  response?: string
  respondedAt?: string
}

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState<'results' | 'recommendations' | 'resources' | 'help'>('results')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [helpSubject, setHelpSubject] = useState('')
  const [helpMessage, setHelpMessage] = useState('')
  const [helpCategory, setHelpCategory] = useState('general')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mock data for manager results
  const managerResults: ManagerResult[] = [
    {
      id: '1',
      assessmentType: 'Burnout Assessment',
      completedAt: '2024-11-15T10:30:00Z',
      score: 3.2,
      category: 'Well-being',
      status: 'completed'
    },
    {
      id: '2',
      assessmentType: 'Trust Audit',
      completedAt: '2024-11-10T14:15:00Z',
      score: 4.1,
      category: 'Team Dynamics',
      status: 'completed'
    },
    {
      id: '3',
      assessmentType: 'Change Readiness Assessment',
      completedAt: '2024-11-05T09:45:00Z',
      score: 3.8,
      category: 'Change Management',
      status: 'completed'
    },
    {
      id: '4',
      assessmentType: 'Decision Making Audit',
      completedAt: '2024-10-28T16:20:00Z',
      score: 4.3,
      category: 'Leadership',
      status: 'completed'
    }
  ]

  // Mock recommendations based on assessment results
  const recommendations: Recommendation[] = [
    {
      id: '1',
      title: 'Managing Stress and Preventing Burnout Workshop',
      type: 'workshop',
      description: 'Learn practical strategies to manage stress and build resilience in high-pressure environments.',
      relevance: 'high',
      timeframe: '90 minutes',
      category: 'Well-being'
    },
    {
      id: '2',
      title: 'Building Psychological Safety in Teams',
      type: 'workshop',
      description: 'Create an environment where team members feel safe to speak up, share ideas, and take risks.',
      relevance: 'high',
      timeframe: '2 hours',
      category: 'Team Dynamics'
    },
    {
      id: '3',
      title: 'Leading Through Change Effectively',
      type: 'workshop',
      description: 'Develop the skills to guide your team through organizational changes with confidence.',
      relevance: 'high',
      timeframe: '90 minutes',
      category: 'Change Management'
    },
    {
      id: '4',
      title: 'Coaching Conversations Tool',
      type: 'tool',
      description: 'A framework for having meaningful coaching conversations that drive performance.',
      relevance: 'medium',
      timeframe: '30 minutes',
      category: 'Leadership'
    },
    {
      id: '5',
      title: 'Delegation Mastery Resource Pack',
      type: 'resource',
      description: 'Templates and guides to help you delegate more effectively and empower your team.',
      relevance: 'medium',
      timeframe: '45 minutes',
      category: 'Leadership'
    },
    {
      id: '6',
      title: 'Weekly Team Check-in Template',
      type: 'tool',
      description: 'Structured template for regular team check-ins to maintain connection and alignment.',
      relevance: 'medium',
      timeframe: '15 minutes',
      category: 'Team Dynamics'
    }
  ]

  // Mock resources library
  const allResources: Resource[] = [
    {
      id: '1',
      title: 'The Manager\'s Guide to One-on-Ones',
      type: 'guide',
      category: 'Leadership',
      duration: '15 min read',
      description: 'Best practices for conducting effective one-on-one meetings with your team members.',
      url: '#',
      tags: ['management', 'communication', 'team-development']
    },
    {
      id: '2',
      title: 'Difficult Conversations Worksheet',
      type: 'template',
      category: 'Communication',
      duration: '10 min',
      description: 'A structured approach to preparing for and navigating challenging conversations.',
      url: '#',
      tags: ['conflict-resolution', 'communication', 'feedback']
    },
    {
      id: '3',
      title: 'Building High-Performance Teams',
      type: 'video',
      category: 'Team Development',
      duration: '22 min',
      description: 'Learn the key characteristics of high-performing teams and how to build them.',
      url: '#',
      tags: ['team-performance', 'leadership', 'culture']
    },
    {
      id: '4',
      title: 'Emotional Intelligence for Leaders',
      type: 'article',
      category: 'Leadership',
      duration: '12 min read',
      description: 'Understanding and developing emotional intelligence as a critical leadership skill.',
      url: '#',
      tags: ['emotional-intelligence', 'self-awareness', 'leadership']
    },
    {
      id: '5',
      title: 'Remote Team Management Playbook',
      type: 'guide',
      category: 'Remote Work',
      duration: '25 min read',
      description: 'Comprehensive guide to managing and engaging remote and hybrid teams effectively.',
      url: '#',
      tags: ['remote-work', 'team-management', 'engagement']
    },
    {
      id: '6',
      title: 'Performance Review Template',
      type: 'template',
      category: 'Performance Management',
      duration: '15 min',
      description: 'Structured template for conducting fair and effective performance reviews.',
      url: '#',
      tags: ['performance-reviews', 'feedback', 'development']
    },
    {
      id: '7',
      title: 'The Power of Feedback',
      type: 'book',
      category: 'Communication',
      duration: '3 hour read',
      description: 'A comprehensive look at how to give and receive feedback that drives improvement.',
      url: '#',
      tags: ['feedback', 'communication', 'development']
    },
    {
      id: '8',
      title: 'Team Charter Template',
      type: 'template',
      category: 'Team Development',
      duration: '30 min',
      description: 'Create alignment and clarity with this comprehensive team charter template.',
      url: '#',
      tags: ['team-alignment', 'purpose', 'values']
    },
    {
      id: '9',
      title: 'Stress Management Techniques',
      type: 'article',
      category: 'Well-being',
      duration: '8 min read',
      description: 'Evidence-based techniques for managing stress and maintaining work-life balance.',
      url: '#',
      tags: ['stress-management', 'well-being', 'work-life-balance']
    },
    {
      id: '10',
      title: 'Change Management Fundamentals',
      type: 'video',
      category: 'Change Management',
      duration: '18 min',
      description: 'Understanding the psychology of change and how to lead teams through transitions.',
      url: '#',
      tags: ['change-management', 'leadership', 'transitions']
    }
  ]

  // Mock help requests
  const helpRequests: HelpRequest[] = [
    {
      id: '1',
      subject: 'Team member struggling with new responsibilities',
      message: 'Hi, one of my team members was recently promoted but is having trouble adjusting to their new role. They seem overwhelmed and their confidence has dropped. What strategies can I use to support them through this transition?',
      category: 'team-development',
      submittedAt: '2024-11-20T09:15:00Z',
      status: 'responded',
      response: 'This is a common challenge when people step into new roles. Here are some strategies: 1) Schedule regular check-ins to provide support and address concerns, 2) Break down their new responsibilities into manageable chunks with clear milestones, 3) Pair them with a mentor who has succeeded in a similar role, 4) Celebrate small wins to rebuild confidence. Consider using our "New Role Transition" toolkit which includes templates for goal-setting and progress tracking.',
      respondedAt: '2024-11-20T14:30:00Z'
    },
    {
      id: '2',
      subject: 'Managing conflict between team members',
      message: 'Two of my team members have been having ongoing disagreements about project priorities. It\'s starting to affect the whole team\'s morale. How should I address this?',
      category: 'conflict-resolution',
      submittedAt: '2024-11-18T16:45:00Z',
      status: 'pending'
    },
    {
      id: '3',
      subject: 'How to give feedback on communication style',
      message: 'I have a team member who is very direct in their communication, sometimes coming across as harsh to others. They\'re technically excellent but this is affecting team dynamics. How do I provide feedback on this sensitive topic?',
      category: 'communication',
      submittedAt: '2024-11-15T11:20:00Z',
      status: 'responded',
      response: 'Communication style feedback requires a delicate approach. Start by highlighting their technical strengths, then address the impact their communication is having on the team (focus on impact, not intent). Provide specific examples and suggest alternative approaches. Role-play different scenarios together and consider our "Difficult Conversations" workshop to help you prepare. The key is to frame this as professional development, not personal criticism.',
      respondedAt: '2024-11-16T10:15:00Z'
    }
  ]

  const filteredResources = allResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const resourceCategories = [...new Set(allResources.map(r => r.category))]

  const handleSubmitHelpRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Reset form
    setHelpSubject('')
    setHelpMessage('')
    setHelpCategory('general')
    setIsSubmitting(false)
    
    // Show success message (in real implementation, you'd update the help requests list)
    alert('Your request has been submitted! HR will respond within 24 hours.')
  }

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600'
    if (score >= 3) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 4) return 'bg-green-100 text-green-800'
    if (score >= 3) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getRelevanceIcon = (relevance: string) => {
    switch (relevance) {
      case 'high':
        return <Star className="w-4 h-4 text-yellow-500 fill-current" />
      case 'medium':
        return <Star className="w-4 h-4 text-gray-400" />
      case 'low':
        return <Star className="w-4 h-4 text-gray-300" />
      default:
        return null
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <FileText className="w-4 h-4" />
      case 'template':
        return <Download className="w-4 h-4" />
      case 'guide':
        return <BookOpen className="w-4 h-4" />
      case 'video':
        return <MessageCircle className="w-4 h-4" />
      case 'book':
        return <BookOpen className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <ViewportContainer className="bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Manager Dashboard</h1>
                <p className="text-sm text-gray-600">Your personalized development insights</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Welcome back, Sarah</span>
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-2 border border-white/30 mb-8">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('results')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === 'results'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Results
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === 'recommendations'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              Recommendations
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === 'resources'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Resources
            </button>
            <button
              onClick={() => setActiveTab('help')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === 'help'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Ask for Help
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Results Tab */}
          {activeTab === 'results' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Your Assessment Results</h2>
                  <p className="text-gray-600 mt-1">Track your progress and identify areas for growth</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  View All Results
                </button>
              </div>

              {/* Results Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{managerResults.length}</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">Total Assessments</h3>
                  <p className="text-sm text-gray-600">Completed this quarter</p>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-2xl font-bold text-green-600">3.9</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">Average Score</h3>
                  <p className="text-sm text-gray-600">Across all assessments</p>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-yellow-600" />
                    </div>
                    <span className="text-2xl font-bold text-yellow-600">2</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">Focus Areas</h3>
                  <p className="text-sm text-gray-600">Identified for improvement</p>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-2xl font-bold text-purple-600">1</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">Strengths</h3>
                  <p className="text-sm text-gray-600">Key areas of excellence</p>
                </div>
              </div>

              {/* Recent Results */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/30">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Assessment Results</h3>
                  <p className="text-sm text-gray-600 mt-1">Your latest completed assessments</p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {managerResults.map((result) => (
                      <div key={result.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{result.assessmentType}</h4>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-sm text-gray-600">{result.category}</span>
                              <span className="text-sm text-gray-400">•</span>
                              <span className="text-sm text-gray-600">Completed {formatDate(result.completedAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBadgeColor(result.score)}`}>
                            {result.score}/5.0
                          </span>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations Tab */}
          {activeTab === 'recommendations' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">AI-Powered Recommendations</h2>
                <p className="text-gray-600 mt-1">Personalized suggestions based on your assessment results</p>
              </div>

              {/* AI Insights Summary */}
              <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-sm rounded-xl p-6 border border-blue-200/30">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Key Insights</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Based on your recent assessments, you show strong decision-making capabilities and effective trust-building with your team. 
                      However, your burnout assessment indicates elevated stress levels, particularly around workload management. 
                      We recommend focusing on stress reduction strategies and building stronger change management skills to support your team through upcoming organizational transitions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommendations Grid */}
              <div className="grid gap-6">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/30 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getRelevanceIcon(rec.relevance)}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          rec.type === 'workshop' ? 'bg-blue-100 text-blue-800' :
                          rec.type === 'tool' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">{rec.category}</span>
                      </div>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {rec.timeframe}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{rec.title}</h3>
                    <p className="text-gray-600 mb-4">{rec.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${
                          rec.relevance === 'high' ? 'text-yellow-600' :
                          rec.relevance === 'medium' ? 'text-blue-600' :
                          'text-gray-600'
                        }`}>
                          {rec.relevance === 'high' ? 'Highly Recommended' :
                           rec.relevance === 'medium' ? 'Recommended' : 'Suggested'}
                        </span>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2">
                        Learn More
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Resource Library</h2>
                  <p className="text-gray-600 mt-1">Curated resources to support your leadership journey</p>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search resources..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[150px]"
                    >
                      <option value="all">All Categories</option>
                      {resourceCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Resources Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource) => (
                  <div key={resource.id} className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/30 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(resource.type)}
                        <span className="text-sm text-gray-600">{resource.type}</span>
                      </div>
                      <span className="text-sm text-gray-500">{resource.duration}</span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.title}</h3>
                    <p className="text-gray-600 mb-4 text-sm">{resource.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {resource.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                        {resource.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            +{resource.tags.length - 3} more
                          </span>
                        )}
                      </div>
                      
                      <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                        <ExternalLink className="w-3 h-3" />
                        Access Resource
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredResources.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
                  <p className="text-gray-600">Try adjusting your search terms or category filter.</p>
                </div>
              )}
            </div>
          )}

          {/* Help Tab */}
          {activeTab === 'help' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Ask for Help</h2>
                <p className="text-gray-600 mt-1">Get personalized advice from HR experts</p>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Submit New Request */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/30">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Submit a Question</h3>
                    <p className="text-sm text-gray-600 mt-1">Describe your challenge and get expert guidance</p>
                  </div>
                  <div className="p-6">
                    <form onSubmit={handleSubmitHelpRequest} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <select
                          value={helpCategory}
                          onChange={(e) => setHelpCategory(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="general">General Management</option>
                          <option value="team-development">Team Development</option>
                          <option value="conflict-resolution">Conflict Resolution</option>
                          <option value="communication">Communication</option>
                          <option value="performance-management">Performance Management</option>
                          <option value="well-being">Well-being & Stress</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subject
                        </label>
                        <input
                          type="text"
                          value={helpSubject}
                          onChange={(e) => setHelpSubject(e.target.value)}
                          placeholder="Brief description of your question..."
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Describe your situation
                        </label>
                        <textarea
                          value={helpMessage}
                          onChange={(e) => setHelpMessage(e.target.value)}
                          rows={5}
                          placeholder="Please provide as much context as possible to help us give you the best advice..."
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          required
                        />
                      </div>
                      
                      <button
                        type="submit"
                        disabled={isSubmitting || !helpSubject.trim() || !helpMessage.trim()}
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Submit Question
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Previous Requests */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/30">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Your Questions</h3>
                    <p className="text-sm text-gray-600 mt-1">Previous questions and responses</p>
                  </div>
                  <div className="p-6 max-h-[600px] overflow-y-auto">
                    <div className="space-y-4">
                      {helpRequests.map((request) => (
                        <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-200 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-medium text-gray-900 text-sm">{request.subject}</h4>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                request.status === 'responded' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {request.status === 'responded' ? 'Answered' : 'Pending'}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3 line-clamp-3">{request.message}</p>
                          
                          {request.status === 'responded' && request.response && (
                            <div className="bg-blue-50 rounded-lg p-3 mt-3">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                  <MessageCircle className="w-3 h-3 text-blue-600" />
                                </div>
                                <span className="text-sm font-medium text-blue-900">HR Response</span>
                                <span className="text-xs text-blue-600">{formatDate(request.respondedAt!)}</span>
                              </div>
                              <p className="text-sm text-blue-800">{request.response}</p>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                            <span className="text-xs text-gray-500">
                              Submitted {formatDate(request.submittedAt)}
                            </span>
                            {request.status === 'pending' && (
                              <div className="flex items-center gap-1 text-xs text-yellow-600">
                                <Clock className="w-3 h-3" />
                                Response expected within 24 hours
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </ViewportContainer>
  )
}