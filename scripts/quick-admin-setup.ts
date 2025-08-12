import bcrypt from 'bcryptjs'

// First, let's just generate the hashed password you'll need
const password = 'Campfire2024!Admin'
const hashedPassword = bcrypt.hashSync(password, 10)

console.log('Run this SQL in your Supabase dashboard:')
console.log('=====================================')
console.log(`
-- First, ensure Campfire company exists
INSERT INTO "Company" (id, name, logo, "createdAt", "updatedAt")
VALUES (
  'campfire-company-id-123',
  'Campfire',
  '/campfire-logo-new.png',
  NOW(),
  NOW()
)
ON CONFLICT (name) DO NOTHING;

-- Then create Steve as admin
INSERT INTO "Admin" (id, email, name, password, "companyId", "isActive", "createdAt", "updatedAt")
VALUES (
  'steve-admin-id-123',
  'steve@getcampfire.com',
  'Steve Arntz',
  '${hashedPassword}',
  (SELECT id FROM "Company" WHERE name = 'Campfire'),
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;
`)
console.log('=====================================')
console.log('\nAfter running this SQL:')
console.log('Email: steve@getcampfire.com')
console.log('Password:', password)
console.log('\nLogin at: https://tools.getcampfire.com/login')