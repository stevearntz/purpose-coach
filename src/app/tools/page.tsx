'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Flame, ArrowLeft, ArrowRight, Target, Printer, BookOpen } from 'lucide-react';
import { challengeCourseMappings } from '@/app/lib/courseMappings';
import Footer from '@/components/Footer';

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
    't1': ( // Purpose and Alignment Map
      <svg viewBox="0 0 128 96" className="w-full h-full">
        <circle cx="64" cy="48" r="32" fill="#fbbf24" opacity="0.2"/>
        <circle cx="64" cy="48" r="24" fill="#f59e0b" opacity="0.3"/>
        <circle cx="64" cy="48" r="16" fill="#f87171" opacity="0.4"/>
        <circle cx="64" cy="48" r="8" fill="#ef4444"/>
        <path d="M64 16 L64 80 M32 48 L96 48" stroke="#7c3aed" strokeWidth="2" strokeDasharray="4 2"/>
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
        <circle cx="84" cy="36" r="4" fill="white"/>
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

const getChallengeVisual = (challengeId: string): React.ReactElement => {
  const visuals: { [key: string]: React.ReactElement } = {
    // Purpose + Direction
    'c1': (
      <svg viewBox="0 0 96 72" className="w-full h-full">
        <circle cx="48" cy="36" r="24" fill="#fbbf24" opacity="0.2"/>
        <circle cx="48" cy="36" r="16" fill="#f59e0b" opacity="0.3"/>
        <circle cx="48" cy="36" r="8" fill="#f87171"/>
        <path d="M48 12 L48 60 M24 36 L72 36" stroke="#7c3aed" strokeWidth="2" strokeDasharray="3 2"/>
      </svg>
    ),
    // Navigating Change
    'c2': (
      <svg viewBox="0 0 96 72" className="w-full h-full">
        <path d="M24 36 Q48 12 72 36 T48 60" fill="none" stroke="#34d399" strokeWidth="3" opacity="0.5"/>
        <circle cx="24" cy="36" r="6" fill="#10b981"/>
        <circle cx="48" cy="24" r="6" fill="#34d399"/>
        <circle cx="72" cy="36" r="6" fill="#6ee7b7"/>
        <path d="M30 36 L42 24 M54 24 L66 36" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    // Trust + Psychological Safety / Feedback + Trust
    'c3': (
      <svg viewBox="0 0 96 72" className="w-full h-full">
        <circle cx="30" cy="24" r="10" fill="#c084fc" opacity="0.3"/>
        <circle cx="66" cy="24" r="10" fill="#c084fc" opacity="0.3"/>
        <circle cx="48" cy="48" r="10" fill="#c084fc" opacity="0.3"/>
        <path d="M30 24 L66 24 L48 48 Z" fill="none" stroke="#9333ea" strokeWidth="2"/>
        <path d="M36 30 Q48 36 60 30" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    // Empowering Others / Leadership Effectiveness
    'c4': (
      <svg viewBox="0 0 96 72" className="w-full h-full">
        <rect x="20" y="12" width="24" height="20" fill="#60a5fa" opacity="0.3" rx="2"/>
        <rect x="52" y="40" width="24" height="20" fill="#3b82f6" opacity="0.3" rx="2"/>
        <path d="M44 22 L52 50" stroke="#1e40af" strokeWidth="2"/>
        <circle cx="32" cy="22" r="4" fill="#3b82f6"/>
        <circle cx="64" cy="50" r="4" fill="#1e40af"/>
      </svg>
    ),
    // Effective Decision Making
    'c5': (
      <svg viewBox="0 0 96 72" className="w-full h-full">
        <path d="M24 18 L72 18 L60 36 L72 54 L24 54 L36 36 Z" fill="#f472b6" opacity="0.3"/>
        <circle cx="48" cy="36" r="6" fill="#ec4899"/>
        <path d="M48 30 L48 42 M42 36 L54 36" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    // Well-Being + Resilience / Well-Being
    'c6': (
      <svg viewBox="0 0 96 72" className="w-full h-full">
        <rect x="18" y="30" width="60" height="12" fill="#f87171" opacity="0.2" rx="6"/>
        <rect x="18" y="30" width="45" height="12" fill="#ef4444" opacity="0.4" rx="6"/>
        <rect x="18" y="30" width="30" height="12" fill="#dc2626" opacity="0.6" rx="6"/>
        <rect x="18" y="30" width="15" height="12" fill="#b91c1c" rx="6"/>
        <path d="M30 18 Q36 24 42 18" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
        <path d="M48 18 Q54 24 60 18" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    // Communication and Collaboration
    'c7': (
      <svg viewBox="0 0 96 72" className="w-full h-full">
        <circle cx="30" cy="36" r="8" fill="#60a5fa" opacity="0.3"/>
        <circle cx="66" cy="36" r="8" fill="#3b82f6" opacity="0.3"/>
        <path d="M38 36 L58 36" stroke="#1e40af" strokeWidth="2"/>
        <path d="M30 28 Q48 20 66 28" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round"/>
        <path d="M30 44 Q48 52 66 44" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    // Role Clarity + Expectations / Clarity + Expectations
    'c8': (
      <svg viewBox="0 0 96 72" className="w-full h-full">
        <rect x="24" y="12" width="48" height="48" fill="none" stroke="#34d399" strokeWidth="2" rx="4" strokeDasharray="4 2"/>
        <rect x="30" y="24" width="8" height="2" fill="#10b981" rx="1"/>
        <rect x="30" y="30" width="16" height="2" fill="#10b981" rx="1"/>
        <rect x="30" y="36" width="12" height="2" fill="#10b981" rx="1"/>
        <rect x="54" y="24" width="12" height="2" fill="#10b981" rx="1"/>
        <rect x="54" y="30" width="8" height="2" fill="#10b981" rx="1"/>
        <rect x="54" y="36" width="10" height="2" fill="#10b981" rx="1"/>
      </svg>
    ),
    // Growth + Development / Skill Building
    'c9': (
      <svg viewBox="0 0 96 72" className="w-full h-full">
        <path d="M24 54 L24 18" stroke="#c084fc" strokeWidth="2"/>
        <path d="M24 54 L72 54" stroke="#c084fc" strokeWidth="2"/>
        <path d="M30 48 L36 36 L42 42 L48 30 L54 33 L60 21 L66 24" fill="none" stroke="#9333ea" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="60" cy="21" r="3" fill="#7c3aed"/>
        <path d="M60 21 L72 9" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round"/>
      </svg>
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
  const searchParams = useSearchParams();
  
  const [currentScreen, setCurrentScreen] = useState(1);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    role: '',
    challenge: ''
  });
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  const getRecommendations = () => {
    if (selectedChallenges.length === 0) {
      return { tools: [], courses: [] };
    }
    
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
    const maxCourses = 5;
    let courseIndex = 0;
    
    // Keep looping until we have 5 courses or run out of options
    while (courses.length < maxCourses && courseIndex < 5) {
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

  // Loading effect (3 seconds)
  useEffect(() => {
    if (currentScreen === 3) {
      setLoadingProgress(0); // Reset progress when entering screen 3
      
      // Start the animation after a brief delay to ensure smooth start
      const startDelay = setTimeout(() => {
        const totalDuration = 3000; // 3 seconds
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
              setTimeout(() => setCurrentScreen(4), 300);
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
        return prev.filter(id => id !== challenge.id);
      } else if (prev.length < 5) {
        return [...prev, challenge.id];
      }
      return prev;
    });
  };

  const handleChallengesNext = () => {
    if (selectedChallenges.length === 0) return;
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

  const handlePrint = () => {
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
      <div className="min-h-screen bg-custom-gradient-diagonal flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl mx-auto text-center text-white">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img 
              src="/campfire-logo-white.png"
              alt="Campfire Logo"
              className="h-12 sm:h-14 md:h-16"
            />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Fuel a culture that performs.</h2>
          <p className="text-base sm:text-lg md:text-xl text-purple-100 mb-8 sm:mb-12 md:mb-16 px-2">
            Discover the right tools, assessments, and courses to help you—and your teams—grow stronger, move faster, and build real momentum.
            Answer a few quick questions and we'll match you with the most impactful solutions for your role and challenges.
          </p>
          
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8">Let's get started!</h2>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8">What is your role?</p>
            
            <div className="relative mb-6">
              <select
                value={userProfile.role}
                onChange={(e) => setUserProfile(prev => ({ ...prev, role: e.target.value }))}
                className="w-full p-3 sm:p-4 rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-orange-400 appearance-none pr-12 text-base"
              >
                <option value="" className="text-gray-800">Select your role</option>
                {roles.map(role => (
                  <option key={role} value={role} className="text-gray-800">{role}</option>
                ))}
              </select>
              {/* Custom dropdown arrow */}
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                </svg>
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
      </div>
    );
  }

  // Screen 2: Challenge Selection (9 role-specific challenges)
  if (currentScreen === 2) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50 py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-4xl font-bold text-nightfall mb-6">
              What are your biggest challenges as a {userProfile.role}?
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
                  
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h3 className={`font-semibold mb-2 ${isSelected ? 'text-iris-700' : 'text-nightfall'}`}>
                        {challenge.title}
                      </h3>
                      <p className={`text-sm ${isSelected ? 'text-iris-500' : 'text-gray-600'}`}>
                        {challenge.description}
                      </p>
                    </div>
                    
                    {/* Small illustration on the right */}
                    <div className={`w-16 h-12 rounded-lg flex-shrink-0 overflow-hidden ${isSelected ? 'bg-purple-100' : 'bg-gray-50'}`}>
                      {getChallengeVisual(challenge.id)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              BACK
            </button>
            
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
      </div>
      <Footer />
      </>
    );
  }

  // Screen 3: Loading State (3 seconds)
  if (currentScreen === 3) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
              Building Your Personalized Development Plan
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
      </div>
    );
  }

  // Screen 4: Recommendations
  if (currentScreen === 4) {
    const recommendations = getRecommendations();
    
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50 py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex justify-between items-center mb-8 print:hidden">
                <button
                  onClick={handleBackToChallenge}
                  className="text-iris-500 hover:text-iris-700 flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  BACK
                </button>
                <div className="flex gap-4">
                  <button 
                    onClick={handlePrint}
                    className="px-4 py-2 border border-gray-300 text-iris-500 rounded-lg hover:border-purple-400 transition-colors flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4 text-iris-500" />
                    PRINT
                  </button>
                  <button 
                    onClick={() => window.open('https://calendly.com/getcampfire/demo', '_blank')}
                    className="px-4 py-2 bg-iris-500 text-white rounded-lg hover:bg-iris-700 transition-colors"
                  >
                    BOOK A DEMO
                  </button>
                </div>
              </div>
              
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
                  We've crafted a targeted plan with {recommendations.tools.length} tools and {recommendations.courses.length} programs to help you overcome these challenges
                </p>
              </div>
            </div>

            {/* Visual separator */}
            <div className="w-24 h-1 bg-custom-gradient-horizontal mx-auto mb-12 rounded-full"></div>

            <div className="mb-12 print:keep-with-next">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-iris-500" />
                </div>
                <h3 className="text-2xl font-bold text-nightfall">Recommended Tools</h3>
              </div>
              <p className="text-gray-600 mb-6 ml-13">Quick wins to address your immediate needs</p>
              
              <div className="grid gap-4">
                {recommendations.tools.map((tool, index) => {
                  const isClickable = tool.id === 't3' || tool.id === 't1'; // Trust Audit and Purpose tools
                  const toolPath = tool.id === 't3' ? '/tools/trust-audit' : tool.id === 't1' ? '/tools/purpose' : '';
                  
                  const toolContent = (
                    <>
                      {/* Priority number badge */}
                      <div className="absolute -top-2 -left-2 w-8 h-8 bg-iris-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {index + 1}
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="w-24 h-20 bg-white rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                          {getToolVisual(tool.id)}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-nightfall mb-2">
                            {tool.name}
                          </h4>
                          <p className="text-gray-600">
                            {tool.description}
                          </p>
                        </div>
                      </div>
                    </>
                  );
                  
                  if (isClickable) {
                    return (
                      <a
                        key={tool.id}
                        href={toolPath}
                        className="relative bg-white rounded-xl border border-gray-200 p-6 shadow-sm print:avoid-break hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer"
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

            <div className="mb-12 print:keep-with-next print:mt-12">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-iris-500" />
                </div>
                <h3 className="text-2xl font-bold text-nightfall">Development Programs</h3>
              </div>
              <p className="text-gray-600 mb-6 ml-13">In-depth learning to build lasting capabilities</p>
              
              <div className="grid gap-6">
                {recommendations.courses.slice(0, 5).map((course) => (
                  <div key={course.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm print:avoid-break">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-nightfall mb-2">
                          {course.title}
                        </h4>
                        <p className="text-gray-600">
                          {course.description}
                        </p>
                      </div>
                      <div className="w-16 h-12 bg-white rounded-lg flex items-center justify-center ml-6 overflow-hidden">
                        {getCourseVisual(course.id)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 justify-center print:hidden">
              <button 
                onClick={() => router.push('/courses')}
                className="px-8 py-3 border border-iris-500 text-iris-500 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
              >
                EXPLORE CATALOG
              </button>
              <button 
                onClick={() => window.open('https://calendly.com/getcampfire/demo', '_blank')}
                className="px-8 py-3 bg-iris-500 text-white rounded-lg font-semibold hover:bg-iris-700 transition-colors"
              >
                BOOK A DEMO
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-nightfall">Loading...</h1>
      </div>
    </div>
  );
}

// Wrapper component to handle Suspense
export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-nightfall">Loading...</h1>
        </div>
      </div>
    }>
      <ToolsPage />
    </Suspense>
  );
}