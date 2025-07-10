'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Conversation {
  id: string;
  title: string;
  description: string;
  emoji: string;
  gradient: string;
  duration: string;
  tags: string[];
  href: string;
  isLive: boolean;
}

export default function HomePage() {
  const [hoveredTile, setHoveredTile] = useState<string | null>(null);

  const conversations: Conversation[] = [
    {
      id: 'purpose',
      title: 'Purpose Coach',
      description: 'Discover your purpose, define your mission, and envision your future through deep reflection.',
      emoji: '🔥',
      gradient: 'from-orange-500 via-red-500 to-pink-500',
      duration: '15-20 min',
      tags: ['Self-Discovery', 'Mission', 'Vision'],
      href: '/purpose',
      isLive: true
    },
    {
      id: 'values',
      title: 'Values Explorer',
      description: 'Uncover your core values and learn how to live in alignment with what matters most.',
      emoji: '💎',
      gradient: 'from-blue-500 via-purple-500 to-indigo-500',
      duration: '12-15 min',
      tags: ['Values', 'Alignment', 'Authenticity'],
      href: '/values',
      isLive: false
    },
    {
      id: 'strengths',
      title: 'Strengths Finder',
      description: 'Identify your unique talents and discover how to leverage them for maximum impact.',
      emoji: '💪',
      gradient: 'from-green-500 via-emerald-500 to-teal-500',
      duration: '10-12 min',
      tags: ['Talents', 'Growth', 'Performance'],
      href: '/strengths',
      isLive: false
    },
    {
      id: 'clarity',
      title: 'Decision Clarity',
      description: 'Work through complex decisions with a structured framework for confident choices.',
      emoji: '🎯',
      gradient: 'from-yellow-500 via-orange-500 to-red-500',
      duration: '8-10 min',
      tags: ['Decisions', 'Clarity', 'Strategy'],
      href: '/clarity',
      isLive: false
    },
    {
      id: 'relationships',
      title: 'Relationship Compass',
      description: 'Navigate challenging relationships and build deeper connections with others.',
      emoji: '🧭',
      gradient: 'from-pink-500 via-rose-500 to-red-500',
      duration: '15-18 min',
      tags: ['Relationships', 'Communication', 'Connection'],
      href: '/relationships',
      isLive: false
    },
    {
      id: 'career',
      title: 'Career Catalyst',
      description: 'Explore career paths, overcome obstacles, and design your professional future.',
      emoji: '🚀',
      gradient: 'from-indigo-500 via-blue-500 to-cyan-500',
      duration: '20-25 min',
      tags: ['Career', 'Growth', 'Strategy'],
      href: '/career',
      isLive: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-500/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="text-6xl">🔥</span>
              <h1 className="text-5xl md:text-7xl font-bold text-white">
                Campfire Guides
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              At Campfire, we empower every employee with the direction, support, and skills they need to thrive. 
              Transform your workplace culture and elevate your team's success today.
            </p>
          </div>
        </div>
      </div>

      {/* Conversations Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Choose Your Tool
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Each tool is designed to help your team develop essential skills and build a thriving workplace culture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className="group relative"
              onMouseEnter={() => setHoveredTile(conversation.id)}
              onMouseLeave={() => setHoveredTile(null)}
            >
              {conversation.isLive ? (
                <Link href={conversation.href}>
                  <ConversationTile 
                    conversation={conversation} 
                    isHovered={hoveredTile === conversation.id}
                  />
                </Link>
              ) : (
                <div className="cursor-not-allowed">
                  <ConversationTile 
                    conversation={conversation} 
                    isHovered={hoveredTile === conversation.id}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              More Tools Coming Soon
            </h3>
            <p className="text-gray-400 mb-6">
              We're developing more powerful tools to help your organization build stronger teams and achieve lasting success.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {['Leadership', 'Creativity', 'Mindfulness', 'Innovation', 'Legacy'].map((topic) => (
                <span 
                  key={topic}
                  className="px-4 py-2 bg-white/10 rounded-full text-sm text-gray-300 border border-white/20"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-lg border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-2xl">🔥</span>
              <span className="text-xl font-semibold text-white">Campfire Guides</span>
            </div>
            <p className="text-gray-400 text-sm">
              Empowering teams to thrive and succeed
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface ConversationTileProps {
  conversation: Conversation;
  isHovered: boolean;
}

function ConversationTile({ conversation, isHovered }: ConversationTileProps) {
  return (
    <div className={`
      relative overflow-hidden rounded-2xl border border-white/20 backdrop-blur-lg
      transition-all duration-500 ease-out
      ${isHovered ? 'transform scale-105 shadow-2xl' : 'transform scale-100'}
      ${conversation.isLive ? 'bg-white/10 hover:bg-white/15' : 'bg-white/5'}
      ${conversation.isLive ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}
    `}>
      {/* Gradient Background */}
      <div className={`
        absolute inset-0 bg-gradient-to-br ${conversation.gradient} opacity-20
        transition-opacity duration-500
        ${isHovered ? 'opacity-30' : 'opacity-20'}
      `}></div>
      
      {/* Content */}
      <div className="relative p-8">
        {/* Status Badge */}
        <div className="flex items-center justify-between mb-4">
          <span className={`
            px-3 py-1 rounded-full text-xs font-semibold
            ${conversation.isLive 
              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
              : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
            }
          `}>
            {conversation.isLive ? 'Live' : 'Coming Soon'}
          </span>
          <span className="text-3xl">{conversation.emoji}</span>
        </div>

        {/* Title & Description */}
        <h3 className="text-2xl font-bold text-white mb-3">
          {conversation.title}
        </h3>
        <p className="text-gray-300 text-sm leading-relaxed mb-6">
          {conversation.description}
        </p>

        {/* Duration */}
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-gray-400">{conversation.duration}</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {conversation.tags.map((tag) => (
            <span 
              key={tag}
              className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300 border border-white/20"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Hover Effect */}
        {conversation.isLive && (
          <div className={`
            absolute bottom-4 right-4 transition-all duration-300
            ${isHovered ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform translate-x-2'}
          `}>
            <div className="flex items-center gap-2 text-sm text-white font-medium">
              <span>Start Journey</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}