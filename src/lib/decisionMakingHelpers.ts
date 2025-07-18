export interface Question {
  id: string
  text: string
  dimension: 'people' | 'purpose' | 'principles' | 'outcomes'
}

export interface Answer {
  questionId: string
  value: number
}

export const questions: Question[] = [
  // People
  { id: 'p1', text: 'I have identified all stakeholders who will be affected', dimension: 'people' },
  { id: 'p2', text: 'I understand each stakeholder\'s perspective', dimension: 'people' },
  { id: 'p3', text: 'I have considered how to communicate the decision', dimension: 'people' },
  { id: 'p4', text: 'I know who needs to be involved in making this decision', dimension: 'people' },
  { id: 'p5', text: 'I have thought about the human impact of each option', dimension: 'people' },
  
  // Purpose
  { id: 'pu1', text: 'The decision aligns with our mission and values', dimension: 'purpose' },
  { id: 'pu2', text: 'I am clear on what problem we\'re trying to solve', dimension: 'purpose' },
  { id: 'pu3', text: 'This decision moves us toward our long-term goals', dimension: 'purpose' },
  { id: 'pu4', text: 'I understand why this decision matters now', dimension: 'purpose' },
  { id: 'pu5', text: 'The "why" behind this decision is compelling', dimension: 'purpose' },
  
  // Principles
  { id: 'pr1', text: 'I have clear criteria for evaluating options', dimension: 'principles' },
  { id: 'pr2', text: 'I\'m using a consistent decision-making framework', dimension: 'principles' },
  { id: 'pr3', text: 'I have gathered sufficient data and evidence', dimension: 'principles' },
  { id: 'pr4', text: 'I\'ve considered multiple alternatives', dimension: 'principles' },
  { id: 'pr5', text: 'My biases and assumptions have been examined', dimension: 'principles' },
  
  // Outcomes
  { id: 'o1', text: 'I have defined what success looks like', dimension: 'outcomes' },
  { id: 'o2', text: 'The risks and trade-offs are clear to me', dimension: 'outcomes' },
  { id: 'o3', text: 'I know how we\'ll measure the results', dimension: 'outcomes' },
  { id: 'o4', text: 'I\'ve considered both short and long-term impacts', dimension: 'outcomes' },
  { id: 'o5', text: 'There\'s a plan to monitor and adjust if needed', dimension: 'outcomes' },
]

export const dimensionInfo = {
  people: {
    title: 'People',
    description: 'Stakeholder consideration and communication'
  },
  purpose: {
    title: 'Purpose',
    description: 'Alignment with mission and goals'
  },
  principles: {
    title: 'Principles',
    description: 'Framework and process quality'
  },
  outcomes: {
    title: 'Outcomes',
    description: 'Results and measurement planning'
  }
}

export const getDecisionRecommendations = (dimension: string, score: number) => {
  const recommendations = {
    people: [
      'Create a stakeholder map to visualize all affected parties',
      'Schedule 1:1 conversations with key stakeholders',
      'Develop a clear communication plan',
      'Consider forming a decision-making committee'
    ],
    purpose: [
      'Revisit your organization\'s mission statement',
      'Write a clear problem statement',
      'Connect this decision to strategic objectives',
      'Articulate the "why" in one compelling sentence'
    ],
    principles: [
      'Choose a decision-making framework (e.g., RAPID, DACI)',
      'List your evaluation criteria explicitly',
      'Gather more data in areas of uncertainty',
      'Facilitate a structured brainstorming session'
    ],
    outcomes: [
      'Define specific, measurable success metrics',
      'Conduct a risk assessment workshop',
      'Create a decision scorecard',
      'Build a monitoring dashboard'
    ]
  }
  
  if (score < 2.5) {
    return recommendations[dimension as keyof typeof recommendations] || []
  } else if (score < 3.8) {
    return recommendations[dimension as keyof typeof recommendations]?.slice(0, 2) || []
  } else {
    return [recommendations[dimension as keyof typeof recommendations]?.[0] || 'Keep refining your approach!']
  }
}