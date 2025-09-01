'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

export default function TestUnifiedAPI() {
  const { user } = useUser()
  const [unifiedData, setUnifiedData] = useState<any>(null)
  const [oldApiData, setOldApiData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    if (!user?.emailAddresses?.[0]?.emailAddress) return
    
    setLoading(true)
    setError(null)
    
    try {
      const email = user.emailAddresses[0].emailAddress
      
      // Fetch from unified API
      const unifiedResponse = await fetch(`/api/assessments/unified?email=${encodeURIComponent(email)}`)
      if (unifiedResponse.ok) {
        const unified = await unifiedResponse.json()
        setUnifiedData(unified)
      }
      
      // Fetch from old API for comparison
      const oldResponse = await fetch(`/api/assessments/results?email=${encodeURIComponent(email)}`)
      if (oldResponse.ok) {
        const old = await oldResponse.json()
        setOldApiData(old)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Unified API Test Page</h1>
        
        <div className="mb-4">
          <p className="text-gray-400">Testing with: {user?.emailAddresses?.[0]?.emailAddress}</p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="mb-8 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh Data'}
        </button>

        {error && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-500 rounded-lg">
            <p className="text-red-400">Error: {error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Unified API Data */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-green-400">
              Unified API (/api/assessments/unified)
            </h2>
            <div className="bg-gray-800 rounded-lg p-4 overflow-auto max-h-[600px]">
              {unifiedData ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Response:</p>
                    <pre className="text-xs whitespace-pre-wrap">
                      {JSON.stringify(unifiedData, null, 2)}
                    </pre>
                  </div>
                  
                  {unifiedData.results?.[0] && (
                    <div className="border-t border-gray-700 pt-4">
                      <p className="text-sm text-gray-400 mb-2">First Result Structure:</p>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-500">Challenges:</span>
                          <pre className="text-xs ml-4">
                            {JSON.stringify(unifiedData.results[0].responses?.challenges, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <span className="text-gray-500">Skills:</span>
                          <pre className="text-xs ml-4">
                            {JSON.stringify(unifiedData.results[0].responses?.skillsToGrow, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <span className="text-gray-500">Support Needs:</span>
                          <pre className="text-xs ml-4">
                            {JSON.stringify(unifiedData.results[0].responses?.supportNeeds, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <span className="text-gray-500">Focus Areas:</span>
                          <pre className="text-xs ml-4">
                            {JSON.stringify(unifiedData.results[0].responses?.teamImpact, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No data yet</p>
              )}
            </div>
          </div>

          {/* Old API Data */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-yellow-400">
              Old API (/api/assessments/results)
            </h2>
            <div className="bg-gray-800 rounded-lg p-4 overflow-auto max-h-[600px]">
              {oldApiData ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Response:</p>
                    <pre className="text-xs whitespace-pre-wrap">
                      {JSON.stringify(oldApiData, null, 2)}
                    </pre>
                  </div>
                  
                  {oldApiData.results?.[0] && (
                    <div className="border-t border-gray-700 pt-4">
                      <p className="text-sm text-gray-400 mb-2">First Result Structure:</p>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-500">Responses:</span>
                          <pre className="text-xs ml-4">
                            {JSON.stringify(oldApiData.results[0].responses, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No data yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Comparison Summary */}
        {unifiedData?.results?.[0] && oldApiData?.results?.[0] && (
          <div className="mt-8 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Comparison Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Unified API</p>
                <ul className="mt-2 space-y-1">
                  <li>✅ Consistent challenge structure</li>
                  <li>✅ Normalized field names</li>
                  <li>✅ Proper ordering</li>
                  <li>✅ Includes all sections</li>
                </ul>
              </div>
              <div>
                <p className="text-gray-400">Old API</p>
                <ul className="mt-2 space-y-1">
                  <li>❌ Mixed field names</li>
                  <li>❌ Inconsistent structure</li>
                  <li>❌ Raw data format</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}