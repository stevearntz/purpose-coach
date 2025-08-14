import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

// Input validation schemas
const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
})

// Get the secret at module level to ensure it's available
let secret = process.env.NEXTAUTH_SECRET || 
             process.env.JWT_SECRET || 
             process.env.AUTH_SECRET

console.log('[auth] Environment check:', {
  hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
  hasJwtSecret: !!process.env.JWT_SECRET,
  hasAuthSecret: !!process.env.AUTH_SECRET,
  nodeEnv: process.env.NODE_ENV,
  secretLength: secret?.length || 0
})

// If no secret is found, generate one based on DATABASE_URL as a fallback
// This is not ideal but ensures the app works
if (!secret && process.env.DATABASE_URL) {
  const crypto = require('crypto')
  secret = crypto
    .createHash('sha256')
    .update(process.env.DATABASE_URL + 'nextauth-campfire-2024')
    .digest('base64')
  console.warn('[auth] Warning: Generated fallback secret from DATABASE_URL. Set NEXTAUTH_SECRET in production!')
}

if (!secret) {
  secret = 'development-secret-please-set-NEXTAUTH_SECRET-in-production'
  console.error('[auth] ERROR: No secret available! Set NEXTAUTH_SECRET environment variable!')
}

// Determine the base URL
const baseUrl = process.env.NEXTAUTH_URL || 
                process.env.NEXT_PUBLIC_APP_URL || 
                (process.env.NODE_ENV === 'production' 
                  ? 'https://tools.getcampfire.com' 
                  : 'http://localhost:3000')

export const authConfig: NextAuthConfig = {
  // Remove adapter when using JWT strategy - adapters are for database sessions
  // adapter: PrismaAdapter(prisma),
  basePath: '/api/auth',
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: secret, // Use the pre-defined secret
  trustHost: true, // Important for production and API routes
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-authjs.session-token'
        : 'authjs.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log("[auth] Authorize called with:", { 
            hasCredentials: !!credentials,
            email: credentials?.email 
          })
          
          // Validate input
          const validatedFields = signInSchema.safeParse(credentials)
          
          if (!validatedFields.success) {
            console.error("[auth] Invalid credentials format:", validatedFields.error.issues)
            return null
          }
          
          const { email, password } = validatedFields.data
          
          console.log("[auth] Login attempt for:", email)
          console.log("[auth] Password length:", password?.length)
          
          // Find admin user
          const admin = await prisma.admin.findUnique({
            where: { email: email.toLowerCase() },
            select: {
              id: true,
              email: true,
              password: true,
              name: true,
              company: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          })
          
          if (!admin) {
            console.error("[auth] Admin not found for email:", email)
            return null
          }
          
          if (!admin.password) {
            console.error("[auth] Admin has no password set:", email)
            return null
          }
          
          console.log("[auth] Admin found, verifying password...")
          
          // Verify password
          console.log("[auth] Comparing password, hash starts with:", admin.password.substring(0, 10))
          const passwordMatch = await bcrypt.compare(password, admin.password)
          console.log("[auth] Password match result:", passwordMatch)
          
          if (!passwordMatch) {
            console.error("[auth] Password mismatch for:", email)
            // Log hash prefix for debugging (safe to log first 10 chars)
            console.error("[auth] Expected hash prefix:", admin.password?.substring(0, 10))
            console.error("[auth] Provided password:", password)
            return null
          }
          
          console.log("[auth] Password verified successfully")
          
          // Update last login
          await prisma.admin.update({
            where: { id: admin.id },
            data: { lastLogin: new Date() }
          })
          
          // Return user object for session - NextAuth v5 expects specific fields
          const user = {
            id: admin.id,
            email: admin.email,
            name: admin.name || admin.email.split('@')[0],
            companyId: admin.company?.id || undefined,
            companyName: admin.company?.name || undefined
          }
          
          console.log('[auth] Returning user for session:', JSON.stringify(user))
          return user as any
        } catch (error) {
          console.error("[auth] Authorization error:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      console.log('[auth] JWT callback called with:', { 
        hasUser: !!user, 
        hasToken: !!token,
        tokenEmail: token?.email 
      })
      
      // This is called whenever a JWT is created, updated, or accessed
      if (user) {
        // User is available during sign-in
        console.log('[auth] JWT callback - creating token for:', user.email)
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.companyId = user.companyId
        token.companyName = user.companyName
      }
      
      console.log('[auth] JWT callback returning token:', JSON.stringify({
        id: token.id,
        email: token.email,
        name: token.name
      }))
      
      return token
    },
    async session({ session, token }) {
      console.log('[auth] Session callback called with:', {
        hasSession: !!session,
        hasToken: !!token,
        tokenEmail: token?.email
      })
      
      // Send properties to the client
      if (session?.user && token) {
        console.log('[auth] Session callback - building session for:', token.email)
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.companyId = token.companyId as string
        session.user.companyName = token.companyName as string
      }
      
      console.log('[auth] Session callback returning session with user:', session?.user?.email)
      
      return session
    },
    async signIn({ user, account, profile, email, credentials }) {
      // Add additional logging
      console.log('[auth] SignIn callback triggered for:', user?.email)
      console.log('[auth] SignIn details:', {
        hasUser: !!user,
        userId: user?.id,
        userEmail: user?.email,
        hasAccount: !!account,
        provider: account?.provider
      })
      
      // Always allow sign in if user is returned from authorize
      return true
    }
  },
  debug: true // Temporarily enable debug to diagnose production issue
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)