'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TestRedirectPage() {
  const router = useRouter();
  
  useEffect(() => {
    console.log('[test-redirect] Page loaded, will redirect in 2 seconds');
    
    // Test different redirect methods
    setTimeout(() => {
      console.log('[test-redirect] Method 1: router.push');
      router.push('/dashboard');
    }, 2000);
    
    setTimeout(() => {
      console.log('[test-redirect] Method 2: window.location.href');
      window.location.href = '/dashboard';
    }, 4000);
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Test Redirect Page</h1>
        <p>Will try router.push in 2 seconds...</p>
        <p>Will try window.location.href in 4 seconds...</p>
        <button 
          onClick={() => router.push('/dashboard')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Manual: router.push
        </button>
        <button 
          onClick={() => window.location.href = '/dashboard'}
          className="mt-4 ml-2 px-4 py-2 bg-green-500 text-white rounded"
        >
          Manual: window.location
        </button>
      </div>
    </div>
  );
}