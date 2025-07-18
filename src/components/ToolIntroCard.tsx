'use client'

import React from 'react'

interface ToolIntroCardProps {
  title: string
  subtitle: string
  description: string
  children: React.ReactNode
}

export default function ToolIntroCard({ 
  title, 
  subtitle, 
  description, 
  children 
}: ToolIntroCardProps) {
  return (
    <>
      <div className="text-center text-white mb-12 max-w-3xl">
        <h1 className="text-5xl font-bold mb-6">{title}</h1>
        <h2 className="text-3xl mb-8">{subtitle}</h2>
        <p className="text-xl text-white/90 leading-relaxed">
          {description}
        </p>
      </div>
      
      <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-2xl w-full">
        <h3 className="text-3xl font-bold text-white text-center mb-8">Let's get started!</h3>
        {children}
      </div>
    </>
  )
}