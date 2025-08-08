'use client';

import { useEffect } from 'react';
import ViewportContainer from '@/components/ViewportContainer';
import Footer from '@/components/Footer';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Admin page error:', error);
  }, [error]);

  return (
    <>
      <ViewportContainer className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-md mx-auto mt-16 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong!
            </h2>
            <p className="text-gray-600 mb-8">
              We encountered an error loading the admin page. Please try again.
            </p>
            <button
              onClick={() => {
                // Reset the error boundary and retry
                reset();
              }}
              className="px-6 py-3 bg-iris-500 text-white rounded-lg hover:bg-iris-600 transition-colors font-semibold"
            >
              Try again
            </button>
          </div>
        </div>
      </ViewportContainer>
      <Footer />
    </>
  );
}