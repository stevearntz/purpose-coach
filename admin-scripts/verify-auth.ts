#!/usr/bin/env node
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local file first
config({ path: resolve(process.cwd(), '.env.local') })

console.log('🔍 NextAuth Environment Check:\n')
console.log(`NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? '✅ Set (length: ' + process.env.NEXTAUTH_SECRET.length + ')' : '❌ Not set'}`)
console.log(`NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || 'Not set (will use default)'}`)
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Not set'}`)
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`)

if (!process.env.NEXTAUTH_SECRET) {
  console.log('\n❌ ERROR: NEXTAUTH_SECRET is not set!')
  console.log('Please ensure .env.local contains: NEXTAUTH_SECRET="your-secret-here"')
  process.exit(1)
}

console.log('\n✅ Environment is properly configured for NextAuth!')
console.log('\n📝 To test authentication:')
console.log('1. Start the dev server: npm run dev')
console.log('2. Visit http://localhost:3000/login')
console.log('3. Use credentials: steve@getcampfire.com / Campfire2024!')
console.log('4. You should be redirected to /dashboard after successful login')