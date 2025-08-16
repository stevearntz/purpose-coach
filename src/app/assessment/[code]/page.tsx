'use client'

import { useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';

export default function AssessmentRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const code = params.code as string;
  const inviteCode = searchParams.get('invite');
  
  useEffect(() => {
    // For now, just redirect to HR Partnership with the campaign code
    // In production, you'd look up the campaign to get the right tool
    let redirectUrl = `/hr-partnership?campaign=${code}`;
    
    // IMPORTANT: Pass along the invite code if present
    if (inviteCode) {
      redirectUrl += `&invite=${inviteCode}`;
    }
    
    router.push(redirectUrl);
  }, [code, inviteCode, router]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p>Redirecting to assessment...</p>
      </div>
    </div>
  );
}