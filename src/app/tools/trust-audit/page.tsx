'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { jsPDF } from 'jspdf'

interface Question {
  id: string
  text: string
  section: 'integrity' | 'competence' | 'empathy'
}

interface Answer {
  questionId: string
  value: number
}

const questions: Question[] = [
  // Integrity Questions
  { id: 'i1', text: 'I keep the commitments that I make to this person', section: 'integrity' },
  { id: 'i2', text: 'I am consistent in my feedback and support to them', section: 'integrity' },
  { id: 'i3', text: 'I own up to the mistakes that I make with this person', section: 'integrity' },
  { id: 'i4', text: 'I keep things confidential when this person asks me to', section: 'integrity' },
  { id: 'i5', text: 'I always speak openly and honestly with this person', section: 'integrity' },
  
  // Competence Questions
  { id: 'c1', text: 'I am capable of providing this person the support they need', section: 'competence' },
  { id: 'c2', text: 'I express confidence in their ability to do their job', section: 'competence' },
  { id: 'c3', text: 'I support this person in finding their own solutions', section: 'competence' },
  { id: 'c4', text: 'I address conflict directly & support this person through it', section: 'competence' },
  { id: 'c5', text: 'We can work through any problems that come up', section: 'competence' },
  
  // Empathy Questions
  { id: 'e1', text: 'I genuinely care about this person as a human being', section: 'empathy' },
  { id: 'e2', text: 'I respond with curiosity when they have a hard time', section: 'empathy' },
  { id: 'e3', text: 'I communicate in ways that respect their preferences', section: 'empathy' },
  { id: 'e4', text: 'I listen intently when they speak to me', section: 'empathy' },
  { id: 'e5', text: 'I regularly check in on their workload & stress levels', section: 'empathy' },
]

const likertOptions = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Slightly Disagree' },
  { value: 4, label: 'Slightly Agree' },
  { value: 5, label: 'Agree' },
  { value: 6, label: 'Strongly Agree' },
]

const sectionInfo = {
  integrity: {
    title: 'Integrity',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-gradient-to-br from-amber-500/20 to-orange-600/20',
    icon: '🧊',
    description: 'Being consistent, reliable, and honest in your interactions'
  },
  competence: {
    title: 'Competence',
    color: 'from-rose-400 to-pink-500',
    bgColor: 'bg-gradient-to-br from-rose-400/20 to-pink-500/20',
    icon: '❄️',
    description: 'Demonstrating capability and supporting growth'
  },
  empathy: {
    title: 'Empathy',
    color: 'from-red-500 to-rose-600',
    bgColor: 'bg-gradient-to-br from-red-500/20 to-rose-600/20',
    icon: '🧊',
    description: 'Showing genuine care and understanding'
  }
}

