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

export const authConfig: NextAuthConfig = {
  // Remove adapter when using JWT strategy - adapters are for database sessions
  // adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: secret, // Use the pre-defined secret
  trustHost: true, // Important for production and API routes
  pages: {
    signIn: "/login",
    error: "/login",
  },
  cookies: {
    sessionToken: {
      name: `authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Validate input
          const validatedFields = signInSchema.safeParse(credentials)
          
          if (!validatedFields.success) {
            console.error("[auth] Invalid credentials format")
            return null
          }
          
          const { email, password } = validatedFields.data
          
          console.log("[auth] Login attempt for:", email)
          
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
          const passwordMatch = await bcrypt.compare(password, admin.password)
          
          if (!passwordMatch) {
            console.error("[auth] Password mismatch for:", email)
            // Log hash prefix for debugging (safe to log first 10 chars)
            console.error("[auth] Expected hash prefix:", admin.password?.substring(0, 10))
            return null
          }
          
          console.log("[auth] Password verified successfully")
          
          // Update last login
          await prisma.admin.update({
            where: { id: admin.id },
            data: { lastLogin: new Date() }
          })
          
          // Return user object for session
          return {
            id: admin.id,
            email: admin.email,
            name: admin.name || admin.email.split('@')[0],
            companyId: admin.company?.id,
            companyName: admin.company?.name
          }
        } catch (error) {
          console.error("[auth] Authorization error:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        console.log('[auth] JWT callback - initial sign in for:', user.email)
        return {
          ...token,
          id: user.id,
          email: user.email,
          name: user.name,
          companyId: user.companyId,
          companyName: user.companyName
        }
      }
      
      // Return previous token if the user is already signed in
      return token
    },
    async session({ session, token }) {
      console.log('[auth] Session callback - creating session for:', token.email)
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.companyId = token.companyId as string
        session.user.companyName = token.companyName as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Always redirect to dashboard after login
      if (url.includes('/login')) {
        return `${baseUrl}/dashboard`
      }
      return url
    }
  },
  debug: process.env.NODE_ENV === "development"
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)