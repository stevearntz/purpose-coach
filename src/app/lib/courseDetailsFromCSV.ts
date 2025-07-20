export interface CourseDetailCSV {
  id: string;
  title: string;
  description: string;
  actionToTake: string;
  howToPrepare: string;
}

// Parse HTML content to clean text while preserving list structure
const parseHtmlContent = (html: string): string[] => {
  if (!html) return [];
  
  // Remove <div><br></div> and <br> tags
  const cleaned = html.replace(/<div><br><\/div>/g, '').replace(/<br>/g, '');
  
  // Extract list items
  const listItems = cleaned.match(/<li>(.*?)<\/li>/g) || [];
  
  return listItems.map(item => 
    item.replace(/<li>/g, '').replace(/<\/li>/g, '').trim()
  ).filter(item => item.length > 0);
};

export const courseDetailsFromCSV: { [key: string]: CourseDetailCSV } = {
  's16': {
    id: 's16',
    title: 'Activate Autonomy',
    description: 'Identify where you want more ownership and learn how to ask for it in a way that builds trust.',
    actionToTake: 'Reflecting on a moment when you felt empowered\nPinpointing a project or area where you want more autonomy\nLearning four simple ways to show you\'re ready for more ownership\nPracticing how to communicate your ask clearly and confidently',
    howToPrepare: 'Have you ever wanted more autonomy in your role? How difficult or easy was it to get that autonomy from your leader, and how did it affect your overall workplace experience?\nWhen it comes to those you lead, do you think autonomy is earned or given, and is there a reason to prefer one over the other?'
  },
  's2': {
    id: 's2',
    title: 'Beat Imposter Syndrome',
    description: 'Rewrite one internal monologue that contributes most to feelings of imposter syndrome.',
    actionToTake: 'Discussing how to separate your achievements from your value\nUnderstanding how to face new things with courage and self-compassion\nPracticing being our own biggest cheerleader by changing how we think about ourselves',
    howToPrepare: 'Have you ever felt like you were not qualified enough, not competent enough, or didn\'t have enough skills and knowledge to be successful in your role, whether those thoughts were actually true or not?\nDo you have a hard time telling the difference between feeling like a fraud, understanding that we often underestimate our own skills and knowledge, and accepting that we\'re all learning and growing in our roles?'
  },
  's14': {
    id: 's14',
    title: 'Build Trust on Your Team',
    description: 'Create an environment where trust flourishes and team members work together efficiently and effectively.',
    actionToTake: 'Reflecting on one team member that you want to build trust with\nCompleting a Trust Audit to identify where trust might be lacking with that individual\nContemplate the impact of increased trust\nDiscuss ICE - the three building blocks of building trusting relationships',
    howToPrepare: 'Do I know my team members personally (e.g. likes, dislikes, hobbies, etc.)?\nWhat do I believe about the quality of my team\'s work? Do I feel comfortable giving team members challenging projects?\nDo I feel comfortable talking through difficult topics with my team members?'
  },
  's36': {
    id: 's36',
    title: 'Candid Communication',
    description: 'Communicate with others in straightforward, clear way, while also inviting the perspectives of the other person.',
    actionToTake: 'Learning principles like how to address needs instead of focusing on problems\nUnderstand how communicating directly can grow relationships\nOvercoming obstacles to addressing things clearly',
    howToPrepare: ''
  },
  's30': {
    id: 's30',
    title: 'Career Mapping',
    description: 'Identify one meaningful step in your career that brings you closer to your overall vision of success.',
    actionToTake: '',
    howToPrepare: ''
  },
  's17': {
    id: 's17',
    title: 'Coaching Essentials',
    description: 'Develop the skills to become effective coaches: tools and techniques to guide meaningful and supportive conversations.',
    actionToTake: 'Reflecting on how coaching from others has supported your growth and what made the difference\nDiscussing the difference between coaching and directing and the appropriate time to do each\nIdentifying everyday coaching moments\nPracticing the double diamond coaching questions framework',
    howToPrepare: ''
  },
  's31': {
    id: 's31',
    title: 'Conscious Communication',
    description: 'Craft clear, impactful messages by defining your goals and desired outcomes.',
    actionToTake: 'Reflecting on moments when you\'ve successfully directed your team towards an outcome\nDiscussing what it means to communicate like a coxswain\nLearn about the ROW framework and how to craft focused messages\nPracticing delivering your next message and getting feedback on how to make it more clear and effective',
    howToPrepare: 'How effective are you at communicating clearly, simply, and purposefully with your team?\nHow would your team rate your ability to communicate clearly and simply and with purpose?\n\nA manager\'s #1 responsibility is to lead their team towards the same goal. One way they can accomplish this is through intentional and simple communication, and when this skill is lacking, both individual and team success are at risk.'
  },
  's3': {
    id: 's3',
    title: 'Constructive Conflict',
    description: 'Learn your natural response as a manager and how to help others control their default responses to conflict.',
    actionToTake: 'Reflecting on a situation where conflict was resolved well\nDiscuss the elements of productive conflict (FIRE framework)\nDetermine the ways you can change the culture of conflict on your team',
    howToPrepare: 'Is your natural reaction to conflict usually negative or positive and why do you think this happens?\nHow has your response to any conflicts affected you as a leader and your team as a whole?\n\nConflict can be common in the workplace since each team member has unique values, experiences, and perspectives; consequently, a leader\'s reaction to conflict can make or break team culture in both the short- and long-term.'
  },
  's1': {
    id: 's1',
    title: 'Cultivating Gratitude',
    description: 'Integrate small, meaningful practices of gratitude into your everyday life to foster a more joyful mindset.',
    actionToTake: 'Reflecting on what we are grateful for in this moment\nSharing appreciation for those we work with\nDiscussing the 3 different aspects of gratitude\nLearning some benefits of practicing gratitude\nChoosing a gratitude practice to implement into our lives',
    howToPrepare: ''
  },
  's18': {
    id: 's18',
    title: 'Curiosity in Conversations',
    description: 'See a team member\'s whole self through actively applying curiosity to your conversations.',
    actionToTake: 'Practicing curiosity by identifying as many differences and commonalities with a partner\nReflecting on what motivates others at work and how we might discover the answers\nDiscussing different aspects of the whole work self and what understanding others in this wholistic way might unlock',
    howToPrepare: 'Do you know what motivates and energizes each member of your team?\nDo you approach workplace conversations with assumptions or with curiosity, and what\'s the difference?'
  },
  's32': {
    id: 's32',
    title: 'Decision Making',
    description: 'Strengthen your ability to make quick, effective decisions and back them up with aligned action.',
    actionToTake: 'Reflecting on a decision you made that you were dissatisfied with\nDiscussing how the impact of action taken after a decision is often greater than the impact of the decision itself\nGaining perspective through participating in the Climb the Tree mechanic',
    howToPrepare: 'How can I redirect a decision I regret?\nHow can I make the best decisions?\nWhat factors should I consider when making decisions?'
  },
  's15': {
    id: 's15',
    title: 'Define Your Leadership Brand',
    description: 'Define your leadership brand and uncover news ways to guide your team.',
    actionToTake: 'Identifying a leader who has impacted you\nDiscussing what good leadership can look like\nLearning the importance of values + aligned action in defining a personal leadership brand\nComplete a personal leadership value audit to identify key aspects of your personal leadership brand',
    howToPrepare: 'Who are your favorite leaders from the past, and why were they your favorites?\nDo you think you\'re that type of leader right now? Why or why not?\n\nThere are as many ways to be a strong leader as there are leaders. Each leader gets to design their own leadership brand, which happens when values are combined with vision and action.'
  },
  's4': {
    id: 's4',
    title: 'Deliberate Listening',
    description: 'Unlock the power of intentional listening by focusing your mind, space, and body on helping others feel seen.',
    actionToTake: 'Auditing our physical space and learning the different between avoiding and resisting distractions\nAsking for what others need to hear in our responses\nBeing aware of our body language and how it impacts the messages we send',
    howToPrepare: 'What makes a good listener so good?\nHow does a good listener make you feel?\nWhat things do you do to be a good listener?\n\nFor a little inspiration watch this TEDx featuring Ronnie Polaneczky. She chronicles her work as a journalist and offers some great nuggets on listening. While our session is not built on her ideas, her talk did inspire us.'
  },
  's28': {
    id: 's28',
    title: 'Deliver Feedback',
    description: 'Bridge gaps and build trust by offering clear, constructive feedback.',
    actionToTake: 'Identifying some feedback that you need to share with an individual on your team\nSharing what makes giving feedback difficult\nDiscussing the importance of being direct and caring and not evasive or harsh\nLearning the 5 principles of how to bridge the gap as you give feedback\nPracticing giving feedback to others in the room',
    howToPrepare: 'Have you ever had to offer difficult feedback and it didn\'t go well?\nDo you struggle with knowing how to offer feedback that is constructive and that will result in stronger relationships in your workplace?'
  },
  's19': {
    id: 's19',
    title: 'Develop Your Team',
    description: 'Make your team indispensable by identifying strengths, addressing gaps, and crafting a development plan.',
    actionToTake: 'Reflecting on who on your team is ready for a new challenge\nDiscussing how to know when someone is ready for development and how to optimize personal development with organizational needs\nLearning the benefits of team development and the 3 P\'s of development\nSharing ideas of untapped resources',
    howToPrepare: 'What skills could be a great addition to my team?\nWhat are the greatest strengths and weaknesses of your team?\nHow can I help my team members learn and progress?'
  },
  's20': {
    id: 's20',
    title: 'Foster Belonging',
    description: 'Create safety on your team by modelling the building blocks of belonging: value, connection, and support.',
    actionToTake: 'Reflecting on when you\'ve felt a sense of belonging and what contributed to it\nDiscussing what it means to belong at work and the impact that it has\nLearning the 3 building blocks of belonging, how to identify and build on them\nDiscussing how to support and encourage moments of vulnerability',
    howToPrepare: 'Have you ever felt like you didn\'t belong somewhere? If so, how did that affect your actions and perspectives—your life?\nDo you believe that everyone on your team feels like they belong in your workplace environment?'
  },
  's5': {
    id: 's5',
    title: 'Habits for Resilience',
    description: 'Create habits to help withstand and recover from challenges quickly and combat stress, anxiety, and overwhelm.',
    actionToTake: 'Breathing and reflecting on your own current levels of energy and stress\nReflecting on aspects of your work that bring rather than take energy\nDiscussing the need for regular and intentional rest\nDetermining a ritual for resilience that will have the greatest impact on your own well-being',
    howToPrepare: 'Are you the person and leader you want to be right now? Why or why not?\nWhat habits could help you become that ideal person and leader, and how can you create those habits?'
  },
  's34': {
    id: 's34',
    title: 'Hopes, Fears, and Expectations',
    description: 'Clarify hopes, fears, and expectations to build a strong foundation for a successful working relationship.',
    actionToTake: 'Discussing how sharing hopes, fears, and expectations creates greater alignment\nSharing personal hopes, fears, and expectations with each other',
    howToPrepare: ''
  },
  's33': {
    id: 's33',
    title: 'Inclusive Leadership',
    description: 'Lead with inclusivity by engaging in deeper conversations and uncovering hidden assumptions.',
    actionToTake: 'Sharing an incorrect assumption others often make about you\nReflecting on what it feels like to be included and developing empathy for those who aren\'t\nDefining what it means to be an inclusive leader\nDiscussing the 3 pillars of inclusion and how to apply them in our daily interactions',
    howToPrepare: 'How aware are you of any biases you might have that can affect your decision-making success?\nHow well do you consider perspectives that might be different from yours when leading and collaborating with others?'
  },
  's6': {
    id: 's6',
    title: 'Inspire with Vision',
    description: 'Establish a vision and align with your team to move towards it together.',
    actionToTake: 'Reflecting on how you came to believe in the vision of your organization\nDiscuss the 3C\'s of communicating vision to your team\nCreating a plan for how to communicate regularly, celebrate progress, and collect responses as you work together with your team towards a shared vision',
    howToPrepare: 'Do you truly understand the biggest risks, roadblocks, and opportunities your team faces?\nDo you have a vision for what success looks like for your team? What the most important outcome might be right now?\n\nLeaders must have vision—that "bird\'s eye view"—that allows them to see things their team often cannot see. Once leaders have that vision and the ideal outcome, it\'s crucial that they share these with their team to both inspire and then ensure that every member on their team is aligned with both, resulting in success for everyone.'
  },
  's26': {
    id: 's26',
    title: 'Lead Effective Meetings',
    description: 'Plan and lead meetings that stay focused on the most important outcomes.',
    actionToTake: 'Discussing the 3 key elements of an effective meeting\nPracticing planning a new meeting using the key elements of effective meetings\nDiscussing strategies for improving meetings you lead\nBrainstorm how you will improve an existing meeting you regularly lead',
    howToPrepare: 'What\'s the purpose of this meeting?\nAt the end of the meetings I attend or lead, do I have a clear idea of what\'s expected of me (if anything) to do next?\nWhat is or isn\'t happening in the meetings that I feel aren\'t a good use of my time?'
  },
  's12': {
    id: 's12',
    title: 'Lead Through Change',
    description: 'Support your team through change by creating space for concerns and guiding them toward the future.',
    actionToTake: 'Reflecting on the amount of recent change at work\nDiscussing the role of a manager/leader in acting as a filter through change\nLearning how to provide a safe space for the feelings that accompany change\nPracticing clearly communicating the relevant impacts of the change\nCompleting a change audit to determine your how to help one team member adjust to change',
    howToPrepare: 'How well do you handle change overall, and could you do better?\nHow successfully do you guide your team through change, and could you do better?\n\nOne of the only constants in life is change. When leaders can handle change in positive ways, their team can focus—both individually and as a team—on what matters most and navigate change successfully.'
  },
  's43': {
    id: 's43',
    title: 'Live Group Coaching',
    description: 'Strengthen your own coaching skills by practicing with peers while receiving insights on your own challenges in a connected, supportive environment.',
    actionToTake: 'Reflecting on a current challenge you\'re facing\nCoaching others and receiving coaching through the climb a tree coaching mechanic\nSharing observations and new discoveries\nDetermining next steps',
    howToPrepare: ''
  },
  's21': {
    id: 's21',
    title: 'Magnify Strengths',
    description: 'Identify your strengths and recognize how they can be put into action.',
    actionToTake: 'Discussing what strengths are\nReflecting on a current challenge you are facing\nPondering what strengths you have utilized in the past and how they might help with the challenge you are facing now\nExplore ways to recognize and develop the unique strengths of your team members',
    howToPrepare: 'What challenges are you currently facing? Do you have a plan on how to deal with them successfully?\nHow aware are you of your strengths? Do you tend to ignore them when facing a challenge?\n\nEvery leader faces challenges—that\'s just part of being a leader. The key to overcoming challenges successfully is for leaders to focus more on how their strengths can help resolve an issue than on how their weaknesses might have contributed to that issue.'
  },
  's13': {
    id: 's13',
    title: 'Making the Most of 1:1\'s',
    description: 'Guide and empower your team with 1-on-1s that build trust, clarity, and momentum.',
    actionToTake: 'Reflecting on what has helped you feel connected to those you\'ve worked with\nIdentifying who on your team would benefit most from increased connection to you\nDiscussing what the impact both team and 1-1 connection have on our teams\nLearn the essential elements of a 1:1 and how to make the most of these opportunities for connection',
    howToPrepare: 'Are the individual conversations you have with your team propelling them towards success or serving as a roadblock?\nHow could you make these 1-1 conversations more impactful and successful?'
  },
  's7': {
    id: 's7',
    title: 'Manage Burnout',
    description: 'Discover the factors that contribute to mental burnout and sharpen the tools to manage your wellbeing.',
    actionToTake: 'Learning to identify signs of burnout early\nDiscuss the impact an overwhelmed leader has on their teams\nShare ideas for how to prevent burnout on your team',
    howToPrepare: 'What is burnout and what causes it? Is it just a normal part of the workplace?\nAt what point does stress shift from being positive to causing harm—causing burnout, and is there anything you can do to keep that negative shift from happening?\n\nLeaders and team members experience ups and downs in their roles, and this is normal. But when the downs cause unhealthy levels of stress, burnout can occur, and if this burnout is not managed well, it can lead to lower engagement and retention and negatively affect team success.'
  },
  's8': {
    id: 's8',
    title: 'Manage Your Time',
    description: 'Protect your time for what matters most by grounding your priorities in people and purpose.',
    actionToTake: 'Identifying the people who are most impacted by your work\nDefining your purpose in your current role\nExploring how people and purpose impact your true priorities\nDiscussing the Eisenhower Matrix and how to execute on the tasks that matter most\nLearning strategies for protecting your priorities',
    howToPrepare: 'How well are you managing your time right now? What grade would you honestly give your time management efforts?\nDo you tend to get overwhelmed by your to-do list to the point you\'re not sure what to do when or even what\'s most important and what\'s not?\n\nWe only have so many hours in a day, and it can be easy to find ourselves spending those hours on tasks that aren\'t most important or of the highest priority. When we can prioritize and protect the most important tasks—both work and non-work related—we can make the best use of the limited time we have every day.'
  },
  's22': {
    id: 's22',
    title: 'Performance Discussions',
    description: 'Lead successful and constructive performance discussions.',
    actionToTake: 'Pondering how your team may currently feel about performance discussions\nSharing what makes performance discussions hard and how to overcome that\nLearning the pillars of performance discussions and discussing their impact\nDiscussing how you might implement one pillar into your performance discussions',
    howToPrepare: 'How can I make performance discussions less intimidating?\nHow can I make performance discussions constructive and uplifting when there can be so much feedback to deliver?\nWhat will be most supportive to team members in performance discussions?\n\nPerformance discussions can be intimidating. From your team members\' perspective, a good evaluation opens doors to promotions and raises, whereas a bad evaluation does, well, the opposite. Through this session, learn to mitigate fear and create a safe and secure environment for team members as you approach your performance discussions.'
  },
  's9': {
    id: 's9',
    title: 'Self-Awareness',
    description: 'Cultivate self-awareness to improve decision-making, strengthen relationships, and lead with empathy.',
    actionToTake: 'Reflect on who you are and when you feel most authentically like yourself\nLearn how self-aware leaders benefit their teams\nDiscuss the aspects of self-awareness (knowing who you are, and how you show up)',
    howToPrepare: 'How aware are you of what makes you uniquely you: Your strengths, struggles, interests, motivators, and so on?\nHow aware are you of how you show up for your team day in and day out?\n\nLeaders who understand and are aware of who they are and how they can best show up for their team will make better decisions, have better relationships, and show greater empathy to those around them, increasing the chances for success for the entire team.'
  },
  's23': {
    id: 's23',
    title: 'Set the Tone',
    description: 'Create a strong team culture by identifying key values and embodying them in your leadership.',
    actionToTake: 'Exploring different attributes and values that can influence how it feels to be on a particular team\nIdentifying and articulating the tone you want to cultivate on your team\nDiscussing the role norms play in creating the tone of your team and how to develop tone reinforcing norms\nLearning how to reinforce the behaviors and attitudes that will build the tone you want on your team',
    howToPrepare: 'The best managers lead by example. In this session, you\'ll learn how to intentionally choose the tone you want for your team and establish norms to reinforce that tone.\n\nHow to prepare:\nReflect on your team\'s tone. How do people feel about being on your team? Is it how you\'d like them to feel?'
  },
  's25': {
    id: 's25',
    title: 'Setting and Achieving Goals',
    description: 'Take an existing goal and make it more achievable.',
    actionToTake: 'Identifying an existing goal we need help on and understanding our "why" for setting the goal\nEvaluating the goal through a more in-depth, critical lens of the SMART framework\nDiscussing our limitations in goal setting and asking for help with the group',
    howToPrepare: 'What projects or tasks are my team members currently working on?\nHow will we know if those projects or tasks are successful?\nAre people motivated to accomplish our team\'s goals?\nWhat the best approach to setting goals?'
  },
  's24': {
    id: 's24',
    title: 'Strategic Thinking',
    description: 'Elevate your thinking to tackle complex problems and develop strategies that drive team success.',
    actionToTake: 'Reflecting on what makes a good strategic thinking partner\nDiscussing what it means to be strategic and the importance of zooming out\nSharing a specific problem that you want to be more strategic in solving\nDiscussing alternative strategies to each other\'s challenges\nBegin crafting your plan to overcome the challenge',
    howToPrepare: 'Why is it so easy to get stuck in the "weeds" of managing your team?\nWith all of the opportunities and challenges you face as a manager, how can you most easily guide your team to success through a big picture perspective?'
  },
  's10': {
    id: 's10',
    title: 'Successful Delegation',
    description: 'Sharpen your delegation skills and create space for your most essential work.',
    actionToTake: 'Complete a delegation audit\nDiscuss common barriers to delegation and how to overcome them\nLearn the CAMP framework of steps to effective delegation',
    howToPrepare: 'How good are you at realistically viewing your available bandwidth?\nHow often are you bogged down by tasks that could be successfully completed by others?'
  },
  's11': {
    id: 's11',
    title: 'The Art of Recognition',
    description: 'Unlock your team\'s best work through tactful recognition.',
    actionToTake: 'Reflect on what the current culture of recognition and appreciation is on your team\nDiscuss the importance of recognizing your team in regular, inclusive, specific and engaging ways\nDecide who on your team could use recognition next, make a plan for how to do so effectively',
    howToPrepare: 'How important is it to you to feel recognized for the work you do, and how do you feel when your work isn\'t recognized?\nDo you understand the difference between reward-based and behavior-based recognition, and which one should you prioritize on your team?\n\nEveryone wants to feel recognized for the work they do, but often, recognition doesn\'t happen as often as it should. When leaders make it a goal to recognize their team\'s efforts and positive behaviors regularly, team culture and engagement will flourish, and team members will be motivated to continuously perform at their highest levels.'
  },
  // Add remaining courses that don't have CSV data
  's27': {
    id: 's27',
    title: 'Campfire Kickoff',
    description: 'Grow in your career by using the Campfire Platform, content, and learning principles.',
    actionToTake: '',
    howToPrepare: ''
  },
  's29': {
    id: 's29',
    title: 'Campfire Storytelling',
    description: 'Learn key concepts and practical strategies to enhance your leadership skills and team performance.',
    actionToTake: '',
    howToPrepare: ''
  },
  's35': {
    id: 's35',
    title: 'Collaborate Intentionally',
    description: 'Learn key concepts and practical strategies to enhance your leadership skills and team performance.',
    actionToTake: '',
    howToPrepare: ''
  },
  's37': {
    id: 's37',
    title: 'Alignment & Momentum',
    description: 'Learn key concepts and practical strategies to enhance your leadership skills and team performance.',
    actionToTake: '',
    howToPrepare: ''
  },
  's38': {
    id: 's38',
    title: 'Improving Together',
    description: 'Learn key concepts and practical strategies to enhance your leadership skills and team performance.',
    actionToTake: '',
    howToPrepare: ''
  },
  's39': {
    id: 's39',
    title: 'Connected Leadership',
    description: 'Learn key concepts and practical strategies to enhance your leadership skills and team performance.',
    actionToTake: '',
    howToPrepare: ''
  },
  's40': {
    id: 's40',
    title: 'Curiosity in Sales',
    description: 'Learn key concepts and practical strategies to enhance your leadership skills and team performance.',
    actionToTake: '',
    howToPrepare: ''
  },
  's41': {
    id: 's41',
    title: 'Leading with Compassion',
    description: 'Learn key concepts and practical strategies to enhance your leadership skills and team performance.',
    actionToTake: '',
    howToPrepare: ''
  },
  's42': {
    id: 's42',
    title: 'Manager Essentials Kickoff',
    description: 'Learn key concepts and practical strategies to enhance your leadership skills and team performance.',
    actionToTake: '',
    howToPrepare: ''
  }
};