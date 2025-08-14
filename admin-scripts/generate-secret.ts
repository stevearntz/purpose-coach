#!/usr/bin/env npx tsx
/**
 * Generate a secure secret for NextAuth
 */

import crypto from 'crypto'

const secret = crypto.randomBytes(32).toString('base64')

console.log('🔐 Generated NextAuth Secret:')
console.log('================================')
console.log(secret)
console.log('================================')
console.log('\n📝 Add this to your Vercel environment variables:')
console.log('1. Go to https://vercel.com/dashboard')
console.log('2. Select your project (purpose-coach)')
console.log('3. Go to Settings > Environment Variables')
console.log('4. Add a new variable:')
console.log('   Name: NEXTAUTH_SECRET')
console.log('   Value:', secret)
console.log('   Environment: Production, Preview, Development')
console.log('\n5. Also add:')
console.log('   Name: NEXTAUTH_URL')
console.log('   Value: https://tools.getcampfire.com')
console.log('   Environment: Production')