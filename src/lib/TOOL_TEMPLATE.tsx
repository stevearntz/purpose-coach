// TEMPLATE FOR NEW TOOL PAGES
// 1. Copy this file to /src/app/[tool-name]/page.tsx
// 2. Update the toolConfigs in /src/lib/toolConfigs.ts with your tool's info
// 3. Replace TOOL_NAME with your tool's key from toolConfigs
// 4. Replace [COLOR2] with the darker gradient stop color (e.g., #DB4839)
// 5. Implement your tool's logic in the sections marked with TODO

'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, Printer } from 'lucide-react'
import Link from 'next/link'
import ToolLayout from '@/components/ToolLayout'
import ToolIntroCard from '@/components/ToolIntroCard'
import { toolConfigs, toolStyles } from '@/lib/toolConfigs'
import Footer from '@/components/Footer'

// TODO: Define your tool's interfaces
interface UserInput {
  // Add your fields here
}

export default function ToolNamePage() {
  const [showIntro, setShowIntro] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [showResults, setShowResults] = useState(false)
  
  // TODO: Add your state variables
  const [userInput, setUserInput] = useState<UserInput>({})
  
  // TODO: Replace TOOL_NAME with your tool's key from toolConfigs
  const config = toolConfigs.TOOL_NAME

  // Intro Screen (Full vibrant gradient)
  if (showIntro) {
    return (
      <ToolLayout gradient={config.gradient} isLight={false}>
        <ToolIntroCard
          title={config.title}
          subtitle={config.subtitle}
          description={config.description}
        >
          <div className="space-y-6">
            {/* TODO: Add your intro form fields */}
            <p className="text-xl text-white/90 text-center">
              Your intro question here
            </p>
            
            <input
              type="text"
              placeholder="Your placeholder text"
              className="w-full p-4 rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 text-base"
              // TODO: Add onChange handler
            />
            
            <button
              onClick={() => setShowIntro(false)}
              className="w-full py-4 bg-white text-[COLOR2] rounded-xl font-semibold hover:bg-white/90 transition-colors text-lg uppercase"
            >
              Start [Tool Name]
            </button>
          </div>
        </ToolIntroCard>
      </ToolLayout>
    )
  }

  // Results Screen
  if (showResults) {
    return (
      <>
        <style jsx>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-section, .print-section * {
              visibility: visible;
            }
            .print-section {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
              display: none !important;
            }
            @page {
              margin: 0.5in;
              size: letter;
            }
          }
        `}</style>
        <div className={`min-h-screen bg-gradient-to-br ${config.gradient}/10 py-16 print-section`}>
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-8 no-print">
                <Link href="/?screen=4" className="text-[COLOR2] hover:opacity-80 flex items-center gap-2 font-medium">
                  <ArrowLeft className="w-4 h-4" />
                  BACK
                </Link>
                <div className="flex gap-4">
                  <button
                    onClick={() => window.print()}
                    className="p-3 border-2 border-[COLOR2]/50 text-[COLOR2] rounded-lg hover:border-[COLOR2] hover:bg-[COLOR2]/10 transition-all"
                    title="Print results"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Implement share functionality
                      const shareUrl = `${window.location.origin}/[tool-name]/share/${Date.now()}`
                      navigator.clipboard.writeText(shareUrl)
                      alert('Share link copied to clipboard!')
                    }}
                    className="px-6 py-3 bg-[COLOR2] text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg font-medium"
                  >
                    SHARE
                  </button>
                </div>
              </div>
              
              <h1 className="text-4xl font-bold text-nightfall mb-8 text-center">Results</h1>
              
              {/* TODO: Add your results display */}
              
              <div className="flex justify-center mt-8 no-print">
                <button
                  onClick={() => {
                    setShowResults(false)
                    setCurrentStep(0)
                    setShowIntro(true)
                    // TODO: Reset your state
                  }}
                  className="px-8 py-3 bg-[COLOR2] text-white rounded-lg font-semibold hover:opacity-90 transition-colors shadow-lg"
                >
                  RETAKE
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  // Main Tool Screen(s)
  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.gradient}/20 flex items-center justify-center p-4`}>
      <div className="max-w-2xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setShowIntro(true)}
              className="inline-flex items-center text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <span className="text-white/70 text-sm">
              Step {currentStep + 1} of {/* TODO: Add total steps */}
            </span>
          </div>
          
          <div className={toolStyles.progressBar}>
            <div
              className={toolStyles.progressFill}
              style={{ width: `${((currentStep + 1) / /* TODO: total steps */ 1) * 100}%` }}
            />
          </div>
        </div>
        
        <div className={toolStyles.card}>
          {/* TODO: Add your main tool content */}
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Your question or content here
          </h2>
          
          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 border ${
                currentStep === 0
                  ? 'border-white/10 text-white/30 cursor-not-allowed'
                  : 'border-white/30 text-white hover:bg-white/10'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Previous</span>
            </button>
            
            <button
              onClick={() => {
                // TODO: Add your next/finish logic
                if (currentStep === /* last step */ 0) {
                  setShowResults(true)
                } else {
                  setCurrentStep(prev => prev + 1)
                }
              }}
              className={toolStyles.primaryButton}
              style={{ width: 'auto', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
            >
              <span>{currentStep === /* last step */ 0 ? 'See Results' : 'Next'}</span>
              <ArrowRight className="w-5 h-5 ml-2 inline" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}