import { prisma } from '../src/lib/prisma'

async function fixSecurityIssue() {
  console.log('Fixing security issue with update_updated_at_column function...')
  
  try {
    // Drop and recreate the function with secure search_path
    await prisma.$executeRaw`
      DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
    `
    
    await prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION public.update_updated_at_column()
      RETURNS TRIGGER
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public
      AS $$
      BEGIN
          NEW."updatedAt" = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$;
    `
    
    console.log('✅ Security issue fixed!')
    console.log('The function now has a fixed search_path, preventing SQL injection.')
    
    // Check if any triggers use this function
    const triggers = await prisma.$queryRaw`
      SELECT 
        t.tgname as trigger_name,
        c.relname as table_name
      FROM pg_trigger t
      JOIN pg_class c ON t.tgrelid = c.oid
      JOIN pg_proc p ON t.tgfoid = p.oid
      WHERE p.proname = 'update_updated_at_column'
    ` as any[]
    
    if (triggers.length > 0) {
      console.log('\nTriggers using this function:')
      triggers.forEach(t => {
        console.log(`  - ${t.trigger_name} on table ${t.table_name}`)
      })
    }
    
  } catch (error) {
    console.error('Error fixing security issue:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixSecurityIssue()