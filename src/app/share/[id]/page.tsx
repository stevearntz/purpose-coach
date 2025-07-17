'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Share2, Loader2, Target, BookOpen } from 'lucide-react';
import jsPDF from 'jspdf';
import Footer from '@/components/Footer';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
}

interface Tool {
  id: string;
  name: string;
  type: string;
  description: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
}

interface SharedData {
  type: string;
  title: string;
  results?: {
    purpose?: string;
    mission?: string;
    vision?: string;
    insights?: string[];
  };
  messages?: Message[];
  userProfile?: Record<string, unknown>;
  conversationStage?: number;
  description?: string;
  role?: string;
  selectedChallenges?: string[];
  challenges?: Challenge[];
  recommendations?: {
    tools: Tool[];
    courses: Course[];
  };
  createdAt: string;
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
      </svg>
    ),
    't4': ( // Coaching Questions Card Deck
      <svg viewBox="0 0 128 96" className="w-full h-full">
        <rect x="36" y="20" width="48" height="56" fill="#60a5fa" opacity="0.3" rx="4" transform="rotate(-10 60 48)"/>
        <rect x="44" y="20" width="48" height="56" fill="#3b82f6" opacity="0.5" rx="4" transform="rotate(-5 68 48)"/>
        <rect x="40" y="20" width="48" height="56" fill="#1e40af" rx="4"/>
        <text x="64" y="52" fill="white" fontSize="24" fontWeight="bold" textAnchor="middle">?</text>
      </svg>
    ),
    't5': ( // Decision Filter Framework
      <svg viewBox="0 0 128 96" className="w-full h-full">
        <rect x="16" y="16" width="96" height="16" fill="#f472b6" opacity="0.3" rx="8"/>
        <rect x="16" y="40" width="96" height="16" fill="#ec4899" opacity="0.5" rx="8"/>
        <rect x="16" y="64" width="96" height="16" fill="#db2777" rx="8"/>
        <circle cx="88" cy="24" r="4" fill="#be185d"/>
        <circle cx="64" cy="48" r="4" fill="#9f1239"/>
        <circle cx="40" cy="72" r="4" fill="#881337"/>
      </svg>
    ),
    't6': ( // Burnout Assessment
      <svg viewBox="0 0 128 96" className="w-full h-full">
        <path d="M64 20 Q80 30 80 48 Q80 66 64 76 Q48 66 48 48 Q48 30 64 20" fill="#fbbf24" opacity="0.3"/>
        <path d="M64 28 Q72 34 72 48 Q72 62 64 68 Q56 62 56 48 Q56 34 64 28" fill="#f59e0b" opacity="0.5"/>
        <path d="M64 36 Q68 40 68 48 Q68 56 64 60 Q60 56 60 48 Q60 40 64 36" fill="#f87171"/>
        <circle cx="64" cy="48" r="4" fill="#ef4444"/>
      </svg>
    ),
    't7': ( // Working with Me Guide
      <svg viewBox="0 0 128 96" className="w-full h-full">
        <circle cx="48" cy="40" r="16" fill="#c084fc" opacity="0.3"/>
        <circle cx="80" cy="40" r="16" fill="#c084fc" opacity="0.3"/>
        <path d="M64 56 Q64 64 64 72" stroke="#9333ea" strokeWidth="8" strokeLinecap="round"/>
        <circle cx="48" cy="40" r="6" fill="#7c3aed"/>
        <circle cx="80" cy="40" r="6" fill="#7c3aed"/>
        <path d="M48 58 Q64 64 80 58" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    't8': ( // Hopes, Fears, Expectations Template
      <svg viewBox="0 0 128 96" className="w-full h-full">
        <rect x="16" y="24" width="32" height="48" fill="#34d399" opacity="0.3" rx="4"/>
        <rect x="48" y="24" width="32" height="48" fill="#fbbf24" opacity="0.3" rx="4"/>
        <rect x="80" y="24" width="32" height="48" fill="#60a5fa" opacity="0.3" rx="4"/>
        <text x="32" y="52" fill="#10b981" fontSize="12" fontWeight="bold" textAnchor="middle">H</text>
        <text x="64" y="52" fill="#f59e0b" fontSize="12" fontWeight="bold" textAnchor="middle">F</text>
        <text x="96" y="52" fill="#3b82f6" fontSize="12" fontWeight="bold" textAnchor="middle">E</text>
      </svg>
    ),
    't9': ( // Career Drivers Exercise
      <svg viewBox="0 0 128 96" className="w-full h-full">
        <path d="M64 72 L32 48 L32 32 L64 20 L96 32 L96 48 Z" fill="#f472b6" opacity="0.3"/>
        <path d="M64 20 L64 72" stroke="#ec4899" strokeWidth="3"/>
        <circle cx="64" cy="20" r="8" fill="#be185d"/>
        <circle cx="32" cy="40" r="6" fill="#ec4899" opacity="0.7"/>
        <circle cx="96" cy="40" r="6" fill="#ec4899" opacity="0.7"/>
        <circle cx="64" cy="72" r="6" fill="#f472b6"/>
      </svg>
    )
  };
  return visuals[toolId] || <div className="w-full h-full bg-gray-200"></div>;
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
  return visuals[courseId] || <div className="w-full h-full bg-gray-200"></div>;
};

