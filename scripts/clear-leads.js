#!/usr/bin/env node

// Script to clear all leads from the database
// Usage: node scripts/clear-leads.js

async function clearLeads() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const adminKey = process.env.ADMIN_KEY || 'your-admin-key-here';
  
  console.log('🗑️  Clearing all leads from the database...');
  
  try {
    const response = await fetch(`${baseUrl}/api/leads`, {
      method: 'DELETE',
      headers: {
        'x-admin-key': adminKey,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Success:', result.message);
      console.log(`   Deleted ${result.deletedCount} leads`);
    } else {
      console.error('❌ Error:', result.error);
      if (result.details) {
        console.error('   Details:', result.details);
      }
    }
  } catch (error) {
    console.error('❌ Failed to clear leads:', error.message);
  }
}

// Run the script
clearLeads();