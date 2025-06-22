'use client';

import React, { useState } from 'react';
import { User, Heart, Target, Eye, Download, Share2, LogOut } from 'lucide-react';

interface User {
  name: string;
  email: string;
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState('welcome');
  const [user, setUser] = useState<User | null>(null);
  const [responses, setResponses] = useState({
    purpose: '',
    mission: '',
    vision: ''
  });
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Simulate Google Auth (we'll add real auth later)
  const handleGoogleLogin = () => {
    setIsTyping(true);
    setTimeout(() => {
      setUser({ name: 'Friend', email: 'user@gmail.com' });
      setCurrentStep('intro');
      setIsTyping(false);
    }, 1500);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentStep('welcome');
    setResponses({ purpose: '', mission: '', vision: '' });
    setCurrentInput('');
  };

  const handleNext = () => {
    if (currentStep === 'intro') {
      setCurrentStep('purpose');
    } else if (currentStep === 'purpose') {
      setResponses(prev => ({ ...prev, purpose: currentInput }));
      setCurrentInput('');
      setCurrentStep('mission');
    } else if (currentStep === 'mission') {
      setResponses(prev => ({ ...prev, mission: currentInput }));
      setCurrentInput('');
      setCurrentStep('vision');
    } else if (currentStep === 'vision') {
      setResponses(prev => ({ ...prev, vision: currentInput }));
      setCurrentStep('results');
    }
  };

  const isReadyToNext = () => {
    if (currentStep === 'intro') return true;
    return currentInput.trim().length > 3;
  };

  const resetJourney = () => {
    setCurrentStep('intro');
    setResponses({ purpose: '', mission: '', vision: '' });
    setCurrentInput('');
  };

  const generatePDF = () => {
    alert('PDF generation would be implemented here!');
  };

  const shareResults = () => {
    const text = `My Purpose Discovery Results:\n\nPurpose: I exist to ${responses.purpose}\n\nMission: I&apos;m on a mission to ${responses.mission}\n\nVision: I see ${responses.vision}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Purpose Discovery',
        text: text
      });
    } else {
      navigator.clipboard.writeText(text);
      alert('Results copied to clipboard!');
    }
  };

  const CoachMessage = ({ children }: { children: React.ReactNode }) => {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl mb-6 border border-blue-100">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div className="text-gray-700 leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Discover Your Purpose
            </h1>
            <p className="text-gray-600 text-lg">
              A gentle 5-minute journey to uncover your purpose, mission, and vision
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <button 
              onClick={handleGoogleLogin}
              disabled={isTyping}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 disabled:opacity-50"
            >
              {isTyping ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <User className="w-5 h-5" />
                  <span>Continue with Google</span>
                </>
              )}
            </button>
            <p className="text-center text-sm text-gray-500 mt-4">
              We&apos;ll create your account and keep your journey private
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'results') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="text-center flex-1">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Your Purpose Discovered
              </h1>
              <p className="text-gray-600">
                Here&apos;s what emerged from our conversation
              </p>
            </div>
            <button 
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-8 text-white text-center">
              <h2 className="text-2xl font-bold mb-2">
                Hello, {user.name}
              </h2>
              <p className="opacity-90">
                Your unique blueprint for meaningful living
              </p>
            </div>

            <div className="p-8 space-y-8">
              <div className="border-l-4 border-blue-500 pl-6">
                <div className="flex items-center mb-3">
                  <Heart className="w-6 h-6 text-blue-500 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-800">Your Purpose</h3>
                </div>
                <div className="bg-blue-50 p-6 rounded-xl">
                  <p className="text-lg text-gray-700 italic">
                    &ldquo;I exist to {responses.purpose}&rdquo;
                  </p>
                </div>
              </div>

              <div className="border-l-4 border-indigo-500 pl-6">
                <div className="flex items-center mb-3">
                  <Target className="w-6 h-6 text-indigo-500 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-800">Your Mission</h3>
                </div>
                <div className="bg-indigo-50 p-6 rounded-xl">
                  <p className="text-lg text-gray-700 italic">
                    &ldquo;I&apos;m on a mission to {responses.mission}&rdquo;
                  </p>
                </div>
              </div>

              <div className="border-l-4 border-purple-500 pl-6">
                <div className="flex items-center mb-3">
                  <Eye className="w-6 h-6 text-purple-500 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-800">Your Vision</h3>
                </div>
                <div className="bg-purple-50 p-6 rounded-xl">
                  <p className="text-lg text-gray-700 italic">
                    &ldquo;I see {responses.vision}&rdquo;
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-8 text-center space-y-4">
              <p className="text-gray-600 mb-6">
                These insights are uniquely yours. Carry them forward as your north star.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={generatePDF}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Save as PDF</span>
                </button>
                
                <button 
                  onClick={shareResults}
                  className="bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-xl border border-gray-200 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share Journey</span>
                </button>
                
                <button 
                  onClick={resetJourney}
                  className="text-gray-500 hover:text-gray-700 font-medium py-3 px-6 transition-all duration-200"
                >
                  Start New Journey
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Purpose Discovery</h1>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Step {currentStep === 'intro' ? 1 : currentStep === 'purpose' ? 2 : currentStep === 'mission' ? 3 : 4} of 4
              </div>
              <button 
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 p-1 rounded transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
              style={{ 
                width: currentStep === 'intro' ? '25%' : 
                       currentStep === 'purpose' ? '50%' : 
                       currentStep === 'mission' ? '75%' : '100%' 
              }}
            />
          </div>
        </div>

        {currentStep === 'intro' && (
          <div>
            <CoachMessage>
              <p className="text-lg mb-4">
                Welcome, {user.name}! I&apos;m so glad you&apos;re here. 
              </p>
              <p className="mb-4">
                Over the next few minutes, we&apos;re going to go on a gentle journey together to discover three fundamental truths about who you are: your purpose, your mission, and your unique vision.
              </p>
              <p>
                There are no right or wrong answers - just what feels true for you. Trust your instincts and let your authentic voice emerge. Ready to begin?
              </p>
            </CoachMessage>
            
            <div className="text-center">
              <button 
                onClick={handleNext}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200"
              >
                Let's Start This Journey
              </button>
            </div>
          </div>
        )}

        {currentStep === 'purpose' && (
          <div>
            <CoachMessage>
              <p className="text-lg mb-4">
                Let&apos;s start with the foundation - your purpose. This is about your core reason for being.
              </p>
              <p className="mb-4">
                Don&apos;t overthink this. What comes up when you ask yourself: Why do you exist? What is your purpose?
              </p>
              <p className="font-medium text-gray-800">
                Complete this sentence with whatever feels most true:
              </p>
            </CoachMessage>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Heart className="w-6 h-6 text-blue-500 mr-3" />
                <span className="text-lg font-medium text-gray-700">I exist to...</span>
              </div>
              <textarea
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="speak your truth here..."
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-lg"
                rows={4}
                autoFocus
              />
              <div className="text-right mt-4">
                <button 
                  onClick={handleNext}
                  disabled={!isReadyToNext()}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'mission' && (
          <div>
            <CoachMessage>
              <p className="text-lg mb-4">
                Beautiful. Now let&apos;s explore your mission - this is about what you&apos;re actively working toward in the world.
              </p>
              <p className="mb-4">
                Your mission is your purpose in action. What are you here to do or create or change?
              </p>
              <p className="font-medium text-gray-800">
                Complete this sentence with what comes to mind immediately:
              </p>
            </CoachMessage>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Target className="w-6 h-6 text-indigo-500 mr-3" />
                <span className="text-lg font-medium text-gray-700">I&apos;m on a mission to...</span>
              </div>
              <textarea
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="what are you here to accomplish?"
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none text-lg"
                rows={4}
                autoFocus
              />
              <div className="text-right mt-4">
                <button 
                  onClick={handleNext}
                  disabled={!isReadyToNext()}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'vision' && (
          <div>
            <CoachMessage>
              <p className="text-lg mb-4">
                Perfect. Now for the final piece - your unique vision. This is about your special perspective on the world.
              </p>
              <p className="mb-4">
                You see things others don&apos;t. You notice patterns, possibilities, or problems that others miss. What is that for you?
              </p>
              <p className="font-medium text-gray-800">
                Trust your intuition and complete this sentence:
              </p>
            </CoachMessage>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Eye className="w-6 h-6 text-purple-500 mr-3" />
                <span className="text-lg font-medium text-gray-700">I see...</span>
              </div>
              <textarea
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="what do you see that others don't?"
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none text-lg"
                rows={4}
                autoFocus
              />
              <div className="text-right mt-4">
                <button 
                  onClick={handleNext}
                  disabled={!isReadyToNext()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                >
                  Discover My Blueprint
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}