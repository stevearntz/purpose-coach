// Script to recreate the Focus Finder share link from PDF data
// Based on the PDF content extracted from the share

const shareData = {
  "type": "accountability-builder",
  "toolName": "Accountability Builder",
  "data": {
    "majorAreas": [
      // These would need to be determined from the context
      "Customer experience",
      "Product development",
      "Team management"
    ],
    "outcomes": [
      // From the PDF questions visible
      {
        "outcome": "Meet somebody on an airplane that builds trust to introduce to Campfire",
        "status": "needs-push",
        "focusArea": "Customer experience"
      },
      {
        "outcome": "Look at the ten deals from a marketing perspective",
        "status": "needs-push", 
        "focusArea": "Customer experience"
      },
      {
        "outcome": "Solve customer problems",
        "status": "on-track",
        "focusArea": "Customer experience"
      },
      {
        "outcome": "Get clear on what customers come to us for and delight them",
        "status": "needs-push",
        "focusArea": "Customer experience"
      },
      {
        "outcome": "Focus more on outcomes and prospects lives better",
        "status": "on-track",
        "focusArea": "Product development"
      },
      {
        "outcome": "Answer 'what impact do we want to have on the lives of those we serve'",
        "status": "needs-push",
        "focusArea": "Product development"
      },
      {
        "outcome": "Solve team churn problem",
        "status": "at-risk",
        "focusArea": "Team management"
      },
      {
        "outcome": "Explore and set goals/milestones for certain initiatives",
        "status": "needs-push",
        "focusArea": "Team management"
      }
    ],
    "topThree": [
      {
        "item": "Get clear on what customers come to us for and delight them",
        "reason": "This is fundamental to success and will guide all other decisions",
        "notes": [
          "Identify what opportunities are there",
          "Understand what makes prospects lives better",
          "Focus on how we can deliver more value"
        ],
        "supportPeople": [
          {
            "name": "Team",
            "how": "Help me understand customer needs and feedback"
          }
        ]
      },
      {
        "item": "Solve team churn problem",
        "reason": "Essential for maintaining momentum and culture",
        "notes": [
          "Understand root causes of churn",
          "Implement retention strategies",
          "Build better team culture"
        ],
        "supportPeople": [
          {
            "name": "HR",
            "how": "Analyze exit interview data and patterns"
          }
        ]
      },
      {
        "item": "Focus on outcomes and making prospects' lives better",
        "reason": "This drives real value and differentiation",
        "notes": [
          "Define clear outcome metrics",
          "Track impact on customer success",
          "Build features that matter"
        ],
        "supportPeople": [
          {
            "name": "Product team",
            "how": "Help define and measure meaningful outcomes"
          }
        ]
      }
    ],
    "focusLevel": 75,
    "weeklyNeed": "support",
    "needDescription": "I need support from the team to help me stay focused on what matters most and not get distracted by less important tasks.",
    "weekOf": new Date().toISOString()
  }
};

// Function to create a new share link
async function createNewShare() {
  try {
    // First try local, then production if needed
    const urls = [
      'http://localhost:3000/api/share',
      'https://tools.getcampfire.com/api/share'
    ];
    
    let result = null;
    let successUrl = null;
    
    for (const url of urls) {
      try {
        console.log(`Attempting to create share at: ${url}`);
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(shareData)
        });

        if (response.ok) {
          result = await response.json();
          successUrl = url.includes('localhost') ? 'http://localhost:3000' : 'https://tools.getcampfire.com';
          break;
        } else {
          console.log(`Failed at ${url}: ${response.status}`);
        }
      } catch (e) {
        console.log(`Could not reach ${url}`);
      }
    }

    if (result) {
      console.log('✅ New share link created successfully!');
      console.log('Full response:', JSON.stringify(result, null, 2));
      
      const shareUrl = result.shareUrl || result.url || `${successUrl}/accountability-builder/share/${result.id}`;
      console.log('\n🔗 You can now access your Focus Finder results at:');
      console.log(shareUrl);
      console.log('\n📋 Share ID:', result.id);
    } else {
      throw new Error('Could not create share on any endpoint');
    }
  } catch (error) {
    console.error('❌ Error creating share:', error);
    console.log('\n💡 Make sure your development server is running (npm run dev) or try the production URL');
  }
}

// Run the function
createNewShare();