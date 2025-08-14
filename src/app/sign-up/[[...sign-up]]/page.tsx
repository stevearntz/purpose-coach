import { SignUp } from '@clerk/nextjs'
import ViewportContainer from '@/components/ViewportContainer'

export default function SignUpPage() {
  return (
    <ViewportContainer className="bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src="/campfire-logo-new.png" 
            alt="Campfire" 
            className="h-12 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900">Create Your Account</h1>
          <p className="text-gray-600 mt-2">Get started with your leadership journey</p>
        </div>
        
        <SignUp 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-xl",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton: "bg-white hover:bg-gray-50 text-gray-900 border border-gray-300",
              formButtonPrimary: "bg-[#BF4C74] hover:bg-[#A63D5F] text-white",
              footerActionLink: "text-[#BF4C74] hover:text-[#A63D5F]",
              identityPreviewText: "text-gray-700",
              identityPreviewEditButtonIcon: "text-[#BF4C74]",
              formFieldLabel: "text-gray-700",
              formFieldInput: "border-gray-300 focus:border-[#BF4C74] focus:ring-[#BF4C74]",
              dividerLine: "bg-gray-200",
              dividerText: "text-gray-500"
            }
          }}
          redirectUrl="/dashboard"
          signInUrl="/sign-in"
        />
      </div>
    </ViewportContainer>
  )
}