#!/usr/bin/env npx tsx
/**
 * Direct SQL script to fix production password
 * This bypasses Prisma to avoid prepared statement conflicts
 */

import bcrypt from 'bcryptjs'

async function fixProductionPassword() {
  // Generate the correct hash for "admin123"
  const hash = await bcrypt.hash('admin123', 10)
  
  console.log('🔐 Password Reset Instructions')
  console.log('=' .repeat(60))
  console.log('')
  console.log('Run this SQL command in your production database:')
  console.log('')
  console.log('-- Update password for steve@getcampfire.com to "admin123"')
  console.log(`UPDATE "Admin" SET password = '${hash}' WHERE email = 'steve@getcampfire.com';`)
  console.log('')
  console.log('You can run this via:')
  console.log('1. Supabase SQL Editor (https://supabase.com/dashboard/project/skchvejhvnybioseqhbv/editor)')
  console.log('2. Or any PostgreSQL client')
  console.log('')
  console.log('After running the SQL, you can login with:')
  console.log('  Email: steve@getcampfire.com')
  console.log('  Password: admin123')
}

fixProductionPassword()