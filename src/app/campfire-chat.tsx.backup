'use client'

import { useState, useEffect, useRef } from 'react'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

interface UserProfile {
  name?: string
  company?: string
  primaryChallenge?: string
  teamSize?: string
  industry?: string
  previousSolutions?: string[]
  painPoints?: string[]
  goals?: string[]
}

export default function CampfireAgent() {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationStage, setConversationStage] = useState(0)
  const [userProfile, setUserProfile] = useState<UserProfile>({})
  const [showDemo, setShowDemo] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [isSharing, setIsSharing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Initial welcome message
    addMessage(
      "Hi! I'm here to check in on how things are going with your team and culture. It's been a while since we connected, and I'd love to understand what's happening in your world right now.\n\nWhat's the biggest people or culture challenge keeping you up at night these days?",
      false
    )
  }, [])

  const addMessage = (text: string, isUser: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }))
  }

  const generateResponse = async (userMessage: string): Promise<string> => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationStage,
          userProfile,
          messageHistory: messages.slice(-6) // Last 6 messages for context
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      return data.response
    } catch (error) {
      console.error('Error:', error)
      return "I apologize, but I'm having trouble connecting right now. Could you try again?"
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!currentInput.trim() || isLoading) return

    const userMessage = currentInput.trim()
    setCurrentInput('')
    addMessage(userMessage, true)

    // Update user profile based on keywords and context
    const lowerMessage = userMessage.toLowerCase()
    
    if (conversationStage === 0) {
      if (lowerMessage.includes('team') || lowerMessage.includes('scaling')) {
        updateUserProfile({ primaryChallenge: 'team-scaling' })
      } else if (lowerMessage.includes('engagement') || lowerMessage.includes('culture')) {
        updateUserProfile({ primaryChallenge: 'culture-engagement' })
      } else if (lowerMessage.includes('performance') || lowerMessage.includes('productivity')) {
        updateUserProfile({ primaryChallenge: 'performance' })
      } else if (lowerMessage.includes('retention') || lowerMessage.includes('turnover')) {
        updateUserProfile({ primaryChallenge: 'retention' })
      }
      setConversationStage(1)
    } else if (conversationStage === 1) {
      setConversationStage(2)
    } else if (conversationStage === 2) {
      setConversationStage(3)
    } else if (conversationStage === 3) {
      setConversationStage(4)
    }

    const response = await generateResponse(userMessage)
    addMessage(response, false)

    if (conversationStage >= 4) {
      setTimeout(() => {
        setShowDemo(true)
      }, 2000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleDemoRequest = () => {
    window.open('https://calendly.com/campfire-demo', '_blank')
  }

  const shareConversation = async () => {
    if (isSharing) return
    
    setIsSharing(true)
    try {
      const shareData = {
        type: 'campfire-conversation',
        messages: messages.map(msg => ({
          text: msg.text,
          isUser: msg.isUser,
          timestamp: msg.timestamp.toISOString()
        })),
        userProfile,
        conversationStage,
        title: 'Campfire Conversation',
        description: `A conversation about ${userProfile.primaryChallenge || 'team and culture challenges'}`,
        createdAt: new Date().toISOString()
      }

      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shareData)
      })

      if (!response.ok) {
        throw new Error('Failed to create share link')
      }

      const { url } = await response.json()
      const fullUrl = `${window.location.origin}${url}`
      setShareUrl(fullUrl)
      
      // Copy to clipboard
      await navigator.clipboard.writeText(fullUrl)
      
      // Show success message
      addMessage('✨ Share link copied to clipboard! Your conversation has been saved and can be accessed for 30 days.', false)
    } catch (error) {
      console.error('Error sharing conversation:', error)
      addMessage('Sorry, I couldn\'t create a share link. Please try again.', false)
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🔥</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Campfire Guides</h1>
                <p className="text-blue-200 text-sm">Tools For Companies and Teams</p>
              </div>
            </div>
            <a href="/tools" className="text-blue-200 hover:text-white transition-colors text-sm">
              Explore Tools →
            </a>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-600/20 to-iris/20 px-6 py-4 border-b border-white/20">
            <h2 className="text-lg font-semibold text-white">Find Your Perfect Tool</h2>
            <p className="text-blue-200 text-sm mt-1">Find the right tool for you or your team to help you thrive and get great results</p>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.isUser
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                      : 'bg-white/20 text-white border border-white/30'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/20 border border-white/30 rounded-lg px-4 py-3 max-w-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Demo CTA (shows after conversation) */}
          {showDemo && (
            <div className="px-6 py-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 border-t border-white/20">
              <div className="text-center">
                <p className="text-white mb-3">
                  Based on our conversation, I think you&apos;d benefit from seeing how Campfire can help. 
                  Would you like to schedule a quick demo?
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={handleDemoRequest}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105"
                  >
                    SCHEDULE DEMO 🔥
                  </button>
                  <button
                    onClick={shareConversation}
                    disabled={isSharing}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSharing ? 'SHARING...' : 'SHARE CONVERSATION'}
                  </button>
                </div>
                {shareUrl && (
                  <p className="text-blue-200 text-sm mt-3">
                    Share link: <span className="text-white">{shareUrl}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-6 border-t border-white/20">
            <div className="flex gap-3">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share what's on your mind..."
                className="flex-1 bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={handleSubmit}
                disabled={isLoading || !currentInput.trim()}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                SEND
              </button>
              {messages.length > 2 && (
                <button
                  onClick={shareConversation}
                  disabled={isSharing}
                  className="bg-gradient-to-r from-iris to-iris text-white px-4 py-3 rounded-lg font-semibold hover:from-iris hover:to-iris/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Share this conversation"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9a9.001 9.001 0 00-1.684-5.316m-9.032 4.026a3 3 0 002.684 0" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-6 text-center">
          <div className="flex justify-center items-center space-x-2">
            {[0, 1, 2, 3, 4].map((stage) => (
              <div
                key={stage}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  stage <= conversationStage
                    ? 'bg-gradient-to-r from-blue-400 to-blue-500'
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>
          <p className="text-blue-200 text-sm mt-2">
            {conversationStage === 0 && "Getting to know your challenges"}
            {conversationStage === 1 && "Understanding the impact"}
            {conversationStage === 2 && "Exploring solutions"}
            {conversationStage === 3 && "Assessing opportunities"}
            {conversationStage >= 4 && "Ready for next steps"}
          </p>
        </div>
      </div>
    </div>
  )
}