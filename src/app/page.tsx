'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Flame, ArrowLeft, ArrowRight, Target, Printer, BookOpen, Share2, Users, Briefcase, User, Building } from 'lucide-react';
import { challengeCourseMappings } from '@/app/lib/courseMappings';
import { courseDetailsFromCSV } from '@/app/lib/courseDetailsFromCSV';
import { getCoursePreviewUrl } from '@/app/lib/coursePreviewUrls';
import { courseImageMapping } from '@/app/lib/courseImages';
import Footer from '@/components/Footer';
import Modal from '@/components/Modal';
import NavigationHeader from '@/components/NavigationHeader';
import EmailGateModal from '@/components/EmailGateModal';
import ViewportContainer from '@/components/ViewportContainer';
import { useAnalytics } from '@/hooks/useAnalytics';
import ShareButton from '@/components/ShareButton';

interface UserProfile {
  role: string;
  challenge: string;
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

const getToolVisual = (toolId: string): React.ReactElement => {
  const visuals: { [key: string]: React.ReactElement } = {
    't1': ( // Team Charter
      <img src="/tool-icons/map-icon.png" alt="Team Charter" className="w-full h-full object-contain p-2" />
    ),
    't2': ( // Change Style Assessment (primary change tool)
      <img src="/tool-icons/kite-icon.png" alt="Change Style Assessment" className="w-full h-full object-contain p-2" />
    ),
    't2b': ( // Change Readiness Assessment (secondary change tool)
      <img src="/tool-icons/kite-icon.png" alt="Change Readiness Assessment" className="w-full h-full object-contain p-2" />
    ),
    't3': ( // Trust Audit
      <img src="/tool-icons/compass-icon.png" alt="Trust Audit" className="w-full h-full object-contain p-2" />
    ),
    't4': ( // Coaching Cards
      <img src="/tool-icons/tools-icon.png" alt="Coaching Cards" className="w-full h-full object-contain p-2" />
    ),
    't5': ( // Decision Making Audit
      <img src="/tool-icons/submarine-icon.png" alt="Decision Making Audit" className="w-full h-full object-contain p-2" />
    ),
    't6': ( // Burnout Assessment
      <img src="/tool-icons/lantern-icon.png" alt="Burnout Assessment" className="w-full h-full object-contain p-2" />
    ),
    't7': ( // User Guide
      <img src="/tool-icons/hammock-icon.png" alt="User Guide" className="w-full h-full object-contain p-2" />
    ),
    't8': ( // Expectations Reflection
      <img src="/tool-icons/plant-icon.png" alt="Expectations Reflection" className="w-full h-full object-contain p-2" />
    ),
    't9': ( // Drivers Reflection
      <img src="/tool-icons/moon-icon.png" alt="Drivers Reflection" className="w-full h-full object-contain p-2" />
    )
  };
  
  return visuals[toolId] || visuals['t1'];
};

const getChallengeVisual = (challengeId: string): React.ReactElement => {
  const visuals: { [key: string]: React.ReactElement } = {
    // Purpose + Direction (maps to Team Canvas - t1)
    'c1': (
      <img src="/tool-icons/map-icon.png" alt="Purpose + Direction" className="w-full h-full object-contain p-2" />
    ),
    // Navigating Change (maps to Change Readiness Assessment - t2)
    'c2': (
      <img src="/tool-icons/kite-icon.png" alt="Navigating Change" className="w-full h-full object-contain p-2" />
    ),
    // Trust + Psychological Safety / Feedback + Trust (maps to Team Trust Audit - t3)
    'c3': (
      <img src="/tool-icons/compass-icon.png" alt="Trust + Psychological Safety" className="w-full h-full object-contain p-2" />
    ),
    // Empowering Others / Leadership Effectiveness (maps to Coaching Questions Card Deck - t4)
    'c4': (
      <img src="/tool-icons/tools-icon.png" alt="Empowering Others" className="w-full h-full object-contain p-2" />
    ),
    // Effective Decision Making (maps to Decision Filter Framework - t5)
    'c5': (
      <img src="/tool-icons/submarine-icon.png" alt="Effective Decision Making" className="w-full h-full object-contain p-2" />
    ),
    // Well-Being + Resilience / Well-Being (maps to Burnout Assessment - t6)
    'c6': (
      <img src="/tool-icons/lantern-icon.png" alt="Well-Being + Resilience" className="w-full h-full object-contain p-2" />
    ),
    // Communication and Collaboration (maps to Working with Me Guide - t7)
    'c7': (
      <img src="/tool-icons/hammock-icon.png" alt="Communication and Collaboration" className="w-full h-full object-contain p-2" />
    ),
    // Role Clarity + Expectations / Clarity + Expectations (maps to Hopes, Fears, Expectations Template - t8)
    'c8': (
      <img src="/tool-icons/plant-icon.png" alt="Role Clarity + Expectations" className="w-full h-full object-contain p-2" />
    ),
    // Growth + Development / Skill Building (maps to Career Drivers Exercise - t9)
    'c9': (
      <img src="/tool-icons/moon-icon.png" alt="Growth + Development" className="w-full h-full object-contain p-2" />
    )
  };
  
  // Extract the challenge type (c1-c9) from the full challenge ID
  const challengeType = challengeId.split('-')[1];
  return visuals[challengeType] || visuals['c1'];
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
    's30': <svg viewBox="0 0 64 48" className="w-full h-full"><path d="M16 12 L16 36 M32 12 L32 36 M48 12 L48 36" stroke="#c084fc" strokeWidth="2" opacity="0.3"/><circle cx="16" cy="20" r="3" fill="#9333ea"/><circle cx="32" cy="28" r="3" fill="#9333ea"/><circle cx="48" cy="24" r="3" fill="#9333ea"/></svg>,
    's31': <svg viewBox="0 0 64 48" className="w-full h-full"><circle cx="20" cy="24" r="6" fill="#60a5fa" opacity="0.5"/><circle cx="32" cy="24" r="6" fill="#3b82f6" opacity="0.7"/><circle cx="44" cy="24" r="6" fill="#1e40af"/></svg>,
    's32': <svg viewBox="0 0 64 48" className="w-full h-full"><path d="M32 12 L44 24 L32 36 L20 24 Z" fill="#f472b6" opacity="0.3"/><path d="M32 18 L38 24 L32 30 L26 24 Z" fill="#ec4899"/></svg>,
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

function ToolsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const analytics = useAnalytics();
  
  const [currentScreen, setCurrentScreen] = useState(1);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    role: '',
    challenge: ''
  });
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Handle returning from courses page
  useEffect(() => {
    const screenParam = searchParams.get('screen');
    if (screenParam === '4') {
      // Try to restore saved state
      const savedProfile = localStorage.getItem('toolsUserProfile');
      const savedChallenges = localStorage.getItem('toolsSelectedChallenges');
      
      if (savedProfile && savedChallenges) {
        setUserProfile(JSON.parse(savedProfile));
        setSelectedChallenges(JSON.parse(savedChallenges));
        setCurrentScreen(4);
      }
    }
  }, [searchParams]);

  const roles = [
    { id: 'People Leader', name: 'Manager', icon: Users },
    { id: 'Talent Leader', name: 'Talent/HR Leader', icon: Briefcase },
    { id: 'Individual Contributor', name: 'Individual Contributor', icon: User }
  ];

  const allChallenges = [
    // People Leader challenges
    { id: 'p1-c1', persona: 'People Leader', title: 'Purpose + Alignment', description: 'Help your team understand the bigger picture and stay focused on what matters most.' },
    { id: 'p1-c2', persona: 'People Leader', title: 'Navigating Change', description: 'Support your team through uncertainty, transitions, and shifting priorities.' },
    { id: 'p1-c3', persona: 'People Leader', title: 'Building Trust', description: 'Build stronger relationships by following through, showing up, and creating a culture of mutual respect.' },
    { id: 'p1-c4', persona: 'People Leader', title: 'Coaching Others', description: 'Act as a coach by asking better questions, offering support, and guiding (not solving) your team\'s challenges.' },
    { id: 'p1-c5', persona: 'People Leader', title: 'Decision Making', description: 'Strengthen your team\'s ability to make smart, timely, and aligned decisions.' },
    { id: 'p1-c6', persona: 'People Leader', title: 'Well-Being + Resilience', description: 'Help your team manage stress, avoid burnout, and stay grounded under pressure.' },
    { id: 'p1-c7', persona: 'People Leader', title: 'Communication + Collaboration', description: 'Communicate clearly, run better meetings, and foster strong team collaboration.' },
    { id: 'p1-c8', persona: 'People Leader', title: 'Expectations + Role Clarity', description: 'Set clear goals, define responsibilities, and reduce confusion or overlap.' },
    { id: 'p1-c9', persona: 'People Leader', title: 'Growth + Development', description: 'Support your team\'s growth with feedback, stretch opportunities, and development plans.' },
    
    // Talent Leader challenges
    { id: 'p2-c1', persona: 'Talent Leader', title: 'Purpose + Alignment', description: 'Help the organization understand its bigger picture and create systems that keep teams focused on what matters most.' },
    { id: 'p2-c2', persona: 'Talent Leader', title: 'Navigating Change', description: 'Design and implement support systems to help teams through uncertainty, transitions, and shifting priorities.' },
    { id: 'p2-c3', persona: 'Talent Leader', title: 'Building Trust', description: 'Foster a culture where relationships thrive through accountability, consistency, and mutual respect at scale.' },
    { id: 'p2-c4', persona: 'Talent Leader', title: 'Coaching Others', description: 'Equip leaders to act as coaches by teaching them to ask better questions and guide (not solve) their teams\' challenges.' },
    { id: 'p2-c5', persona: 'Talent Leader', title: 'Decision Making', description: 'Build organizational capability to make smart, timely, and aligned decisions at every level.' },
    { id: 'p2-c6', persona: 'Talent Leader', title: 'Well-Being + Resilience', description: 'Create programs and policies that help employees manage stress, avoid burnout, and stay grounded under pressure.' },
    { id: 'p2-c7', persona: 'Talent Leader', title: 'Communication + Collaboration', description: 'Develop systems for clear communication, effective meetings, and strong cross-functional collaboration.' },
    { id: 'p2-c8', persona: 'Talent Leader', title: 'Expectations + Role Clarity', description: 'Design frameworks for clear goals, well-defined responsibilities, and reduced confusion or overlap across teams.' },
    { id: 'p2-c9', persona: 'Talent Leader', title: 'Growth + Development', description: 'Build scalable programs for feedback, stretch opportunities, and development plans that drive organizational growth.' },
    
    // Individual Contributor challenges
    { id: 'p3-c1', persona: 'Individual Contributor', title: 'Purpose + Alignment', description: 'Understand how your work connects to the bigger picture and stay focused on what matters most.' },
    { id: 'p3-c2', persona: 'Individual Contributor', title: 'Navigating Change', description: 'Build your resilience and adaptability to thrive through uncertainty, transitions, and shifting priorities.' },
    { id: 'p3-c3', persona: 'Individual Contributor', title: 'Building Trust', description: 'Strengthen relationships with colleagues by following through, showing up, and contributing to mutual respect.' },
    { id: 'p3-c4', persona: 'Individual Contributor', title: 'Self-Leadership', description: 'Take ownership of your work, ask better questions, and find solutions while knowing when to seek guidance.' },
    { id: 'p3-c5', persona: 'Individual Contributor', title: 'Decision Making', description: 'Develop your ability to make smart, timely decisions that align with team and organizational goals.' },
    { id: 'p3-c6', persona: 'Individual Contributor', title: 'Well-Being + Resilience', description: 'Learn to manage stress, avoid burnout, and stay grounded under pressure while maintaining performance.' },
    { id: 'p3-c7', persona: 'Individual Contributor', title: 'Communication + Collaboration', description: 'Communicate clearly, participate effectively in meetings, and build strong working relationships with your team.' },
    { id: 'p3-c8', persona: 'Individual Contributor', title: 'Expectations + Role Clarity', description: 'Get clear on goals, understand your responsibilities, and navigate any confusion or overlap in your role.' },
    { id: 'p3-c9', persona: 'Individual Contributor', title: 'Growth + Development', description: 'Pursue feedback, seek stretch opportunities, and create your own development plan to advance your career.' }
  ];

  const challenges = allChallenges.filter(challenge => challenge.persona === userProfile.role);

  const getRecommendations = () => {
    if (selectedChallenges.length === 0) {
      return { tools: [], courses: [] };
    }
    
    const toolMappings: { [key: string]: Tool } = {
      'c1': { id: 't1', name: 'Team Charter', type: 'guide', description: 'Map your team\'s purpose, composition, and growth opportunities' },
      'c2': { id: 't2', name: 'Change Style Assessment', type: 'assessment', description: 'Discover how you naturally respond to change and get personalized strategies' },
      'c3': { id: 't3', name: 'Trust Audit', type: 'assessment', description: 'Evaluate and strengthen trust within your team' },
      'c4': { id: 't4', name: 'Coaching Cards', type: 'guide', description: 'Powerful questions to empower and develop others' },
      'c5': { id: 't5', name: 'Decision Making Audit', type: 'guide', description: 'Make better decisions with a structured approach' },
      'c6': { id: 't6', name: 'Burnout Assessment', type: 'assessment', description: 'Identify and address signs of burnout' },
      'c7': { id: 't7', name: 'User Guide', type: 'guide', description: 'Share your work style and improve collaboration' },
      'c8': { id: 't8', name: 'Expectations Reflection', type: 'guide', description: 'Create clarity through open dialogue about expectations' },
      'c9': { id: 't9', name: 'Drivers Reflection', type: 'reflection', description: 'Explore what motivates your team members and support the ways they want to grow in their role.' }
    };

    // Use the shared course mappings
    const courseMappings = challengeCourseMappings;

    // Get tools based on selected challenges in priority order
    const tools: Tool[] = [];
    const toolsAdded = new Set<string>();
    
    selectedChallenges.forEach(challengeId => {
      const challengeType = challengeId.split('-')[1];
      const tool = toolMappings[challengeType];
      if (tool && !toolsAdded.has(tool.id)) {
        tools.push(tool);
        toolsAdded.add(tool.id);
      }
    });

    // Get courses using round-robin from each challenge's priority list
    const courses: Course[] = [];
    const coursesAdded = new Set<string>();
    const maxCourses = 6;
    let courseIndex = 0;
    
    // Keep looping until we have 6 courses or run out of options
    while (courses.length < maxCourses && courseIndex < 6) {
      for (const challengeId of selectedChallenges) {
        if (courses.length >= maxCourses) break;
        
        const challengeType = challengeId.split('-')[1];
        const challengeCourses = courseMappings[challengeType] || [];
        
        if (courseIndex < challengeCourses.length) {
          const course = challengeCourses[courseIndex];
          if (!coursesAdded.has(course.id)) {
            courses.push(course);
            coursesAdded.add(course.id);
          }
        }
      }
      courseIndex++;
    }

    return { tools, courses };
  };

  // Loading effect (2 seconds)
  useEffect(() => {
    if (currentScreen === 3) {
      setLoadingProgress(0); // Reset progress when entering screen 3
      
      // Start the animation after a brief delay to ensure smooth start
      const startDelay = setTimeout(() => {
        const totalDuration = 2000; // 2 seconds
        const intervalDuration = 20; // Update every 20ms for smoother animation
        const increment = 100 / (totalDuration / intervalDuration);
        
        const interval = setInterval(() => {
          setLoadingProgress(prev => {
            const newProgress = prev + increment;
            if (newProgress >= 100) {
              clearInterval(interval);
              // Save state before moving to screen 4
              localStorage.setItem('toolsUserProfile', JSON.stringify(userProfile));
              localStorage.setItem('toolsSelectedChallenges', JSON.stringify(selectedChallenges));
              
              // Track recommendations shown
              const recommendations = getRecommendations();
              analytics.trackToolRecommendation(
                recommendations.tools.map(t => t.name),
                selectedChallenges.map(id => {
                  const challenge = challenges.find(c => c.id === id);
                  return challenge?.title || id;
                })
              );
              
              // Show email gate instead of going directly to screen 4
              setTimeout(() => {
                setCurrentScreen(4); // Show results screen in background
                setShowEmailGate(true); // Show email modal on top
              }, 300);
              return 100;
            }
            return newProgress;
          });
        }, intervalDuration);
        
        return () => clearInterval(interval);
      }, 100); // Small delay to ensure smooth start
      
      return () => clearTimeout(startDelay);
    }
  }, [currentScreen, userProfile, selectedChallenges]);

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
      // Clear challenge selections when going back from challenge screen
      if (currentScreen === 2) {
        setSelectedChallenges([]);
      }
      setCurrentScreen(prev => prev - 1);
      setIsTransitioning(false);
    }, 300);
  };

  const handleBackToChallenge = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedChallenges([]); // Clear previous selections
      setCurrentScreen(2); // Go directly to challenge selection
      setIsTransitioning(false);
    }, 300);
  };

  const handleChallengeSelect = (challenge: Challenge) => {
    setSelectedChallenges(prev => {
      const isSelected = prev.includes(challenge.id);
      if (isSelected) {
        analytics.trackAction('Challenge Deselected', { 
          challenge: challenge.title,
          challenge_id: challenge.id,
          role: userProfile.role
        });
        return prev.filter(id => id !== challenge.id);
      } else if (prev.length < 5) {
        analytics.trackAction('Challenge Selected', { 
          challenge: challenge.title,
          challenge_id: challenge.id,
          role: userProfile.role,
          selection_count: prev.length + 1
        });
        return [...prev, challenge.id];
      }
      return prev;
    });
  };

  const handleChallengesNext = () => {
    if (selectedChallenges.length === 0) return;
    
    // Track challenge selection completion
    const selectedChallengeNames = selectedChallenges.map(id => {
      const challenge = challenges.find(c => c.id === id);
      return challenge?.title || id;
    });
    
    analytics.trackChallengeSelection(selectedChallengeNames, userProfile.role);
    
    // For now, just use the first selected challenge for the flow
    const firstChallengeId = selectedChallenges[0];
    const firstChallenge = challenges.find(c => c.id === firstChallengeId);
    if (firstChallenge) {
      setSelectedChallenge(firstChallenge);
      setUserProfile(prev => ({ ...prev, challenge: firstChallenge.title }));
    }
    setLoadingProgress(0); // Reset progress before transitioning
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentScreen(3); // Skip directly to loading screen
      setIsTransitioning(false);
    }, 300);
  };

  const getSvgString = (element: React.ReactElement): string => {
    const svgElement = element.props as Record<string, any>;
    const attributes = Object.entries(svgElement)
      .filter(([key]) => key !== 'children')
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
    
    const renderChildren = (children: any): string => {
      if (!children) return '';
      if (typeof children === 'string') return children;
      if (Array.isArray(children)) {
        return children.map(child => renderChildren(child)).join('');
      }
      if (children && typeof children === 'object' && 'props' in children) {
        const childAttrs = Object.entries(children.props as Record<string, any>)
          .filter(([key]) => key !== 'children')
          .map(([key, value]) => `${key}="${value}"`)
          .join(' ');
        return `<${children.type} ${childAttrs}>${renderChildren(children.props.children)}</${children.type}>`;
      }
      return '';
    };
    
    return `<svg ${attributes}>${renderChildren(svgElement.children)}</svg>`;
  };

  const handleEmailSubmit = async (email: string, name?: string) => {
    setUserEmail(email);
    setShowEmailGate(false);
    
    // Save user info to localStorage for other tools
    localStorage.setItem('campfire_user_email', email);
    if (name) {
      localStorage.setItem('campfire_user_name', name);
    }
    const selectedRole = roles.find(r => r.id === userProfile.role);
    if (selectedRole?.name) {
      localStorage.setItem('campfire_user_role', selectedRole.name);
    }
    
    // Track conversion
    analytics.trackAction('Email Captured', {
      from_page: 'personal_development_plan',
      has_name: !!name
    });
    
    // Send to our API
    try {
      const recommendations = getRecommendations();
      
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          source: 'personal-development-plan',
          metadata: {
            userRole: selectedRole?.name || userProfile.role,
            selectedChallenges: selectedChallenges.map(id => {
              const challenge = challenges.find(c => c.id === id);
              return challenge?.title || id;
            }),
            recommendedTools: recommendations.tools.map(t => t.name),
            recommendedCourses: recommendations.courses.slice(0, 3).map(c => c.title)
          }
        })
      });
    } catch (error) {
      console.error('Failed to save lead:', error);
      // Don't block the user experience if lead capture fails
    }
  };
  
  const handleEmailSkip = () => {
    setShowEmailGate(false);
    analytics.trackAction('Email Gate Skipped', {
      from_page: 'personal_development_plan'
    });
  };

  const handleShare = async () => {
    const recommendations = getRecommendations();
    const shareData = {
      type: 'personal-development-plan',
      title: 'Personal Development Plan',
      role: userProfile.role,
      selectedChallenges,
      challenges: selectedChallenges.map(id => {
        const challenge = challenges.find(c => c.id === id);
        return challenge || { id, title: 'Unknown Challenge', description: '' };
      }),
      recommendations,
      createdAt: new Date().toISOString()
    };

    const response = await fetch('/api/share', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shareData)
    });

    if (!response.ok) {
      throw new Error('Failed to create share link');
    }

    const { url } = await response.json();
    const fullUrl = `${window.location.origin}${url}`;
    setShareUrl(fullUrl);
    
    // Track share event
    analytics.trackShare('Personal Development Plan', 'link', {
      role: userProfile.role,
      challenges: selectedChallenges,
      tools_count: recommendations.tools.length,
      courses_count: recommendations.courses.length
    });
    
    return fullUrl;
  };

  const handlePrint = () => {
    // Track print action
    analytics.trackAction('Print Clicked', {
      type: 'personal-development-plan',
      role: userProfile.role,
      challenges: selectedChallenges,
      tools_count: getRecommendations().tools.length,
      courses_count: getRecommendations().courses.length
    });
    
    // Create a print-friendly version
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const recommendations = getRecommendations();
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Your Personalized Development Plan</title>
        <style>
          @page {
            size: A4;
            margin: 20mm;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .page-background {
            background: linear-gradient(to bottom right, #faf5ff, #fdf4ff, #faf5ff);
            min-height: 100vh;
            padding: 20px;
          }
          
          .header {
            text-align: center;
            margin-bottom: 40px;
          }
          
          .logo {
            height: 50px;
            margin-bottom: 20px;
          }
          
          h1 {
            font-size: 28px;
            margin: 10px 0;
          }
          
          .role {
            color: #666;
            font-size: 16px;
            margin-bottom: 30px;
          }
          
          .challenges-header {
            text-transform: uppercase;
            font-size: 12px;
            color: #999;
            letter-spacing: 1px;
            margin-bottom: 15px;
          }
          
          .challenges {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            justify-content: center;
            margin-bottom: 20px;
          }
          
          .challenge-badge {
            background: #8b5cf6;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
          }
          
          .challenge-number {
            font-weight: bold;
            margin-right: 5px;
          }
          
          .summary {
            text-align: center;
            color: #666;
            margin-bottom: 40px;
          }
          
          .divider {
            width: 120px;
            height: 4px;
            background: linear-gradient(to right, #A14ED0, #EB6593);
            margin: 40px auto;
            border-radius: 2px;
            box-shadow: 0 2px 4px rgba(168, 85, 247, 0.2);
          }
          
          .section {
            margin-bottom: 40px;
            page-break-inside: avoid;
          }
          
          .section-header {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 10px;
          }
          
          .section-icon {
            width: 40px;
            height: 40px;
            background: #e9d5ff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #8b5cf6;
          }
          
          h2 {
            font-size: 22px;
            margin: 0;
          }
          
          .section-subtitle {
            color: #666;
            margin-left: 55px;
            margin-bottom: 20px;
          }
          
          .card {
            background: #fefefe;
            border: 1px solid #e9d5ff;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 15px;
            page-break-inside: avoid;
            position: relative;
            box-shadow: 0 1px 3px rgba(139, 92, 246, 0.1);
          }
          
          .priority-badge {
            position: absolute;
            top: -10px;
            left: -10px;
            width: 30px;
            height: 30px;
            background: #8b5cf6;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          
          .card-content {
            display: flex;
            gap: 20px;
          }
          
          .card-icon {
            width: 80px;
            height: 60px;
            background: white;
            border-radius: 8px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          
          .card-icon svg {
            width: 100%;
            height: 100%;
          }
          
          .card-text h3 {
            margin: 0 0 5px 0;
            font-size: 18px;
          }
          
          .card-text p {
            margin: 0;
            color: #666;
            font-size: 14px;
          }
          
          .programs-section {
            page-break-before: always;
          }
          
          .footer {
            text-align: center;
            color: #999;
            font-size: 12px;
            margin-top: 60px;
          }
        </style>
      </head>
      <body>
        <div class="page-background">
          <div class="header">
          <img src="/campfire-logo-new.png" alt="Campfire" class="logo" />
          <h1>Your Personalized Development Plan</h1>
          <div class="role">${userProfile.role}</div>
        </div>
        
        <div class="challenges-header">BASED ON YOUR TOP CHALLENGES</div>
        <div class="challenges">
          ${selectedChallenges.map((id, index) => {
            const challenge = challenges.find(c => c.id === id);
            return `<div class="challenge-badge"><span class="challenge-number">${index + 1}</span> ${challenge?.title || ''}</div>`;
          }).join('')}
        </div>
        
        <div class="summary">
          We've crafted a targeted plan with ${recommendations.tools.length} tools and ${recommendations.courses.length} programs to help you overcome these challenges
        </div>
        
        <div class="divider"></div>
        
        <div class="section">
          <div class="section-header">
            <div class="section-icon">📌</div>
            <h2>Recommended Tools</h2>
          </div>
          <div class="section-subtitle">Quick wins to address your immediate needs</div>
          
          ${recommendations.tools.map((tool, index) => {
            const visual = getToolVisual(tool.id);
            const svgString = getSvgString(visual);
            return `
              <div class="card">
                <div class="priority-badge">${index + 1}</div>
                <div class="card-content">
                  <div class="card-icon">${svgString}</div>
                  <div class="card-text">
                    <h3>${tool.name}</h3>
                    <p>${tool.description}</p>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        
        <div class="section programs-section">
          <div class="section-header">
            <div class="section-icon">📚</div>
            <h2>Development Programs</h2>
          </div>
          <div class="section-subtitle">In-depth learning to build lasting capabilities</div>
          
          ${recommendations.courses.slice(0, 5).map(course => {
            const visual = getCourseVisual(course.id);
            const svgString = getSvgString(visual);
            return `
              <div class="card">
                <div class="card-content">
                  <div class="card-text" style="flex: 1;">
                    <h3>${course.title}</h3>
                    <p>${course.description}</p>
                  </div>
                  <div class="card-icon">${svgString}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        
          <div class="footer">
            Generated by Campfire
          </div>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      }, 250);
    };
  };

  // Screen 1: Role Selection (with nice dropdown)
  if (currentScreen === 1) {
    return (
      <div className="bg-custom-gradient-diagonal">
        <ViewportContainer className="flex items-center justify-center px-4 py-8 pb-24 sm:pb-8">
          <div className="w-full max-w-2xl mx-auto text-center text-white">
            <div className="flex items-center justify-center gap-3 mb-6">
              <img 
                src="/campfire-logo-white.png"
                alt="Campfire Logo"
                className="h-12 sm:h-14 md:h-16"
              />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Solve your biggest leadership and team challenges—starting now.</h2>
            <p className="text-base sm:text-lg md:text-xl text-purple-100 mb-8 sm:mb-12 md:mb-16 px-2">
              This interactive hub gives you instant access to tools, workshops, and personalized recommendations to help you lead better, align your team, and build a culture that performs. Simply answer a few quick questions and we'll match you with solutions that fit your needs.
            </p>
            
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8">What is your role?</h2>
              
              <div className="flex flex-col gap-4 mb-8">
                {/* Top row - Manager centered */}
                <div className="flex justify-center">
                  {roles.slice(0, 1).map((role) => {
                    const Icon = role.icon;
                    const isSelected = userProfile.role === role.id;
                    return (
                      <button
                        key={role.id}
                        onClick={() => {
                          setUserProfile(prev => ({ ...prev, role: role.id }));
                          analytics.trackAction('Role Selected', { role: role.id });
                        }}
                        className={`p-6 rounded-xl border-2 transition-all w-full max-w-[240px] ${
                          isSelected
                            ? 'bg-white/30 border-white shadow-lg'
                            : 'bg-white/10 border-white/30 hover:bg-white/20 hover:border-white/50'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-3">
                          <div className={`p-3 rounded-full ${
                            isSelected ? 'bg-white/30' : 'bg-white/20'
                          }`}>
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="font-semibold text-white text-lg">{role.name}</h3>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {/* Bottom row - Two roles */}
                <div className="grid grid-cols-2 gap-4">
                  {roles.slice(1).map((role) => {
                    const Icon = role.icon;
                    const isSelected = userProfile.role === role.id;
                    return (
                      <button
                        key={role.id}
                        onClick={() => {
                          setUserProfile(prev => ({ ...prev, role: role.id }));
                          analytics.trackAction('Role Selected', { role: role.id });
                        }}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'bg-white/30 border-white shadow-lg'
                            : 'bg-white/10 border-white/30 hover:bg-white/20 hover:border-white/50'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-3">
                          <div className={`p-3 rounded-full ${
                            isSelected ? 'bg-white/30' : 'bg-white/20'
                          }`}>
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="font-semibold text-white text-lg">{role.name}</h3>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <button
                  onClick={handleNext}
                  disabled={!userProfile.role}
                  className="w-full py-3 sm:py-4 bg-white text-iris-500 rounded-xl font-semibold hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg"
                >
                  NEXT
                </button>
              </div>
            </div>
          </div>
        </ViewportContainer>
      </div>
    );
  }

  // Screen 2: Challenge Selection (9 role-specific challenges)
  if (currentScreen === 2) {
    return (
      <>
        <ViewportContainer className="bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50">
          <NavigationHeader
            onBack={handleBack}
            backLabel="Back"
            variant="dark"
          />
          
          <div className="container mx-auto px-6 py-16">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-4xl font-bold text-nightfall mb-6">
                What are your biggest challenges as a {roles.find(r => r.id === userProfile.role)?.name || userProfile.role}?
              </h2>
            <p className="text-lg text-gray-600">
              Select up to 5 challenges ({selectedChallenges.length}/5 selected)
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {challenges.map((challenge) => {
              const isSelected = selectedChallenges.includes(challenge.id);
              const selectionIndex = selectedChallenges.indexOf(challenge.id);
              return (
                <button
                  key={challenge.id}
                  onClick={() => handleChallengeSelect(challenge)}
                  className={`relative p-6 text-left rounded-xl border-2 transition-all ${
                    isSelected 
                      ? 'bg-purple-50 border-purple-500 shadow-lg' 
                      : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-lg'
                  }`}
                >
                  {/* Selection number badge */}
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-iris-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {selectionIndex + 1}
                    </div>
                  )}
                  
                  <div className="flex items-stretch gap-4">
                    <div className="flex-1">
                      <h4 className={`text-xl font-semibold mb-2 ${isSelected ? 'text-iris-700' : 'text-nightfall'}`}>
                        {challenge.title}
                      </h4>
                      <p className={`text-base ${isSelected ? 'text-iris-500' : 'text-gray-600'}`}>
                        {challenge.description}
                      </p>
                    </div>
                    
                    {/* Full height illustration on the right */}
                    <div className="w-24 rounded-lg flex-shrink-0 overflow-hidden bg-white">
                      {getChallengeVisual(challenge.id)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleChallengesNext}
              disabled={selectedChallenges.length === 0}
              className="px-8 py-3 bg-iris-500 text-white rounded-lg font-semibold hover:bg-iris-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              NEXT
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </ViewportContainer>
      <Footer />
      </>
    );
  }

  // Screen 3: Loading State (3 seconds)
  if (currentScreen === 3) {
    return (
      <ViewportContainer className="bg-gray-50 flex items-center justify-center">
        <div className="max-w-lg mx-auto text-center px-6">
          <div className="bg-white rounded-2xl p-12 shadow-lg">
            <div className="mb-6">
              <img 
                src="/campfire-logo-new.png"
                alt="Campfire Logo"
                className="h-12 mx-auto mb-6 opacity-80"
              />
            </div>
            
            <h2 className="text-3xl font-bold text-nightfall mb-12">
              Building your personalized development plan
            </h2>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div 
                className={`bg-custom-gradient h-3 rounded-full ${loadingProgress > 0 ? 'transition-all duration-300 ease-out' : ''}`}
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            
            <p className="text-sm text-gray-500">Creating your custom recommendations...</p>
          </div>
        </div>
      </ViewportContainer>
    );
  }

  // Screen 4: Recommendations
  if (currentScreen === 4) {
    const recommendations = getRecommendations();
    
    return (
      <>
        <ViewportContainer className="bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50 print:bg-white">
          <NavigationHeader
            onBack={handleBackToChallenge}
            backLabel="Back"
            variant="dark"
            className="print:hidden"
            rightActions={[
                { 
                  type: 'share', 
                  onClick: handleShare,
                  variant: 'secondary'
                },
                { 
                  type: 'print', 
                  onClick: handlePrint,
                  variant: 'secondary'
                },
                { 
                  type: 'custom',
                  label: 'Book a Demo',
                  onClick: () => window.open('https://calendly.com/getcampfire/demo', '_blank'),
                  variant: 'primary'
                }
              ]}
            />
          
          <div className="container mx-auto px-6 py-16">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
              
              {/* Print-only header with logo */}
              <div className="hidden print:block mb-8">
                <img 
                  src="/campfire-logo-new.png"
                  alt="Campfire Logo"
                  className="h-12 mx-auto mb-6"
                />
              </div>
              
              <h2 className="text-4xl font-bold text-nightfall mb-8">
                Your Personalized Development Plan
              </h2>
              
              {/* Selected challenges display */}
              <div className="max-w-3xl mx-auto">
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-4">Based on your top challenges</p>
                <div className="flex flex-wrap justify-center gap-3 mb-2">
                  {selectedChallenges.map((challengeId, index) => {
                    const challenge = challenges.find(c => c.id === challengeId);
                    if (!challenge) return null;
                    return (
                      <div 
                        key={challengeId} 
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-iris-700 rounded-full"
                      >
                        <span className="flex items-center justify-center w-5 h-5 bg-iris-500 text-white text-xs rounded-full font-bold">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium">{challenge.title}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-gray-600 text-sm mt-4">
                  We've crafted a targeted plan that includes tools and workshops to help you overcome these challenges.
                </p>
              </div>
            </div>

            {/* Visual separator */}
            <div className="w-24 h-1 bg-custom-gradient-horizontal mx-auto mb-12 rounded-full"></div>
          </div>

          {/* Recommended Tools Section */}
          <div className="max-w-4xl mx-auto mb-12 print:keep-with-next">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-iris-500" />
                </div>
                <h3 className="text-2xl font-bold text-nightfall">Recommended Tools</h3>
              </div>
              <p className="text-gray-600 ml-13">Simple, effective tools to help you tackle your challenges right away.</p>
            </div>
            
            <div className="grid gap-4">
                {recommendations.tools.map((tool, index) => {
                  const isClickable = tool.id === 't3' || tool.id === 't1' || tool.id === 't6' || tool.id === 't5' || tool.id === 't2' || tool.id === 't7' || tool.id === 't4' || tool.id === 't9' || tool.id === 't8'; // Trust Audit, Team Canvas, Burnout Assessment, Decision Making Audit, Change Style, Working with Me, Coaching Cards, Career Drivers, and Hopes Fears Expectations tools
                  const toolPath = tool.id === 't3' ? '/trust-audit' : tool.id === 't1' ? '/team-charter' : tool.id === 't6' ? '/burnout-assessment' : tool.id === 't5' ? '/decision-making-audit' : tool.id === 't2' ? '/change-style' : tool.id === 't7' ? '/user-guide' : tool.id === 't4' ? '/coaching-cards' : tool.id === 't9' ? '/drivers-reflection' : tool.id === 't8' ? '/expectations-reflection' : '';
                  
                  const toolContent = (
                    <>
                      {/* Priority number badge */}
                      <div className="absolute -top-2 -left-2 w-8 h-8 bg-iris-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {index + 1}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                        <div className="flex items-center gap-3 sm:gap-4 flex-1">
                          <div className="w-16 h-16 sm:w-24 sm:h-20 bg-white rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                            {getToolVisual(tool.id)}
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-nightfall mb-2">
                              {tool.name}
                            </h4>
                            <p className="text-sm sm:text-base text-gray-600">
                              {tool.description}
                            </p>
                          </div>
                        </div>
                        
                        {isClickable && (
                          <button className="w-full sm:w-auto mt-3 sm:mt-0 sm:ml-auto px-6 py-3 sm:py-2 bg-iris-500 text-white rounded-lg font-semibold text-sm uppercase tracking-wider hover:bg-iris-700 transition-colors flex-shrink-0">
                            START
                          </button>
                        )}
                      </div>
                    </>
                  );
                  
                  if (isClickable) {
                    return (
                      <a
                        key={tool.id}
                        href={toolPath}
                        onClick={() => analytics.trackAction('Tool Clicked', { 
                          tool_name: tool.name,
                          tool_id: tool.id,
                          from_challenges: selectedChallenges,
                          priority: index + 1
                        })}
                        className="group relative bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm print:avoid-break hover:shadow-xl hover:border-iris-500 hover:scale-[1.02] transition-all cursor-pointer"
                      >
                        {toolContent}
                      </a>
                    );
                  }
                  
                  return (
                    <div key={tool.id} className="relative bg-white rounded-xl border border-gray-200 p-6 shadow-sm print:avoid-break">
                      {toolContent}
                    </div>
                  );
                })}
              </div>
            </div>

          {/* Development Programs Section */}
          <div className="max-w-4xl mx-auto mb-12 print:keep-with-next print:mt-12">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-iris-500" />
                </div>
                <h3 className="text-2xl font-bold text-nightfall">Development Programs</h3>
              </div>
              <p className="text-gray-600 ml-13">Live, guided sessions designed to build key skills through a blend of learning, reflection, and peer connection.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.courses.slice(0, 6).map((course) => (
                  <div
                    key={course.id}
                    onClick={() => setSelectedCourse(course.id)}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer flex flex-col transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105"
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
                          {courseDetailsFromCSV[course.id]?.description || course.description}
                        </p>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <span className="block text-center text-sm font-medium text-iris group-hover:text-iris-dark transition-colors uppercase tracking-wider">
                          VIEW DETAILS
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="flex gap-4 justify-center print:hidden">
              <button 
                onClick={() => {
                  analytics.trackAction('Catalog Clicked', { 
                    from_challenges: selectedChallenges,
                    role: userProfile.role
                  });
                  router.push('/courses');
                }}
                className="px-8 py-3 border border-iris-500 text-iris-500 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
              >
                <span className="sm:hidden">CATALOG</span><span className="hidden sm:inline">EXPLORE CATALOG</span>
              </button>
              <button 
                onClick={() => {
                  analytics.trackAction('Demo Booked', { 
                    from_challenges: selectedChallenges,
                    role: userProfile.role
                  });
                  window.open('https://calendly.com/getcampfire/demo', '_blank');
                }}
                className="px-8 py-3 bg-iris-500 text-white rounded-lg font-semibold hover:bg-iris-700 transition-colors"
              >
                <span className="sm:hidden">DEMO</span><span className="hidden sm:inline">BOOK A DEMO</span>
              </button>
              </div>
            </div>
        </div>
      </ViewportContainer>
      
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
                      width={600}
                      height={450}
                      className="w-full h-auto"
                      priority={true}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  )}
                </div>
                
                {/* View in platform link */}
                <div className="text-center mt-6">
                  <p className="text-gray-600 text-sm mb-4">
                    See how the slides, script notes, and activities from this template come alive in our custom virtual classroom!
                  </p>
                  <a 
                    href={getCoursePreviewUrl(selectedCourse, courseDetailsFromCSV[selectedCourse].title)}
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
                      Take meaningful action on what you've learned to drive real impact in your role.
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
      
      <Footer />
      
      {/* Email Gate Modal */}
      <EmailGateModal
        isOpen={showEmailGate}
        onClose={() => setShowEmailGate(false)}
        onSubmit={handleEmailSubmit}
        onSkip={handleEmailSkip}
      />
      </>
    );
  }

  return (
    <ViewportContainer className="bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-nightfall">Loading...</h1>
      </div>
    </ViewportContainer>
  );
}

// Wrapper component to handle Suspense
export default function Page() {
  return (
    <Suspense fallback={
      <ViewportContainer className="bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-nightfall">Loading...</h1>
        </div>
      </ViewportContainer>
    }>
      <ToolsPage />
    </Suspense>
  );
}