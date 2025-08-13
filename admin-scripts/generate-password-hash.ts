#!/usr/bin/env npx tsx
/**
 * Generate a bcrypt hash for manual database update
 * Usage: npx tsx scripts/generate-password-hash.ts <password>
 */

import bcrypt from 'bcryptjs'

async function generateHash() {
  const password = process.argv[2]
  
  if (!password) {
    console.log('Usage: npx tsx scripts/generate-password-hash.ts <password>')
    process.exit(1)
  }
  
  const hash = await bcrypt.hash(password, 10)
  
  console.log('\n🔐 Password Hash Generated:\n')
  console.log(hash)
  console.log('\n📝 SQL Update Command:\n')
  console.log(`UPDATE "Admin" SET password = '${hash}' WHERE email = 'steve@getcampfire.com';`)
  console.log('\nRun this SQL in your Supabase SQL Editor')
}

generateHash()