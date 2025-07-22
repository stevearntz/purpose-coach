export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
}

// Priority-ordered course mappings for each challenge
// The order in each array represents the priority (P1, P2, P3, etc.)
export const challengeCourseMappings: { [key: string]: Course[] } = {
  'c1': [ // Purpose + Direction
    { id: 's6', title: 'Inspire with Vision', description: 'Create shared understanding of organizational direction', duration: '2 weeks' },
    { id: 's15', title: 'Define Your Leadership Brand', description: 'Establish your unique leadership identity', duration: '3 weeks' },
    { id: 's25', title: 'Setting and Achieving Goals', description: 'Learn to set and cascade meaningful goals', duration: '2 weeks' },
    { id: 's24', title: 'Strategic Thinking', description: 'Develop strategic thinking capabilities', duration: '3 weeks' },
    { id: 's30', title: 'Career Mapping', description: 'Create clarity around purpose and strategic alignment', duration: '3 weeks' },
    { id: 's11', title: 'The Art of Recognition', description: 'Create shared understanding of organizational direction', duration: '2 weeks' },
    { id: 's29', title: 'Campfire Storytelling', description: 'Establish your unique leadership identity and story', duration: '2 weeks' },
    { id: 's23', title: 'Set The Tone', description: 'Learn to set and cascade meaningful goals', duration: '2 weeks' },
    { id: 's41', title: 'Leading with Compassion', description: 'Develop strategic thinking capabilities', duration: '3 weeks' }
  ],
  'c2': [ // Navigating Change
    { id: 's12', title: 'Lead Through Change', description: 'Master the art of change management', duration: '4 weeks' },
    { id: 's5', title: 'Habits for Resilience', description: 'Develop personal and team resilience', duration: '2 weeks' },
    { id: 's41', title: 'Leading with Compassion', description: 'Lead with empathy and compassion', duration: '3 weeks' },
    { id: 's39', title: 'Connected Leadership', description: 'Build connections that matter', duration: '3 weeks' },
    { id: 's18', title: 'Curiosity in Conversations', description: 'Foster curiosity in your interactions', duration: '2 weeks' },
    { id: 's25', title: 'Setting and Achieving Goals', description: 'Learn to set and cascade meaningful goals', duration: '2 weeks' },
    { id: 's11', title: 'The Art of Recognition', description: 'Create shared understanding of organizational direction', duration: '2 weeks' },
    { id: 's6', title: 'Inspire with Vision', description: 'Create shared understanding of organizational direction', duration: '2 weeks' }
  ],
  'c3': [ // Feedback + Trust
    { id: 's14', title: 'Build Trust on Your Team', description: 'Create psychological safety across teams', duration: '3 weeks' },
    { id: 's20', title: 'Foster Belonging', description: 'Create an inclusive environment', duration: '3 weeks' },
    { id: 's4', title: 'Deliberate Listening', description: 'Master the art of active listening', duration: '2 weeks' },
    { id: 's36', title: 'Candid Communication', description: 'Have honest, productive conversations', duration: '2 weeks' },
    { id: 's34', title: 'Hopes Fears and Expectations', description: 'Navigate team dynamics effectively', duration: '2 weeks' },
    { id: 's33', title: 'Inclusive Leadership', description: 'Foster trust through inclusive practices', duration: '3 weeks' },
    { id: 's41', title: 'Leading with Compassion', description: 'Lead with empathy and compassion', duration: '3 weeks' },
  ],
  'c4': [ // Empowering Others
    { id: 's10', title: 'Successful Delegation', description: 'Learn to delegate effectively and build capability', duration: '2 weeks' },
    { id: 's16', title: 'Activate Autonomy', description: 'Empower others to take ownership', duration: '3 weeks' },
    { id: 's17', title: 'Coaching Essentials', description: 'Develop coaching skills that empower others', duration: '3 weeks' },
    { id: 's21', title: 'Magnify Strengths', description: 'Identify and develop team strengths', duration: '3 weeks' },
    { id: 's19', title: 'Develop Your Team', description: 'Build capability across your team', duration: '3 weeks' },
    { id: 's22', title: 'Performance Discussions', description: 'Navigate performance conversations effectively', duration: '2 weeks' },
    { id: 's30', title: 'Career Mapping', description: 'Create clear career development paths', duration: '3 weeks' }
  ],
  'c5': [ // Decision Making
    { id: 's32', title: 'Decision Making', description: 'Make better decisions under pressure', duration: '2 weeks' },
    { id: 's24', title: 'Strategic Thinking', description: 'Think strategically about challenges', duration: '3 weeks' },
    { id: 's9', title: 'Self-Awareness', description: 'Develop deeper self-awareness', duration: '2 weeks' },
    { id: 's26', title: 'Lead Effective Meetings', description: 'Run meetings that drive decisions', duration: '2 weeks' },
    { id: 's31', title: 'Conscious Communication', description: 'Communicate with intention and clarity', duration: '2 weeks' },
    { id: 's25', title: 'Setting and Achieving Goals', description: 'Learn to set and cascade meaningful goals', duration: '2 weeks' },
  ],
  'c6': [ // Well-Being
    { id: 's7', title: 'Manage Burnout', description: 'Prevent and address burnout', duration: '3 weeks' },
    { id: 's5', title: 'Habits for Resilience', description: 'Build sustainable resilience habits', duration: '2 weeks' },
    { id: 's2', title: 'Beat Imposter Syndrome', description: 'Overcome self-doubt and build confidence', duration: '2 weeks' },
    { id: 's8', title: 'Manage Your Time', description: 'Master time management strategies', duration: '2 weeks' },
    { id: 's1', title: 'Cultivating Gratitude', description: 'Practice gratitude for well-being', duration: '2 weeks' },
    { id: 's29', title: 'Campfire Storytelling', description: 'Find meaning and purpose through storytelling', duration: '2 weeks' },
    { id: 's41', title: 'Leading with Compassion', description: 'Lead with empathy and self-compassion', duration: '3 weeks' },
    { id: 's33', title: 'Inclusive Leadership', description: 'Create an inclusive environment for well-being', duration: '3 weeks' }
  ],
  'c7': [ // Communication and Collaboration
    { id: 's31', title: 'Conscious Communication', description: 'Master clear and impactful communication', duration: '2 weeks' },
    { id: 's35', title: 'Collaborate Intentionally', description: 'Build effective collaboration practices', duration: '3 weeks' },
    { id: 's18', title: 'Curiosity in Conversations', description: 'Bring curiosity to every interaction', duration: '2 weeks' },
    { id: 's3', title: 'Constructive Conflict', description: 'Navigate conflict productively', duration: '2 weeks' },
    { id: 's4', title: 'Deliberate Listening', description: 'Listen with intention and presence', duration: '2 weeks' },
    { id: 's39', title: 'Connected Leadership', description: 'Build connections that matter', duration: '3 weeks' },
  ],
  'c8': [ // Skill Building
    { id: 's13', title: 'Make the Most of 1-on-1s', description: 'Have impactful one-on-one conversations', duration: '2 weeks' },
    { id: 's34', title: 'Hopes Fears and Expectations', description: 'Create clarity through open dialogue', duration: '2 weeks' },
    { id: 's22', title: 'Performance Discussions', description: 'Navigate performance conversations effectively', duration: '2 weeks' },
    { id: 's23', title: 'Set The Tone', description: 'Establish clear team culture and norms', duration: '2 weeks' },
    { id: 's28', title: 'Deliver Feedback', description: 'Give feedback that drives growth', duration: '2 weeks' },
    { id: 's12', title: 'Lead Through Change', description: 'Master the art of change management', duration: '4 weeks' },
    { id: 's6', title: 'Inspire with Vision', description: 'Create shared understanding of organizational direction', duration: '2 weeks' }
  ],
  'c9': [ // Alignment + Direction
    { id: 's30', title: 'Career Mapping', description: 'Create clear career development paths', duration: '3 weeks' },
    { id: 's19', title: 'Develop Your Team', description: 'Build team capabilities systematically', duration: '3 weeks' },
    { id: 's17', title: 'Coaching Essentials', description: 'Essential coaching skills for leaders', duration: '3 weeks' },
    { id: 's43', title: 'Live Group Coaching', description: 'Experience real-time coaching dynamics', duration: '4 weeks' },
    { id: 's21', title: 'Magnify Strengths', description: 'Identify and amplify team strengths', duration: '3 weeks' },
    { id: 's15', title: 'Define Your Leadership Brand', description: 'Establish your unique leadership identity', duration: '3 weeks' },
    { id: 's33', title: 'Inclusive Leadership', description: 'Lead with inclusivity for better alignment', duration: '3 weeks' },
    { id: 's39', title: 'Connected Leadership', description: 'Build connections that create alignment', duration: '3 weeks' }
  ]
};

// Helper function to get course IDs in priority order for a challenge
export function getCourseIdsForChallenge(challengeId: string): string[] {
  const courses = challengeCourseMappings[challengeId] || [];
  return courses.map(course => course.id);
}

// Helper function to get all unique course IDs from multiple challenges in priority order
export function getCourseIdsForChallenges(challengeIds: string[]): string[] {
  const orderedCourseIds: string[] = [];
  const addedCourseIds = new Set<string>();

  // Process challenges in the order they were selected
  challengeIds.forEach(challengeId => {
    const courses = challengeCourseMappings[challengeId] || [];
    
    // Add courses in their priority order for this challenge
    courses.forEach(course => {
      if (!addedCourseIds.has(course.id)) {
        orderedCourseIds.push(course.id);
        addedCourseIds.add(course.id);
      }
    });
  });

  return orderedCourseIds;
}