'use client'

import { useState, useEffect } from 'react'

export default function Home() {
  const [connections, setConnections] = useState<string[]>([])
  const [sorted, setSorted] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const people = [
    "Alice 👩‍💼", "Bob 👨‍💻", "Charlie 🎨", "Diana 🎸", 
    "Ethan 📚", "Fiona 🏃‍♀️", "George 🍕", "Hannah ✈️",
    "Ian 🎮", "Julia 📸", "Kevin 🎭", "Luna 🌙"
  ]

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const shuffleConnections = () => {
    setSorted(false)
    const shuffled = [...people].sort(() => Math.random() - 0.5)
    setConnections(shuffled)
  }

  const sortConnections = () => {
    setSorted(true)
    const sorted = [...connections].sort()
    setConnections(sorted)
  }

  useEffect(() => {
    shuffleConnections()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden relative">
      {/* Animated background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.1) 0%, transparent 50%)`
        }}
      />
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
      <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4 animate-fade-in">
            Connection Sorter 🌐
          </h1>
          <p className="text-xl text-gray-200 animate-fade-in animation-delay-200">
            Because even your social network needs organization!
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl max-w-2xl w-full animate-fade-in animation-delay-400">
          <div className="grid grid-cols-3 gap-4 mb-8">
            {connections.map((person, index) => (
              <div
                key={person}
                className={`
                  bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center text-white
                  transform transition-all duration-500 hover:scale-105 hover:bg-white/30
                  ${sorted ? 'animate-slide-in' : 'animate-bounce-in'}
                `}
                style={{
                  animationDelay: `${index * 50}ms`
                }}
              >
                {person}
              </div>
            ))}
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={shuffleConnections}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              🎲 Shuffle
            </button>
            <button
              onClick={sortConnections}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              ✨ Sort A-Z
            </button>
          </div>
        </div>

        <p className="text-gray-300 mt-8 text-sm animate-fade-in animation-delay-600">
          Coming soon: Sort by vibes, energy levels, and coffee preferences ☕
        </p>
      </main>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.3); }
          50% { transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out forwards;
        }
        .animate-slide-in {
          animation: slide-in 0.4s ease-out forwards;
        }
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-400 { animation-delay: 400ms; }
        .animation-delay-600 { animation-delay: 600ms; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  )
}
// Force deployment Thu Jul 31 20:10:41 MDT 2025