export default function SharePage() {
  const params = useParams();
  const [data, setData] = useState<SharedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchSharedData = async () => {
      try {
        const response = await fetch(`/api/share?id=${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to load shared content');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedData();
  }, [params.id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    if (!data) return;

    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    let yPosition = 20;

    doc.setFontSize(20);
    doc.text(data.title || 'Personal Development Plan', 20, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    doc.text(`Created: ${new Date(data.createdAt).toLocaleDateString()}`, 20, yPosition);
    yPosition += 20;

    if (data.type === 'purpose' && data.results) {
      doc.setFontSize(14);
      doc.text('Purpose Statement', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(11);
      const purposeLines = doc.splitTextToSize(data.results.purpose || '', 170) as string[];
      purposeLines.forEach((line) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 20, yPosition);
        yPosition += 7;
      });

      if (data.results.insights && data.results.insights.length > 0) {
        yPosition += 10;
        doc.setFontSize(14);
        doc.text('Key Insights', 20, yPosition);
        yPosition += 10;

        doc.setFontSize(11);
        data.results.insights.forEach((insight: string, index: number) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }
          const insightLines = doc.splitTextToSize(`${index + 1}. ${insight}`, 170) as string[];
          insightLines.forEach((line) => {
            doc.text(line, 20, yPosition);
            yPosition += 7;
          });
          yPosition += 3;
        });
      }
    }

    if (data.type === 'campfire-conversation' && data.messages) {
      doc.setFontSize(14);
      doc.text('Conversation Summary', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      if (data.description) {
        const descLines = doc.splitTextToSize(data.description, 170) as string[];
        descLines.forEach((line) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, 20, yPosition);
          yPosition += 7;
        });
        yPosition += 10;
      }

      doc.setFontSize(11);
      data.messages.forEach((message: Message) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFont('helvetica', message.isUser ? 'bold' : 'normal');
        doc.text(message.isUser ? 'You:' : 'Campfire:', 20, yPosition);
        yPosition += 7;
        
        doc.setFont('helvetica', 'normal');
        const messageLines = doc.splitTextToSize(message.text, 160) as string[];
        messageLines.forEach((line) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, 30, yPosition);
          yPosition += 6;
        });
        yPosition += 8;
      });
    }

    if (data.type === 'personal-development-plan' && data.recommendations) {
      doc.setFontSize(14);
      doc.text('Personal Development Plan', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      doc.text(`Role: ${data.role}`, 20, yPosition);
      yPosition += 15;

      if (data.challenges && data.challenges.length > 0) {
        doc.setFontSize(14);
        doc.text('Selected Challenges', 20, yPosition);
        yPosition += 10;

        doc.setFontSize(11);
        data.challenges.forEach((challenge: Challenge, index: number) => {
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
          }
          doc.setFont('helvetica', 'bold');
          doc.text(`${index + 1}. ${challenge.title}`, 20, yPosition);
          yPosition += 7;
          doc.setFont('helvetica', 'normal');
          const descLines = doc.splitTextToSize(challenge.description, 160) as string[];
          descLines.forEach((line) => {
            if (yPosition > pageHeight - 20) {
              doc.addPage();
              yPosition = 20;
            }
            doc.text(line, 25, yPosition);
            yPosition += 6;
          });
          yPosition += 8;
        });
      }

      if (data.recommendations.tools.length > 0) {
        yPosition += 10;
        doc.setFontSize(14);
        doc.text('Recommended Tools', 20, yPosition);
        yPosition += 10;

        doc.setFontSize(11);
        data.recommendations.tools.forEach((tool: Tool) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }
          doc.setFont('helvetica', 'bold');
          doc.text(tool.name, 20, yPosition);
          yPosition += 7;
          doc.setFont('helvetica', 'normal');
          const toolDescLines = doc.splitTextToSize(tool.description, 160) as string[];
          toolDescLines.forEach((line) => {
            doc.text(line, 20, yPosition);
            yPosition += 6;
          });
          yPosition += 8;
        });
      }

      if (data.recommendations.courses.length > 0) {
        yPosition += 10;
        doc.setFontSize(14);
        doc.text('Development Programs', 20, yPosition);
        yPosition += 10;

        doc.setFontSize(11);
        data.recommendations.courses.forEach((course: Course) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }
          doc.setFont('helvetica', 'bold');
          doc.text(course.title, 20, yPosition);
          yPosition += 7;
          doc.setFont('helvetica', 'normal');
          const courseDescLines = doc.splitTextToSize(course.description, 160) as string[];
          courseDescLines.forEach((line) => {
            doc.text(line, 20, yPosition);
            yPosition += 6;
          });
          yPosition += 8;
        });
      }
    }

    doc.save(`${data.type || 'results'}-${params.id}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-black flex items-center justify-center p-4">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Oops!</h1>
          <p className="text-gray-300 mb-6">{error || 'This shared content could not be found or may have expired.'}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-iris-500/90 hover:bg-iris-500 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            GO TO HOMEPAGE
          </Link>
        </div>
      </div>
    );
  }

  // Personal Development Plan view
  if (data.type === 'personal-development-plan' && data.recommendations) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50 py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="flex justify-between items-center mb-8">
                  <Link
                    href="/"
                    className="text-iris-500 hover:text-iris-700 flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    BACK
                  </Link>
                  <div className="flex gap-4">
                    <button
                      onClick={handleCopyLink}
                      className="px-4 py-2 border border-gray-300 text-iris-500 rounded-lg hover:border-purple-400 transition-colors flex items-center gap-2"
                    >
                      <Share2 className="w-4 h-4 text-iris-500" />
                      {copied ? 'COPIED!' : 'SHARE'}
                    </button>
                    <button
                      onClick={handleDownloadPDF}
                      className="px-4 py-2 border border-gray-300 text-iris-500 rounded-lg hover:border-purple-400 transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4 text-iris-500" />
                      DOWNLOAD PDF
                    </button>
                  </div>
                </div>
                
                <h2 className="text-4xl font-bold text-nightfall mb-8">
                  Personalized Development Plan
                </h2>
                
                {/* Selected challenges display */}
                <div className="max-w-3xl mx-auto">
                  <p className="text-sm text-gray-500 uppercase tracking-wider mb-4">Based on your top challenges</p>
                  <div className="flex flex-wrap justify-center gap-3 mb-2">
                    {data.challenges?.map((challenge, index) => (
                      <div 
                        key={challenge.id} 
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-iris-700 rounded-full"
                      >
                        <span className="flex items-center justify-center w-5 h-5 bg-iris-500 text-white text-xs rounded-full font-bold">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium">{challenge.title}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm mt-4">
                    We&apos;ve crafted a targeted plan with {data.recommendations.tools.length} tools and {data.recommendations.courses.length} programs to help you overcome these challenges
                  </p>
                </div>
              </div>

              {/* Visual separator */}
              <div className="w-24 h-1 bg-custom-gradient-horizontal mx-auto mb-12 rounded-full"></div>

              <div className="mb-12">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5 text-iris-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-nightfall">Recommended Tools</h3>
                </div>
                <p className="text-gray-600 mb-6 ml-13">Quick wins to address your immediate needs</p>
                
                <div className="grid gap-4">
                  {data.recommendations.tools.map((tool, index) => {
                    const isClickable = tool.id === 't3' || tool.id === 't1';
                    const toolPath = tool.id === 't3' ? '/trust-audit' : tool.id === 't1' ? '/purpose' : '';
                    
                    const toolContent = (
                      <>
                        <div className="absolute -top-2 -left-2 w-8 h-8 bg-iris-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                          {index + 1}
                        </div>
                        
                        <div className="flex items-start gap-4">
                          <div className="w-24 h-20 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
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
                          className="relative bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer"
                        >
                          {toolContent}
                        </a>
                      );
                    }
                    
                    return (
                      <div key={tool.id} className="relative bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        {toolContent}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mb-12">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-iris-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-nightfall">Development Programs</h3>
                </div>
                <p className="text-gray-600 mb-6 ml-13">In-depth learning to build lasting capabilities</p>
                
                <div className="grid gap-6">
                  {data.recommendations.courses.slice(0, 5).map((course) => (
                    <div key={course.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
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

              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => window.location.href = '/'}
                  className="px-8 py-3 bg-iris-500 text-white rounded-lg font-semibold hover:bg-iris-700 transition-colors"
                >
                  BUILD MY PLAN
                </button>
                <button 
                  onClick={() => window.location.href = '/courses'}
                  className="px-8 py-3 border border-iris-500 text-iris-500 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
                >
                  EXPLORE CATALOG
                </button>
                <button 
                  onClick={() => window.open('https://calendly.com/getcampfire/demo', '_blank')}
                  className="px-8 py-3 border border-iris-500 text-iris-500 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
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

  // Original share page content for other types
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-black">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      
      <div className="relative z-10 container mx-auto p-6 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <div className="flex gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm border border-white/10"
            >
              <Share2 className="w-4 h-4" />
              {copied ? 'COPIED!' : 'SHARE'}
            </button>
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm border border-white/10"
            >
              <Download className="w-4 h-4" />
              DOWNLOAD PDF
            </button>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">{data.title || 'Personal Development Results'}</h1>
            <p className="text-gray-400">Created on {new Date(data.createdAt).toLocaleDateString()}</p>
          </div>

          {data.type === 'purpose' && data.results && (
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-3">Your Purpose Statement</h2>
                <p className="text-gray-200 text-lg leading-relaxed">{data.results.purpose}</p>
              </div>

              {data.results.insights && data.results.insights.length > 0 && (
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Key Insights</h2>
                  <ul className="space-y-3">
                    {data.results.insights.map((insight: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-iris-500/30 text-indigo-300 rounded-full flex items-center justify-center text-sm">
                          {index + 1}
                        </span>
                        <span className="text-gray-200">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {data.userProfile && (
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Profile Summary</h2>
                  <div className="grid gap-4">
                    {data.userProfile.background ? (
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-1">Background</h3>
                        <p className="text-gray-200">{String(data.userProfile.background)}</p>
                      </div>
                    ) : null}
                    {data.userProfile.strengths ? (
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-1">Strengths</h3>
                        <p className="text-gray-200">{String(data.userProfile.strengths)}</p>
                      </div>
                    ) : null}
                    {data.userProfile.values ? (
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-1">Values</h3>
                        <p className="text-gray-200">{String(data.userProfile.values)}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          )}

          {data.type === 'campfire-conversation' && data.messages && (
            <div className="space-y-6">
              {data.description && (
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-white mb-3">Conversation Overview</h2>
                  <p className="text-gray-200">{data.description}</p>
                </div>
              )}

              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Conversation</h2>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {data.messages.map((message: Message, index: number) => (
                    <div
                      key={index}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                          message.isUser
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                            : 'bg-white/10 text-white border border-white/20'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {data.userProfile && Object.keys(data.userProfile).length > 0 && (
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Conversation Insights</h2>
                  <div className="grid gap-4">
                    {data.userProfile.primaryChallenge ? (
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-1">Primary Challenge</h3>
                        <p className="text-gray-200 capitalize">
                          {String(data.userProfile.primaryChallenge).replace('-', ' ')}
                        </p>
                      </div>
                    ) : null}
                    {data.conversationStage !== undefined && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-1">Conversation Progress</h3>
                        <div className="flex items-center gap-2">
                          <div className="flex space-x-1">
                            {[0, 1, 2, 3, 4].map((stage) => (
                              <div
                                key={stage}
                                className={`w-3 h-3 rounded-full ${
                                  stage <= data.conversationStage!
                                    ? 'bg-gradient-to-r from-blue-400 to-blue-500'
                                    : 'bg-white/20'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-gray-200 text-sm">
                            {data.conversationStage === 0 && "Getting to know challenges"}
                            {data.conversationStage === 1 && "Understanding impact"}
                            {data.conversationStage === 2 && "Exploring solutions"}
                            {data.conversationStage === 3 && "Assessing opportunities"}
                            {data.conversationStage! >= 4 && "Ready for next steps"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}