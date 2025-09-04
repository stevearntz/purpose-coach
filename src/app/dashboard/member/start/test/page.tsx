'use client'

import { useState, useEffect } from 'react'

export default function TestPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch('/api/user/profile')
      .then(r => r.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
      .catch(e => {
        console.error('Error:', e)
        setLoading(false)
      })
  }, [])
  
  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl mb-4">Test Page</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <pre className="bg-black/50 p-4 rounded">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  )
}