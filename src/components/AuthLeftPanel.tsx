import { Target, Brain, Rocket } from 'lucide-react'

export default function AuthLeftPanel() {
  return (
    <div 
      className="hidden lg:flex flex-1 flex-col justify-center items-center px-20 py-16" 
      style={{ 
        backgroundColor: '#ffffff80'
      }}
    >
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=League+Spartan:wght@800;900&display=swap');
      `}</style>
      <div className="max-w-2xl w-full">
        <div className="mb-16">
          <h1 
            className="text-center"
            style={{ 
              fontSize: '60px',
              fontFamily: "'League Spartan', sans-serif",
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: '1.1'
            }}
          >
            <span className="text-white">Empower Your Leaders,</span><br/>
            <span
              style={{ 
                background: 'linear-gradient(90deg, #B762FF 0%, #E975EB 50%, #FA65B7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Ignite Your Culture
            </span>
          </h1>
        </div>
        
        <div className="relative">
          {/* Step 1 */}
          <div className="flex items-start gap-6 relative mb-6">
            <div className="flex flex-col items-center">
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg z-10"
                style={{ 
                  background: 'linear-gradient(135deg, #B963FF 0%, #800EC6 100%)'
                }}
              >
                <Target className="w-10 h-10 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <p 
                className="mb-1"
                style={{ 
                  color: '#800EC6',
                  fontSize: '14px',
                  fontWeight: 800,
                  letterSpacing: '0.1em'
                }}
              >
                STEP 1
              </p>
              <h3 
                className="text-white mb-1"
                style={{ 
                  fontSize: '32px',
                  fontWeight: 700,
                  lineHeight: '1'
                }}
              >
                Diagnose Real Needs
              </h3>
              <p 
                className="text-white/80"
                style={{ 
                  fontSize: '18px',
                  lineHeight: '1.3',
                  fontWeight: 400
                }}
              >
                Uncover your team's unique challenges with research-backed assessments.
              </p>
            </div>
          </div>

          {/* Connector 1 to 2 */}
          <div 
            className="absolute w-0.5"
            style={{
              left: '40px',
              top: '80px',
              height: '60px',
              background: 'linear-gradient(180deg, #A855F7 0%, #C084FC 100%)',
              maskImage: 'repeating-linear-gradient(to bottom, black 0, black 4px, transparent 4px, transparent 8px)',
              WebkitMaskImage: 'repeating-linear-gradient(to bottom, black 0, black 4px, transparent 4px, transparent 8px)'
            }}
          />

          {/* Step 2 */}
          <div className="flex items-start gap-6 relative mb-6">
            <div className="flex flex-col items-center">
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg z-10"
                style={{ 
                  background: 'linear-gradient(135deg, #E574EC 0%, #CB1DC2 100%)'
                }}
              >
                <Brain className="w-10 h-10 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <p 
                className="mb-1"
                style={{ 
                  color: '#CB1DC2',
                  fontSize: '14px',
                  fontWeight: 800,
                  letterSpacing: '0.1em'
                }}
              >
                STEP 2
              </p>
              <h3 
                className="text-white mb-1"
                style={{ 
                  fontSize: '32px',
                  fontWeight: 700,
                  lineHeight: '1'
                }}
              >
                Get AI-Powered Recommendations
              </h3>
              <p 
                className="text-white/80"
                style={{ 
                  fontSize: '18px',
                  lineHeight: '1.3',
                  fontWeight: 400
                }}
              >
                Receive personalized development paths tailored to your organization.
              </p>
            </div>
          </div>

          {/* Connector 2 to 3 */}
          <div 
            className="absolute w-0.5"
            style={{
              left: '40px',
              top: '180px',
              height: '120px',
              background: 'linear-gradient(180deg, #C084FC 0%, #EC4899 100%)',
              maskImage: 'repeating-linear-gradient(to bottom, black 0, black 4px, transparent 4px, transparent 8px)',
              WebkitMaskImage: 'repeating-linear-gradient(to bottom, black 0, black 4px, transparent 4px, transparent 8px)'
            }}
          />

          {/* Step 3 */}
          <div className="flex items-start gap-6 relative">
            <div className="flex flex-col items-center">
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg z-10"
                style={{ 
                  background: 'linear-gradient(135deg, #FF8BCC 0%, #ED3FA0 100%)'
                }}
              >
                <Rocket className="w-10 h-10 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <p 
                className="mb-1"
                style={{ 
                  color: '#ED3FA0',
                  fontSize: '14px',
                  fontWeight: 800,
                  letterSpacing: '0.1em'
                }}
              >
                STEP 3
              </p>
              <h3 
                className="text-white mb-1"
                style={{ 
                  fontSize: '32px',
                  fontWeight: 700,
                  lineHeight: '1'
                }}
              >
                Launch Transformative Experiences
              </h3>
              <p 
                className="text-white/80"
                style={{ 
                  fontSize: '18px',
                  lineHeight: '1.3',
                  fontWeight: 400
                }}
              >
                Deploy expert-led workshops and tools that drive lasting change.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}