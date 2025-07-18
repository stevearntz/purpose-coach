// Tool configurations with gradients and metadata
export const toolConfigs = {
  trustAudit: {
    gradient: "from-[#FFA62A] to-[#DB4839]",
    title: "Trust Audit",
    subtitle: "Build stronger work relationships.",
    description: "Assess trust across three key dimensions—Integrity, Competence, and Empathy—to identify strengths and opportunities for growth in your professional relationships."
  },
  purpose: {
    gradient: "from-[#6E3FCC] to-[#EB6593]", // Example gradient for Purpose tool
    title: "Purpose Discovery",
    subtitle: "Find your why.",
    description: "Uncover your core purpose and align your work with what matters most to you."
  },
  burnoutAssessment: {
    gradient: "from-[#74DEDE] to-[#30B859]",
    title: "Burnout Assessment",
    subtitle: "Check your energy levels.",
    description: "Evaluate your current state across multiple dimensions to identify early signs of burnout and get personalized strategies for maintaining your well-being."
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