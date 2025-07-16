'use client';

import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';

interface UserData {
  id: string;
  name: string;
  email: string;
  picture: string;
}

interface Responses {
  purpose: string;
  mission: string;
  vision: string;
}

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

export default function PurposeCoach() {
  const [user, setUser] = useState<UserData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Responses>({
    purpose: '',
    mission: '',
    vision: ''
  });
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const questions = [
    {
      id: 'purpose',
      title: 'Discover Your Purpose',
      question: 'What activities make you lose track of time? What problems do you feel compelled to solve?',
      placeholder: 'I exist to...',
      description: 'Think about moments when you feel most alive and engaged. What themes emerge?'
    },
    {
      id: 'mission',
      title: 'Define Your Mission',
      question: 'How do you want to make a difference in the world? What specific actions will you take?',
      placeholder: 'I am on a mission to...',
      description: 'Your mission is your purpose in action. What will you do to fulfill your purpose?'
    },
    {
      id: 'vision',
      title: 'Envision Your Future',
      question: 'What does success look like? How will the world be different because of your efforts?',
      placeholder: 'I see a world where...',
      description: 'Paint a picture of the future impact you want to create.'
    }
  ];

  // Google Auth functionality (commented out for now)
  /*
  useEffect(() => {
    const initializeGoogleAuth = async () => {
      try {
        // Load Google Identity Services
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          if (window.google) {
            window.google.accounts.id.initialize({
              client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '348216088961-o64ec4i8q1mpnq1r52rdkf6bg5ddv608.apps.googleusercontent.com',
              callback: handleGoogleSignIn,
              auto_select: false,
              cancel_on_tap_outside: false,
            });
            
            // Wait a bit for the DOM element to be ready
            setTimeout(() => {
              const buttonElement = document.getElementById('google-signin-button');
              if (buttonElement) {
                window.google.accounts.id.renderButton(
                  buttonElement,
                  {
                    theme: 'outline',
                    size: 'large',
                    text: 'signin_with',
                    shape: 'rectangular',
                    width: 280,
                    logo_alignment: 'left'
                  }
                );
              }
            }, 100);
          }
          setIsLoading(false);
        };
        
        script.onerror = () => {
          console.log('Google Auth not available, using demo mode');
          setIsLoading(false);
        };
        
        document.head.appendChild(script);
      } catch (error) {
        console.log('Auth initialization failed, using demo mode');
        setIsLoading(false);
      }
    };

    initializeGoogleAuth();

    // Cleanup function to remove script on unmount
    return () => {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);
  */

  const handleGoogleSignIn = (response: any) => {
    try {
      const credential = response.credential;
      const payload = JSON.parse(atob(credential.split('.')[1]));
      
      setUser({
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture
      });
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  const handleDemoLogin = () => {
    setUser({
      id: 'demo-user',
      name: 'Demo User',
      email: 'demo@example.com',
      picture: 'data:image/svg+xml;base64,' + btoa(`
        <svg width="150" height="150" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#3B82F6;stop-opacity:1" />
            </linearGradient>
          </defs>
          <circle cx="75" cy="75" r="75" fill="url(#gradient)"/>
          <circle cx="75" cy="55" r="25" fill="white" opacity="0.9"/>
          <path d="M 30 120 Q 75 90 120 120 L 120 150 L 30 150 Z" fill="white" opacity="0.9"/>
        </svg>
      `)
    });
  };

  const handleSignOut = () => {
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
    setUser(null);
    setCurrentQuestion(0);
    setResponses({ purpose: '', mission: '', vision: '' });
    setIsComplete(false);
  };

  const handleResponse = (value: string) => {
    const questionKey = questions[currentQuestion].id as keyof Responses;
    setResponses(prev => ({ ...prev, [questionKey]: value }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsComplete(true);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    const lineHeight = 7;
    let yPosition = 30;

    // Header
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Purpose Discovery Results', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 20;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated for: ${user?.name}`, pageWidth / 2, yPosition, { align: 'center' });
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition + 7, { align: 'center' });
    
    yPosition += 30;

    // Purpose Section
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('My Purpose', margin, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const purposeText = `I exist to ${responses.purpose}`;
    const purposeLines = doc.splitTextToSize(purposeText, pageWidth - 2 * margin);
    doc.text(purposeLines, margin, yPosition);
    yPosition += purposeLines.length * lineHeight + 15;

    // Mission Section
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('My Mission', margin, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const missionText = `I am on a mission to ${responses.mission}`;
    const missionLines = doc.splitTextToSize(missionText, pageWidth - 2 * margin);
    doc.text(missionLines, margin, yPosition);
    yPosition += missionLines.length * lineHeight + 15;

    // Vision Section
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('My Vision', margin, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const visionText = `I see a world where ${responses.vision}`;
    const visionLines = doc.splitTextToSize(visionText, pageWidth - 2 * margin);
    doc.text(visionLines, margin, yPosition);
    yPosition += visionLines.length * lineHeight + 20;

    // Footer
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Generated by Purpose Coach - chatbythefire.com', pageWidth / 2, 280, { align: 'center' });

    // Save the PDF
    doc.save(`${user?.name?.replace(/\s+/g, '_')}_Purpose_Discovery.pdf`);
  };

  const shareResults = () => {
    const text = `My Purpose Discovery Results:

Purpose: I exist to ${responses.purpose}

Mission: I am on a mission to ${responses.mission}

Vision: I see a world where ${responses.vision}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Purpose Discovery Results',
        text: text
      });
    } else {
      navigator.clipboard.writeText(text);
      alert('Results copied to clipboard!');
    }
  };

  const restartJourney = () => {
    setCurrentQuestion(0);
    setResponses({ purpose: '', mission: '', vision: '' });
    setIsComplete(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Building Your Custom Plan</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/20">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Purpose Coach</h1>
            <p className="text-purple-200 text-lg">
              Discover your purpose, define your mission, and envision your future.
            </p>
          </div>
          
          <div className="space-y-4">
            <div id="google-signin-button" className="flex justify-center"></div>
            
            <div className="flex items-center justify-center space-x-2 text-purple-200">
              <div className="h-px bg-purple-300 flex-1"></div>
              <span className="text-sm">or</span>
              <div className="h-px bg-purple-300 flex-1"></div>
            </div>
            
            <button
              onClick={handleDemoLogin}
              className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 border border-white/30"
            >
              Continue with Demo
            </button>
          </div>
          
          <p className="text-purple-300 text-sm mt-6">
            Your responses will be kept private and secure.
          </p>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img 
                  src={user.picture} 
                  alt={user.name}
                  className="w-12 h-12 rounded-full border-2 border-white/30"
                />
                <div>
                  <h2 className="text-white font-semibold">{user.name}</h2>
                  <p className="text-purple-200 text-sm">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="text-purple-200 hover:text-white text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-6 border border-white/20">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">Your Purpose Discovery</h1>
              <p className="text-purple-200">Here is your personal mission blueprint</p>
            </div>

            <div className="space-y-8">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-2xl font-bold text-purple-300 mb-3">My Purpose</h3>
                <p className="text-white text-lg leading-relaxed">
                  I exist to <span className="font-semibold text-purple-200">{responses.purpose}</span>
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-2xl font-bold text-blue-300 mb-3">My Mission</h3>
                <p className="text-white text-lg leading-relaxed">
                  I am on a mission to <span className="font-semibold text-blue-200">{responses.mission}</span>
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-2xl font-bold text-indigo-300 mb-3">My Vision</h3>
                <p className="text-white text-lg leading-relaxed">
                  I see a world where <span className="font-semibold text-indigo-200">{responses.vision}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={generatePDF}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download PDF</span>
              </button>
              
              <button
                onClick={shareResults}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <span>Share Results</span>
              </button>
              
              <button
                onClick={restartJourney}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Start Over</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const currentResponse = responses[currentQ.id as keyof Responses];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src={user.picture} 
                alt={user.name}
                className="w-12 h-12 rounded-full border-2 border-white/30"
              />
              <div>
                <h2 className="text-white font-semibold">{user.name}</h2>
                <p className="text-purple-200 text-sm">Question {currentQuestion + 1} of {questions.length}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="text-purple-200 hover:text-white text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 mb-6 border border-white/20">
          <div className="flex justify-between text-sm text-purple-200 mb-2">
            <span>Progress</span>
            <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-400 to-blue-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-6 border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{currentQ.title}</h1>
            <p className="text-purple-200 text-lg">{currentQ.question}</p>
            <p className="text-purple-300 text-sm mt-2">{currentQ.description}</p>
          </div>

          <div className="space-y-4">
            <textarea
              value={currentResponse}
              onChange={(e) => handleResponse(e.target.value)}
              placeholder={currentQ.placeholder}
              className="w-full h-40 bg-white/10 border border-white/30 rounded-xl p-4 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
              autoFocus
            />
            
            <div className="flex justify-between">
              <button
                onClick={previousQuestion}
                disabled={currentQuestion === 0}
                className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:text-purple-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <button
                onClick={nextQuestion}
                disabled={!currentResponse.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:text-purple-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
              >
                {currentQuestion === questions.length - 1 ? 'Complete Journey' : 'Next Question'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}