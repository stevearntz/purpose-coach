import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Priority/Focus area ID to full label mapping
const PRIORITY_LABELS: Record<string, string> = {
  'revenue': 'Revenue, sales, or growth targets',
  'customer': 'Customer success or retention',
  'product': 'Product or delivery milestones',
  'team': 'Team performance or growth',
  'collaboration': 'Cross-functional collaboration',
  'culture': 'Culture or engagement',
  'efficiency': 'Operational efficiency',
  'budget': 'Budget or cost management',
  'strategy': 'Strategy or planning',
  'change': 'Change or transformation efforts',
  'personal': 'My own focus / effectiveness',
  'risk': 'Risk management or compliance'
};

// Same resource catalog as the team recommendations
const RESOURCE_CATALOG = {
  courses: [
    // Well-Being Workshops
    {
      id: 'cultivating-gratitude',
      title: 'Cultivating Gratitude',
      category: 'Well-Being',
      duration: '60 minutes',
      format: 'Live Workshop',
      tags: ['gratitude', 'mindset', 'wellbeing', 'mental health', 'joy'],
      targetChallenges: ['work-life balance', 'mental health resources', 'culture or engagement'],
      targetSkills: ['emotional intelligence', 'mindfulness', 'resilience'],
      description: 'Integrate small, meaningful practices of gratitude into your everyday life to foster a more joyful mindset'
    },
    {
      id: 'habits-for-resilience',
      title: 'Habits for Resilience',
      category: 'Well-Being',
      duration: '60 minutes',
      format: 'Live Workshop',
      tags: ['resilience', 'stress', 'anxiety', 'overwhelm', 'habits', 'recovery'],
      targetChallenges: ['work-life balance', 'mental health resources', 'change or transformation efforts'],
      targetSkills: ['resilience', 'stress management', 'coping strategies'],
      description: 'Create habits to help withstand and recover from challenges quickly and combat stress, anxiety, and overwhelm'
    },
    {
      id: 'manage-burnout',
      title: 'Manage Burnout',
      category: 'Well-Being',
      duration: '60 minutes',
      format: 'Live Workshop',
      tags: ['burnout', 'wellbeing', 'mental health', 'stress management'],
      targetChallenges: ['work-life balance', 'mental health resources', 'performance management'],
      targetSkills: ['self-care', 'boundary setting', 'stress management'],
      description: 'Discover the factors that contribute to mental burnout and sharpen the tools to manage your wellbeing'
    },
    {
      id: 'leading-with-compassion',
      title: 'Leading with Compassion',
      category: 'Well-Being',
      duration: '60 minutes',
      format: 'Live Workshop',
      tags: ['compassion', 'empathy', 'leadership', 'emotional intelligence'],
      targetChallenges: ['day-to-day people issues', 'mental health resources', 'culture or engagement'],
      targetSkills: ['empathy', 'emotional intelligence', 'compassionate leadership'],
      description: 'Learn to lead with compassion and create a supportive environment for your team'
    },
    
    // Purpose + Direction Workshops
    {
      id: 'beat-imposter-syndrome',
      title: 'Beat Imposter Syndrome',
      category: 'Purpose + Direction',
      duration: '60 minutes',
      format: 'Live Workshop',
      tags: ['imposter syndrome', 'confidence', 'self-belief', 'mindset'],
      targetChallenges: ['high performer growth', 'my own focus / effectiveness'],
      targetSkills: ['self-confidence', 'self-awareness', 'mindset'],
      description: 'Rewrite one internal monologue that contributes most to feelings of imposter syndrome'
    },
    {
      id: 'self-awareness',
      title: 'Self-Awareness',
      category: 'Purpose + Direction',
      duration: '60 minutes',
      format: 'Live Workshop',
      tags: ['self-awareness', 'empathy', 'decision-making', 'relationships'],
      targetChallenges: ['my own focus / effectiveness', 'high performer growth'],
      targetSkills: ['self-awareness', 'emotional intelligence', 'empathy'],
      description: 'Cultivate self-awareness to improve decision-making, strengthen relationships, and lead with empathy'
    },
    {
      id: 'career-mapping',
      title: 'Career Mapping',
      category: 'Purpose + Direction',
      duration: '60 minutes',
      format: 'Live Workshop',
      tags: ['career', 'growth', 'development', 'planning', 'goals'],
      targetChallenges: ['high performer growth', 'talent acquisition', 'performance management'],
      targetSkills: ['career planning', 'goal setting', 'strategic thinking'],
      description: 'Map out your career path and identify key milestones for professional growth'
    },
    {
      id: 'setting-achieving-goals',
      title: 'Setting and Achieving Goals',
      category: 'Purpose + Direction',
      duration: '60 minutes',
      format: 'Live Workshop',
      tags: ['goals', 'achievement', 'planning', 'focus', 'execution'],
      targetChallenges: ['strategy or planning', 'my own focus / effectiveness', 'project planning'],
      targetSkills: ['goal setting', 'planning', 'execution'],
      description: 'Learn to set meaningful goals and create actionable plans to achieve them'
    },
    
    // Feedback + Trust Workshops
    {
      id: 'constructive-conflict',
      title: 'Constructive Conflict',
      category: 'Feedback + Trust',
      duration: '60 minutes',
      format: 'Live Workshop',
      tags: ['conflict', 'communication', 'resolution', 'feedback'],
      targetChallenges: ['day-to-day people issues', 'feedback and terminations', 'difficult terminations'],
      targetSkills: ['conflict resolution', 'communication', 'emotional regulation'],
      description: 'Learn your natural response as a manager and how to help others control their default responses to conflict'
    },
    {
      id: 'art-of-recognition',
      title: 'The Art of Recognition',
      category: 'Feedback + Trust',
      duration: '60 minutes',
      format: 'Live Workshop',
      tags: ['recognition', 'appreciation', 'motivation', 'engagement'],
      targetChallenges: ['culture or engagement', 'team performance or growth', 'high performer growth'],
      targetSkills: ['recognition', 'motivation', 'team building'],
      description: 'Unlock your team\'s best work through tactful recognition'
    },
    {
      id: 'deliver-feedback',
      title: 'Deliver Feedback',
      category: 'Feedback + Trust',
      duration: '60 minutes',
      format: 'Live Workshop',
      tags: ['feedback', 'communication', 'development', 'performance'],
      targetChallenges: ['feedback and terminations', 'performance management', 'difficult terminations'],
      targetSkills: ['feedback delivery', 'communication', 'coaching'],
      description: 'Master the art of delivering constructive feedback that drives growth'
    },
    {
      id: 'performance-discussions',
      title: 'Performance Discussions',
      category: 'Feedback + Trust',
      duration: '60 minutes',
      format: 'Live Workshop',
      tags: ['performance', 'feedback', 'development', 'management'],
      targetChallenges: ['performance management', 'feedback and terminations', 'high performer growth'],
      targetSkills: ['performance management', 'feedback', 'coaching'],
      description: 'Lead effective performance discussions that motivate and develop your team'
    },
    
    // Communication Workshops
    {
      id: 'deliberate-listening',
      title: 'Deliberate Listening',
      category: 'Communication and Collaboration',
      duration: '60 minutes',
      format: 'Live Workshop',
      tags: ['listening', 'communication', 'empathy', 'connection'],
      targetChallenges: ['day-to-day people issues', 'hybrid collaboration', 'culture or engagement'],
      targetSkills: ['active listening', 'empathy', 'communication'],
      description: 'Unlock the power of intentional listening by focusing your mind, space, and body on helping others feel seen'
    },
    {
      id: 'hopes-fears-expectations',
      title: 'Hopes, Fears, and Expectations',
      category: 'Communication and Collaboration',
      duration: '60 minutes',
      format: 'Live Workshop',
      tags: ['psychological safety', 'team building', 'communication', 'trust'],
      targetChallenges: ['culture or engagement', 'change or transformation efforts', 'team performance or growth'],
      targetSkills: ['vulnerability', 'trust building', 'team dynamics'],
      description: 'Create psychological safety by sharing hopes, fears, and expectations with your team'
    },
    {
      id: 'conscious-communication',
      title: 'Conscious Communication',
      category: 'Communication and Collaboration',
      duration: '60 minutes',
      format: 'Live Workshop',
      tags: ['communication', 'mindfulness', 'clarity', 'connection'],
      targetChallenges: ['hybrid collaboration', 'day-to-day people issues', 'culture or engagement'],
      targetSkills: ['communication', 'mindfulness', 'clarity'],
      description: 'Communicate with intention and clarity to build stronger connections'
    },
    {
      id: 'campfire-storytelling',
      title: 'Campfire Storytelling',
      category: 'Communication and Collaboration',
      duration: '60 minutes',
      format: 'Live Workshop',
      tags: ['storytelling', 'communication', 'influence', 'engagement'],
      targetChallenges: ['culture or engagement', 'change or transformation efforts'],
      targetSkills: ['storytelling', 'influence', 'engagement'],
      description: 'Use the power of storytelling to inspire and connect with your team'
    },
    {
      id: 'lead-effective-meetings',
      title: 'Lead Effective Meetings',
      category: 'Communication and Collaboration',
      duration: '60 minutes',
      format: 'Live Workshop',
      tags: ['meetings', 'facilitation', 'productivity', 'collaboration'],
      targetChallenges: ['hybrid collaboration', 'project planning', 'my own focus / effectiveness'],
      targetSkills: ['facilitation', 'meeting management', 'productivity'],
      description: 'Transform meetings from time-wasters to productive collaborations'
    },
    {
      id: 'curiosity-in-conversations',
      title: 'Curiosity in Conversations',
      category: 'Communication and Collaboration',
      duration: '60 minutes',
      format: 'Live Workshop',
      tags: ['curiosity', 'questions', 'communication', 'discovery'],
      targetChallenges: ['day-to-day people issues', 'culture or engagement'],
      targetSkills: ['curiosity', 'questioning', 'active listening'],
      description: 'Use curiosity to deepen conversations and unlock new insights'
    },
    
    // Decision Making Workshops
    {
      id: 'manage-your-time',
      title: 'Manage Your Time',
      category: 'Decision Making',
      duration: '60 minutes',
      format: 'Live Workshop',
      tags: ['time management', 'priorities', 'productivity', 'focus'],
      targetChallenges: ['my own focus / effectiveness', 'project planning', 'work-life balance'],
      targetSkills: ['time management', 'prioritization', 'productivity'],
      description: 'Protect your time for what matters most by grounding your priorities in people and purpose'
    },
    {
      id: 'decision-making',
      title: 'Decision Making',
      category: 'Decision Making',
      duration: '60 minutes',
      format: 'Live Workshop',
      tags: ['decisions', 'problem-solving', 'analysis', 'judgment'],
      targetChallenges: ['strategy or planning', 'leading through ambiguity', 'risk management or compliance'],
      targetSkills: ['decision making', 'critical thinking', 'problem solving'],
      description: 'Develop frameworks and approaches for making better decisions'
    },
    {
      id: 'strategic-thinking',
      title: 'Strategic Thinking',
      category: 'Decision Making',
      duration: '60 minutes',
      format: 'Live Workshop',
      tags: ['strategy', 'planning', 'vision', 'long-term thinking'],
      targetChallenges: ['strategy or planning', 'leading through ambiguity', 'project planning'],
      targetSkills: ['strategic thinking', 'planning', 'vision'],
      description: 'Develop strategic thinking capabilities to see the bigger picture'
    },
    
    // Empowering Others Workshops
    {
      id: 'successful-delegation',
      title: 'Successful Delegation',
      category: 'Empowering Others',
      duration: '60 minutes',
      format: 'Live Workshop',
      tags: ['delegation', 'empowerment', 'leadership', 'trust'],
      targetChallenges: ['delegation', 'team performance or growth', 'my own focus / effectiveness'],
      targetSkills: ['delegation', 'trust building', 'empowerment'],
      description: 'Sharpen your delegation skills and create space for your most essential work'
    },
    {
      id: 'inclusive-leadership',
      title: 'Inclusive Leadership',
      category: 'Empowering Others',
      duration: '60 minutes',
      format: 'Live Workshop',
      tags: ['inclusion', 'diversity', 'belonging', 'equity'],
      targetChallenges: ['culture or engagement', 'talent acquisition', 'team performance or growth'],
      targetSkills: ['inclusive leadership', 'cultural awareness', 'empathy'],
      description: 'Lead inclusively to create environments where everyone can thrive'
    },
    {
      id: 'magnify-strengths',
      title: 'Magnify Strengths',
      category: 'Empowering Others',
      duration: '60 minutes',
      format: 'Live Workshop',
      tags: ['strengths', 'development', 'coaching', 'potential'],
      targetChallenges: ['high performer growth', 'team performance or growth', 'performance management'],
      targetSkills: ['strengths coaching', 'development', 'empowerment'],
      description: 'Identify and amplify the unique strengths of your team members'
    },
    {
      id: 'foster-belonging',
      title: 'Foster Belonging',
      category: 'Empowering Others',
      duration: '60 minutes',
      format: 'Live Workshop',
      tags: ['belonging', 'inclusion', 'psychological safety', 'culture'],
      targetChallenges: ['culture or engagement', 'talent acquisition', 'hybrid collaboration'],
      targetSkills: ['inclusion', 'belonging', 'team building'],
      description: 'Create a sense of belonging where everyone feels valued and included'
    },
    
    // Change Navigation Workshops
    {
      id: 'lead-through-change',
      title: 'Lead Through Change',
      category: 'Navigating Change',
      duration: '60 minutes',
      format: 'Live Workshop',
      tags: ['change', 'leadership', 'transformation', 'resilience'],
      targetChallenges: ['change or transformation efforts', 'leading through ambiguity', 'culture or engagement'],
      targetSkills: ['change leadership', 'communication', 'resilience'],
      description: 'Support your team through change by creating space for concerns and guiding them toward the future'
    },
    
    // Alignment + Direction Workshops
    {
      id: 'inspire-with-vision',
      title: 'Inspire with Vision',
      category: 'Alignment + Direction',
      duration: '60 minutes',
      format: 'Live Workshop',
      tags: ['vision', 'inspiration', 'alignment', 'leadership'],
      targetChallenges: ['strategy or planning', 'culture or engagement', 'team performance or growth'],
      targetSkills: ['vision creation', 'inspiration', 'alignment'],
      description: 'Establish a vision and align with your team to move towards it together'
    },
    {
      id: 'set-the-tone',
      title: 'Set the Tone',
      category: 'Alignment + Direction',
      duration: '60 minutes',
      format: 'Live Workshop',
      tags: ['culture', 'leadership', 'tone', 'values'],
      targetChallenges: ['culture or engagement', 'team performance or growth', 'change or transformation efforts'],
      targetSkills: ['culture building', 'leadership presence', 'values alignment'],
      description: 'Set the cultural tone for your team through intentional leadership'
    },
    
    // Skill Building Workshops
    {
      id: 'connected-leadership',
      title: 'Connected Leadership',
      category: 'Leadership Skills',
      duration: '60 minutes',
      format: 'Live Workshop',
      tags: ['leadership', 'connection', 'relationships', 'influence'],
      targetChallenges: ['culture or engagement', 'team performance or growth', 'hybrid collaboration'],
      targetSkills: ['relationship building', 'influence', 'connection'],
      description: 'Build authentic connections to lead more effectively'
    },
    {
      id: 'live-group-coaching',
      title: 'Live Group Coaching',
      category: 'Skill Building',
      duration: '60 minutes',
      format: 'Live Workshop',
      tags: ['coaching', 'development', 'learning', 'peer support'],
      targetChallenges: ['high performer growth', 'team performance or growth'],
      targetSkills: ['coaching', 'facilitation', 'peer learning'],
      description: 'Experience the power of group coaching for collective growth'
    },
    {
      id: 'develop-your-team',
      title: 'Develop Your Team',
      category: 'Skill Building',
      duration: '60 minutes',
      format: 'Live Workshop',
      tags: ['team development', 'coaching', 'growth', 'performance'],
      targetChallenges: ['team performance or growth', 'high performer growth', 'performance management'],
      targetSkills: ['team development', 'coaching', 'performance management'],
      description: 'Learn strategies to develop your team\'s capabilities and potential'
    },
    {
      id: 'coaching-essentials',
      title: 'Coaching Essentials',
      category: 'Skill Building',
      duration: '60 minutes',
      format: 'Live Workshop',
      tags: ['coaching', 'questions', 'development', 'growth'],
      targetChallenges: ['high performer growth', 'team performance or growth', 'performance management'],
      targetSkills: ['coaching', 'questioning', 'development'],
      description: 'Master essential coaching skills to develop others effectively'
    }
  ],
  tools: [
    {
      id: 'team-charter',
      title: 'Team Charter',
      category: 'Team Tool',
      duration: '30 minutes',
      format: 'Interactive Assessment',
      tags: ['alignment', 'purpose', 'values', 'team', 'clarity'],
      targetChallenges: ['team performance or growth', 'culture or engagement', 'hybrid collaboration'],
      targetSkills: ['alignment', 'team building', 'clarity'],
      targetNeeds: ['alignment resources', 'team building support'],
      description: 'Create clarity and alignment on your team\'s purpose, values, and ways of working'
    },
    {
      id: 'trust-audit',
      title: 'Trust Audit',
      category: 'Personal/Team Tool',
      duration: '15 minutes',
      format: 'Assessment',
      tags: ['trust', 'relationships', 'feedback', 'communication'],
      targetChallenges: ['culture or engagement', 'day-to-day people issues', 'feedback and terminations'],
      targetSkills: ['trust building', 'relationship management'],
      targetNeeds: ['trust building support', 'feedback resources'],
      description: 'Assess trust across key dimensions to strengthen your professional relationships'
    },
    {
      id: 'burnout-assessment',
      title: 'Burnout Assessment',
      category: 'Personal Tool',
      duration: '10 minutes',
      format: 'Self-Assessment',
      tags: ['burnout', 'wellbeing', 'stress', 'mental health'],
      targetChallenges: ['work-life balance', 'mental health resources', 'performance management'],
      targetNeeds: ['mental health resources', 'wellbeing support'],
      description: 'Evaluate your current state and get strategies for maintaining well-being'
    },
    {
      id: 'decision-making-audit',
      title: 'Decision Making Audit',
      category: 'Personal Tool',
      duration: '15 minutes',
      format: 'Self-Assessment',
      tags: ['decisions', 'analysis', 'judgment', 'growth'],
      targetChallenges: ['leading through ambiguity', 'strategy or planning', 'my own focus / effectiveness'],
      targetSkills: ['decision making', 'self-awareness'],
      targetNeeds: ['decision support', 'clarity resources'],
      description: 'Evaluate how you make decisions to identify strengths and growth areas'
    },
    {
      id: 'change-style-profile',
      title: 'Change Style Profile',
      category: 'Personal Tool',
      duration: '15 minutes',
      format: 'Assessment',
      tags: ['change', 'adaptability', 'transitions', 'resilience'],
      targetChallenges: ['change or transformation efforts', 'leading through ambiguity'],
      targetSkills: ['adaptability', 'change management'],
      targetNeeds: ['change management support'],
      description: 'Understand how you naturally respond to change and get strategies for navigating transitions'
    },
    {
      id: 'change-readiness',
      title: 'Change Readiness Assessment',
      category: 'Personal/Team Tool',
      duration: '20 minutes',
      format: 'Assessment',
      tags: ['change', 'readiness', 'preparation', 'support'],
      targetChallenges: ['change or transformation efforts', 'leading through ambiguity'],
      targetSkills: ['change readiness', 'preparation'],
      targetNeeds: ['change management support'],
      description: 'Assess your readiness for change and identify where you need support'
    },
    {
      id: 'user-guide',
      title: 'User Guide',
      category: 'Personal Tool',
      duration: '25 minutes',
      format: 'Interactive Tool',
      tags: ['collaboration', 'communication', 'working styles', 'preferences'],
      targetChallenges: ['hybrid collaboration', 'day-to-day people issues', 'culture or engagement'],
      targetSkills: ['self-awareness', 'communication'],
      targetNeeds: ['collaboration resources'],
      description: 'Build a shareable guide that helps others collaborate effectively with you'
    },
    {
      id: 'expectations-reflection',
      title: 'Expectations Reflection',
      category: 'Team Tool',
      duration: '20 minutes',
      format: 'Team Exercise',
      tags: ['expectations', 'psychological safety', 'trust', 'communication'],
      targetChallenges: ['culture or engagement', 'change or transformation efforts', 'team performance or growth'],
      targetSkills: ['vulnerability', 'trust building'],
      targetNeeds: ['psychological safety resources'],
      description: 'Create psychological safety by sharing hopes, fears, and expectations'
    },
    {
      id: 'drivers-reflection',
      title: 'Drivers Reflection',
      category: 'Personal Tool',
      duration: '15 minutes',
      format: 'Self-Reflection',
      tags: ['motivation', 'career', 'purpose', 'values'],
      targetChallenges: ['high performer growth', 'my own focus / effectiveness'],
      targetSkills: ['self-awareness', 'clarity'],
      targetNeeds: ['career development resources'],
      description: 'Identify and prioritize what truly drives you in your career'
    },
    {
      id: 'coaching-cards',
      title: 'Coaching Cards',
      category: 'Personal Tool',
      duration: '10-30 minutes',
      format: 'Coaching Tool',
      tags: ['coaching', 'reflection', 'questions', 'growth'],
      targetChallenges: ['high performer growth', 'team performance or growth'],
      targetSkills: ['self-reflection', 'coaching'],
      targetNeeds: ['coaching resources', 'development support'],
      description: 'Use powerful questions to guide self-reflection and growth'
    },
    {
      id: 'change-reflection',
      title: 'Change Reflection',
      category: 'Team Tool',
      duration: '20 minutes',
      format: 'Team Discussion Guide',
      tags: ['change', 'conversation', 'team', 'preparation'],
      targetChallenges: ['change or transformation efforts', 'team performance or growth'],
      targetSkills: ['change communication', 'facilitation'],
      targetNeeds: ['change management support'],
      description: 'Prepare for meaningful conversations about change with your team members'
    },
    {
      id: 'focus-finder',
      title: 'Focus Finder',
      category: 'Personal Tool',
      duration: '5 minutes',
      format: 'Weekly Reflection',
      tags: ['focus', 'priorities', 'reflection', 'clarity'],
      targetChallenges: ['my own focus / effectiveness', 'project planning'],
      targetSkills: ['prioritization', 'focus'],
      targetNeeds: ['focus support', 'clarity resources'],
      description: 'A rapid weekly reflection to surface what really matters'
    }
  ]
};

