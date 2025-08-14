import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET_EXISTS: !!process.env.NEXTAUTH_SECRET,
    AUTH_SECRET_EXISTS: !!process.env.AUTH_SECRET,
    DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    // Check which secret NextAuth is actually using
    SECRET_LENGTH: (process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || '').length
  })
}