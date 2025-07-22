// Tool configurations with gradients and metadata
export const toolConfigs = {
  trustAudit: {
    gradient: "from-[#FFA62A] to-[#DB4839]",
    title: "Trust Audit",
    subtitle: "Build stronger work relationships.",
    description: "Assess trust across three key dimensions—Integrity, Competence, and Empathy—to identify strengths and opportunities for growth in your professional relationships."
  },
  burnoutAssessment: {
    gradient: "from-[#74DEDE] to-[#30B859]",
    title: "Burnout Assessment",
    subtitle: "Check your energy levels.",
    description: "Evaluate your current state across multiple dimensions to identify early signs of burnout and get personalized strategies for maintaining your well-being."
  },
  decisionMakingAudit: {
    gradient: "from-[#6DC7FF] to-[#3C36FF]",
    title: "Decision Making Audit",
    subtitle: "Assess your decision approach.",
    description: "Evaluate how you make decisions across four key dimensions—People, Purpose, Principles, and Outcomes—to identify your strengths and areas for growth."
  },
  changeReadiness: {
    gradient: "from-[#F595B6] to-[#BF4C74]",
    title: "Change Readiness Assessment",
    subtitle: "Navigate change with confidence.",
    description: "Assess your readiness for change across three key dimensions—People, Purpose, and Principles—to identify where you feel confident and where you need support."
  },
  workingWithMe: {
    gradient: "from-[#30C7C7] to-[#2A74B9]",
    title: "User Guide",
    subtitle: "Create your personal user guide.",
    description: "Build a shareable guide that helps others understand your work style, communication preferences, and how to collaborate effectively with you."
  },
  coachingCards: {
    gradient: "from-[#D4F564] to-[#87AE05]",
    title: "Coaching Cards",
    subtitle: "Spark meaningful conversations.",
    description: "Powerful questions to spark meaningful conversations and drive personal and team growth."
  },
  expectationsReflection: {
    gradient: "from-[#C67AF4] to-[#3E37FF]",
    title: "Hopes, Fears & Expectations",
    subtitle: "Prepare for meaningful conversations.",
    description: "Prepare for meaningful conversations by clarifying what you hope for, what concerns you, and what you need to succeed."
  },
  changeStyle: {
    gradient: "from-[#F595B6] to-[#BF4C74]",
    title: "Change Style Assessment",
    subtitle: "Discover your change persona.",
    description: "Understand how you naturally respond to change at work and get personalized strategies for navigating transitions more effectively."
  },
  // Add more tools here as you create them
}

// Helper function to create muted gradient background
export const getMutedGradient = (gradient: string) => {
  // This creates a layered background with a dark base and the gradient at 30% opacity
  return `bg-gray-900 relative before:absolute before:inset-0 before:bg-gradient-to-br before:${gradient} before:opacity-30`
}

// Shared styles for tool pages
export const toolStyles = {
  card: "bg-white/15 backdrop-blur-sm rounded-2xl p-8 border border-white/20",
  input: "w-full p-4 rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-orange-400 appearance-none text-base",
  primaryButton: "w-full py-4 bg-white text-iris-500 rounded-xl font-semibold hover:bg-white/90 transition-colors text-lg",
  secondaryButton: "w-full py-4 border border-white/30 text-white rounded-xl font-semibold hover:bg-white/10 transition-colors text-lg",
  progressBar: "w-full bg-white/20 rounded-full h-2",
  progressFill: "h-2 rounded-full bg-white transition-all duration-300"
}