#!/usr/bin/env npx tsx
/**
 * Direct password reset script
 * Usage: npx tsx scripts/reset-password.ts <email> <newPassword>
 */

import prisma from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

async function resetPassword() {
  const args = process.argv.slice(2)
  
  if (args.length !== 2) {
    console.log('Usage: npx tsx scripts/reset-password.ts <email> <newPassword>')
    console.log('Example: npx tsx scripts/reset-password.ts steve@getcampfire.com NewPassword123!')
    process.exit(1)
  }
  
  const [email, password] = args
  
  try {
    // Find admin
    const admin = await prisma.admin.findUnique({
      where: { email }
    })
    
    if (!admin) {
      console.log(`❌ No admin found with email: ${email}`)
      process.exit(1)
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Update password
    await prisma.admin.update({
      where: { email },
      data: { password: hashedPassword }
    })
    
    console.log(`✅ Password reset successfully for ${email}`)
    console.log('You can now login at: https://tools.getcampfire.com/login')
    
  } catch (error) {
    console.error('❌ Error resetting password:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
resetPassword()