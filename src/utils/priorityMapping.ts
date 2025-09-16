// Full priority/focus area titles mapping
export const priorityMap: Record<string, string> = {
  'revenue': 'Revenue, sales, or growth targets',
  'customer': 'Customer success or retention',
  'product': 'Product or delivery milestones',
  'team': 'Team performance or growth',
  'collaboration': 'Cross-functional collaboration',
  'culture': 'Culture or engagement',
  'operations': 'Operational efficiency',
  'efficiency': 'Operational efficiency', // alias
  'budget': 'Budget or cost management',
  'strategy': 'Strategy or planning',
  'change': 'Change or transformation efforts',
  'personal': 'My own focus / effectiveness',
  'risk': 'Risk management or compliance',
  // Also handle if the full text is already there
  'revenue, sales, or growth targets': 'Revenue, sales, or growth targets',
  'customer success or retention': 'Customer success or retention',
  'customer satisfaction or retention': 'Customer success or retention', // variant
  'product or delivery milestones': 'Product or delivery milestones',
  'team performance or growth': 'Team performance or growth',
  'cross-functional collaboration': 'Cross-functional collaboration',
  'culture or engagement': 'Culture or engagement',
  'operational efficiency': 'Operational efficiency',
  'budget or cost management': 'Budget or cost management',
  'strategy or planning': 'Strategy or planning',
  'change or transformation efforts': 'Change or transformation efforts',
  'my own focus / effectiveness': 'My own focus / effectiveness',
  'risk management or compliance': 'Risk management or compliance',
  'innovation': 'Product or delivery milestones', // map innovation to product
  'innovation or product development': 'Product or delivery milestones'
}

export function mapPriorityToFullText(priority: string): string {
  // Try exact match first (case-insensitive)
  const lowerPriority = priority.toLowerCase().trim()
  return priorityMap[lowerPriority] || priority
}