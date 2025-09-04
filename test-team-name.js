// Test script to verify teamName saving
async function testTeamName() {
  try {
    // First, get the current profile
    const getResponse = await fetch('http://localhost:3002/api/user/profile', {
      credentials: 'include',
      headers: {
        'Cookie': 'YOUR_AUTH_COOKIE_HERE' // You'll need to replace this with actual auth
      }
    });
    
    console.log('GET Response status:', getResponse.status);
    const currentProfile = await getResponse.json();
    console.log('Current profile teamName:', currentProfile.profile?.teamName);
    
    // Test updating teamName
    const testData = {
      teamName: 'Test Team ' + new Date().toISOString(),
      teamPurpose: 'Testing team name persistence',
      partialUpdate: true
    };
    
    console.log('\nSending update with:', testData);
    
    const updateResponse = await fetch('http://localhost:3002/api/user/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'YOUR_AUTH_COOKIE_HERE' // You'll need to replace this with actual auth
      },
      credentials: 'include',
      body: JSON.stringify(testData)
    });
    
    console.log('POST Response status:', updateResponse.status);
    const updateResult = await updateResponse.json();
    console.log('Updated profile teamName:', updateResult.profile?.teamName);
    console.log('Full response:', JSON.stringify(updateResult, null, 2));
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

console.log('To test, you need to:');
console.log('1. Open the app in browser at http://localhost:3002');
console.log('2. Log in');
console.log('3. Open browser dev tools and get your auth cookie');
console.log('4. Replace YOUR_AUTH_COOKIE_HERE in this script');
console.log('5. Run: node test-team-name.js');