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

export const authConfig: NextAuthConfig = {
  // Remove adapter when using JWT strategy - adapters are for database sessions
  // adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET, // Ensure secret is set
  trustHost: true, // Important for production and API routes
  pages: {
    signIn: "/login",
    error: "/login",
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
          
          if (!admin || !admin.password) {
            console.error("[auth] Admin not found or no password set")
            return null
          }
          
          // Verify password
          const passwordMatch = await bcrypt.compare(password, admin.password)
          
          if (!passwordMatch) {
            console.error("[auth] Password mismatch")
            return null
          }
          
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.companyId = user.companyId
        token.companyName = user.companyName
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.companyId = token.companyId as string
        session.user.companyName = token.companyName as string
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
  debug: process.env.NODE_ENV === "development",
  trustHost: true, // Important for production
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)