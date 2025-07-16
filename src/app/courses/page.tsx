'use client';

import React, { useState, useEffect } from 'react';
import { Flame, ArrowRight, ArrowLeft, Users, Target, BookOpen, Brain, MessageCircle, Heart, Download, TrendingUp } from 'lucide-react';

interface UserProfile {
  role: string;
  challenge: string;
  challengeDetails: string;
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
  description: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
}

function ToolsPage() {
  const [currentScreen, setCurrentScreen] = useState(1);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    role: '',
    challenge: '',
    challengeDetails: ''
  });
  const [customChallenge, setCustomChallenge] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const roles = [
    'People Leader',
    'Talent Leader',
    'Individual Contributor',
    'CEO/Executive',
    'Other'
  ];

  const allChallenges = [
    // People Leader challenges
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

  const challenges = allChallenges.filter(challenge => challenge.persona === userProfile.role);

  const getRecommendations = (challengeId: string) => {
    const challengeType = challengeId.split('-')[1];
    
    const toolMappings: { [key: string]: Tool } = {
      'c1': { id: 't1', name: 'Purpose and Alignment Map', type: 'guide', description: 'Create clarity around purpose and strategic alignment' },
      'c2': { id: 't2', name: 'Change Readiness Reflection', type: 'reflection', description: 'Assess and build readiness for navigating change' },
      'c3': { id: 't3', name: 'Team Trust Audit', type: 'assessment', description: 'Evaluate and strengthen trust within your team' },
      'c4': { id: 't4', name: 'Coaching Questions Card Deck', type: 'guide', description: 'Powerful questions to empower and develop others' },
      'c5': { id: 't5', name: 'Decision Filter Framework', type: 'guide', description: 'Make better decisions with a structured approach' },
      'c6': { id: 't6', name: 'Burnout Assessment', type: 'assessment', description: 'Identify and address signs of burnout' },
      'c7': { id: 't7', name: 'Working with Me Guide', type: 'guide', description: 'Share your work style and improve collaboration' },
      'c8': { id: 't8', name: 'Hopes, Fears, Expectations Template', type: 'guide', description: 'Create clarity through open dialogue about expectations' },
      'c9': { id: 't9', name: 'Career Drivers Exercise', type: 'reflection', description: 'Discover what motivates and drives your career growth' }
    };

    const courseMappings: { [key: string]: Course[] } = {
      'c1': [
        { id: 'course1', title: 'Strategic Goal Setting', description: 'Learn to set and cascade meaningful goals', duration: '2 weeks' },
        { id: 'course2', title: 'Purpose-Driven Leadership', description: 'Connect individual purpose to organizational mission', duration: '3 weeks' },
        { id: 'course3', title: 'Vision Alignment Workshop', description: 'Create shared understanding of organizational direction', duration: '1 week' }
      ],
      'c2': [
        { id: 'course4', title: 'Leading Through Change', description: 'Master the art of change management', duration: '4 weeks' },
        { id: 'course5', title: 'Building Resilience', description: 'Develop personal and team resilience', duration: '2 weeks' },
        { id: 'course6', title: 'Adaptive Leadership', description: 'Lead effectively in uncertain times', duration: '3 weeks' }
      ],
      'c3': [
        { id: 'course7', title: 'Building Trust at Scale', description: 'Create psychological safety across teams', duration: '3 weeks' },
        { id: 'course8', title: 'Effective Feedback Systems', description: 'Design feedback loops that work', duration: '2 weeks' },
        { id: 'course9', title: 'Emotional Intelligence Mastery', description: 'Develop emotional intelligence skills', duration: '4 weeks' }
      ],
      'c4': [
        { id: 'course10', title: 'Coaching for Impact', description: 'Develop coaching skills that empower others', duration: '3 weeks' },
        { id: 'course11', title: 'Delegation Mastery', description: 'Learn to delegate effectively and build capability', duration: '2 weeks' },
        { id: 'course12', title: 'Servant Leadership', description: 'Lead by serving and empowering your team', duration: '3 weeks' }
      ],
      'c5': [
        { id: 'course13', title: 'Strategic Decision Making', description: 'Make better decisions under pressure', duration: '2 weeks' },
        { id: 'course14', title: 'Data-Driven Decisions', description: 'Use data and analytics to guide choices', duration: '3 weeks' },
        { id: 'course15', title: 'Collaborative Decision Making', description: 'Include diverse perspectives in decisions', duration: '2 weeks' }
      ],
      'c6': [
        { id: 'course16', title: 'Well-Being at Work', description: 'Create sustainable work practices', duration: '3 weeks' },
        { id: 'course17', title: 'Burnout Prevention', description: 'Identify and prevent team burnout', duration: '2 weeks' },
        { id: 'course18', title: 'Building Mental Fitness', description: 'Develop resilience and mental strength', duration: '4 weeks' }
      ],
      'c7': [
        { id: 'course19', title: 'Effective Communication', description: 'Master clear and impactful communication', duration: '3 weeks' },
        { id: 'course20', title: 'Cross-Functional Collaboration', description: 'Work effectively across teams and silos', duration: '2 weeks' },
        { id: 'course21', title: 'Virtual Team Success', description: 'Collaborate effectively in remote settings', duration: '2 weeks' }
      ],
      'c8': [
        { id: 'course22', title: 'Role Design Workshop', description: 'Create clear and meaningful roles', duration: '2 weeks' },
        { id: 'course23', title: 'Performance Expectations', description: 'Set and communicate clear expectations', duration: '2 weeks' },
        { id: 'course24', title: 'Accountability Systems', description: 'Build accountability into your culture', duration: '3 weeks' }
      ],
      'c9': [
        { id: 'course25', title: 'Learning Culture', description: 'Build a culture of continuous learning', duration: '3 weeks' },
        { id: 'course26', title: 'Career Development Planning', description: 'Create meaningful development paths', duration: '2 weeks' },
        { id: 'course27', title: 'Skills for the Future', description: 'Develop tomorrow\'s critical capabilities', duration: '4 weeks' }
      ]
    };

    const tool = toolMappings[challengeType] || toolMappings['c1'];
    const courses = courseMappings[challengeType] || courseMappings['c1'];

    return { tools: [tool], courses };
  };

  useEffect(() => {
    if (currentScreen === 4) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setCurrentScreen(5), 500);
            return 100;
          }
          return prev + (100 / 150);
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [currentScreen]);

  const handleNext = () => {
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
    setUserProfile(prev => ({ ...prev, challenge: challenge.title }));
    handleNext();
  };

  const handleCustomChallenge = () => {
    if (!customChallenge.trim()) return;
    setUserProfile(prev => ({ ...prev, challenge: customChallenge }));
    setSelectedChallenge({
      id: 'custom',
      persona: userProfile.role,
      title: customChallenge,
      description: 'Custom challenge'
    });
    handleNext();
  };

  const skipToTools = () => {
    setCurrentScreen(5);
  };

  if (currentScreen === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center text-white px-6">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Flame className="w-12 h-12 text-orange-300" />
            <h1 className="text-6xl font-bold">Campfire Guides</h1>
          </div>
          <p className="text-2xl text-purple-100 mb-16">Tools For Companies and Teams</p>
          
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold mb-8">Let's get started!</h2>
            <p className="text-xl mb-8">What is your role?</p>
            
            <select
              value={userProfile.role}
              onChange={(e) => setUserProfile(prev => ({ ...prev, role: e.target.value }))}
              className="w-full p-4 rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-orange-400 mb-6"
            >
              <option value="" className="text-gray-800">Select your role</option>
              {roles.map(role => (
                <option key={role} value={role} className="text-gray-800">{role}</option>
              ))}
            </select>
            
            <div className="flex flex-col gap-4">
              <button
                onClick={handleNext}
                disabled={!userProfile.role}
                className="w-full py-4 bg-white text-purple-600 rounded-xl font-semibold hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                NEXT
              </button>
              
              <button
                onClick={skipToTools}
                className="text-white/80 hover:text-white text-sm underline"
              >
                Skip to tools
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 2) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              What's your biggest challenge as a {userProfile.role}?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
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

          <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Something else?</h3>
            <textarea
              value={customChallenge}
              onChange={(e) => setCustomChallenge(e.target.value)}
              placeholder="Describe your challenge..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
            />
            <button
              onClick={handleCustomChallenge}
              disabled={!customChallenge.trim()}
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            
            <button
              onClick={skipToTools}
              className="text-gray-600 hover:text-gray-900 text-sm underline"
            >
              Skip to tools
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 3) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-12">
              Tell us more about your challenge...
            </h2>
            
            <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
              <textarea
                value={userProfile.challengeDetails}
                onChange={(e) => setUserProfile(prev => ({ ...prev, challengeDetails: e.target.value }))}
                placeholder="What makes it hard?"
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-lg"
                rows={6}
              />
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleBack}
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Next
              </button>
            </div>
            
            <button
              onClick={skipToTools}
              className="mt-6 text-gray-600 hover:text-gray-900 text-sm underline"
            >
              Skip to tools
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 4) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-lg mx-auto text-center px-6">
          <div className="bg-white rounded-2xl p-12 shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Great! We're generating your personalized rec...
            </h2>
            
            <div className="relative mb-8">
              <div className="w-16 h-16 mx-auto">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-100"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 5) {
    const recommendations = selectedChallenge ? getRecommendations(selectedChallenge.id) : getRecommendations('c1');
    
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex justify-between items-center mb-8">
                <button
                  onClick={handleBack}
                  className="text-purple-600 hover:text-purple-700 flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  All Recommendations
                </button>
                <div className="flex gap-4">
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors">
                    Contact
                  </button>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
              
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Your Recommended Plan...
              </h2>
              {selectedChallenge && (
                <p className="text-lg text-gray-600">
                  Based on {selectedChallenge.title}
                </p>
              )}
            </div>

            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Tools:</h3>
              <p className="text-gray-600 mb-6">Start here:</p>
              
              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <div className="flex items-start gap-6">
                  <div className="w-32 h-24 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-8 h-8 text-purple-600" />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      {recommendations.tools[0].name}
                    </h4>
                    <p className="text-gray-600 mb-4">
                      {recommendations.tools[0].description}
                    </p>
                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                      {recommendations.tools[0].type}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Programs:</h3>
              
              <div className="grid gap-6">
                {recommendations.courses.map((course) => (
                  <div key={course.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {course.title}
                        </h4>
                        <p className="text-gray-600 mb-2">
                          {course.description}
                        </p>
                        <span className="text-sm text-purple-600 font-medium">
                          {course.duration}
                        </span>
                      </div>
                      <div className="w-16 h-12 bg-gray-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center ml-6">
                        <div className="text-xs text-gray-400">IMG</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button className="px-8 py-3 border border-purple-600 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors">
                Explore Catalog
              </button>
              <button className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Loading...</h1>
      </div>
    </div>
  );
}

export default ToolsPage;