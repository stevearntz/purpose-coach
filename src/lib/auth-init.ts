/**
 * NextAuth initialization wrapper for production
 */
import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

// Input validation schemas
const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
})

// Build config at runtime
export function getAuthConfig(): NextAuthConfig {
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET
  
  if (!secret) {
    throw new Error('Auth secret not configured')
  }
  
  return {
    basePath: '/api/auth',
    session: {
      strategy: "jwt",
      maxAge: 30 * 24 * 60 * 60,
    },
    jwt: {
      maxAge: 30 * 24 * 60 * 60,
    },
    secret,
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
            const validatedFields = signInSchema.safeParse(credentials)
            
            if (!validatedFields.success) {
              return null
            }
            
            const { email, password } = validatedFields.data
            
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
            
            if (!admin?.password) {
              return null
            }
            
            const passwordMatch = await bcrypt.compare(password, admin.password)
            
            if (!passwordMatch) {
              return null
            }
            
            return {
              id: admin.id,
              email: admin.email,
              name: admin.name || admin.email.split('@')[0],
              companyId: admin.company?.id,
              companyName: admin.company?.name
            } as any
          } catch (error) {
            console.error("[auth-init] Authorization error:", error)
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
        if (session?.user && token) {
          session.user.id = token.id as string
          session.user.email = token.email as string
          session.user.name = token.name as string
          session.user.companyId = token.companyId as string
          session.user.companyName = token.companyName as string
        }
        return session
      }
    },
    debug: false
  }
}

// Initialize NextAuth with runtime config
let authInstance: ReturnType<typeof NextAuth> | null = null

export function getAuth() {
  if (!authInstance) {
    authInstance = NextAuth(getAuthConfig())
  }
  return authInstance
}