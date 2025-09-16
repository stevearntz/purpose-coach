// Script to recreate the Focus Finder share link
// This is the data from your previous share that we retrieved from the API

const shareData = {
  "type": "accountability-builder",
  "toolName": "Accountability Builder",
  "data": {
    "majorAreas": [
      "Revenue, sales, or growth targets",
      "Product or delivery milestones",
      "Strategy or planning"
    ],
    "outcomes": [
      {
        "outcome": "Ensure that Nuvei pays the $47k",
        "status": "needs-push",
        "focusArea": "Revenue, sales, or growth targets"
      },
      {
        "outcome": "Work the window (follow-up on all active deal flow)",
        "status": "needs-push",
        "focusArea": "Revenue, sales, or growth targets"
      },
      {
        "outcome": "Create plan for invoice factoring based on payment terms",
        "status": "at-risk",
        "focusArea": "Revenue, sales, or growth targets"
      },
      {
        "outcome": "Review and refine CNH proposal for Sept. 30th (+ finish booking travel)",
        "status": "needs-push",
        "focusArea": "Revenue, sales, or growth targets"
      },
      {
        "outcome": "Ship team member experience for tool completion",
        "status": "needs-push",
        "focusArea": "Product or delivery milestones"
      },
      {
        "outcome": "Design 360 product for Cotopaxi's needs (+ first ten customers)",
        "status": "needs-push",
        "focusArea": "Product or delivery milestones"
      },
      {
        "outcome": "Simplify and deliver on all existing assessments",
        "status": "on-track",
        "focusArea": "Product or delivery milestones"
      },
      {
        "outcome": "Board meeting on Thursday - prepare financials and pre-read",
        "status": "needs-push",
        "focusArea": "Strategy or planning"
      },
      {
        "outcome": "Build a lightweight acquisition strategy in the event of early cash-out",
        "status": "at-risk",
        "focusArea": "Strategy or planning"
      },
      {
        "outcome": "Align acquisition strategy with SMB customer acquisition strategy",
        "status": "on-track",
        "focusArea": "Strategy or planning"
      }
    ],
    "topThree": [
      {
        "item": "Ensure that Nuvei pays the $47k",
        "reason": "",
        "notes": [
          "F/U with Ashley on launch and payment",
          "Message A/P to make sure that we're on target for dates",
          "Make sure that check date aligns well with next payroll dates and needs"
        ],
        "supportPeople": [
          {
            "name": "Ella",
            "how": "F/U with Ashley and A/P to see if we're gonna get that check"
          },
          {
            "name": "Marinne",
            "how": "Make sure that all of our payables align with receivables dates and we don't bounce things."
          }
        ]
      },
      {
        "item": "Align acquisition strategy with SMB customer acquisition strategy",
        "reason": "",
        "notes": [
          "Determine strategy for BambooHR and other possible acquisition partners (soft landing)",
          "Understand our existing SMB customer needs (validate existing product plan)",
          "Finalize SMB customer acquisition strategy",
          "Align the two strategies"
        ],
        "supportPeople": [
          {
            "name": "Todd Grierson",
            "how": "Talk to him about Bamboo's acquisition timeline and needs. Update him on our progress."
          },
          {
            "name": "Marinne",
            "how": "Have her finalize the SMB customer acquisition (and product) strategy."
          },
          {
            "name": "Ella",
            "how": "Have her provide an update on validation around SMB existing customer needs and our customer acquisition strategy. Also, find where there are opportunities to expand existing accounts with this strategy. She can help close those deals!"
          }
        ]
      },
      {
        "item": "Create plan for invoice factoring based on payment terms",
        "reason": "",
        "notes": [
          "Talk to Mitch about Sepio's willingness to bridge with active invoices",
          "Talk to the contact that Amelia Wilcox introduced me to",
          "Talk to other rich friends who might want to make a short term 10% return",
          "Figure out likely dates of existing invoices on new customers."
        ],
        "supportPeople": [
          {
            "name": "Amelia Wilcox",
            "how": "Re-intro her friend to see if we can have a plan ready."
          },
          {
            "name": "Mitch",
            "how": "Explain the process we'd go through if Sepio is willing to factor upcoming invoices. If not, have him share an approach we might use."
          },
          {
            "name": "Gentry",
            "how": "See if he wants to buy a few invoices and make a small bit of cash."
          }
        ]
      }
    ],
    "focusLevel": 77,
    "weeklyNeed": "support",
    "needDescription": "I probably need some support from the people closest to me... patience and understanding, encouragement and prayers... this feels like it's going to be an exceptionally challenging week.",
    "weekOf": "2025-09-15T03:25:03.575Z"
  }
};

// Function to create a new share link
async function createNewShare() {
  try {
    const response = await fetch('https://tools.getcampfire.com/api/share', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shareData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ New share link created successfully!');
    console.log('Full response:', JSON.stringify(result, null, 2));
    console.log('\nShare URL:', result.shareUrl || result.url);
    
    if (result.shareUrl || result.url) {
      console.log('\nYou can now access your Focus Finder results at:');
      console.log(result.shareUrl || result.url);
    } else if (result.id) {
      const shareUrl = `https://tools.getcampfire.com/accountability-builder/share/${result.id}`;
      console.log('\nYou can now access your Focus Finder results at:');
      console.log(shareUrl);
    }
  } catch (error) {
    console.error('❌ Error creating share:', error);
  }
}

// Run the function
createNewShare();