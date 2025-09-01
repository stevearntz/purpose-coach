'use client'

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';

export default function AssessmentRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const code = params.code as string;
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCampaignAndRedirect = async () => {
      try {
        // Debug: Log incoming parameters
        console.log('[Assessment Redirect] Campaign code:', code);
        console.log('[Assessment Redirect] Search params:', Array.from(searchParams.entries()));
        
        // Look up the campaign to get the tool path
        const response = await fetch(`/api/campaigns/by-code/${code}`);
        let toolPath = '/people-leader-needs'; // Default fallback
        
        if (response.ok) {
          const data = await response.json();
          toolPath = data.toolPath || '/people-leader-needs';
        }
        
        // Build redirect URL with all parameters
        const newParams = new URLSearchParams();
        
        // Add campaign code
        newParams.append('campaign', code);
        
        // Pass along ALL query parameters from the original URL
        searchParams.forEach((value, key) => {
          newParams.append(key, value);
        });
        
        const redirectUrl = `${toolPath}?${newParams.toString()}`;
        console.log('[Assessment Redirect] Redirecting to:', redirectUrl);
        
        // Use window.location to preserve all parameters
        window.location.href = redirectUrl;
      } catch (error) {
        console.error('Error fetching campaign:', error);
        // Fallback to people-leader-needs with all params
        const newParams = new URLSearchParams();
        newParams.append('campaign', code);
        searchParams.forEach((value, key) => {
          newParams.append(key, value);
        });
        // Use window.location to preserve all parameters
        window.location.href = `/people-leader-needs?${newParams.toString()}`;
      }
    };
    
    fetchCampaignAndRedirect();
  }, [code, searchParams, router]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p>Redirecting to assessment...</p>
      </div>
    </div>
  );
}