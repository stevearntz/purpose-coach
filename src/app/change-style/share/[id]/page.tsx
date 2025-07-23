import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import ViewportContainer from '@/components/ViewportContainer'
import Footer from '@/components/Footer'
import { headers } from 'next/headers'

interface PersonaReadout {
  label: string
  title: string
  description: string
  watch_out_for: string
  superpower: string
  try_this: string
}

// Character illustrations for each persona
const personaCharacters: Record<string, string> = {
  champion: "🦸‍♂️", // Superhero with cape
  reactor: "🌋", // Volcano erupting
  therapist: "🧸", // Teddy bear (comforting)
  skeptic: "🦉", // Owl (wise but questioning)
  analyzer: "🤖", // Robot (logical)
  ghost: "👻", // Ghost (invisible/withdrawn)
  energizer: "⚡", // Lightning bolt
  stabilizer: "🗿", // Stone statue (steady)
  whiner: "🌧️", // Rain cloud
  adapter: "🦎", // Chameleon
  protector: "🛡️", // Shield
  navigator: "🧭" // Compass
}

const personaReadouts: Record<string, PersonaReadout> = {
  champion: {
    label: "🏆 The Champion",
    title: "Leads the charge with energy and vision",
    description: "You see change as opportunity. You're quick to step up, motivate others, and build momentum. You're often the first to say, 'Let's do this.'",
    watch_out_for: "Overextending yourself or steamrolling others' concerns",
    superpower: "Inspiring others to believe in a better future",
    try_this: "Pause to check how others are feeling before moving forward"
  },
  reactor: {
    label: "🐥 The Reactor",
    title: "Feels it first, processes later",
    description: "You respond emotionally and instinctively to change. You may voice fears early—and often say what others are feeling but won't say aloud.",
    watch_out_for: "Getting stuck in fear or unintentionally spreading panic",
    superpower: "Surfacing early warning signals others miss",
    try_this: "Name your emotions, then ask what's truly within your control"
  },
  therapist: {
    label: "🛋 The Therapist",
    title: "Tends to the emotional impact of change",
    description: "You create space for others to share how they're doing. You help people feel seen, heard, and supported during uncertainty.",
    watch_out_for: "Taking on too much of others' emotions as your own",
    superpower: "Deep empathy and emotional intelligence",
    try_this: "Support others—while also setting boundaries for yourself"
  },
  skeptic: {
    label: "🕵️ The Skeptic",
    title: "Questions the motives behind change",
    description: "You challenge assumptions and ask hard questions. You want to make sure change is real, relevant, and not just corporate spin.",
    watch_out_for: "Becoming dismissive before hearing the full picture",
    superpower: "Seeing what others might overlook",
    try_this: "Pair your questions with curiosity, not cynicism"
  },
  analyzer: {
    label: "🧮 The Analyzer",
    title: "Needs clarity, logic, and rationale",
    description: "You want the facts. Before getting on board, you look for evidence, risk analysis, and a sound plan. You're the team's sense-checker.",
    watch_out_for: "Overanalyzing and slowing progress",
    superpower: "Bringing structure and clear thinking to messy change",
    try_this: "Act even when things aren't 100% certain"
  },
  ghost: {
    label: "🔌 The Ghost",
    title: "Disengages during disruption",
    description: "You tend to retreat when things get uncertain. You prefer to fly under the radar until the dust settles.",
    watch_out_for: "Missing your chance to influence outcomes",
    superpower: "Observing calmly before jumping in",
    try_this: "Speak up about what you need to stay engaged"
  },
  energizer: {
    label: "💃 The Energizer",
    title: "Lifts the team's spirits through change",
    description: "You bring contagious enthusiasm and optimism. When others feel unsure, you're the voice saying, 'We've got this!'",
    watch_out_for: "Glossing over real concerns in favor of positivity",
    superpower: "Motivating teams with energy and belief",
    try_this: "Pair your hype with listening to real fears"
  },
  stabilizer: {
    label: "🧊 The Stabilizer",
    title: "Grounds others with consistency and calm",
    description: "You value clear plans, steady expectations, and defined roles. In times of change, you bring needed stability and structure.",
    watch_out_for: "Resisting change simply because it's new",
    superpower: "Helping teams feel anchored and focused",
    try_this: "Flex your comfort zone—practice adapting in small steps"
  },
  whiner: {
    label: "😩 The Whiner",
    title: "Voices discomfort... loudly",
    description: "You have no trouble expressing what's not working. You often represent the unspoken frustrations of the team.",
    watch_out_for: "Turning critique into constant complaining",
    superpower: "Identifying friction points others ignore",
    try_this: "Match every complaint with a constructive idea"
  },
  adapter: {
    label: "😐 The Adapter",
    title: "Goes with the flow, no drama",
    description: "You don't love change or hate it—you just move forward. You're flexible and steady, and others often follow your lead.",
    watch_out_for: "Becoming too passive or disengaged",
    superpower: "Keeping things moving without emotional whiplash",
    try_this: "Name how the change actually impacts you—it helps others too"
  },
  protector: {
    label: "🧱 The Protector",
    title: "Defends their people from disruption",
    description: "You think first about your team's safety and stability. You try to filter noise and prevent chaos from hitting your circle.",
    watch_out_for: "Becoming too territorial or resistant to collaboration",
    superpower: "Providing security and loyalty during uncertain times",
    try_this: "Bring your team into the change conversation early"
  },
  navigator: {
    label: "🧭 The Navigator",
    title: "Helps others make meaning out of change",
    description: "You're a thoughtful, intuitive guide who sees both the emotional and strategic sides of change. You help others reframe uncertainty.",
    watch_out_for: "Getting stuck in reflection instead of action",
    superpower: "Bringing clarity and wisdom in the fog",
    try_this: "Once you understand it—help others navigate it too"
  }
}

