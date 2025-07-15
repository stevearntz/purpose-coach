'use client';

import { useState } from 'react';
import { Flame, ArrowRight, ArrowLeft, Users, Target, BookOpen, Brain, MessageCircle, Heart, Download, Settings, TrendingUp, Calendar, Globe } from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  role: string;
}

interface Challenge {
  id: string;
  persona: string;
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
    'People Leader',
    'Talent Leader',
    'Individual Contributor',
    'CEO/Executive',
    'Other'
  ];

  // Define all challenges with persona mappings
  const allChallenges = [
    // People Leader (Manager) challenges
    { id: 'p1-c1', persona: 'People Leader', title: 'Purpose + Direction', description: 'Align my team on purpose and direction' },
    { id: 'p1-c2', persona: 'People Leader', title: 'Navigating Change', description: 'Help my team adapt to change' },
    { id: 'p1-c3', persona: 'People Leader', title: 'Trust + Psychological Safety', description: 'Build trust and psychological safety' },
    { id: 'p1-c4', persona: 'People Leader', title: 'Empowering Others', description: 'Empower others through coaching and support' },
    { id: 'p1-c5', persona: 'People Leader', title: 'Effective Decision Making', description: 'Improve decision making on my team' },
    { id: 'p1-c6', persona: 'People Leader', title: 'Well-Being + Resilience', description: 'Support well-being and prevent burnout' },
    { id: 'p1-c7', persona: 'People Leader', title: 'Communication and Collaboration', description: 'Communicate and collaborate more effectively' },
    { id: 'p1-c8', persona: 'People Leader', title: 'Role Clarity + Expectations', description: 'Create clarity around roles and expectations' },
    { id: 'p1-c9', persona: 'People Leader', title: 'Growth + Development', description: 'Develop my team\'s skills and confidence' },
    
    // Talent Leader challenges
    { id: 'p2-c1', persona: 'Talent Leader', title: 'Alignment + Direction', description: 'Align the organization on purpose and direction' },
    { id: 'p2-c2', persona: 'Talent Leader', title: 'Navigating Change', description: 'Support teams through change and uncertainty' },
    { id: 'p2-c3', persona: 'Talent Leader', title: 'Feedback + Trust', description: 'Foster a culture of trust and psychological safety' },
    { id: 'p2-c4', persona: 'Talent Leader', title: 'Leadership Effectiveness', description: 'Enable managers to coach and empower others' },
    { id: 'p2-c5', persona: 'Talent Leader', title: 'Decision Making', description: 'Improve decision making across the organization' },
    { id: 'p2-c6', persona: 'Talent Leader', title: 'Well-Being', description: 'Promote well-being and resilience at scale' },
    { id: 'p2-c7', persona: 'Talent Leader', title: 'Communication and Collaboration', description: 'Strengthen communication and collaboration across teams' },
    { id: 'p2-c8', persona: 'Talent Leader', title: 'Clarity + Expectations', description: 'Clarify roles, responsibilities, and expectations' },
    { id: 'p2-c9', persona: 'Talent Leader', title: 'Skill Building', description: 'Drive skill development and continuous learning' },
    
    // Individual Contributor challenges
    { id: 'p3-c1', persona: 'Individual Contributor', title: 'Alignment + Direction', description: 'Understand the purpose behind my work' },
    { id: 'p3-c2', persona: 'Individual Contributor', title: 'Navigating Change', description: 'Adapt to change with confidence' },
    { id: 'p3-c3', persona: 'Individual Contributor', title: 'Feedback + Trust', description: 'Build trust with my team' },
    { id: 'p3-c4', persona: 'Individual Contributor', title: 'Leadership Effectiveness', description: 'Take ownership and contribute meaningfully' },
    { id: 'p3-c5', persona: 'Individual Contributor', title: 'Decision Making', description: 'Make better decisions in my day-to-day' },
    { id: 'p3-c6', persona: 'Individual Contributor', title: 'Well-Being', description: 'Care for my well-being and avoid burnout' },
    { id: 'p3-c7', persona: 'Individual Contributor', title: 'Communication and Collaboration', description: 'Communicate and collaborate more effectively' },
    { id: 'p3-c8', persona: 'Individual Contributor', title: 'Clarity + Expectations', description: 'Get clear on what\'s expected of me' },
    { id: 'p3-c9', persona: 'Individual Contributor', title: 'Skill Building', description: 'Grow my skills and develop in my role' },
    
    // CEO/Executive challenges
    { id: 'p4-c1', persona: 'CEO/Executive', title: 'Alignment + Direction', description: 'Align the company around purpose and direction' },
    { id: 'p4-c2', persona: 'CEO/Executive', title: 'Navigating Change', description: 'Lead the organization through change' },
    { id: 'p4-c3', persona: 'CEO/Executive', title: 'Feedback + Trust', description: 'Build a culture of trust and psychological safety' },
    { id: 'p4-c4', persona: 'CEO/Executive', title: 'Leadership Effectiveness', description: 'Empower leaders to grow and develop their teams' },
    { id: 'p4-c5', persona: 'CEO/Executive', title: 'Decision Making', description: 'Improve decision making at every level' },
    { id: 'p4-c6', persona: 'CEO/Executive', title: 'Well-Being', description: 'Support well-being and resilience across the company' },
    { id: 'p4-c7', persona: 'CEO/Executive', title: 'Communication and Collaboration', description: 'Strengthen communication and collaboration company-wide' },
    { id: 'p4-c8', persona: 'CEO/Executive', title: 'Clarity + Expectations', description: 'Ensure clarity of roles, accountability, and expectations' },
    { id: 'p4-c9', persona: 'CEO/Executive', title: 'Skill Building', description: 'Invest in skill development to drive performance and growth' },
    
    // Other challenges
    { id: 'p5-c1', persona: 'Other', title: 'Alignment + Direction', description: 'Connect my work to the organization\'s purpose and direction' },
    { id: 'p5-c2', persona: 'Other', title: 'Navigating Change', description: 'Support others through change and transition' },
    { id: 'p5-c3', persona: 'Other', title: 'Feedback + Trust', description: 'Create spaces of trust and psychological safety' },
    { id: 'p5-c4', persona: 'Other', title: 'Leadership Effectiveness', description: 'Help others grow through support and encouragement' },
    { id: 'p5-c5', persona: 'Other', title: 'Decision Making', description: 'Contribute to better decisions across the team' },
    { id: 'p5-c6', persona: 'Other', title: 'Well-Being', description: 'Promote well-being and emotional resilience' },
    { id: 'p5-c7', persona: 'Other', title: 'Communication and Collaboration', description: 'Facilitate clear and respectful communication' },
    { id: 'p5-c8', persona: 'Other', title: 'Clarity + Expectations', description: 'Bring clarity to roles and shared expectations' },
    { id: 'p5-c9', persona: 'Other', title: 'Skill Building', description: 'Support learning and skill development for those around me' }
  ];

  // Filter challenges based on selected role
  const challenges = allChallenges.filter(challenge => challenge.persona === userProfile.role);

  // Map challenges to tools and courses
  const getRecommendations = (challengeId: string) => {
    // Extract challenge type from ID (e.g., 'p1-c1' -> 'c1')
    const challengeType = challengeId.split('-')[1];
    
    const toolMappings: { [key: string]: Tool[] } = {
      'c1': [ // Purpose + Direction / Alignment + Direction
        { id: 't1', name: 'Purpose and Alignment Map', type: 'guide', icon: Target, description: 'Create clarity around purpose and strategic alignment' }
      ],
      'c2': [ // Navigating Change
        { id: 't2', name: 'Change Readiness Reflection', type: 'reflection', icon: Brain, description: 'Assess and build readiness for navigating change' }
      ],
      'c3': [ // Trust + Psychological Safety / Feedback + Trust
        { id: 't3', name: 'Team Trust Audit', type: 'assessment', icon: Target, description: 'Evaluate and strengthen trust within your team' }
      ],
      'c4': [ // Empowering Others / Leadership Effectiveness
        { id: 't4', name: 'Coaching Questions Card Deck', type: 'guide', icon: MessageCircle, description: 'Powerful questions to empower and develop others' }
      ],
      'c5': [ // Decision Making
        { id: 't5', name: 'Decision Filter Framework', type: 'guide', icon: Target, description: 'Make better decisions with a structured approach' }
      ],
      'c6': [ // Well-Being + Resilience
        { id: 't6', name: 'Burnout Assessment', type: 'assessment', icon: Heart, description: 'Identify and address signs of burnout' }
      ],
      'c7': [ // Communication and Collaboration
        { id: 't7', name: 'Working with Me Guide', type: 'guide', icon: Users, description: 'Share your work style and improve collaboration' }
      ],
      'c8': [ // Role Clarity + Expectations
        { id: 't8', name: 'Hopes, Fears, Expectations Template', type: 'guide', icon: MessageCircle, description: 'Create clarity through open dialogue about expectations' }
      ],
      'c9': [ // Growth + Development / Skill Building
        { id: 't9', name: 'Career Drivers Exercise', type: 'reflection', icon: TrendingUp, description: 'Discover what motivates and drives your career growth' }
      ]
    };

    const courseMappings: { [key: string]: Course[] } = {
      'c1': [ // Purpose + Direction / Alignment + Direction
        { id: 'course1', title: 'Strategic Goal Setting', description: 'Learn to set and cascade meaningful goals', duration: '2 weeks' },
        { id: 'course2', title: 'Purpose-Driven Leadership', description: 'Connect individual purpose to organizational mission', duration: '3 weeks' },
        { id: 'course3', title: 'Vision Alignment Workshop', description: 'Create shared understanding of organizational direction', duration: '1 week' }
      ],
      'c2': [ // Navigating Change
        { id: 'course4', title: 'Leading Through Change', description: 'Master the art of change management', duration: '4 weeks' },
        { id: 'course5', title: 'Building Resilience', description: 'Develop personal and team resilience', duration: '2 weeks' },
        { id: 'course6', title: 'Adaptive Leadership', description: 'Lead effectively in uncertain times', duration: '3 weeks' }
      ],
      'c3': [ // Trust + Psychological Safety / Feedback + Trust
        { id: 'course7', title: 'Building Trust at Scale', description: 'Create psychological safety across teams', duration: '3 weeks' },
        { id: 'course8', title: 'Effective Feedback Systems', description: 'Design feedback loops that work', duration: '2 weeks' },
        { id: 'course9', title: 'Emotional Intelligence Mastery', description: 'Develop emotional intelligence skills', duration: '4 weeks' }
      ],
      'c4': [ // Empowering Others / Leadership Effectiveness
        { id: 'course10', title: 'Coaching for Impact', description: 'Develop coaching skills that empower others', duration: '3 weeks' },
        { id: 'course11', title: 'Delegation Mastery', description: 'Learn to delegate effectively and build capability', duration: '2 weeks' },
        { id: 'course12', title: 'Servant Leadership', description: 'Lead by serving and empowering your team', duration: '3 weeks' }
      ],
      'c5': [ // Decision Making
        { id: 'course13', title: 'Strategic Decision Making', description: 'Make better decisions under pressure', duration: '2 weeks' },
        { id: 'course14', title: 'Data-Driven Decisions', description: 'Use data and analytics to guide choices', duration: '3 weeks' },
        { id: 'course15', title: 'Collaborative Decision Making', description: 'Include diverse perspectives in decisions', duration: '2 weeks' }
      ],
      'c6': [ // Well-Being + Resilience
        { id: 'course16', title: 'Well-Being at Work', description: 'Create sustainable work practices', duration: '3 weeks' },
        { id: 'course17', title: 'Burnout Prevention', description: 'Identify and prevent team burnout', duration: '2 weeks' },
        { id: 'course18', title: 'Building Mental Fitness', description: 'Develop resilience and mental strength', duration: '4 weeks' }
      ],
      'c7': [ // Communication and Collaboration
        { id: 'course19', title: 'Effective Communication', description: 'Master clear and impactful communication', duration: '3 weeks' },
        { id: 'course20', title: 'Cross-Functional Collaboration', description: 'Work effectively across teams and silos', duration: '2 weeks' },
        { id: 'course21', title: 'Virtual Team Success', description: 'Collaborate effectively in remote settings', duration: '2 weeks' }
      ],
      'c8': [ // Role Clarity + Expectations
        { id: 'course22', title: 'Role Design Workshop', description: 'Create clear and meaningful roles', duration: '2 weeks' },
        { id: 'course23', title: 'Performance Expectations', description: 'Set and communicate clear expectations', duration: '2 weeks' },
        { id: 'course24', title: 'Accountability Systems', description: 'Build accountability into your culture', duration: '3 weeks' }
      ],
      'c9': [ // Growth + Development / Skill Building
        { id: 'course25', title: 'Learning Culture', description: 'Build a culture of continuous learning', duration: '3 weeks' },
        { id: 'course26', title: 'Career Development Planning', description: 'Create meaningful development paths', duration: '2 weeks' },
        { id: 'course27', title: 'Skills for the Future', description: 'Develop tomorrow\'s critical capabilities', duration: '4 weeks' }
      ]
    };

    return {
      tools: toolMappings[challengeType] || toolMappings['c1'],
      courses: courseMappings[challengeType] || courseMappings['c1']
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
    <div className="relative">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Flame className="w-8 h-8 text-purple-600" />
          <span className="text-2xl font-bold text-gray-900">Campfire</span>
        </div>
        <div className="flex items-center gap-8">
          <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">Packages & Pricing</a>
          <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">Help</a>
          <button className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors">
            Sign Up
          </button>
          <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 transition-colors">
            Log In
          </button>
        </div>
      </nav>

      {/* Hero Section with Purple Gradient */}
      <div className="relative min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left side - Hero Content */}
            <div className="text-white">
              <h1 className="text-6xl font-bold leading-tight mb-8">
                Campfire Guides
              </h1>
              <p className="text-xl text-purple-100 mb-12 leading-relaxed">
                Tools For Companies and Teams
              </p>
              
              {/* Platform Illustration */}
              <div className="mt-16 relative">
                {/* Main Content Library Card */}
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-6 border border-white/20 max-w-lg">
                  <div className="flex items-center gap-2 mb-4 text-white font-semibold">
                    <Flame className="w-5 h-5 text-orange-300" />
                    Content Library
                  </div>
                  
                  {/* Grid of colorful content cards */}
                  <div className="grid grid-cols-4 gap-3 mb-6">
                    <div className="h-8 bg-purple-400 rounded"></div>
                    <div className="h-8 bg-blue-400 rounded"></div>
                    <div className="h-8 bg-green-400 rounded"></div>
                    <div className="h-8 bg-yellow-400 rounded"></div>
                    <div className="h-8 bg-green-400 rounded"></div>
                    <div className="h-8 bg-orange-400 rounded"></div>
                    <div className="h-8 bg-purple-400 rounded"></div>
                    <div className="h-8 bg-blue-400 rounded"></div>
                  </div>
                  
                  {/* Workshop Preview */}
                  <div className="bg-purple-500/50 rounded-lg p-4 relative">
                    <div className="text-sm text-white font-medium mb-2">Leading Through Change</div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="aspect-square bg-purple-300 rounded flex items-center justify-center">
                        <div className="w-4 h-4 bg-white/70 rounded-full"></div>
                      </div>
                      <div className="aspect-square bg-pink-300 rounded flex items-center justify-center">
                        <div className="w-6 h-4 bg-white/70 rounded"></div>
                      </div>
                      <div className="aspect-square bg-blue-300 rounded flex items-center justify-center">
                        <div className="w-4 h-6 bg-white/70 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Insights Card */}
                <div className="absolute -bottom-4 -right-8 bg-white/15 backdrop-blur-sm rounded-lg p-4 border border-white/20 w-48">
                  <div className="flex items-center gap-2 mb-3 text-white text-sm font-semibold">
                    <TrendingUp className="w-4 h-4 text-orange-300" />
                    Insights & Reporting
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-purple-400 rounded w-3/4"></div>
                    <div className="h-2 bg-green-400 rounded w-1/2"></div>
                    <div className="h-2 bg-blue-400 rounded w-5/6"></div>
                  </div>
                </div>
                
                {/* Floating annotation */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-orange-300 text-orange-900 px-3 py-1 rounded-full text-xs font-medium">
                  Library of turnkey, customizable content
                </div>
              </div>
            </div>

            {/* Right side - Lead Form */}
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Flame className="w-8 h-8 text-purple-600" />
                  <span className="text-2xl font-bold text-gray-900">Campfire</span>
                </div>
                <p className="text-gray-600">Find the right tool for you or your team to help you thrive and get great results</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={userProfile.name}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={userProfile.email}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={userProfile.role}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select your role</option>
                    {roles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={handleNext}
                  disabled={!userProfile.name || !userProfile.email || !userProfile.role}
                  className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  NEXT
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderScreen2 = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Flame className="w-8 h-8 text-purple-600" />
          <span className="text-2xl font-bold text-gray-900">Campfire</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 text-gray-600 hover:text-gray-900">Contact Us</button>
          <button className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors">
            Demo Platform
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            What's the main challenge you'd like to help your people overcome?
          </h2>
          <p className="text-xl text-gray-600">
            Choose the area where your team needs the most support
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {challenges.map((challenge) => (
            <button
              key={challenge.id}
              onClick={() => handleChallengeSelect(challenge)}
              className="p-6 text-left bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all group"
            >
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
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
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>
    </div>
  );

  const renderScreen3 = () => {
    if (!selectedChallenge) return null;
    
    const recommendations = getRecommendations(selectedChallenge.id);

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="flex items-center justify-between p-6 bg-white border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Flame className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">Campfire</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 text-gray-600 hover:text-gray-900">Contact Us</button>
            <button className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </nav>

        <div className="container mx-auto px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 mb-8"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                We'd recommend...
              </h2>
              <p className="text-xl text-gray-600">
                Based on "{selectedChallenge.title}", here are your personalized recommendations
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Tools Section */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  Tools
                </h3>
                
                <div className="space-y-4">
                  {recommendations.tools.map((tool) => (
                    <div key={tool.id} className="p-4 border border-gray-100 rounded-xl hover:border-purple-200 hover:bg-purple-50/50 transition-all group cursor-pointer" onClick={handleToolLaunch}>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mt-1 group-hover:bg-purple-200 transition-colors">
                          <tool.icon className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                            {tool.name}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {tool.description}
                          </p>
                          <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                            {tool.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Programs/Courses Section */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                  </div>
                  Programs/Sessions/Live Workshops
                </h3>
                
                <div className="space-y-4">
                  {recommendations.courses.map((course) => (
                    <div key={course.id} className="p-4 border border-gray-100 rounded-xl hover:border-purple-200 hover:bg-purple-50/50 transition-all group cursor-pointer">
                      <h4 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {course.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {course.description}
                      </p>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded">{course.duration}</span>
                        <ArrowRight className="w-4 h-4 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderScreen4 = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Flame className="w-8 h-8 text-purple-600" />
          <span className="text-2xl font-bold text-gray-900">Campfire</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 text-gray-600 hover:text-gray-900">Contact Us</button>
          <button className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors">
            Share
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Full Recommendations
              </button>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-8">Decision Audit</h2>
            
            <div className="space-y-6">
              <p className="text-lg text-gray-700 mb-8">
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
                <div key={index} className="flex items-center justify-between p-6 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-900 flex-1 mr-6 font-medium">{index + 1}. {statement}</span>
                  <div className="flex gap-3">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        className="w-10 h-10 rounded-full border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all font-medium text-gray-700 hover:text-purple-700"
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              
              <div className="flex justify-center pt-8">
                <button className="px-8 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-lg">
                  Complete Assessment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'}`}>
        {currentScreen === 1 && renderScreen1()}
        {currentScreen === 2 && renderScreen2()}
        {currentScreen === 3 && renderScreen3()}
        {currentScreen === 4 && renderScreen4()}
      </div>
    </div>
  );
}