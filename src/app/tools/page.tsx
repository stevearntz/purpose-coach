'use client';

import { useState } from 'react';
import { Flame, ArrowRight, ArrowLeft, Users, Target, BookOpen, Brain, MessageCircle, Heart, Download } from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  role: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
}

interface Tool {
  id: string;
  name: string;
  type: 'assessment' | 'guide' | 'reflection';
  icon: any;
  description: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
}

export default function ToolsPage() {
  const [currentScreen, setCurrentScreen] = useState(1);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    email: '',
    role: ''
  });
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const roles = [
    'Talent Leader',
    'People Leader', 
    'IC',
    'CEO/Other'
  ];

  const challenges: Challenge[] = [
    { id: '1', title: 'Connect teams to goals', description: 'Align team efforts with organizational objectives' },
    { id: '2', title: 'Support managers in change', description: 'Help leaders navigate organizational transitions' },
    { id: '3', title: 'Build a culture of feedback, care, and trust', description: 'Foster psychological safety and open communication' },
    { id: '4', title: 'Strengthen decision making', description: 'Improve clarity and speed in critical decisions' },
    { id: '5', title: 'Help build confidence and capability', description: 'Develop skills and self-assurance in team members' },
    { id: '6', title: 'Improve communication', description: 'Enhance clarity and effectiveness in all interactions' },
    { id: '7', title: 'Increase emotional well-being', description: 'Support mental health and resilience' },
    { id: '8', title: 'Align expectations', description: 'Create clarity around roles and responsibilities' },
    { id: '9', title: 'Scale without burning out', description: 'Grow sustainably while maintaining team health' }
  ];

  // Map challenges to tools and courses
  const getRecommendations = (challengeId: string) => {
    const toolMappings: { [key: string]: Tool[] } = {
      '1': [
        { id: 't1', name: 'Goal Alignment Assessment', type: 'assessment', icon: Target, description: 'Evaluate current goal clarity and connection' },
        { id: 't2', name: 'Strategy Conversation Guide', type: 'guide', icon: MessageCircle, description: 'Facilitate meaningful strategy discussions' },
        { id: 't3', name: 'Purpose Reflection Tool', type: 'reflection', icon: Brain, description: 'Reflect on individual and team purpose' }
      ],
      '2': [
        { id: 't4', name: 'Change Readiness Assessment', type: 'assessment', icon: Target, description: 'Assess readiness for organizational change' },
        { id: 't5', name: 'Change Leadership Guide', type: 'guide', icon: MessageCircle, description: 'Navigate change conversations effectively' },
        { id: 't6', name: 'Resilience Reflection', type: 'reflection', icon: Brain, description: 'Build personal resilience during change' }
      ],
      '3': [
        { id: 't7', name: 'Trust Assessment', type: 'assessment', icon: Target, description: 'Measure trust levels within teams' },
        { id: 't8', name: 'Feedback Conversation Guide', type: 'guide', icon: MessageCircle, description: 'Give and receive feedback effectively' },
        { id: 't9', name: 'Emotional Intelligence Reflection', type: 'reflection', icon: Brain, description: 'Develop emotional awareness and regulation' }
      ]
      // Add more mappings as needed
    };

    const courseMappings: { [key: string]: Course[] } = {
      '1': [
        { id: 'c1', title: 'Strategic Goal Setting', description: 'Learn to set and cascade meaningful goals', duration: '2 weeks' },
        { id: 'c2', title: 'Purpose-Driven Leadership', description: 'Connect individual purpose to organizational mission', duration: '3 weeks' },
        { id: 'c3', title: 'Vision Alignment Workshop', description: 'Create shared understanding of organizational direction', duration: '1 week' }
      ],
      '2': [
        { id: 'c4', title: 'Leading Through Change', description: 'Master the art of change management', duration: '4 weeks' },
        { id: 'c5', title: 'Building Resilience', description: 'Develop personal and team resilience', duration: '2 weeks' },
        { id: 'c6', title: 'Adaptive Leadership', description: 'Lead effectively in uncertain times', duration: '3 weeks' }
      ],
      '3': [
        { id: 'c7', title: 'Building Trust at Scale', description: 'Create psychological safety across teams', duration: '3 weeks' },
        { id: 'c8', title: 'Effective Feedback Systems', description: 'Design feedback loops that work', duration: '2 weeks' },
        { id: 'c9', title: 'Emotional Intelligence Mastery', description: 'Develop emotional intelligence skills', duration: '4 weeks' }
      ]
    };

    return {
      tools: toolMappings[challengeId] || toolMappings['1'],
      courses: courseMappings[challengeId] || courseMappings['1']
    };
  };

  const handleNext = () => {
    if (currentScreen === 1 && (!userProfile.name || !userProfile.email || !userProfile.role)) {
      return;
    }
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentScreen(prev => prev + 1);
      setIsTransitioning(false);
    }, 300);
  };

  const handleBack = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentScreen(prev => prev - 1);
      setIsTransitioning(false);
    }, 300);
  };

  const handleChallengeSelect = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    handleNext();
  };

  const handleToolLaunch = () => {
    setCurrentScreen(4);
  };

  const renderScreen1 = () => (
    <div className="max-w-2xl mx-auto text-center">
      {/* Hero Section */}
      <div className="mb-12">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Flame className="w-12 h-12 text-orange-500" />
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Campfire Guides
          </h1>
        </div>
        <p className="text-2xl text-gray-700 mb-8">
          Tools For Companies and Teams
        </p>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          Find the right tool for you or your team to help you thrive and get great results
        </p>
      </div>

      {/* Lead Form */}
      <div className="backdrop-blur-md bg-white/20 rounded-2xl border border-white/30 p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Get Started</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={userProfile.name}
              onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-3 rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm placeholder-gray-500 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Your name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={userProfile.email}
              onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
              className="w-full p-3 rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm placeholder-gray-500 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="your@email.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={userProfile.role}
              onChange={(e) => setUserProfile(prev => ({ ...prev, role: e.target.value }))}
              className="w-full p-3 rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">Select your role</option>
              {roles.map(role => (
                <option key={role} value={role} className="bg-white text-gray-800">{role}</option>
              ))}
            </select>
          </div>
        </div>
        
        <button
          onClick={handleNext}
          disabled={!userProfile.name || !userProfile.email || !userProfile.role}
          className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          Next
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderScreen2 = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          What's the main challenge you'd like to help your people overcome?
        </h2>
        <p className="text-lg text-gray-600">
          Choose the area where your team needs the most support
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {challenges.map((challenge) => (
          <button
            key={challenge.id}
            onClick={() => handleChallengeSelect(challenge)}
            className="p-6 text-left rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all text-gray-800 hover:border-orange-300 group"
          >
            <h3 className="font-semibold mb-2 group-hover:text-orange-600 transition-colors">
              {challenge.title}
            </h3>
            <p className="text-sm text-gray-600">
              {challenge.description}
            </p>
          </button>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleBack}
          className="px-6 py-3 bg-white/20 text-gray-700 rounded-xl font-semibold hover:bg-white/30 transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>
    </div>
  );

  const renderScreen3 = () => {
    if (!selectedChallenge) return null;
    
    const recommendations = getRecommendations(selectedChallenge.id);

    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-white/20 text-gray-700 rounded-lg hover:bg-white/30 transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="flex gap-4">
              <button className="px-4 py-2 bg-white/20 text-gray-700 rounded-lg hover:bg-white/30 transition-all">
                Contact Us
              </button>
              <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            We'd recommend...
          </h2>
          <p className="text-lg text-gray-600">
            Based on "{selectedChallenge.title}", here are your personalized recommendations
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Tools Section */}
          <div className="backdrop-blur-md bg-white/20 rounded-2xl border border-white/30 p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-500" />
              Tools
            </h3>
            
            <div className="space-y-4">
              {recommendations.tools.map((tool) => (
                <div key={tool.id} className="p-4 bg-white/20 rounded-xl hover:bg-white/30 transition-all group cursor-pointer" onClick={handleToolLaunch}>
                  <div className="flex items-start gap-3">
                    <tool.icon className="w-5 h-5 text-orange-500 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                        {tool.name}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {tool.description}
                      </p>
                      <span className="inline-block mt-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                        {tool.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Programs/Courses Section */}
          <div className="backdrop-blur-md bg-white/20 rounded-2xl border border-white/30 p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-orange-500" />
              Programs/Sessions/Live Workshops
            </h3>
            
            <div className="space-y-4">
              {recommendations.courses.map((course) => (
                <div key={course.id} className="p-4 bg-white/20 rounded-xl hover:bg-white/30 transition-all group cursor-pointer">
                  <h4 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                    {course.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {course.description}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">{course.duration}</span>
                    <ArrowRight className="w-4 h-4 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderScreen4 = () => (
    <div className="max-w-4xl mx-auto">
      <div className="backdrop-blur-md bg-white/20 rounded-2xl border border-white/30 p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-white/20 text-gray-700 rounded-lg hover:bg-white/30 transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Full Recommendations
          </button>
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-white/20 text-gray-700 rounded-lg hover:bg-white/30 transition-all">
              Contact Us
            </button>
            <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all">
              Share
            </button>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-8">Decision Audit</h2>
        
        <div className="space-y-6">
          <p className="text-lg text-gray-700 mb-6">
            Rate each statement on how true it feels for your team (1 = Never, 5 = Always)
          </p>
          
          {[
            "We have clear criteria for making important decisions",
            "Team members understand their decision-making authority", 
            "We consistently follow up on the outcomes of our decisions",
            "Different perspectives are genuinely considered before deciding",
            "We learn from our decision-making mistakes",
            "Decisions are communicated clearly to all stakeholders",
            "We make decisions at an appropriate speed for our context"
          ].map((statement, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
              <span className="text-gray-800 flex-1 mr-4">{index + 1}. {statement}</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    className="w-8 h-8 rounded-full border-2 border-orange-300 hover:bg-orange-200 transition-all"
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>
          ))}
          
          <div className="flex justify-center pt-6">
            <button className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all">
              Complete Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-red-50 to-pink-100">
      <div className="container mx-auto px-4 py-8">
        <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'}`}>
          {currentScreen === 1 && renderScreen1()}
          {currentScreen === 2 && renderScreen2()}
          {currentScreen === 3 && renderScreen3()}
          {currentScreen === 4 && renderScreen4()}
        </div>
      </div>
    </div>
  );
}