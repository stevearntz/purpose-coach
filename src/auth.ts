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

// Get the secret - NEXTAUTH_SECRET is the standard env var
const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET

if (!secret && process.env.NODE_ENV === 'production') {
  console.error('[auth] WARNING: NEXTAUTH_SECRET is not set in production!')
}

// Determine the base URL
const baseUrl = process.env.NEXTAUTH_URL || 
                (process.env.NODE_ENV === 'production' 
                  ? 'https://tools.getcampfire.com' 
                  : 'http://localhost:3000')

export const authConfig: NextAuthConfig = {
  basePath: '/api/auth',
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: secret || 'fallback-secret-for-build-only-replace-in-production',
  trustHost: true,
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
          // Validate input
          const validatedFields = signInSchema.safeParse(credentials)
          
          if (!validatedFields.success) {
            console.error('[auth] Validation failed in production:', validatedFields.error.issues)
            return null
          }
          
          const { email, password } = validatedFields.data
          
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
            console.error('[auth] Admin not found in production for:', email)
            return null
          }
          
          if (!admin.password) {
            console.error('[auth] Admin has no password in production:', email)
            return null
          }
          
          // Verify password
          const passwordMatch = await bcrypt.compare(password, admin.password)
          
          if (!passwordMatch) {
            console.error('[auth] Password mismatch in production for:', email)
            return null
          }
          
          console.log('[auth] Login successful in production for:', email)
          
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
          
          return user as any
        } catch (error) {
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // This is called whenever a JWT is created, updated, or accessed
      if (user) {
        // User is available during sign-in
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.companyId = user.companyId
        token.companyName = user.companyName
      }
      
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      if (session?.user && token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.companyId = token.companyId as string
        session.user.companyName = token.companyName as string
      }
      
      return session
    },
    async signIn({ user, account, profile, email, credentials }) {
      // Always allow sign in if user is returned from authorize
      return true
    }
  },
  debug: false // Disable debug in production
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)