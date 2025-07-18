export interface CourseDetail {
  id: string;
  title: string;
  tagline: string;
  description: string;
  whatYouWillLearn: string[];
  leaveReadyTo: string;
  duration?: string;
  slidePreview?: string;
}

export const courseDetails: Record<string, CourseDetail> = {
  's1': {
    id: 's1',
    title: 'Cultivating Gratitude',
    tagline: 'Integrate small, meaningful practices of gratitude into your everyday life to foster a more joyful mindset.',
    description: 'This session teaches how to integrate small, meaningful practices of gratitude into your everyday life to foster a more joyful mindset.',
    whatYouWillLearn: [
      'Reflecting on what we are grateful for in this moment',
      'Sharing appreciation for those we work with',
      'Discussing the 3 different aspects of gratitude',
      'Learning some benefits of practicing gratitude',
      'Choosing a gratitude practice to implement into our lives'
    ],
    leaveReadyTo: 'Cultivate a grateful mindset by introducing one practice of gratitude into your routine.',
    duration: '45 minutes'
  },
  's2': {
    id: 's2',
    title: 'Beat Imposter Syndrome',
    tagline: 'Overcome self-doubt and build confidence in your abilities.',
    description: 'Learn to recognize and overcome imposter syndrome, building genuine confidence in your skills and contributions.',
    whatYouWillLearn: [
      'Understanding what imposter syndrome is and how it manifests',
      'Identifying your personal triggers and patterns',
      'Reframing negative self-talk and limiting beliefs',
      'Building evidence of your competence and achievements',
      'Creating strategies to manage imposter feelings when they arise'
    ],
    leaveReadyTo: 'Recognize imposter syndrome patterns and apply practical strategies to build authentic confidence.',
    duration: '60 minutes'
  },
  's3': {
    id: 's3',
    title: 'Constructive Conflict',
    tagline: 'Transform conflict into opportunities for growth and stronger relationships.',
    description: 'Master the art of navigating disagreements productively, turning potential conflicts into opportunities for innovation and deeper understanding.',
    whatYouWillLearn: [
      'Understanding different conflict styles and their impacts',
      'Practicing active listening during disagreements',
      'Using "I" statements to express concerns without blame',
      'Finding common ground and shared interests',
      'Creating action plans that address all parties\' needs'
    ],
    leaveReadyTo: 'Navigate conflicts with confidence, turning disagreements into opportunities for team growth.',
    duration: '90 minutes'
  },
  's4': {
    id: 's4',
    title: 'Deliberate Listening',
    tagline: 'Master the art of truly hearing and understanding others.',
    description: 'Develop deep listening skills that build trust, uncover insights, and strengthen professional relationships.',
    whatYouWillLearn: [
      'The difference between hearing and deliberate listening',
      'Techniques to minimize distractions and stay present',
      'How to ask powerful follow-up questions',
      'Reading non-verbal cues and emotional undertones',
      'Summarizing and reflecting to ensure understanding'
    ],
    leaveReadyTo: 'Practice deliberate listening techniques that deepen connections and improve collaboration.',
    duration: '60 minutes'
  },
  's5': {
    id: 's5',
    title: 'Habits for Resilience',
    tagline: 'Build sustainable practices that help you thrive under pressure.',
    description: 'Develop personal resilience through evidence-based habits that support your well-being and performance.',
    whatYouWillLearn: [
      'Understanding the science of resilience',
      'Identifying your current stress responses and triggers',
      'Building a personal toolkit of resilience practices',
      'Creating sustainable routines for energy management',
      'Developing a growth mindset approach to challenges'
    ],
    leaveReadyTo: 'Implement 2-3 specific resilience habits that support your long-term well-being and performance.',
    duration: '75 minutes'
  },
  's6': {
    id: 's6',
    title: 'Inspire with Vision',
    tagline: 'Create and communicate a compelling vision that motivates action.',
    description: 'Learn to craft and share visions that inspire your team, align efforts, and drive meaningful results.',
    whatYouWillLearn: [
      'Elements of a compelling vision statement',
      'Connecting vision to individual motivations',
      'Using storytelling to bring vision to life',
      'Creating visual representations of future success',
      'Building buy-in through collaborative visioning'
    ],
    leaveReadyTo: 'Articulate an inspiring vision and engage others in making it reality.',
    duration: '90 minutes'
  },
  's7': {
    id: 's7',
    title: 'Manage Burnout',
    tagline: 'Recognize early warning signs and build sustainable work practices.',
    description: 'Understand burnout\'s causes and create personal strategies for sustainable high performance.',
    whatYouWillLearn: [
      'Recognizing the stages and symptoms of burnout',
      'Identifying personal and organizational risk factors',
      'Setting healthy boundaries without guilt',
      'Creating recovery rituals and renewal practices',
      'Building team norms that prevent burnout'
    ],
    leaveReadyTo: 'Implement a personal burnout prevention plan with specific boundaries and renewal practices.',
    duration: '60 minutes'
  },
  's8': {
    id: 's8',
    title: 'Manage Your Time',
    tagline: 'Take control of your schedule and focus on what matters most.',
    description: 'Master time management techniques that help you prioritize effectively and achieve more with less stress.',
    whatYouWillLearn: [
      'Analyzing how you currently spend your time',
      'Identifying and eliminating time wasters',
      'Using prioritization frameworks (Eisenhower Matrix, etc.)',
      'Time-blocking for deep work and focus',
      'Managing interruptions and saying no effectively'
    ],
    leaveReadyTo: 'Apply a personalized time management system that aligns with your priorities and work style.',
    duration: '75 minutes'
  },
  's9': {
    id: 's9',
    title: 'Self-Awareness',
    tagline: 'Deepen understanding of your strengths, triggers, and impact on others.',
    description: 'Develop greater self-awareness to lead more effectively and build stronger relationships.',
    whatYouWillLearn: [
      'Understanding your personality style and preferences',
      'Identifying personal values and motivations',
      'Recognizing emotional triggers and patterns',
      'Gathering feedback on your leadership impact',
      'Creating a personal development action plan'
    ],
    leaveReadyTo: 'Use self-awareness insights to adapt your leadership style and improve team dynamics.',
    duration: '90 minutes'
  },
  's10': {
    id: 's10',
    title: 'Successful Delegation',
    tagline: 'Empower others while freeing yourself to focus on high-impact work.',
    description: 'Learn to delegate effectively, developing your team while multiplying your impact.',
    whatYouWillLearn: [
      'Identifying what to delegate and to whom',
      'Matching tasks to team members\' development goals',
      'Providing clear context and expectations',
      'Creating accountability without micromanaging',
      'Using delegation as a development tool'
    ],
    leaveReadyTo: 'Confidently delegate tasks that develop others while freeing you for strategic work.',
    duration: '60 minutes'
  }
};