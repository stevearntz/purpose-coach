import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function runMigration() {
  try {
    console.log('🚀 Running team structure migration...')
    
    // Read the SQL file
    const sqlPath = path.join(process.cwd(), 'create-team-tables.sql')
    const sql = fs.readFileSync(sqlPath, 'utf-8')
    
    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)
    
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`)
      try {
        await prisma.$executeRawUnsafe(statement)
        console.log('✅ Success')
      } catch (error: any) {
        if (error.message.includes('already exists')) {
          console.log('⚠️  Already exists, skipping')
        } else {
          throw error
        }
      }
    }
    
    console.log('✨ Migration completed successfully!')
    
    // Verify the tables were created
    const teamMembers = await prisma.teamMember.count()
    const teamMemberships = await prisma.teamMembership.count()
    const teamInvitations = await prisma.teamInvitation.count()
    
    console.log(`\n📊 Table counts:`)
    console.log(`  - TeamMembers: ${teamMembers}`)
    console.log(`  - TeamMemberships: ${teamMemberships}`)
    console.log(`  - TeamInvitations: ${teamInvitations}`)
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

runMigration()