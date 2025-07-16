'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, ArrowRight, ArrowLeft, Users, Target, BookOpen, Brain, MessageCircle, Heart, Download, TrendingUp } from 'lucide-react';

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

const getToolVisual = (toolId: string) => {
  const visuals: { [key: string]: JSX.Element } = {
    't1': ( // Purpose and Alignment Map
      <svg viewBox="0 0 128 96" className="w-full h-full">
        <circle cx="64" cy="48" r="32" fill="#fbbf24" opacity="0.2"/>
        <circle cx="64" cy="48" r="24" fill="#f59e0b" opacity="0.3"/>
        <circle cx="64" cy="48" r="16" fill="#f87171" opacity="0.4"/>
        <circle cx="64" cy="48" r="8" fill="#ef4444"/>
        <path d="M64 16 L64 80 M32 48 L96 48" stroke="#7c3aed" strokeWidth="2" strokeDasharray="4 2"/>
        <text x="64" y="52" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">WHY</text>
      </svg>
    ),
    't2': ( // Change Readiness Reflection
      <svg viewBox="0 0 128 96" className="w-full h-full">
        <path d="M32 48 Q64 16 96 48 T64 80" fill="none" stroke="#34d399" strokeWidth="4" opacity="0.5"/>
        <circle cx="32" cy="48" r="8" fill="#10b981"/>
        <circle cx="64" cy="32" r="8" fill="#34d399"/>
        <circle cx="96" cy="48" r="8" fill="#6ee7b7"/>
        <path d="M40 48 L56 32 M72 32 L88 48" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
        <rect x="52" y="60" width="24" height="4" fill="#10b981" rx="2"/>
        <rect x="48" y="68" width="32" height="4" fill="#34d399" opacity="0.6" rx="2"/>
      </svg>
    ),
    't3': ( // Team Trust Audit
      <svg viewBox="0 0 128 96" className="w-full h-full">
        <circle cx="40" cy="32" r="12" fill="#c084fc" opacity="0.4"/>
        <circle cx="88" cy="32" r="12" fill="#c084fc" opacity="0.4"/>
        <circle cx="64" cy="64" r="12" fill="#c084fc" opacity="0.4"/>
        <path d="M40 32 L88 32 L64 64 Z" fill="none" stroke="#9333ea" strokeWidth="2"/>
        <circle cx="40" cy="32" r="4" fill="#7c3aed"/>
        <circle cx="88" cy="32" r="4" fill="#7c3aed"/>
        <circle cx="64" cy="64" r="4" fill="#7c3aed"/>
        <path d="M52 40 Q64 48 76 40" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    't4': ( // Coaching Questions Card Deck
      <svg viewBox="0 0 128 96" className="w-full h-full">
        <rect x="24" y="24" width="40" height="56" fill="#60a5fa" opacity="0.3" rx="4" transform="rotate(-10 44 52)"/>
        <rect x="44" y="20" width="40" height="56" fill="#3b82f6" opacity="0.5" rx="4" transform="rotate(-5 64 48)"/>
        <rect x="64" y="16" width="40" height="56" fill="#1e40af" rx="4"/>
        <text x="84" y="36" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">?</text>
        <rect x="72" y="48" width="24" height="2" fill="white" rx="1"/>
        <rect x="72" y="54" width="24" height="2" fill="white" rx="1"/>
        <rect x="72" y="60" width="16" height="2" fill="white" rx="1"/>
      </svg>
    ),
    't5': ( // Decision Filter Framework
      <svg viewBox="0 0 128 96" className="w-full h-full">
        <path d="M32 24 L96 24 L80 48 L96 72 L32 72 L48 48 Z" fill="#f472b6" opacity="0.3"/>
        <path d="M48 24 L80 24 L72 48 L80 72 L48 72 L56 48 Z" fill="#ec4899" opacity="0.5"/>
        <circle cx="64" cy="48" r="8" fill="#be185d"/>
        <path d="M24 16 L24 80 M104 16 L104 80" stroke="#ec4899" strokeWidth="2" strokeDasharray="2 4"/>
        <path d="M64 40 L64 56 M56 48 L72 48" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    't6': ( // Burnout Assessment
      <svg viewBox="0 0 128 96" className="w-full h-full">
        <rect x="24" y="40" width="80" height="16" fill="#f87171" opacity="0.2" rx="8"/>
        <rect x="24" y="40" width="60" height="16" fill="#ef4444" opacity="0.4" rx="8"/>
        <rect x="24" y="40" width="40" height="16" fill="#dc2626" opacity="0.6" rx="8"/>
        <rect x="24" y="40" width="20" height="16" fill="#b91c1c" rx="8"/>
        <circle cx="44" cy="48" r="4" fill="white"/>
        <path d="M32 20 Q40 32 48 20" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
        <path d="M56 20 Q64 32 72 20" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round"/>
        <path d="M80 20 Q88 32 96 20" fill="none" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    't7': ( // Working with Me Guide
      <svg viewBox="0 0 128 96" className="w-full h-full">
        <rect x="32" y="16" width="64" height="64" fill="#34d399" opacity="0.2" rx="8"/>
        <circle cx="64" cy="40" r="16" fill="#10b981" opacity="0.5"/>
        <circle cx="64" cy="40" r="8" fill="#059669"/>
        <rect x="44" y="56" width="8" height="2" fill="#10b981" rx="1"/>
        <rect x="44" y="62" width="16" height="2" fill="#10b981" rx="1"/>
        <rect x="44" y="68" width="12" height="2" fill="#10b981" rx="1"/>
        <rect x="68" y="56" width="12" height="2" fill="#10b981" rx="1"/>
        <rect x="68" y="62" width="16" height="2" fill="#10b981" rx="1"/>
        <rect x="68" y="68" width="8" height="2" fill="#10b981" rx="1"/>
      </svg>
    ),
    't8': ( // Hopes, Fears, Expectations Template
      <svg viewBox="0 0 128 96" className="w-full h-full">
        <path d="M32 32 Q64 16 96 32" fill="none" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round"/>
        <path d="M32 48 Q64 64 96 48" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round"/>
        <path d="M32 64 Q64 48 96 64" fill="none" stroke="#f87171" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="32" cy="32" r="6" fill="#fbbf24"/>
        <circle cx="64" cy="48" r="6" fill="#f59e0b"/>
        <circle cx="96" cy="64" r="6" fill="#f87171"/>
        <text x="32" y="20" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">HOPES</text>
        <text x="64" y="36" textAnchor="middle" fill="#f87171" fontSize="10" fontWeight="bold">FEARS</text>
        <text x="96" y="52" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="bold">EXPECT</text>
      </svg>
    ),
    't9': ( // Career Drivers Exercise
      <svg viewBox="0 0 128 96" className="w-full h-full">
        <path d="M24 72 L24 24 M24 72 L104 72" stroke="#c084fc" strokeWidth="2"/>
        <path d="M32 64 L40 48 L48 56 L56 40 L64 44 L72 32 L80 36 L88 24 L96 28" fill="none" stroke="#9333ea" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="40" cy="48" r="4" fill="#7c3aed"/>
        <circle cx="56" cy="40" r="4" fill="#7c3aed"/>
        <circle cx="72" cy="32" r="4" fill="#7c3aed"/>
        <circle cx="88" cy="24" r="4" fill="#7c3aed"/>
        <path d="M88 24 L104 8" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" markerEnd="url(#arrowhead)"/>
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#7c3aed"/>
          </marker>
        </defs>
      </svg>
    )
  };
  
  return visuals[toolId] || visuals['t1'];
};

const getCourseVisual = (courseId: string) => {
  const visuals: { [key: string]: JSX.Element } = {
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
    's13': <svg viewBox="0 0 64 48" className="w-full h-full"><circle cx="24" cy="24" r="8" fill="#60a5fa" opacity="0.3"/><circle cx="40" cy="24" r="8" fill="#3b82f6" opacity="0.3"/></svg>,
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
  const [currentScreen, setCurrentScreen] = useState(1);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    role: '',
    challenge: ''
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
        { id: 's6', title: 'Inspire with Vision', description: 'Create shared understanding of organizational direction', duration: '2 weeks' },
        { id: 's15', title: 'Define Your Leadership Brand', description: 'Establish your unique leadership identity', duration: '3 weeks' },
        { id: 's25', title: 'Setting and Achieving Goals', description: 'Learn to set and cascade meaningful goals', duration: '2 weeks' },
        { id: 's37', title: 'Alignment & Momentum', description: 'Build alignment and maintain momentum', duration: '3 weeks' },
        { id: 's24', title: 'Strategic Thinking', description: 'Develop strategic thinking capabilities', duration: '3 weeks' }
      ],
      'c2': [
        { id: 's12', title: 'Lead Through Change', description: 'Master the art of change management', duration: '4 weeks' },
        { id: 's5', title: 'Habits for Resilience', description: 'Develop personal and team resilience', duration: '2 weeks' },
        { id: 's41', title: 'Leading with Compassion', description: 'Lead with empathy and compassion', duration: '3 weeks' },
        { id: 's39', title: 'Connected Leadership', description: 'Build connections that matter', duration: '3 weeks' },
        { id: 's18', title: 'Curiosity in Conversations', description: 'Foster curiosity in your interactions', duration: '2 weeks' }
      ],
      'c3': [
        { id: 's14', title: 'Build Trust on Your Team', description: 'Create psychological safety across teams', duration: '3 weeks' },
        { id: 's20', title: 'Foster Belonging', description: 'Create an inclusive environment', duration: '3 weeks' },
        { id: 's4', title: 'Deliberate Listening', description: 'Master the art of active listening', duration: '2 weeks' },
        { id: 's36', title: 'Candid Communication', description: 'Have honest, productive conversations', duration: '2 weeks' },
        { id: 's34', title: 'Hopes Fears and Expectations', description: 'Navigate team dynamics effectively', duration: '2 weeks' }
      ],
      'c4': [
        { id: 's10', title: 'Successful Delegation', description: 'Learn to delegate effectively and build capability', duration: '2 weeks' },
        { id: 's16', title: 'Activate Autonomy', description: 'Empower others to take ownership', duration: '3 weeks' },
        { id: 's17', title: 'Coaching Essentials', description: 'Develop coaching skills that empower others', duration: '3 weeks' },
        { id: 's21', title: 'Magnify Strengths', description: 'Identify and develop team strengths', duration: '3 weeks' },
        { id: 's19', title: 'Develop Your Team', description: 'Build capability across your team', duration: '3 weeks' }
      ],
      'c5': [
        { id: 's32', title: 'Decision Making', description: 'Make better decisions under pressure', duration: '2 weeks' },
        { id: 's24', title: 'Strategic Thinking', description: 'Think strategically about challenges', duration: '3 weeks' },
        { id: 's9', title: 'Self-Awareness', description: 'Develop deeper self-awareness', duration: '2 weeks' },
        { id: 's26', title: 'Lead Effective Meetings', description: 'Run meetings that drive decisions', duration: '2 weeks' },
        { id: 's31', title: 'Conscious Communication', description: 'Communicate with intention and clarity', duration: '2 weeks' }
      ],
      'c6': [
        { id: 's7', title: 'Manage Burnout', description: 'Prevent and address burnout', duration: '3 weeks' },
        { id: 's5', title: 'Habits for Resilience', description: 'Build sustainable resilience habits', duration: '2 weeks' },
        { id: 's2', title: 'Beat Imposter Syndrome', description: 'Overcome self-doubt and build confidence', duration: '2 weeks' },
        { id: 's8', title: 'Manage Your Time', description: 'Master time management strategies', duration: '2 weeks' },
        { id: 's1', title: 'Cultivating Gratitude', description: 'Practice gratitude for well-being', duration: '2 weeks' }
      ],
      'c7': [
        { id: 's31', title: 'Conscious Communication', description: 'Master clear and impactful communication', duration: '2 weeks' },
        { id: 's35', title: 'Collaborate Intentionally', description: 'Build effective collaboration practices', duration: '3 weeks' },
        { id: 's18', title: 'Curiosity in Conversations', description: 'Bring curiosity to every interaction', duration: '2 weeks' },
        { id: 's3', title: 'Constructive Conflict', description: 'Navigate conflict productively', duration: '2 weeks' },
        { id: 's4', title: 'Deliberate Listening', description: 'Listen with intention and presence', duration: '2 weeks' }
      ],
      'c8': [
        { id: 's13', title: 'Making the Most of 1:1\'s', description: 'Have impactful one-on-one conversations', duration: '2 weeks' },
        { id: 's34', title: 'Hopes Fears and Expectations', description: 'Create clarity through open dialogue', duration: '2 weeks' },
        { id: 's22', title: 'Performance Discussions', description: 'Navigate performance conversations effectively', duration: '2 weeks' },
        { id: 's23', title: 'Set The Tone', description: 'Establish clear team culture and norms', duration: '2 weeks' },
        { id: 's28', title: 'Deliver Feedback', description: 'Give feedback that drives growth', duration: '2 weeks' }
      ],
      'c9': [
        { id: 's30', title: 'Career Mapping', description: 'Create meaningful career development paths', duration: '3 weeks' },
        { id: 's19', title: 'Develop Your Team', description: 'Build skills and capabilities', duration: '3 weeks' },
        { id: 's17', title: 'Coaching Essentials', description: 'Coach others for growth', duration: '3 weeks' },
        { id: 's43', title: 'Live Group Coaching', description: 'Experience the power of group coaching', duration: '4 weeks' },
        { id: 's21', title: 'Magnify Strengths', description: 'Develop and leverage strengths', duration: '3 weeks' }
      ]
    };

    const tool = toolMappings[challengeType] || toolMappings['c1'];
    const courses = courseMappings[challengeType] || courseMappings['c1'];

    return { tools: [tool], courses };
  };

  useEffect(() => {
    if (currentScreen === 3) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setCurrentScreen(4), 500);
            return 100;
          }
          return prev + 3.33; // 100% / 30 intervals = 3.33% per interval
        });
      }, 100); // 100ms * 30 intervals = 3000ms = 3 seconds
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
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentScreen(3); // Jump to loading screen
      setIsTransitioning(false);
    }, 300);
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
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentScreen(3); // Jump to loading screen
      setIsTransitioning(false);
    }, 300);
  };

  const skipToTools = () => {
    setCurrentScreen(4);
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
              className="w-full p-4 rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-orange-400 mb-6 appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'><path fill='%23ffffff' d='M2 0L0 2h4zm0 5L0 3h4z'/></svg>")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '12px'
              }}
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

  if (currentScreen === 4) {
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
                  <div className="w-32 h-24 bg-white rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                    {getToolVisual(recommendations.tools[0].id)}
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
                {recommendations.courses.slice(0, 5).map((course) => (
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
                      <div className="w-16 h-12 bg-white rounded-lg flex items-center justify-center ml-6 overflow-hidden">
                        {getCourseVisual(course.id)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => router.push('/courses')}
                className="px-8 py-3 border border-purple-600 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
              >
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