'use client'

import { 
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser 
} from '@clerk/nextjs'

export default function ClerkTestPage() {
  const { isLoaded, isSignedIn, user } = useUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Clerk Authentication Test</h1>
        
        <div className="bg-white rounded-lg shadow-xl p-6 mb-4">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          
          <SignedOut>
            <div className="space-y-4">
              <p className="text-gray-600">You are not signed in.</p>
              <div className="flex gap-4">
                <SignInButton mode="modal">
                  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            </div>
          </SignedOut>
          
          <SignedIn>
            <div className="space-y-4">
              <p className="text-green-600 font-semibold">✅ You are signed in!</p>
              {isLoaded && user && (
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="font-semibold mb-2">User Details:</h3>
                  <ul className="space-y-1 text-sm">
                    <li><strong>ID:</strong> {user.id}</li>
                    <li><strong>Email:</strong> {user.primaryEmailAddress?.emailAddress}</li>
                    <li><strong>Name:</strong> {user.fullName || 'Not set'}</li>
                    <li><strong>Username:</strong> {user.username || 'Not set'}</li>
                  </ul>
                </div>
              )}
              <div className="flex items-center gap-4">
                <UserButton afterSignOutUrl="/" />
                <span className="text-sm text-gray-600">← Click to manage your account</span>
              </div>
            </div>
          </SignedIn>
        </div>
        
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Test Navigation</h2>
          <div className="space-y-2">
            <a href="/dashboard" className="block text-blue-500 hover:underline">
              Go to Dashboard (protected route)
            </a>
            <a href="/" className="block text-blue-500 hover:underline">
              Go to Home (public route)
            </a>
            <a href="/sign-in" className="block text-blue-500 hover:underline">
              Go to Sign In page
            </a>
            <a href="/sign-up" className="block text-blue-500 hover:underline">
              Go to Sign Up page
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}