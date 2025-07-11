'use client';

import { useState } from 'react';
import { Flame, ArrowRight, BookOpen, Users, Calendar, Trophy, Star, Target } from 'lucide-react';

interface Recommendation {
  tool: string;
  description: string;
  timeRequired: string;
  reason: string;
}

export default function ToolsPage() {
  const [challenge, setChallenge] = useState('');
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [userResults, setUserResults] = useState([
    { tool: 'Purpose Discovery', completed: true, score: 85 },
    { tool: 'Values Alignment', completed: false, score: 0 }
  ]);

  const predefinedChallenges = [
    'Navigate change',
    'Better communication', 
    'Employee well-being',
    'Alignment on goals',
    'Manager conversations',
    'Consistent expectations'
  ];

  const availableTools = [
    { name: 'Purpose Discovery', path: '/tools/purpose', icon: Target, description: 'Find your core purpose and direction' },
    { name: 'Values Clarification', path: '/tools/values', icon: Star, description: 'Identify your fundamental values' },
    { name: 'Strengths Assessment', path: '/tools/strengths', icon: Trophy, description: 'Discover your natural talents' },
  ];

  const handleChallengeSelect = (selectedChallenge: string) => {
    setChallenge(selectedChallenge);
    handleGetRecommendation(selectedChallenge);
  };

  const handleGetRecommendation = async (selectedChallenge?: string) => {
    const challengeText = selectedChallenge || challenge;
    if (!challengeText.trim()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Based on this challenge: "${challengeText}", recommend ONE of these coaching tools and explain why: Purpose Discovery (helps find life direction and meaning), Values Clarification (identifies core values and principles), Strengths Assessment (discovers natural talents and abilities). Respond in JSON format: {"tool": "Tool Name", "description": "Brief description of what this tool will help with", "timeRequired": "estimated time", "reason": "why this tool is best for their challenge"}`
          }]
        })
      });

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        const parsedRecommendation = JSON.parse(content);
        setRecommendation(parsedRecommendation);
      } catch {
        // Fallback if AI doesn't return proper JSON
        setRecommendation({
          tool: 'Purpose Discovery',
          description: 'Find clarity on your life direction and core purpose',
          timeRequired: '15-20 minutes',
          reason: 'This challenge suggests you need foundational clarity on your direction.'
        });
      }
    } catch (error) {
      console.error('Error getting recommendation:', error);
      // Fallback recommendation
      setRecommendation({
        tool: 'Purpose Discovery',
        description: 'Find clarity on your life direction and core purpose',
        timeRequired: '15-20 minutes',
        reason: 'A great starting point for most personal development journeys.'
      });
    }
    
    setIsLoading(false);
  };

  const handleGetStarted = () => {
    const tool = availableTools.find(t => t.name === recommendation?.tool);
    if (tool) {
      window.location.href = tool.path;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-red-50 to-pink-100">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Flame className="w-8 h-8 text-orange-500" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Find Your Way Forward
            </h1>
          </div>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Get tailored guidance and tools to navigate life's challenges
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content - Steps 1-3 */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Step 1: Find Your Challenge */}
            <div className="backdrop-blur-md bg-white/20 rounded-2xl border border-white/30 p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white flex items-center justify-center font-bold">
                  1
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Find Your Challenge</h2>
              </div>
              
              <p className="text-gray-700 mb-6">
                What are you trying to navigate through right now?
              </p>
              
              {!showCustomInput ? (
                <div className="space-y-3">
                  {predefinedChallenges.map((challengeOption, index) => (
                    <button
                      key={index}
                      onClick={() => handleChallengeSelect(challengeOption)}
                      className="w-full p-4 text-left rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all text-gray-800 hover:border-orange-300"
                    >
                      {challengeOption}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setShowCustomInput(true)}
                    className="w-full p-4 text-left rounded-xl border-2 border-dashed border-orange-300 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all text-orange-600 hover:border-orange-400"
                  >
                    Something else? Tell us more...
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <textarea
                    value={challenge}
                    onChange={(e) => setChallenge(e.target.value)}
                    placeholder="Describe your challenge..."
                    className="w-full p-4 rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm placeholder-gray-500 text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
                    rows={4}
                    autoFocus
                  />
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleGetRecommendation}
                      disabled={!challenge.trim() || isLoading}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? 'Getting Recommendation...' : 'Get My Recommendation'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowCustomInput(false);
                        setChallenge('');
                      }}
                      className="px-4 py-3 bg-white/20 text-gray-700 rounded-xl font-semibold hover:bg-white/30 transition-all"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Recommendation */}
            {recommendation && (
              <div className="backdrop-blur-md bg-white/20 rounded-2xl border border-white/30 p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white flex items-center justify-center font-bold">
                    2
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Recommendation</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Use this tool when:</p>
                    <p className="text-gray-700">{recommendation.reason}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Time required:</p>
                    <p className="text-gray-700">{recommendation.timeRequired}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-2">What it will help with:</p>
                    <p className="text-gray-700">{recommendation.description}</p>
                  </div>
                </div>
                
                <div className="flex gap-4 mt-6">
                  <div className="flex-1 p-4 bg-white/30 rounded-xl">
                    <h3 className="font-semibold text-gray-800 mb-2">{recommendation.tool}</h3>
                    <p className="text-sm text-gray-600">Recommended for your challenge</p>
                  </div>
                  <button
                    onClick={handleGetStarted}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all flex items-center gap-2"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Your Personalized System */}
            <div className="backdrop-blur-md bg-white/20 rounded-2xl border border-white/30 p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white flex items-center justify-center font-bold">
                  3
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Your Personalized System</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-white/20 rounded-lg">
                  <BookOpen className="w-5 h-5 text-orange-500" />
                  <span className="text-gray-700">Use the tools to...</span>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-white/20 rounded-lg">
                  <Users className="w-5 h-5 text-orange-500" />
                  <span className="text-gray-700">Live sessions on...</span>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-white/20 rounded-lg">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  <span className="text-gray-700">Monthly workshops on...</span>
                </div>
              </div>
              
              <div className="mt-6">
                <p className="text-sm text-gray-600 mb-2">Other sessions to explore:</p>
                <p className="text-gray-700">Additional coaching opportunities will appear here as you complete tools and build your personalized development plan.</p>
              </div>
            </div>
          </div>

          {/* Sidebar: Your Results */}
          <div className="lg:col-span-1">
            <div className="backdrop-blur-md bg-white/20 rounded-2xl border border-white/30 p-6 shadow-xl sticky top-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-orange-500" />
                Your Results
              </h3>
              
              <div className="space-y-4">
                {userResults.map((result, index) => (
                  <div key={index} className="p-4 bg-white/30 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800 text-sm">{result.tool}</h4>
                      {result.completed && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                    </div>
                    
                    {result.completed ? (
                      <div>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Completion Score</span>
                          <span>{result.score}%</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all"
                            style={{ width: `${result.score}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-600">Not started</p>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-orange-400/20 to-red-400/20 rounded-xl border border-orange-200">
                <h4 className="font-semibold text-gray-800 mb-2">Level 2 - Beacon</h4>
                <p className="text-xs text-gray-600 mb-2">Complete 3 tools to unlock advanced coaching features</p>
                <div className="w-full bg-white/30 rounded-full h-2">
                  <div className="bg-gradient-to-r from-orange-400 to-red-400 h-2 rounded-full w-1/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}