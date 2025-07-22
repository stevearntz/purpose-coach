'use client';

import React, { useState, useMemo } from 'react';
import { ArrowLeft, Flame, ArrowRight, ChevronLeft, ChevronRight, ExternalLink, Target, Navigation, Shield, Users, Brain, Heart, Lightbulb, Sparkles, CheckCircle } from 'lucide-react';
import NavigationHeader from '@/components/NavigationHeader';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getCourseIdsForChallenges } from '@/app/lib/courseMappings';
import { allCourses } from '@/app/lib/coursesData';
import { courseDetails } from '@/app/lib/courseDetails';
import { courseDetailsFromCSV } from '@/app/lib/courseDetailsFromCSV';
import { courseImageMapping } from '@/app/lib/courseImages';
import Footer from '@/components/Footer';
import Modal from '@/components/Modal';

interface Course {
  id: string;
  title: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const getCourseGradient = (courseId: string): string => {
  const gradients: { [key: string]: string } = {
    's1': 'from-yellow-400 via-orange-400 to-red-400',
    's2': 'from-blue-400 via-indigo-400 to-purple-400',
    's3': 'from-orange-400 via-red-400 to-pink-400',
    's4': 'from-teal-400 via-cyan-400 to-blue-400',
    's5': 'from-green-400 via-emerald-400 to-teal-400',
    's6': 'from-amber-400 via-yellow-400 to-orange-400',
    's7': 'from-red-400 via-rose-400 to-pink-400',
    's8': 'from-indigo-400 via-purple-400 to-pink-400',
    's9': 'from-purple-400 via-violet-400 to-indigo-400',
    's10': 'from-blue-400 via-sky-400 to-cyan-400',
    's11': 'from-yellow-400 via-amber-400 to-orange-400',
    's12': 'from-emerald-400 via-green-400 to-lime-400',
    's13': 'from-sky-400 via-blue-400 to-indigo-400',
    's14': 'from-violet-400 via-purple-400 to-fuchsia-400',
    's15': 'from-pink-400 via-rose-400 to-red-400',
    's16': 'from-cyan-400 via-teal-400 to-emerald-400',
    's17': 'from-lime-400 via-green-400 to-emerald-400',
    's18': 'from-orange-400 via-amber-400 to-yellow-400',
    's19': 'from-fuchsia-400 via-purple-400 to-violet-400',
    's20': 'from-rose-400 via-pink-400 to-fuchsia-400',
    's21': 'from-amber-400 via-orange-400 to-red-400',
    's22': 'from-sky-400 via-cyan-400 to-teal-400',
    's23': 'from-green-400 via-emerald-400 to-cyan-400',
    's24': 'from-violet-400 via-indigo-400 to-blue-400',
    's25': 'from-pink-400 via-fuchsia-400 to-purple-400',
    's26': 'from-blue-400 via-indigo-400 to-violet-400',
    's27': 'from-red-400 via-orange-400 to-amber-400',
    's28': 'from-teal-400 via-emerald-400 to-green-400',
    's29': 'from-yellow-400 via-lime-400 to-green-400',
    's30': 'from-indigo-400 via-violet-400 to-purple-400',
    's31': 'from-cyan-400 via-blue-400 to-indigo-400',
    's32': 'from-rose-400 via-red-400 to-orange-400',
    's33': 'from-green-400 via-teal-400 to-cyan-400',
    's34': 'from-orange-400 via-yellow-400 to-lime-400',
    's35': 'from-purple-400 via-fuchsia-400 to-pink-400',
    's36': 'from-blue-400 via-cyan-400 to-teal-400',
    's37': 'from-pink-400 via-rose-400 to-red-400',
    's38': 'from-emerald-400 via-green-400 to-lime-400',
    's39': 'from-amber-400 via-yellow-400 to-orange-400',
    's40': 'from-violet-400 via-purple-400 to-fuchsia-400',
    's41': 'from-red-400 via-pink-400 to-rose-400',
    's42': 'from-blue-400 via-sky-400 to-cyan-400',
    's43': 'from-green-400 via-emerald-400 to-teal-400'
  };
  
  return gradients[courseId] || 'from-purple-400 via-pink-400 to-orange-400';
};

const getCourseVisual = (courseId: string): React.ReactElement => {
  const visuals: { [key: string]: React.ReactElement } = {
    's1': <svg viewBox="0 0 64 48" className="w-full h-full"><circle cx="32" cy="24" r="16" fill="#fbbf24" opacity="0.3"/><circle cx="32" cy="24" r="8" fill="#f59e0b"/></svg>,
    's2': <svg viewBox="0 0 64 48" className="w-full h-full"><rect x="16" y="12" width="32" height="24" fill="#c084fc" opacity="0.3" rx="4"/><rect x="24" y="18" width="16" height="12" fill="#9333ea" rx="2"/></svg>,
    's3': <svg viewBox="0 0 64 48" className="w-full h-full"><path d="M20 24 L32 12 L44 24 L32 36 Z" fill="#f472b6" opacity="0.3"/><path d="M26 24 L32 18 L38 24 L32 30 Z" fill="#ec4899"/></svg>,
    's4': <svg viewBox="0 0 64 48" className="w-full h-full"><circle cx="20" cy="24" r="8" fill="#60a5fa" opacity="0.3"/><circle cx="44" cy="24" r="8" fill="#3b82f6" opacity="0.3"/><line x1="28" y1="24" x2="36" y2="24" stroke="#1e40af" strokeWidth="2"/></svg>,
    's5': <svg viewBox="0 0 64 48" className="w-full h-full"><path d="M32 8 L40 16 L40 32 L32 40 L24 32 L24 16 Z" fill="#34d399" opacity="0.3"/><circle cx="32" cy="24" r="6" fill="#10b981"/></svg>,
    's6': <svg viewBox="0 0 64 48" className="w-full h-full"><polygon points="32,8 48,24 32,40 16,24" fill="#fbbf24" opacity="0.3"/><polygon points="32,16 40,24 32,32 24,24" fill="#f59e0b"/></svg>,
    's7': <svg viewBox="0 0 64 48" className="w-full h-full"><rect x="12" y="16" width="40" height="16" fill="#f87171" opacity="0.3" rx="8"/><rect x="20" y="20" width="24" height="8" fill="#ef4444" rx="4"/></svg>,
    's8': <svg viewBox="0 0 64 48" className="w-full h-full"><circle cx="32" cy="24" r="20" fill="none" stroke="#8b5cf6" strokeWidth="2" opacity="0.3"/><path d="M32 12 L32 24 L44 24" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round"/></svg>,
    's9': <svg viewBox="0 0 64 48" className="w-full h-full"><circle cx="32" cy="24" r="12" fill="#c084fc" opacity="0.3"/><circle cx="32" cy="24" r="6" fill="#9333ea"/><circle cx="32" cy="24" r="3" fill="#7c3aed"/></svg>,
    's10': <svg viewBox="0 0 64 48" className="w-full h-full"><rect x="16" y="8" width="16" height="16" fill="#60a5fa" opacity="0.3" rx="2"/><rect x="32" y="24" width="16" height="16" fill="#3b82f6" opacity="0.3" rx="2"/><path d="M32 16 L32 32" stroke="#1e40af" strokeWidth="2"/></svg>,
    's11': <svg viewBox="0 0 64 48" className="w-full h-full"><polygon points="32,8 40,20 52,20 42,32 48,44 32,32 16,44 22,32 12,20 24,20" fill="#fbbf24" opacity="0.3"/><polygon points="32,16 36,22 42,22 37,28 40,34 32,28 24,34 27,28 22,22 28,22" fill="#f59e0b"/></svg>,
    's12': <svg viewBox="0 0 64 48" className="w-full h-full"><path d="M16 24 Q32 8 48 24 T32 40" fill="none" stroke="#34d399" strokeWidth="3" opacity="0.5"/><circle cx="32" cy="24" r="4" fill="#10b981"/></svg>,
    's13': <svg viewBox="0 0 64 48" className="w-full h-full"><circle cx="24" cy="24" r="8" fill="#3b82f6" opacity="0.5"/><circle cx="40" cy="24" r="8" fill="#1e40af" opacity="0.5"/><path d="M32 24 Q36 16 40 24 Q36 32 32 24 Q28 16 24 24 Q28 32 32 24" fill="#60a5fa" opacity="0.3"/></svg>,
    's14': <svg viewBox="0 0 64 48" className="w-full h-full"><path d="M20 32 Q32 20 44 32" fill="none" stroke="#c084fc" strokeWidth="4" strokeLinecap="round"/><circle cx="20" cy="32" r="3" fill="#9333ea"/><circle cx="32" cy="24" r="3" fill="#9333ea"/><circle cx="44" cy="32" r="3" fill="#9333ea"/></svg>,
    's15': <svg viewBox="0 0 64 48" className="w-full h-full"><rect x="24" y="12" width="16" height="24" fill="#f472b6" opacity="0.3" rx="2"/><circle cx="32" cy="24" r="6" fill="#ec4899"/></svg>,
    's16': <svg viewBox="0 0 64 48" className="w-full h-full"><path d="M32 12 L44 24 L32 36 L20 24 Z" fill="none" stroke="#60a5fa" strokeWidth="2"/><circle cx="32" cy="24" r="4" fill="#3b82f6"/></svg>,
    's17': <svg viewBox="0 0 64 48" className="w-full h-full"><rect x="16" y="16" width="32" height="16" fill="#34d399" opacity="0.3" rx="2"/><circle cx="24" cy="24" r="3" fill="#10b981"/><circle cx="32" cy="24" r="3" fill="#10b981"/><circle cx="40" cy="24" r="3" fill="#10b981"/></svg>,
    's18': <svg viewBox="0 0 64 48" className="w-full h-full"><path d="M32 36 Q32 24 32 12" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round"/><circle cx="32" cy="36" r="3" fill="#f59e0b"/><text x="26" y="18" fill="#f59e0b" fontSize="16" fontWeight="bold">?</text></svg>,
    's19': <svg viewBox="0 0 64 48" className="w-full h-full"><circle cx="32" cy="16" r="4" fill="#c084fc"/><circle cx="24" cy="28" r="4" fill="#9333ea" opacity="0.7"/><circle cx="40" cy="28" r="4" fill="#9333ea" opacity="0.7"/><circle cx="32" cy="36" r="4" fill="#7c3aed" opacity="0.5"/></svg>,
    's20': <svg viewBox="0 0 64 48" className="w-full h-full"><circle cx="32" cy="24" r="16" fill="#f472b6" opacity="0.3"/><path d="M24 24 Q32 16 40 24 T32 32" fill="#ec4899"/></svg>,
    's21': <svg viewBox="0 0 64 48" className="w-full h-full"><path d="M32 8 L38 20 L52 22 L42 32 L44 46 L32 40 L20 46 L22 32 L12 22 L26 20 Z" fill="#fbbf24" opacity="0.3"/><path d="M32 12 L36 20 L44 21 L38 27 L39 35 L32 31 L25 35 L26 27 L20 21 L28 20 Z" fill="#f59e0b"/></svg>,
    's22': <svg viewBox="0 0 64 48" className="w-full h-full"><rect x="16" y="12" width="32" height="4" fill="#60a5fa" opacity="0.3" rx="2"/><rect x="16" y="22" width="32" height="4" fill="#3b82f6" opacity="0.5" rx="2"/><rect x="16" y="32" width="32" height="4" fill="#1e40af" rx="2"/></svg>,
    's23': <svg viewBox="0 0 64 48" className="w-full h-full"><circle cx="32" cy="24" r="16" fill="none" stroke="#34d399" strokeWidth="3" strokeDasharray="4 2"/><circle cx="32" cy="24" r="8" fill="#10b981" opacity="0.3"/><circle cx="32" cy="24" r="4" fill="#10b981"/></svg>,
    's24': <svg viewBox="0 0 64 48" className="w-full h-full"><rect x="12" y="20" width="12" height="8" fill="#c084fc" opacity="0.3"/><rect x="26" y="16" width="12" height="16" fill="#9333ea" opacity="0.5"/><rect x="40" y="12" width="12" height="24" fill="#7c3aed"/></svg>,
    's25': <svg viewBox="0 0 64 48" className="w-full h-full"><path d="M16 32 L24 24 L32 28 L40 16 L48 20" fill="none" stroke="#f472b6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><circle cx="48" cy="20" r="3" fill="#ec4899"/></svg>,
    's26': <svg viewBox="0 0 64 48" className="w-full h-full"><rect x="16" y="16" width="32" height="16" fill="#60a5fa" opacity="0.3" rx="2"/><rect x="20" y="20" width="8" height="8" fill="#3b82f6" rx="1"/><rect x="28" y="20" width="8" height="8" fill="#3b82f6" rx="1"/><rect x="36" y="20" width="8" height="8" fill="#3b82f6" rx="1"/></svg>,
    's27': <svg viewBox="0 0 64 48" className="w-full h-full"><circle cx="32" cy="24" r="12" fill="#f87171" opacity="0.3"/><path d="M28 20 L28 28 M32 16 L32 28 M36 20 L36 28" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/></svg>,
    's28': <svg viewBox="0 0 64 48" className="w-full h-full"><path d="M20 16 L32 24 L20 32" fill="#34d399" opacity="0.3"/><path d="M32 24 L44 16" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/><path d="M32 24 L44 32" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/></svg>,
    's29': <svg viewBox="0 0 64 48" className="w-full h-full"><circle cx="32" cy="24" r="16" fill="#fbbf24" opacity="0.3"/><path d="M24 20 Q32 28 40 20" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/></svg>,
    's30': <svg viewBox="0 0 64 48" className="w-full h-full"><path d="M16 12 L16 36 M32 12 L32 36 M48 12 L48 36" stroke="#9333ea" strokeWidth="3"/><circle cx="16" cy="20" r="4" fill="#7c3aed"/><circle cx="32" cy="28" r="4" fill="#7c3aed"/><circle cx="48" cy="24" r="4" fill="#7c3aed"/><path d="M16 20 L32 28 L48 24" stroke="#c084fc" strokeWidth="2" strokeDasharray="2 2"/></svg>,
    's31': <svg viewBox="0 0 64 48" className="w-full h-full"><circle cx="20" cy="24" r="6" fill="#60a5fa" opacity="0.5"/><circle cx="32" cy="24" r="6" fill="#3b82f6" opacity="0.7"/><circle cx="44" cy="24" r="6" fill="#1e40af"/></svg>,
    's32': <svg viewBox="0 0 64 48" className="w-full h-full"><path d="M32 12 L44 24 L32 36 L20 24 Z" fill="#ec4899" opacity="0.4"/><path d="M32 18 L38 24 L32 30 L26 24 Z" fill="#be185d"/><circle cx="32" cy="24" r="3" fill="#881337"/></svg>,
    's33': <svg viewBox="0 0 64 48" className="w-full h-full"><circle cx="32" cy="24" r="12" fill="#34d399" opacity="0.3"/><circle cx="26" cy="24" r="4" fill="#10b981"/><circle cx="38" cy="24" r="4" fill="#10b981"/><circle cx="32" cy="30" r="4" fill="#10b981"/></svg>,
    's34': <svg viewBox="0 0 64 48" className="w-full h-full"><path d="M20 20 Q32 12 44 20" fill="none" stroke="#fbbf24" strokeWidth="2"/><path d="M20 24 Q32 32 44 24" fill="none" stroke="#f59e0b" strokeWidth="2"/><path d="M20 28 Q32 20 44 28" fill="none" stroke="#f87171" strokeWidth="2"/></svg>,
    's35': <svg viewBox="0 0 64 48" className="w-full h-full"><rect x="16" y="20" width="12" height="8" fill="#c084fc" opacity="0.5" rx="2"/><rect x="36" y="20" width="12" height="8" fill="#9333ea" opacity="0.5" rx="2"/><path d="M28 24 L36 24" stroke="#7c3aed" strokeWidth="2"/></svg>,
    's36': <svg viewBox="0 0 64 48" className="w-full h-full"><path d="M20 24 L44 24" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round"/><path d="M24 20 L20 24 L24 28 M40 20 L44 24 L40 28" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    's37': <svg viewBox="0 0 64 48" className="w-full h-full"><circle cx="32" cy="24" r="8" fill="#f472b6" opacity="0.3"/><path d="M32 16 L40 24 L32 32 L24 24 Z" fill="#ec4899"/></svg>,
    's38': <svg viewBox="0 0 64 48" className="w-full h-full"><path d="M24 16 L32 24 L24 32 M40 16 L32 24 L40 32" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>,
    's39': <svg viewBox="0 0 64 48" className="w-full h-full"><circle cx="32" cy="24" r="4" fill="#fbbf24"/><circle cx="24" cy="16" r="3" fill="#f59e0b" opacity="0.7"/><circle cx="40" cy="16" r="3" fill="#f59e0b" opacity="0.7"/><circle cx="24" cy="32" r="3" fill="#f59e0b" opacity="0.7"/><circle cx="40" cy="32" r="3" fill="#f59e0b" opacity="0.7"/><path d="M32 24 L24 16 M32 24 L40 16 M32 24 L24 32 M32 24 L40 32" stroke="#f87171" strokeWidth="1" opacity="0.5"/></svg>,
    's40': <svg viewBox="0 0 64 48" className="w-full h-full"><text x="20" y="28" fill="#c084fc" fontSize="20" fontWeight="bold">?</text><text x="36" y="28" fill="#9333ea" fontSize="20" fontWeight="bold">$</text></svg>,
    's41': <svg viewBox="0 0 64 48" className="w-full h-full"><path d="M32 12 Q24 24 32 36 Q40 24 32 12" fill="#f472b6" opacity="0.3"/><circle cx="32" cy="24" r="4" fill="#ec4899"/></svg>,
    's42': <svg viewBox="0 0 64 48" className="w-full h-full"><rect x="16" y="16" width="32" height="16" fill="#60a5fa" opacity="0.3" rx="8"/><circle cx="24" cy="24" r="2" fill="#3b82f6"/><circle cx="32" cy="24" r="2" fill="#3b82f6"/><circle cx="40" cy="24" r="2" fill="#3b82f6"/></svg>,
    's43': <svg viewBox="0 0 64 48" className="w-full h-full"><circle cx="24" cy="20" r="6" fill="#34d399" opacity="0.5"/><circle cx="40" cy="20" r="6" fill="#34d399" opacity="0.5"/><circle cx="32" cy="32" r="6" fill="#10b981"/></svg>
  };
  
  return visuals[courseId] || visuals['s1'];
};

// Use the shared courses data
const courses = allCourses as Course[];

const challenges: Challenge[] = [
  { id: 'c1', title: 'Purpose + Direction', description: 'Clarify purpose and set clear direction', icon: <Target className="w-5 h-5" /> },
  { id: 'c2', title: 'Navigating Change', description: 'Lead through transitions and uncertainty', icon: <Navigation className="w-5 h-5" /> },
  { id: 'c3', title: 'Feedback + Trust', description: 'Build trust and psychological safety', icon: <Shield className="w-5 h-5" /> },
  { id: 'c4', title: 'Empowering Others', description: 'Develop and empower your team', icon: <Users className="w-5 h-5" /> },
  { id: 'c5', title: 'Decision Making', description: 'Make better decisions under pressure', icon: <Brain className="w-5 h-5" /> },
  { id: 'c6', title: 'Well-Being', description: 'Maintain balance and prevent burnout', icon: <Heart className="w-5 h-5" /> },
  { id: 'c7', title: 'Communication and Collaboration', description: 'Improve team communication', icon: <Lightbulb className="w-5 h-5" /> },
  { id: 'c8', title: 'Skill Building', description: 'Develop key leadership skills', icon: <Sparkles className="w-5 h-5" /> },
  { id: 'c9', title: 'Alignment + Direction', description: 'Align teams around shared goals', icon: <CheckCircle className="w-5 h-5" /> }
];

// Remove the old mapping - we'll use the shared one from courseMappings.ts

export default function CoursesPage() {
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);

