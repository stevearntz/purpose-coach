#!/usr/bin/env node

async function testCampaignCreation() {
  const baseUrl = 'http://localhost:3000';
  
  // Test data matching what the UI sends
  const testData = {
    toolId: 'people-leader-needs',
    toolName: 'People Leadership Needs Assessment',
    toolPath: '/people-leader-needs',
    campaignName: 'People Leadership Needs Assessment - 9/25/2025',
    customMessage: '',
    startDate: new Date().toISOString(),
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
    participants: [
      {
        email: 'steve.arntz@getcampfire.com',
        name: 'John Doe'
      }
    ],
    senderEmail: 'admin@getcampfire.com',
    companyName: 'Campfire'
  };

  console.log('Testing campaign creation with:', JSON.stringify(testData, null, 2));

  try {
    // First, we need to get an auth token
    // For testing, we'll use the test endpoint directly
    const response = await fetch(`${baseUrl}/api/campaigns/launch/v3`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add test auth headers if needed
      },
      body: JSON.stringify(testData)
    });

    console.log('Response status:', response.status);
    
    const text = await response.text();
    console.log('Response text:', text);
    
    try {
      const result = JSON.parse(text);
      console.log('Response JSON:', JSON.stringify(result, null, 2));
    } catch (e) {
      console.log('Could not parse as JSON');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testCampaignCreation();