async function getSharedResult(id: string) {
  try {
    // Get the host from headers in server component - same as ToolSharePage
    const headersList = await headers()
    const host = headersList.get('host') || 'localhost:3000'
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const baseUrl = `${protocol}://${host}`
    
    console.log('Fetching share data from:', `${baseUrl}/api/share?id=${id}`)
    
    const response = await fetch(`${baseUrl}/api/share?id=${id}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      console.error('Share fetch failed with status:', response.status)
      return null
    }
    
    const result = await response.json()
    console.log('Share data retrieved:', result)
    
    // Handle both old format (with toolId) and new format (with type)
    if (result.toolId !== 'change-style' && result.type !== 'change-style') {
      console.error('Invalid tool type:', result.toolId || result.type)
      return null
    }
    
    return result.data || result
  } catch (error) {
    console.error('Error fetching shared result:', error)
    return null
  }
}

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sharedData = await getSharedResult(id)
  
  if (!sharedData) {
    notFound()
  }

  const primaryReadout = personaReadouts[sharedData.primaryPersona]
  const secondaryReadouts = sharedData.secondaryPersonas?.map((code: string) => personaReadouts[code]) || []

  return (
    <>
      <ViewportContainer className="bg-gradient-to-br from-[#F595B6]/10 via-[#E37A75]/10 to-[#BF4C74]/10 py-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Shared Change Style Results
            </h1>
            <p className="text-lg text-gray-600">
              Here's how this person navigates change
            </p>
          </div>

          {/* Primary Persona */}
          <div className="bg-gradient-to-br from-[#F595B6] to-[#BF4C74] rounded-2xl p-8 text-white mb-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                <span className="text-7xl">{personaCharacters[sharedData.primaryPersona]}</span>
              </div>
              <h2 className="text-3xl font-bold mb-2">{primaryReadout.label}</h2>
              <p className="text-xl text-white/90">{primaryReadout.title}</p>
            </div>
            
            <div className="space-y-6 max-w-2xl mx-auto">
              <div>
                <p className="text-lg leading-relaxed">{primaryReadout.description}</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <h3 className="font-semibold mb-2 text-white/90">Superpower</h3>
                  <p className="text-white/90">{primaryReadout.superpower}</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <h3 className="font-semibold mb-2 text-white/90">Watch Out For</h3>
                  <p className="text-white/90">{primaryReadout.watch_out_for}</p>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="font-semibold mb-2 text-white/90">Try This</h3>
                <p className="text-lg">{primaryReadout.try_this}</p>
              </div>
            </div>
          </div>

          {/* Secondary Personas */}
          {secondaryReadouts.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-12">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Secondary Style{secondaryReadouts.length > 1 ? 's' : ''}
              </h3>
              <p className="text-gray-600 mb-6">
                These styles also show up strongly:
              </p>
              <div className="space-y-4">
                {sharedData.secondaryPersonas.map((personaCode: string, index: number) => {
                  const readout = secondaryReadouts[index]
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-3xl">{personaCharacters[personaCode]}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">
                            {readout.label}
                          </h4>
                          <p className="text-gray-600 mb-3">{readout.title}</p>
                          <p className="text-gray-700 text-sm">{readout.description}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="text-center">
            <Link 
              href="/change-style"
              className="inline-flex items-center px-6 py-3 bg-[#BF4C74] text-white rounded-lg hover:bg-[#A63D5F] transition-colors font-semibold"
            >
              Take the Assessment
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </ViewportContainer>
      <Footer />
    </>
  )
}