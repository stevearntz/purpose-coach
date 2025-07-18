export interface UserGuideData {
  name: string
  workingConditions: string
  hoursOfOperation: {
    early: boolean
    morning: boolean
    afternoon: boolean
    evening: boolean
    late: boolean
    weekends: boolean
  }
  shareHours: string
  communicationMethods: {
    inPerson: boolean
    call: boolean
    text: boolean
    zoom: boolean
    slack: boolean
  }
  responseExpectations: string
  meetingPreferences: string
  feedbackPreferences: string
  biggestNeeds: string
  personalStruggles: string
  thingsILove: string[]
  thingsAboutMe: string
}

export const sections = [
  { id: 'working-conditions', title: 'Working Conditions' },
  { id: 'hours', title: 'Hours of Operation' },
  { id: 'communication', title: 'Communication' },
  { id: 'feedback', title: 'Feedback' },
  { id: 'needs', title: 'My Biggest Needs' },
  { id: 'struggles', title: 'Personal Struggles' },
  { id: 'love', title: 'Things I Love' },
  { id: 'about', title: 'Other Things About Me' },
]

export const generateShareableGuide = (userData: UserGuideData) => {
  const timeSlots = []
  if (userData.hoursOfOperation.early) timeSlots.push('Early morning (before 8am)')
  if (userData.hoursOfOperation.morning) timeSlots.push('Morning (8am-12pm)')
  if (userData.hoursOfOperation.afternoon) timeSlots.push('Afternoon (12pm-5pm)')
  if (userData.hoursOfOperation.evening) timeSlots.push('Evening (5pm-8pm)')
  if (userData.hoursOfOperation.late) timeSlots.push('Late night (after 8pm)')
  if (userData.hoursOfOperation.weekends) timeSlots.push('Weekends')
  
  const commMethods = []
  if (userData.communicationMethods.inPerson) commMethods.push('In-person')
  if (userData.communicationMethods.call) commMethods.push('Phone call')
  if (userData.communicationMethods.text) commMethods.push('Text message')
  if (userData.communicationMethods.zoom) commMethods.push('Video call')
  if (userData.communicationMethods.slack) commMethods.push('Slack/Chat')
  
  return {
    title: `Working with ${userData.name}`,
    sections: [
      { title: 'Working Conditions', content: userData.workingConditions },
      { title: 'Hours of Operation', content: `I work best during: ${timeSlots.join(', ')}.\n\n${userData.shareHours}` },
      { title: 'Communication Preferences', content: `Preferred methods: ${commMethods.join(', ')}.\n\nResponse times: ${userData.responseExpectations}\n\nMeetings: ${userData.meetingPreferences}` },
      { title: 'Feedback', content: userData.feedbackPreferences },
      { title: 'My Biggest Needs', content: userData.biggestNeeds },
      { title: 'Personal Struggles', content: userData.personalStruggles },
      { title: 'Things I Love', content: userData.thingsILove.filter(item => item).map((item, i) => `${i + 1}. ${item}`).join('\n') },
      { title: 'Other Things About Me', content: userData.thingsAboutMe },
    ]
  }
}