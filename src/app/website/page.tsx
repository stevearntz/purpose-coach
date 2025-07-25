'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Menu, X } from 'lucide-react'

export default function WebsitePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Navigation */}
      <nav className="px-6 py-6 md:px-12 lg:px-24">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-white text-2xl font-bold">
              Campfire
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#" className="text-white/90 hover:text-white transition-colors">
              Our Approach
            </Link>
            <Link href="#" className="text-white/90 hover:text-white transition-colors">
              Programs
            </Link>
            <Link href="#" className="text-white/90 hover:text-white transition-colors">
              Resources
            </Link>
            <Link href="#" className="text-white/90 hover:text-white transition-colors">
              About
            </Link>
            <Link 
              href="/"
              className="ml-4 px-5 py-2.5 bg-white text-purple-800 rounded-full font-medium hover:bg-white/90 transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/20 pt-4">
            <div className="flex flex-col space-y-4">
              <Link href="#" className="text-white/90 hover:text-white transition-colors">
                Our Approach
              </Link>
              <Link href="#" className="text-white/90 hover:text-white transition-colors">
                Programs
              </Link>
              <Link href="#" className="text-white/90 hover:text-white transition-colors">
                Resources
              </Link>
              <Link href="#" className="text-white/90 hover:text-white transition-colors">
                About
              </Link>
              <Link 
                href="/"
                className="inline-block px-5 py-2.5 bg-white text-purple-800 rounded-full font-medium hover:bg-white/90 transition-colors text-center"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="px-6 md:px-12 lg:px-24 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Fuel a Culture That Performs, at Every Level
              </h1>
              <p className="text-xl text-white/80 mb-8">
                Build leadership capability through scalable workshops and learning programs that create lasting behavior change.
              </p>
              <Link
                href="/"
                className="inline-flex items-center px-8 py-4 bg-white text-purple-800 rounded-full font-semibold text-lg hover:bg-white/90 transition-all hover:gap-3 gap-2"
              >
                EXPLORE LEADERSHIP TOOLS
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Right Column - Illustration */}
            <div className="relative">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                {/* Campfire illustration */}
                <svg viewBox="0 0 400 400" className="w-full h-full">
                  {/* Fire glow */}
                  <circle cx="200" cy="280" r="60" fill="url(#fireGlow)" opacity="0.3" />
                  
                  {/* Logs */}
                  <rect x="160" y="290" width="80" height="15" rx="7" fill="#654321" />
                  <rect x="150" y="305" width="100" height="15" rx="7" fill="#543210" />
                  
                  {/* Fire */}
                  <path
                    d="M200 250 C 180 270, 170 280, 175 295 C 180 290, 185 285, 190 285 C 185 290, 185 300, 195 305 C 195 300, 200 295, 205 295 C 205 300, 210 305, 215 305 C 220 300, 220 290, 225 295 C 230 280, 220 270, 200 250"
                    fill="url(#fireGradient)"
                  />
                  
                  {/* People silhouettes */}
                  <g opacity="0.8">
                    {/* Person 1 */}
                    <circle cx="120" cy="260" r="20" fill="#2C1F3D" />
                    <path d="M120 280 Q 120 320, 110 340 L 130 340 Q 120 320, 120 280" fill="#2C1F3D" />
                    
                    {/* Person 2 */}
                    <circle cx="280" cy="260" r="20" fill="#2C1F3D" />
                    <path d="M280 280 Q 280 320, 270 340 L 290 340 Q 280 320, 280 280" fill="#2C1F3D" />
                    
                    {/* Person 3 */}
                    <circle cx="200" cy="240" r="18" fill="#2C1F3D" />
                    <path d="M200 258 Q 200 290, 190 310 L 210 310 Q 200 290, 200 258" fill="#2C1F3D" />
                  </g>
                  
                  {/* Stars */}
                  <circle cx="100" cy="100" r="2" fill="white" opacity="0.8" />
                  <circle cx="150" cy="80" r="1.5" fill="white" opacity="0.6" />
                  <circle cx="250" cy="90" r="2" fill="white" opacity="0.7" />
                  <circle cx="300" cy="110" r="1.5" fill="white" opacity="0.8" />
                  <circle cx="320" cy="70" r="1" fill="white" opacity="0.5" />
                  
                  <defs>
                    <linearGradient id="fireGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#FFA500" />
                      <stop offset="50%" stopColor="#FF6347" />
                      <stop offset="100%" stopColor="#FFD700" />
                    </linearGradient>
                    <radialGradient id="fireGlow">
                      <stop offset="0%" stopColor="#FFA500" />
                      <stop offset="100%" stopColor="#FF6347" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Client Logos Section */}
      <div className="bg-white/10 backdrop-blur-sm py-12 md:py-16">
        <div className="px-6 md:px-12 lg:px-24">
          <div className="max-w-6xl mx-auto">
            <p className="text-center text-white/60 text-sm uppercase tracking-wider mb-8">
              Trusted by leading organizations
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center">
              {/* Placeholder logos */}
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex justify-center">
                  <div className="w-24 h-12 bg-white/20 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="px-6 md:px-12 lg:px-24 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Organization?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join thousands of leaders using Campfire to build high-performing teams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-purple-800 rounded-full font-semibold hover:bg-white/90 transition-all"
            >
              Start Free Trial
            </Link>
            <Link
              href="#"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-all"
            >
              Schedule Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}