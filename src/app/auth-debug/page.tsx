'use client';

import React, { useState, useEffect } from 'react';
import ViewportContainer from '@/components/ViewportContainer';

export default function AuthDebugPage() {
  const [cookieInfo, setCookieInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkCookies = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/test-cookie', {
        credentials: 'include'
      });
      const data = await response.json();
      setCookieInfo(data);
    } catch (error) {
      console.error('Failed to check cookies:', error);
    }
    setLoading(false);
  };

  const setCookie = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/test-cookie', {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();
      console.log('Set cookie response:', data);
      // Check cookies again after setting
      await checkCookies();
    } catch (error) {
      console.error('Failed to set test cookie:', error);
    }
    setLoading(false);
  };

  const checkMe = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      const data = await response.json();
      console.log('Me endpoint response:', data);
      alert(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Failed to check /me:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkCookies();
  }, []);

  return (
    <ViewportContainer className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Auth Debug Page</h1>
          
          <div className="bg-white rounded-lg shadow p-6 mb-4">
            <h2 className="text-lg font-semibold mb-4">Cookie Information</h2>
            {loading ? (
              <p>Loading...</p>
            ) : cookieInfo ? (
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(cookieInfo, null, 2)}
              </pre>
            ) : (
              <p>No cookie info available</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            <div className="space-y-2">
              <button
                onClick={checkCookies}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Check Cookies
              </button>
              <button
                onClick={setCookie}
                disabled={loading}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 ml-2"
              >
                Set Test Cookie
              </button>
              <button
                onClick={checkMe}
                disabled={loading}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 ml-2"
              >
                Check /api/auth/me
              </button>
            </div>
          </div>

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Debug Instructions:</strong><br />
              1. Try setting a test cookie and see if it persists<br />
              2. Check if campfire-auth cookie exists after login<br />
              3. Check browser DevTools → Application → Cookies<br />
              4. Try the /api/auth/me endpoint to see if you're authenticated
            </p>
          </div>
        </div>
      </div>
    </ViewportContainer>
  );
}