// Calculate relevance score between user needs and resource
function calculateRelevanceScore(
  resource: any,
  userChallenges: string[],
  userSkills: string[],
  userNeeds: string[],
  userFocusAreas: string[]
): number {
  let score = 0;
  
  // Check challenge matches (highest weight)
  if (resource.targetChallenges) {
    resource.targetChallenges.forEach((challenge: string) => {
      userChallenges.forEach(userChallenge => {
        if (challenge.toLowerCase().includes(userChallenge.toLowerCase()) ||
            userChallenge.toLowerCase().includes(challenge.toLowerCase())) {
          score += 30;
        }
      });
    });
  }
  
  // Check skill matches
  if (resource.targetSkills) {
    resource.targetSkills.forEach((skill: string) => {
      userSkills.forEach(userSkill => {
        if (skill.toLowerCase().includes(userSkill.toLowerCase()) ||
            userSkill.toLowerCase().includes(skill.toLowerCase())) {
          score += 20;
        }
      });
    });
  }
  
  // Check support needs matches
  if (resource.targetNeeds) {
    resource.targetNeeds.forEach((need: string) => {
      userNeeds.forEach(userNeed => {
        if (need.toLowerCase().includes(userNeed.toLowerCase()) ||
            userNeed.toLowerCase().includes(need.toLowerCase())) {
          score += 25;
        }
      });
    });
  }
  
  // Check tag matches (lower weight)
  if (resource.tags) {
    const allUserTerms = [...userChallenges, ...userSkills, ...userNeeds, ...userFocusAreas];
    resource.tags.forEach((tag: string) => {
      allUserTerms.forEach(term => {
        if (tag.toLowerCase().includes(term.toLowerCase()) ||
            term.toLowerCase().includes(tag.toLowerCase())) {
          score += 10;
        }
      });
    });
  }
  
  return score;
}

