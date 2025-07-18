export interface Question {
  id: string
  text: string
  dimension: 'people' | 'purpose' | 'principles'
}

export interface Answer {
  questionId: string
  value: number
}

export const questions: Question[] = [
  // People
  { id: 'pe1', text: 'I understand how this change will impact the people I work with', dimension: 'people' },
  { id: 'pe2', text: 'I trust the leaders who are guiding us through this change', dimension: 'people' },
  { id: 'pe3', text: 'I believe my team can adapt to what\'s coming', dimension: 'people' },
  { id: 'pe4', text: 'I feel supported by others as I navigate this change', dimension: 'people' },
  { id: 'pe5', text: 'I\'m confident this change will strengthen relationships on my team', dimension: 'people' },
  
  // Purpose
  { id: 'pu1', text: 'I understand why this change is happening', dimension: 'purpose' },
  { id: 'pu2', text: 'I believe this change supports our broader goals and mission', dimension: 'purpose' },
  { id: 'pu3', text: 'I can clearly see how this change connects to what my role is meant to accomplish', dimension: 'purpose' },
  { id: 'pu4', text: 'I believe this change will move us in the right direction as an organization', dimension: 'purpose' },
  { id: 'pu5', text: 'I feel more motivated when I see how this change supports our purpose', dimension: 'purpose' },
  
  // Principles
  { id: 'pr1', text: 'I know what principles will guide my decisions during this change', dimension: 'principles' },
  { id: 'pr2', text: 'I feel empowered to make decisions that reflect my values', dimension: 'principles' },
  { id: 'pr3', text: 'I trust myself to respond thoughtfully and flexibly as things shift', dimension: 'principles' },
  { id: 'pr4', text: 'I believe this change is aligned with the core values of our team or company', dimension: 'principles' },
  { id: 'pr5', text: 'I am confident I can stay grounded in what matters most, even as things change', dimension: 'principles' },
]

export const dimensionInfo = {
  people: {
    title: 'People',
    description: 'Trust in relationships, team dynamics, leadership support, and impact on others'
  },
  purpose: {
    title: 'Purpose',
    description: 'Clarity of vision, connection to role, alignment with company direction'
  },
  principles: {
    title: 'Principles',
    description: 'Values alignment, confidence in navigating decisions, adaptability'
  }
}

export const getChangeReadinessLevel = (score: number) => {
  if (score >= 21) return { level: 'High', description: 'You feel confident and supported', color: 'text-green-600' }
  if (score >= 16) return { level: 'Moderate', description: 'You\'re mostly on board, but have questions', color: 'text-yellow-600' }
  if (score >= 11) return { level: 'Low', description: 'You may feel unsure or disconnected', color: 'text-orange-600' }
  return { level: 'Very Low', description: 'You may feel anxious or unprepared', color: 'text-red-600' }
}

export const getChangeRecommendations = (dimension: string, score: number) => {
  const recommendations = {
    people: {
      high: ['Continue building on strong relationships', 'Share your confidence with others who may be struggling'],
      moderate: ['Schedule 1:1s with key stakeholders', 'Join or create a change support group'],
      low: ['Identify trusted colleagues to talk with', 'Request clearer communication from leadership', 'Map out who will be affected and how']
    },
    purpose: {
      high: ['Help others connect to the vision', 'Document how the change aligns with your goals'],
      moderate: ['Ask clarifying questions about the "why"', 'Connect change goals to your role explicitly'],
      low: ['Request a town hall or Q&A session', 'Write down what\'s unclear and seek answers', 'Find the story behind the change']
    },
    principles: {
      high: ['Model values-based decision making', 'Mentor others in staying grounded'],
      moderate: ['Create a personal values checklist', 'Practice scenario planning with your principles'],
      low: ['Define your core values explicitly', 'Seek guidance on decision frameworks', 'Build daily grounding practices']
    }
  }
  
  const level = score >= 21 ? 'high' : score >= 16 ? 'moderate' : 'low'
  return recommendations[dimension as keyof typeof recommendations]?.[level] || []
}