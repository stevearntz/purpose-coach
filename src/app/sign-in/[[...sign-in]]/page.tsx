import { SignIn } from '@clerk/nextjs'
import Image from 'next/image'

export default function SignInPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <Image
        src="/purple-sign-in-background.png"
        alt="Background"
        fill
        className="object-cover"
        priority
      />
      
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8">
          <img
            src="/campfire-logo-white.png"
            alt="Campfire"
            className="h-12 w-auto mx-auto mb-6"
          />
          <p className="text-white/90 text-lg drop-shadow">Sign in to access your dashboard</p>
        </div>
        
        <SignIn 
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
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  )
}