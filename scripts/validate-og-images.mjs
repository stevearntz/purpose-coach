import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

const PRODUCTION_URL = 'https://tools.getcampfire.com';

const tools = [
  { path: '/', name: 'Home Page', expectedImage: 'og-tools-hub.jpg' },
  { path: '/team-canvas', name: 'Team Canvas', expectedImage: 'og-team-canvas.png' },
  { path: '/burnout-assessment', name: 'Burnout Assessment', expectedImage: 'og-burnout-assessment.png' },
  { path: '/trust-audit', name: 'Trust Audit', expectedImage: 'og-trust-audit.png' },
  { path: '/change-readiness', name: 'Change Readiness', expectedImage: 'og-change-readiness.png' },
  { path: '/coaching-cards', name: 'Coaching Cards', expectedImage: 'og-coaching-cards.png' },
  { path: '/career-drivers', name: 'Career Drivers', expectedImage: 'og-career-drivers.png' },
  { path: '/hopes-fears-expectations', name: 'Hopes Fears Expectations', expectedImage: 'og-hopes-fears.png' },
  { path: '/decision-making-audit', name: 'Decision Making Audit', expectedImage: 'og-decision-making.png' },
  { path: '/user-guide', name: 'Working with Me Guide', expectedImage: 'og-user-guide.png' },
  { path: '/courses', name: 'Campfire Catalog', expectedImage: 'og-catalog.jpg' }
];

async function validateOGImages() {
  console.log('🔍 Validating Open Graph images in production...\n');
  
  let allPassed = true;
  const results = [];

  for (const tool of tools) {
    const url = `${PRODUCTION_URL}${tool.path}`;
    
    try {
      console.log(`Checking ${tool.name}...`);
      const response = await fetch(url);
      const html = await response.text();
      const dom = new JSDOM(html);
      const document = dom.window.document;
      
      // Find OG image meta tag
      const ogImage = document.querySelector('meta[property="og:image"]');
      const ogImageContent = ogImage?.getAttribute('content');
      
      // Find Twitter image meta tag
      const twitterImage = document.querySelector('meta[name="twitter:image"]');
      const twitterImageContent = twitterImage?.getAttribute('content');
      
      // Check if image exists
      let imageStatus = '❌ Missing';
      let imageUrl = '';
      
      if (ogImageContent) {
        imageUrl = ogImageContent;
        if (ogImageContent.includes(tool.expectedImage)) {
          imageStatus = '✅ Correct';
        } else {
          imageStatus = '⚠️  Wrong image';
          allPassed = false;
        }
      } else {
        allPassed = false;
      }
      
      // Test if image URL is accessible
      let accessible = false;
      if (imageUrl) {
        try {
          const imgResponse = await fetch(imageUrl);
          accessible = imgResponse.ok;
        } catch (e) {
          accessible = false;
        }
      }
      
      results.push({
        tool: tool.name,
        url: url,
        status: imageStatus,
        ogImage: ogImageContent || 'None',
        twitterImage: twitterImageContent || 'None',
        accessible: accessible ? '✅' : '❌',
        expected: tool.expectedImage
      });
      
    } catch (error) {
      console.error(`Error checking ${tool.name}:`, error.message);
      results.push({
        tool: tool.name,
        url: url,
        status: '❌ Error',
        error: error.message
      });
      allPassed = false;
    }
  }
  
  // Display results
  console.log('\n📊 VALIDATION RESULTS:\n');
  console.log('Tool                          | Status      | Image Accessible | Expected Image');
  console.log('------------------------------|-------------|------------------|---------------------------');
  
  results.forEach(result => {
    const toolName = result.tool.padEnd(28);
    const status = (result.status || '').padEnd(11);
    const accessible = (result.accessible || '').padEnd(16);
    console.log(`${toolName} | ${status} | ${accessible} | ${result.expected || 'N/A'}`);
  });
  
  console.log('\n📝 DETAILED RESULTS:\n');
  results.forEach(result => {
    console.log(`\n${result.tool}:`);
    console.log(`  URL: ${result.url}`);
    console.log(`  OG Image: ${result.ogImage}`);
    console.log(`  Twitter Image: ${result.twitterImage}`);
    if (result.error) {
      console.log(`  Error: ${result.error}`);
    }
  });
  
  if (allPassed) {
    console.log('\n✅ All Open Graph images are correctly configured!');
  } else {
    console.log('\n❌ Some issues found with Open Graph images.');
    console.log('\n💡 Next steps:');
    console.log('1. Make sure the deployment has completed on Vercel');
    console.log('2. Clear social media caches using the debug tools');
    console.log('3. Check that image files exist in the public directory');
  }
  
  // Generate cache-busting URLs
  console.log('\n🔗 Cache-busting URLs for testing:');
  tools.forEach(tool => {
    console.log(`${PRODUCTION_URL}${tool.path}?v=${Date.now()}`);
  });
}

// Run the validation
validateOGImages().catch(console.error);