  const handleCourseClick = (courseId: string) => {
    console.log('Course clicked:', courseId);
    setSelectedCourse(courseId);
  };

  const handleChallengeToggle = (challengeId: string) => {
    setSelectedChallenges(prev => 
      prev.includes(challengeId) 
        ? prev.filter(id => id !== challengeId)
        : [...prev, challengeId]
    );
  };

  // Get filtered courses based on selected challenges
  const filteredCourses = useMemo(() => {
    if (selectedChallenges.length === 0) {
      return courses;
    }

    // Get course IDs in priority order using the shared mapping
    const orderedCourseIds = getCourseIdsForChallenges(selectedChallenges);

    // Return courses in the priority order
    return orderedCourseIds
      .map(id => allCourses.find(course => course.id === id))
      .filter(course => course !== undefined) as Course[];
  }, [selectedChallenges]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="gradient-main-horizontal text-white">
        <NavigationHeader 
          backTo="/?screen=4" 
          backLabel="Back to Tools"
          variant="light"
        />
        
        <div className="max-w-7xl mx-auto px-6 pb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Workshops for Every Challenge</h1>
            <p className="text-2xl text-iris-100 mb-2">Live, conversation-based sessions built to develop people, strengthen culture, and drive real impact.</p>
          </div>
        </div>
      </div>

      {/* Challenge Filter Pills */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Filter by Challenge</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {challenges.map((challenge, index) => {
              const isSelected = selectedChallenges.includes(challenge.id);
              return (
                <button
                  key={challenge.id}
                  onClick={() => handleChallengeToggle(challenge.id)}
                  className={`
                    relative px-5 py-3 rounded-full flex items-center gap-2 text-base font-medium transition-all duration-200
                    ${isSelected 
                      ? 'bg-iris-100 text-iris-dark shadow-sm scale-105' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-700'
                    }
                  `}
                >
                  {challenge.icon}
                  <span>{challenge.title}</span>
                </button>
              );
            })}
          </div>
          {selectedChallenges.length > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-base font-medium text-gray-700">
                Showing {filteredCourses.length} of {courses.length} courses
              </p>
              <button
                onClick={() => setSelectedChallenges([])}
                className="text-sm text-iris hover:text-iris-dark font-medium"
              >
                CLEAR FILTERS
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Course Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No courses match your selected challenges.</p>
            <button
              onClick={() => setSelectedChallenges([])}
              className="text-iris hover:text-iris-dark font-medium"
            >
              CLEAR FILTERS TO SEE ALL COURSES
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => {
            const isVisible = selectedChallenges.length === 0 || filteredCourses.includes(course);
            return (
              <div
                key={course.id}
                onClick={() => handleCourseClick(course.id)}
                className={`
                  group bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer flex flex-col
                  transition-all duration-300 ease-in-out
                  hover:shadow-lg hover:scale-105 
                  ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}
                `}
                style={{
                  transitionDelay: isVisible ? '0ms' : '0ms'
                }}
              >
                {/* Image/Visual Area */}
                <div className="relative h-40 overflow-hidden bg-gray-50">
                  {courseImageMapping[course.id] && (
                    <Image
                      src={courseImageMapping[course.id]}
                      alt={courseDetailsFromCSV[course.id]?.title || course.title}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                
                {/* Content Area */}
                <div className="p-5 flex flex-col h-full">
                  <div className="flex-grow">
                    <h3 className="text-2xl font-semibold text-nightfall mb-3 leading-tight">
                      {courseDetailsFromCSV[course.id]?.title || course.title}
                    </h3>
                    
                    <p className="text-base text-gray-600 leading-relaxed">
                      {courseDetailsFromCSV[course.id]?.description || 'Learn key concepts and practical strategies to enhance your leadership skills and team performance.'}
                    </p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <span className="block text-center text-sm font-medium text-iris group-hover:text-iris-dark transition-colors uppercase tracking-wider">
                      VIEW DETAILS
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-6 py-12 text-center">
        <p className="text-gray-600 mb-6">Need help choosing the right courses for your team?</p>
        <button 
          onClick={() => window.open('https://calendly.com/getcampfire/demo', '_blank')}
          className="px-8 py-3 bg-iris text-white rounded-lg font-semibold hover:bg-iris-dark transition-colors"
        >
          <span className="sm:hidden">DEMO</span><span className="hidden sm:inline">BOOK A DEMO</span>
        </button>
      </div>

      <Footer />

      {/* Course Detail Modal */}
      <Modal 
        isOpen={selectedCourse !== null} 
        onClose={() => setSelectedCourse(null)}
      >
        {selectedCourse && courseDetailsFromCSV[selectedCourse] && (
          <div className="flex flex-col md:flex-row h-full">
            {/* Left side - Visual/Image */}
            <div className="md:w-1/2 bg-gradient-to-br from-indigo-100 to-purple-100 p-8 flex items-center justify-center">
              <div className="relative w-full max-w-md">
                {/* Main content area with session image */}
                <div className="bg-white rounded-lg overflow-hidden shadow-xl">
                  {courseImageMapping[selectedCourse] && (
                    <Image
                      src={courseImageMapping[selectedCourse]}
                      alt={courseDetailsFromCSV[selectedCourse].title}
                      width={800}
                      height={600}
                      className="w-full h-auto"
                    />
                  )}
                </div>
                
                {/* View in platform link */}
                <div className="text-center mt-6">
                  <p className="text-gray-600 text-sm mb-4">
                    See how the slides, script notes, and activities from this template come alive in our custom virtual classroom!
                  </p>
                  <a 
                    href={`https://meet.getcampfire.com/lessons/${courseDetailsFromCSV[selectedCourse].title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}/preview`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-iris text-white rounded-lg hover:bg-iris-dark transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <rect x="2" y="4" width="16" height="12" rx="1" stroke="currentColor" strokeWidth="2" fill="none" />
                      <path d="M7 10 L13 10 M13 10 L11 8 M13 10 L11 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    VIEW IN CAMPFIRE
                  </a>
                </div>
              </div>
            </div>
            
            {/* Right side - Content */}
            <div className="md:w-1/2 p-8 overflow-y-auto bg-white">
              <div className="max-w-lg">
                
                <h1 className="text-3xl font-bold text-nightfall mb-6">
                  {courseDetailsFromCSV[selectedCourse].title}
                </h1>
                
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-nightfall mb-3">This session teaches how to...</h3>
                    <p className="text-gray-600">
                      {courseDetailsFromCSV[selectedCourse].description}
                    </p>
                  </div>
                  
                  {courseDetailsFromCSV[selectedCourse].actionToTake && (
                    <div>
                      <h3 className="text-lg font-semibold text-nightfall mb-3">We'll do this by...</h3>
                      <ul className="space-y-2">
                        {courseDetailsFromCSV[selectedCourse].actionToTake.split('\n').filter(item => item.trim()).map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-purple-500 mt-1">•</span>
                            <span className="text-gray-600">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-lg font-semibold text-nightfall mb-3">Leave this session ready to...</h3>
                    <p className="text-gray-600">
                      Claim more autonomy by taking a meaningful step toward ownership in the area you've identified.
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={() => window.open('https://calendly.com/getcampfire/demo', '_blank')}
                  className="w-full mt-8 px-8 py-4 bg-iris text-white rounded-lg font-semibold hover:bg-iris-dark transition-colors uppercase tracking-wider"
                >
                  SCHEDULE SESSION
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}