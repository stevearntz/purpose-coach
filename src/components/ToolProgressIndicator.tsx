'use client'

import { FC } from 'react'

interface ToolProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  completedSteps: Set<number>
  onStepClick: (step: number) => void
  color: string // Hex color for the tool's brand color
  stepLabel?: string // "Question", "Step", "Stage", etc.
}

const ToolProgressIndicator: FC<ToolProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  completedSteps,
  onStepClick,
  color,
  stepLabel = 'Question'
}) => {
  // Create color with opacity (50% and 70%)
  const colorWith50 = `${color}80` // 50% opacity in hex
  const colorWith70 = `${color}B3` // 70% opacity in hex

  return (
    <div className="flex flex-col items-end gap-1">
      <p className="text-sm text-gray-600">
        {stepLabel} {currentStep + 1} of {totalSteps}
      </p>
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (index <= currentStep || completedSteps.has(index)) {
                onStepClick(index)
              }
            }}
            disabled={!completedSteps.has(index) && index > currentStep}
            className={`h-2 rounded-full transition-all ${
              index === currentStep
                ? 'w-8'
                : completedSteps.has(index) || index < currentStep
                ? 'w-2 cursor-pointer'
                : 'w-2 bg-gray-300 cursor-not-allowed'
            }`}
            style={{
              backgroundColor: 
                index === currentStep
                  ? color
                  : completedSteps.has(index) || index < currentStep
                  ? colorWith50
                  : undefined
            }}
            onMouseEnter={(e) => {
              if ((completedSteps.has(index) || index < currentStep) && index !== currentStep) {
                e.currentTarget.style.backgroundColor = colorWith70
              }
            }}
            onMouseLeave={(e) => {
              if ((completedSteps.has(index) || index < currentStep) && index !== currentStep) {
                e.currentTarget.style.backgroundColor = colorWith50
              }
            }}
            aria-label={`Go to ${stepLabel.toLowerCase()} ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default ToolProgressIndicator