export default function TrustAuditPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [showResults, setShowResults] = useState(false)
  const [relationshipName, setRelationshipName] = useState('')
  const [showIntro, setShowIntro] = useState(true)

  const currentQuestion = questions[currentQuestionIndex]
  const currentSection = currentQuestion?.section
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers.filter(a => a.questionId !== currentQuestion.id)]
    newAnswers.push({ questionId: currentQuestion.id, value })
    setAnswers(newAnswers)
  }

  const getCurrentAnswer = () => {
    return answers.find(a => a.questionId === currentQuestion.id)?.value
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      setShowResults(true)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const calculateScores = () => {
    const sections = ['integrity', 'competence', 'empathy'] as const
    const scores = sections.map(section => {
      const sectionQuestions = questions.filter(q => q.section === section)
      const sectionAnswers = answers.filter(a => 
        sectionQuestions.some(q => q.id === a.questionId)
      )
      const total = sectionAnswers.reduce((sum, a) => sum + a.value, 0)
      const average = sectionAnswers.length > 0 ? total / sectionAnswers.length : 0
      return { section, score: average, count: sectionAnswers.length }
    })
    
    const totalScore = scores.reduce((sum, s) => sum + s.score, 0)
    return { sections: scores, total: totalScore }
  }

  const getRecommendations = (section: string, score: number) => {
    const recommendations = {
      integrity: [
        'Track open requests (even informal ones) and close the loop on them visibly',
        "Don't cancel meetings. If you say you're attending, be there",
        'Be honest, even when it\'s difficult',
        'Take ownership when you don\'t follow through on something, and make sure your team knows what you\'ll do differently next time'
      ],
      competence: [
        'Find a mentor or a senior team member to coach you',
        'If things get tense, take a beat before reacting—and name what\'s happening calmly',
        'Talk through your decision making process and thoughts. Ask for their input',
        'Provide thoughtful support and remove roadblocks that make their job harder'
      ],
      empathy: [
        'Spend time shadowing them in their role. What challenges are they facing?',
        'Learn how they like to be recognized and do it intentionally',
        'Discover what they\'re interested in: hobbies, passions, interests, etc. Ask questions about them',
        'Instead of jumping into tasks, begin 1:1s with a simple check-in'
      ]
    }

    if (score < 3) {
      return recommendations[section as keyof typeof recommendations] || []
    } else if (score < 4.5) {
      return recommendations[section as keyof typeof recommendations]?.slice(0, 2) || []
    } else {
      return [recommendations[section as keyof typeof recommendations]?.[0] || 'Keep up the great work!']
    }
  }

  const generatePDF = () => {
    const pdf = new jsPDF()
    const { sections, total } = calculateScores()
    
    pdf.setFontSize(24)
    pdf.text('Trust Audit Results', 20, 30)
    
    pdf.setFontSize(14)
    pdf.text(`Relationship: ${relationshipName || 'Team Member'}`, 20, 45)
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 55)
    
    pdf.setFontSize(18)
    pdf.text(`Overall Trust Score: ${total.toFixed(1)}/18`, 20, 75)
    
    let yPosition = 95
    
    sections.forEach(({ section, score }) => {
      pdf.setFontSize(16)
      pdf.text(`${sectionInfo[section as keyof typeof sectionInfo].title}: ${score.toFixed(1)}/6`, 20, yPosition)
      
      pdf.setFontSize(12)
      const recommendations = getRecommendations(section, score)
      yPosition += 15
      
      recommendations.forEach((rec, index) => {
        const lines = pdf.splitTextToSize(`• ${rec}`, 170)
        lines.forEach((line: string) => {
          pdf.text(line, 25, yPosition)
          yPosition += 7
        })
        yPosition += 3
      })
      
      yPosition += 10
    })
    
    pdf.save('trust-audit-results.pdf')
  }

  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <Link href="/" className="inline-flex items-center text-white/70 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🧊</div>
              <h1 className="text-4xl font-bold text-white mb-4">Trust Audit</h1>
              <p className="text-xl text-white/80">
                Break the ice by conducting a trust audit
              </p>
            </div>
            
            <div className="space-y-6 mb-8">
              <p className="text-white/90">
                This tool will help you assess the level of trust in a specific work relationship
                across three key dimensions:
              </p>
              
              <div className="space-y-4">
                {Object.entries(sectionInfo).map(([key, info]) => (
                  <div key={key} className={`${info.bgColor} backdrop-blur-sm rounded-lg p-4`}>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{info.icon}</span>
                      <div>
                        <h3 className="font-semibold text-white">{info.title}</h3>
                        <p className="text-white/80 text-sm">{info.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <label className="block">
                <span className="text-white/90 text-sm font-medium mb-2 block">
                  Who would you like to build trust with? (optional)
                </span>
                <input
                  type="text"
                  value={relationshipName}
                  onChange={(e) => setRelationshipName(e.target.value)}
                  placeholder="e.g., My manager, Team member, Direct report"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </label>
              
              <button
                onClick={() => setShowIntro(false)}
                className="w-full bg-gradient-to-r from-iris to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-iris-dark hover:to-pink-700 transition-all duration-200 shadow-lg"
              >
                Start Trust Audit
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (showResults) {
    const { sections, total } = calculateScores()
    const trustLevel = total >= 15 ? 'Strong' : total >= 9 ? 'Moderate' : 'Needs Attention'
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center text-white/70 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl">
            <h1 className="text-4xl font-bold text-white mb-2">Trust Audit Results</h1>
            {relationshipName && (
              <p className="text-white/80 mb-8">Relationship: {relationshipName}</p>
            )}
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Overall Trust Level: {trustLevel}
              </h2>
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                {total.toFixed(1)} / 18
              </div>
            </div>
            
            <div className="space-y-6 mb-8">
              {sections.map(({ section, score }) => {
                const info = sectionInfo[section as keyof typeof sectionInfo]
                const percentage = (score / 6) * 100
                
                return (
                  <div key={section} className={`${info.bgColor} backdrop-blur-sm rounded-xl p-6`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{info.icon}</span>
                        <h3 className="text-xl font-semibold text-white">{info.title}</h3>
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {score.toFixed(1)} / 6
                      </div>
                    </div>
                    
                    <div className="w-full bg-white/20 rounded-full h-3 mb-4">
                      <div
                        className={`h-3 rounded-full bg-gradient-to-r ${info.color} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-white/90">Recommendations:</h4>
                      {getRecommendations(section, score).map((rec, index) => (
                        <p key={index} className="text-white/80 text-sm pl-4">
                          • {rec}
                        </p>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowResults(false)
                  setCurrentQuestionIndex(0)
                  setAnswers([])
                }}
                className="flex-1 bg-white/10 backdrop-blur-sm text-white font-semibold py-3 px-6 rounded-lg hover:bg-white/20 transition-all duration-200"
              >
                Retake Audit
              </button>
              <button
                onClick={generatePDF}
                className="flex-1 bg-gradient-to-r from-iris to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-iris-dark hover:to-pink-700 transition-all duration-200 shadow-lg"
              >
                Download PDF Report
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <Link href="/" className="inline-flex items-center text-white/70 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Exit
            </Link>
            <span className="text-white/70 text-sm">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
          
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl">
          {currentSection && (
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">{sectionInfo[currentSection].icon}</div>
              <h2 className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${sectionInfo[currentSection].color}`}>
                {sectionInfo[currentSection].title}
              </h2>
            </div>
          )}
          
          <div className="mb-8">
            <h3 className="text-xl font-medium text-white mb-6 text-center">
              {currentQuestion.text}
            </h3>
            
            <div className="space-y-3">
              {likertOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className={`w-full p-4 rounded-lg text-left transition-all duration-200 ${
                    getCurrentAnswer() === option.value
                      ? 'bg-gradient-to-r from-iris to-pink-600 text-white shadow-lg'
                      : 'bg-white/10 backdrop-blur-sm text-white/90 hover:bg-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option.label}</span>
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      getCurrentAnswer() === option.value
                        ? 'border-white bg-white'
                        : 'border-white/50'
                    }`}>
                      {getCurrentAnswer() === option.value && (
                        <div className="w-full h-full rounded-full bg-gradient-to-r from-iris to-pink-600 scale-75" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                currentQuestionIndex === 0
                  ? 'bg-white/5 text-white/30 cursor-not-allowed'
                  : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Previous</span>
            </button>
            
            <button
              onClick={handleNext}
              disabled={!getCurrentAnswer()}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                !getCurrentAnswer()
                  ? 'bg-white/5 text-white/30 cursor-not-allowed'
                  : 'bg-gradient-to-r from-iris to-pink-600 text-white hover:from-iris-dark hover:to-pink-700 shadow-lg'
              }`}
            >
              <span>{currentQuestionIndex === questions.length - 1 ? 'See Results' : 'Next'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}