export async function GET(request: NextRequest) {
  try {
    console.log('[member/recommendations] Starting request');
    const { userId } = await auth();
    
    console.log('[member/recommendations] User ID:', userId);
    
    if (!userId) {
      console.log('[member/recommendations] No userId found, returning 401');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get the user profile
    console.log('[member/recommendations] Fetching user profile for:', userId);
    const userProfile = await prisma.userProfile.findUnique({
      where: { clerkUserId: userId }
    });
    
    if (!userProfile) {
      console.log('[member/recommendations] No user profile found for:', userId);
      return NextResponse.json({ 
        recommendations: {
          courses: [],
          tools: [],
          insights: {
            topChallenges: [],
            topSkills: [],
            topNeeds: [],
            topFocusAreas: [],
            aiSummary: null
          },
          metadata: {
            totalAssessments: 0,
            lastUpdated: new Date().toISOString()
          }
        }
      });
    }
    
    console.log('[member/recommendations] User profile found:', userProfile.id);
    
    // Get the user's assessment results through invitations
    // First, find invitations for this user's email
    const userEmail = userProfile.email;
    
    if (!userEmail) {
      console.log('[member/recommendations] User profile has no email, returning empty results');
      return NextResponse.json({ 
        recommendations: {
          courses: [],
          tools: [],
          insights: {
            topChallenges: [],
            topSkills: [],
            topNeeds: [],
            topFocusAreas: [],
            aiSummary: null
          },
          metadata: {
            totalAssessments: 0,
            lastUpdated: new Date().toISOString(),
            memberName: `${userProfile.firstName} ${userProfile.lastName}`.trim() || undefined
          }
        }
      });
    }
    
    console.log('[member/recommendations] Looking for invitations for email:', userEmail);
    
    const invitations = await prisma.invitation.findMany({
      where: {
        email: userEmail,
        status: 'COMPLETED'
      },
      include: {
        assessmentResults: true
      }
    });
    
    console.log('[member/recommendations] Found invitations:', invitations.length);
    
    // Extract all assessment results from the invitations
    const assessmentResults = invitations.flatMap(invitation => invitation.assessmentResults);
    console.log('[member/recommendations] Total assessment results:', assessmentResults.length);
    
    // Aggregate data from user's assessments
    const aggregatedData = {
      challenges: new Map<string, number>(),
      skills: new Map<string, number>(),
      supportNeeds: new Map<string, number>(),
      focusAreas: new Map<string, number>()
    };
    
    // Count occurrences of each item
    assessmentResults.forEach(result => {
      if (result.insights && typeof result.insights === 'object') {
        const insights = result.insights as any;
        
        // Process challenges
        if (insights.mainChallengeAreas) {
          Object.values(insights.mainChallengeAreas).forEach((area: any) => {
            if (area.challenges) {
              area.challenges.forEach((challenge: string) => {
                const count = aggregatedData.challenges.get(challenge) || 0;
                aggregatedData.challenges.set(challenge, count + 1);
              });
            }
          });
        }
        
        // Process skills
        if (insights.skillsToImprove) {
          insights.skillsToImprove.forEach((skill: string) => {
            const count = aggregatedData.skills.get(skill) || 0;
            aggregatedData.skills.set(skill, count + 1);
          });
        }
        // Also check for skillGaps (alternate field name)
        if (insights.skillGaps) {
          const skillGapsArray = Array.isArray(insights.skillGaps) 
            ? insights.skillGaps 
            : Object.values(insights.skillGaps).flat();
          skillGapsArray.forEach((skill: any) => {
            if (typeof skill === 'string') {
              const count = aggregatedData.skills.get(skill) || 0;
              aggregatedData.skills.set(skill, count + 1);
            }
          });
        }
        
        // Process support needs
        if (insights.supportNeeded) {
          insights.supportNeeded.forEach((need: string) => {
            const count = aggregatedData.supportNeeds.get(need) || 0;
            aggregatedData.supportNeeds.set(need, count + 1);
          });
        }
        // Also check for supportNeeds (alternate field name)
        if (insights.supportNeeds) {
          const supportNeedsArray = Array.isArray(insights.supportNeeds) 
            ? insights.supportNeeds 
            : Object.values(insights.supportNeeds).flat();
          supportNeedsArray.forEach((need: any) => {
            if (typeof need === 'string') {
              const count = aggregatedData.supportNeeds.get(need) || 0;
              aggregatedData.supportNeeds.set(need, count + 1);
            }
          });
        }
      }
      
      // Process responses for focus areas
      if (result.responses && typeof result.responses === 'object') {
        const responses = result.responses as any;
        if (responses.priorities || responses.selectedPriorities) {
          const prioritiesArray = Array.isArray(responses.priorities || responses.selectedPriorities) 
            ? (responses.priorities || responses.selectedPriorities)
            : [responses.priorities || responses.selectedPriorities];
          prioritiesArray.forEach((priority: string) => {
            if (priority) {
              // Convert priority ID to full label
              const fullLabel = PRIORITY_LABELS[priority] || priority;
              const count = aggregatedData.focusAreas.get(fullLabel) || 0;
              aggregatedData.focusAreas.set(fullLabel, count + 1);
            }
          });
        }
      }
      
      // Also check insights for priorities/focus areas
      if (result.insights && typeof result.insights === 'object') {
        const insights = result.insights as any;
        if (insights.priorities) {
          const prioritiesArray = Array.isArray(insights.priorities) 
            ? insights.priorities 
            : Object.values(insights.priorities).flat();
          prioritiesArray.forEach((priority: any) => {
            if (typeof priority === 'string') {
              // Convert priority ID to full label
              const fullLabel = PRIORITY_LABELS[priority] || priority;
              const count = aggregatedData.focusAreas.get(fullLabel) || 0;
              aggregatedData.focusAreas.set(fullLabel, count + 1);
            }
          });
        }
      }
    });
    
    // Get top items from each category
    const getTopItems = (map: Map<string, number>, limit = 5) => {
      return Array.from(map.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([item]) => item);
    };
    
    const topChallenges = getTopItems(aggregatedData.challenges);
    const topSkills = getTopItems(aggregatedData.skills);
    const topNeeds = getTopItems(aggregatedData.supportNeeds);
    const topFocusAreas = getTopItems(aggregatedData.focusAreas);
    
    // Score and rank all resources
    const courseRecommendations = RESOURCE_CATALOG.courses.map(course => ({
      ...course,
      relevanceScore: calculateRelevanceScore(
        course,
        topChallenges,
        topSkills,
        topNeeds,
        topFocusAreas
      ),
      type: 'course' as const
    }));
    
    const toolRecommendations = RESOURCE_CATALOG.tools.map(tool => ({
      ...tool,
      relevanceScore: calculateRelevanceScore(
        tool,
        topChallenges,
        topSkills,
        topNeeds,
        topFocusAreas
      ),
      type: 'tool' as const
    }));
    
    // Sort by relevance and take top recommendations
    const topCourses = courseRecommendations
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5);
    
    const topTools = toolRecommendations
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 3);
    
    // Generate AI insights using OpenAI
    let aiInsights = null;
    if (topChallenges.length > 0) {
      try {
        const prompt = `Based on this individual's assessment data:
        Top Challenges: ${topChallenges.join(', ')}
        Skills Gaps: ${topSkills.join(', ')}
        Support Needs: ${topNeeds.join(', ')}
        Focus Areas: ${topFocusAreas.join(', ')}
        
        Provide a brief (2-3 sentences) personalized development recommendation focused on what this individual should prioritize for their growth.`;
        
        const completion = await openai.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'gpt-4-0125-preview',
          max_tokens: 150,
          temperature: 0.7
        });
        
        aiInsights = completion.choices[0]?.message?.content;
      } catch (error) {
        console.error('Failed to generate AI insights:', error);
      }
    }
    
    return NextResponse.json({
      recommendations: {
        courses: topCourses,
        tools: topTools,
        insights: {
          topChallenges,
          topSkills,
          topNeeds,
          topFocusAreas,
          aiSummary: aiInsights
        },
        metadata: {
          totalAssessments: assessmentResults.length,
          lastUpdated: new Date().toISOString(),
          memberName: `${userProfile.firstName} ${userProfile.lastName}`.trim() || undefined,
          memberEmail: userProfile.email || undefined
        }
      }
    });
    
  } catch (error) {
    console.error('[member/recommendations] Error:', error);
    
    // More detailed error response for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = {
      error: 'Failed to generate recommendations',
      message: errorMessage,
      timestamp: new Date().toISOString()
    };
    
    console.error('[member/recommendations] Error details:', errorDetails);
    
    return NextResponse.json(errorDetails, { status: 500 });
  }
}