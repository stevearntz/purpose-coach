import { config } from 'dotenv'
import { resolve } from 'path'
import bcrypt from 'bcryptjs'

// Load .env.local file first
config({ path: resolve(process.cwd(), '.env.local') })

// Need to import prisma after env vars are loaded
import prisma from '../src/lib/prisma'

async function resetPassword() {
  const email = 'steve@getcampfire.com'
  const newPassword = 'Campfire2024!'
  
  try {
    console.log(`Resetting password for ${email}...`)
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    // Update the admin's password
    const admin = await prisma.admin.update({
      where: { email },
      data: { password: hashedPassword },
      select: {
        id: true,
        email: true,
        name: true,
        company: {
          select: {
            name: true
          }
        }
      }
    })
    
    console.log('\n✅ Password reset successful!')
    console.log(`   Email: ${admin.email}`)
    console.log(`   Password: ${newPassword}`)
    console.log(`   Name: ${admin.name}`)
    console.log(`   Company: ${admin.company?.name}`)
    
    // Verify the password works
    const verifyAdmin = await prisma.admin.findUnique({
      where: { email },
      select: { password: true }
    })
    
    if (verifyAdmin?.password) {
      const passwordMatch = await bcrypt.compare(newPassword, verifyAdmin.password)
      console.log(`\n🔐 Password verification: ${passwordMatch ? '✅ Success' : '❌ Failed'}`)
    }
    
  } catch (error) {
    console.error('Error resetting password:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetPassword()