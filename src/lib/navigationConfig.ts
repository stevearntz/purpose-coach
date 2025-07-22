// Centralized navigation configuration for all assessment tools
export const toolNavigation = {
  backToPlan: {
    href: '/?screen=4',
    label: 'Back to Plan'
  },
  allTools: {
    href: '/toolkit',
    label: 'All Tools'
  }
} as const

// Helper function to get navigation props
export function getToolNavigationProps() {
  return {
    backToPlan: toolNavigation.backToPlan,
    allTools: toolNavigation.allTools
  }
}