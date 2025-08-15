export default function AuthLeftPanel() {
  return (
    <div 
      className="hidden lg:flex flex-1 flex-col justify-center items-center p-16" 
      style={{ 
        backgroundColor: '#ffffff80'
      }}
    >
      <div className="max-w-md">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">
          Empower Your Leaders,
        </h1>
        <h1 className="text-4xl font-bold mb-12 text-center" style={{ color: '#BF4C74' }}>
          Ignite Your Culture
        </h1>
        
        <div className="space-y-8">
          {/* Step 1 */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#BF4C74' }}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">STEP 1</p>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Diagnose Real Needs</h3>
              <p className="text-sm text-gray-600">
                Uncover your team's unique challenges with research-backed assessments
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#BF4C74' }}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">STEP 2</p>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Get AI-Powered Recommendations</h3>
              <p className="text-sm text-gray-600">
                Receive personalized development paths tailored to your organization
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#BF4C74' }}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">STEP 3</p>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Launch Transformative Experiences</h3>
              <p className="text-sm text-gray-600">
                Deploy expert-led workshops and tools that drive lasting change
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}