import type { Metadata } from 'next'

interface ToolMetadataConfig {
  name: string
  description: string
  ogImage?: string
}

export const toolsMetadata: Record<string, ToolMetadataConfig> = {
  'team-charter': {
    name: 'Team Charter',
    description: 'Create a visual map of your team\'s purpose, values, activities, and goals to align everyone around what matters most.',
    ogImage: '/og-team-canvas.png'
  },
  'burnout-assessment': {
    name: 'Burnout Assessment',
    description: 'Evaluate your current state of workplace wellbeing and get personalized strategies to prevent or recover from burnout.',
    ogImage: '/og-burnout-assessment.png'
  },
  'trust-audit': {
    name: 'Trust Audit',
    description: 'Assess and strengthen trust in your key relationships with a comprehensive trust evaluation framework.',
    ogImage: '/og-trust-audit.png'
  },
  'change-readiness-assessment': {
    name: 'Change Readiness Assessment',
    description: 'Evaluate your preparedness for change and develop strategies to navigate transitions with confidence.',
    ogImage: '/og-change-readiness.png'
  },
  'change-style': {
    name: 'Change Style Profile',
    description: 'Discover how you naturally respond to change and get personalized strategies for navigating transitions.',
    ogImage: '/og-change-readiness.png'
  },
  'coaching-cards': {
    name: 'Coaching Cards',
    description: 'Explore powerful coaching questions to gain clarity, overcome challenges, and accelerate your growth.',
    ogImage: '/og-coaching-cards.png'
  },
  'drivers-reflection': {
    name: 'Drivers Reflection',
    description: 'Discover what truly motivates you and create a personalized career map aligned with your core drivers.',
    ogImage: '/og-career-drivers.png'
  },
  'expectations-reflection': {
    name: 'Expectations Reflection',
    description: 'Surface and align team expectations to build trust and set the foundation for success.',
    ogImage: '/og-hopes-fears.png'
  },
  'decision-making-audit': {
    name: 'Decision Making Audit',
    description: 'Analyze your decision-making patterns and develop strategies for more confident, effective choices.',
    ogImage: '/og-decision-making.png'
  },
  'user-guide': {
    name: 'User Guide',
    description: 'Create a personalized guide to help others understand how to work with you most effectively.',
    ogImage: '/og-user-guide.png'
  },
  'hr-partnership': {
    name: 'HR Partnership Assessment',
    description: 'Help managers articulate their needs for HR support across growth, development, strategy, and culture to strengthen the HR-manager partnership.',
    ogImage: '/og-hr-partnership.png'
  }
}

export function generateToolMetadata(toolId: string): Metadata {
  const tool = toolsMetadata[toolId]
  
  if (!tool) {
    return {
      title: 'Campfire Tool',
      description: 'Leadership development tool from Campfire'
    }
  }

  const title = `${tool.name} - Campfire`
  const baseUrl = 'https://tools.getcampfire.com'
  
  return {
    title,
    description: tool.description,
    openGraph: {
      title,
      description: tool.description,
      url: `${baseUrl}/${toolId}`,
      siteName: 'Campfire',
      images: [
        {
          url: `${baseUrl}${tool.ogImage || '/campfire-logo-new.png'}`,
          width: 1200,
          height: 630,
          alt: `${tool.name} - Campfire Tool`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: tool.description,
      images: [`${baseUrl}${tool.ogImage || '/campfire-logo-new.png'}`],
      site: '@campfire',
    },
    metadataBase: new URL(baseUrl),
  }
}