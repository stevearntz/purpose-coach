import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local file first
config({ path: resolve(process.cwd(), '.env.local') })

async function testLogin() {
  const email = 'steve@getcampfire.com'
  const password = 'Campfire2024!'
  
  console.log('🔐 Testing login with NextAuth...\n')
  console.log(`Email: ${email}`)
  console.log(`Password: ${password}`)
  
  try {
    // First, get the CSRF token
    console.log('\n1. Getting CSRF token...')
    const csrfResponse = await fetch('http://localhost:3000/api/auth/csrf')
    const { csrfToken } = await csrfResponse.json()
    console.log('   ✅ CSRF token obtained')
    
    // Now attempt to sign in
    console.log('\n2. Attempting sign in...')
    const signInResponse = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email,
        password,
        csrfToken,
        json: 'true'
      }),
      redirect: 'manual'
    })
    
    console.log(`   Response status: ${signInResponse.status}`)
    
    if (signInResponse.status === 200 || signInResponse.status === 302) {
      console.log('   ✅ Login successful!')
      
      // Check if we got a session
      console.log('\n3. Checking session...')
      const sessionResponse = await fetch('http://localhost:3000/api/auth/session')
      const session = await sessionResponse.json()
      
      if (session?.user) {
        console.log('   ✅ Session established!')
        console.log(`   User: ${session.user.email}`)
        console.log(`   Name: ${session.user.name}`)
        console.log(`   Company: ${session.user.companyName}`)
      } else {
        console.log('   ⚠️  No session found')
      }
    } else {
      const body = await signInResponse.text()
      console.log('   ❌ Login failed')
      console.log('   Response:', body)
    }
    
    console.log('\n✅ Auth test complete!')
    console.log('\nYou can now:')
    console.log('1. Visit http://localhost:3000/login in your browser')
    console.log('2. Enter the credentials shown above')
    console.log('3. You should be redirected to /dashboard')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testLogin()