'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import ViewportContainer from '@/components/ViewportContainer';
import { ArrowRight, CheckCircle, User } from 'lucide-react';

function StartPageContent() {
  const searchParams = useSearchParams();
  const [inviteData, setInviteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const inviteCode = searchParams.get('invite');
    if (inviteCode) {
      // Track that the invite link was opened
      trackInviteOpened(inviteCode);
      // Load invitation data
      loadInviteData(inviteCode);
    } else {
      setLoading(false);
    }
  }, [searchParams]);
  
  const trackInviteOpened = async (inviteCode: string) => {
    try {
      await fetch('/api/invitations/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          inviteCode, 
          event: 'opened',
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to track invite:', error);
    }
  };
  
  const loadInviteData = async (inviteCode: string) => {
    try {
      const response = await fetch(`/api/invitations/${inviteCode}`);
      if (response.ok) {
        const data = await response.json();
        setInviteData(data);
      }
    } catch (error) {
      console.error('Failed to load invite data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleClaimAccount = () => {
    const inviteCode = searchParams.get('invite');
    if (inviteCode) {
      // Track that they clicked claim account
      fetch('/api/invitations/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          inviteCode, 
          event: 'started',
          timestamp: new Date().toISOString()
        })
      });
      
      // Store invite code in session for tracking throughout the journey
      sessionStorage.setItem('campfire_invite_code', inviteCode);
      
      // Redirect to account claim page with invite code
      window.location.href = `/claim-account?invite=${inviteCode}`;
    } else {
      // No invite code, just go to regular flow
      window.location.href = '/claim-account';
    }
  };

  return (
    <div className="bg-custom-gradient-diagonal">
      <ViewportContainer className="flex items-center justify-center px-4 py-8 pb-24 sm:pb-8">
        <div className="w-full max-w-2xl mx-auto text-center text-white">
          {/* Logo Section - Company Logo or Campfire Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            {inviteData?.companyLogo ? (
              <div className="flex flex-col items-center gap-4">
                <img 
                  src={inviteData.companyLogo}
                  alt={`${inviteData.company} Logo`}
                  className="h-16 sm:h-20 md:h-24 object-contain bg-white/10 backdrop-blur-sm rounded-lg p-3"
                  onError={(e) => {
                    // Fallback to Campfire logo if company logo fails to load
                    e.currentTarget.src = '/campfire-logo-white.png';
                    e.currentTarget.className = 'h-12 sm:h-14 md:h-16 object-contain';
                  }}
                />
                <div className="flex items-center gap-2 text-sm text-purple-200">
                  <span>powered by</span>
                  <img 
                    src="/campfire-logo-white.png"
                    alt="Campfire Logo"
                    className="h-6"
                  />
                </div>
              </div>
            ) : (
              <img 
                src="/campfire-logo-white.png"
                alt="Campfire Logo"
                className="h-12 sm:h-14 md:h-16"
              />
            )}
          </div>
          
          {loading ? (
            <div className="text-white">Loading...</div>
          ) : (
            <>
              {/* Personalized Welcome Badge */}
              {inviteData && (
                <div className="mb-6">
                  <div className="inline-flex flex-col items-center gap-2">
                    {inviteData.company && (
                      <div className="px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                        <span className="text-lg font-semibold">{inviteData.company}</span>
                      </div>
                    )}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm">
                      <User className="w-4 h-4" />
                      <span>{inviteData.name || inviteData.email}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                {inviteData?.name ? (
                  <>Welcome {inviteData.name.split(' ')[0]}!</>
                ) : (
                  'Welcome to Campfire'
                )}
              </h1>
              
              <p className="text-lg sm:text-xl md:text-2xl text-purple-100 mb-8 sm:mb-12 md:mb-16 px-2">
                {inviteData?.personalMessage || 
                  "Your personal leadership and team development platform is ready. Let's build stronger teams and better leaders, together."}
              </p>
              
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6">
                  {inviteData?.company ? 
                    `Your ${inviteData.company} leadership journey starts here` : 
                    'Ready to transform how you lead?'}
                </h2>
                
                <p className="text-base sm:text-lg text-purple-100 mb-8">
                  {inviteData?.company ? 
                    `${inviteData.company} has partnered with Campfire to give you access to evidence-based tools, guided workshops, and personalized recommendations designed to help you overcome your biggest challenges.` :
                    'Get instant access to evidence-based tools, guided workshops, and personalized recommendations designed to help you overcome your biggest challenges.'}
                </p>
                
                {inviteData && (
                  <div className="mb-6 text-left space-y-2">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm sm:text-base text-purple-100">
                        Personalized development plan based on your role
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm sm:text-base text-purple-100">
                        12+ evidence-based assessment tools
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm sm:text-base text-purple-100">
                        Guided workshops and skill-building sessions
                      </span>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={handleClaimAccount}
                  className="w-full py-3 sm:py-4 bg-white text-iris-500 rounded-xl font-semibold hover:bg-white/90 transition-colors text-base sm:text-lg flex items-center justify-center gap-2"
                >
                  CLAIM YOUR ACCOUNT
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>
      </ViewportContainer>
    </div>
  );
}

export default function StartPage() {
  return (
    <Suspense fallback={
      <div className="bg-custom-gradient-diagonal">
        <ViewportContainer className="flex items-center justify-center px-4 py-8 pb-24 sm:pb-8">
          <div className="text-white">Loading...</div>
        </ViewportContainer>
      </div>
    }>
      <StartPageContent />
    </Suspense>
  );
}