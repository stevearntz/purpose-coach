import { NextRequest, NextResponse } from 'next/server';
import { invitationStorage } from '@/lib/invitationStorage';
import { companyStorage } from '@/lib/companyStorage';

export async function POST(request: NextRequest) {
  try {
    console.log('=== FLUSHING ALL STORAGE ===');
    
    // Clear invitation storage
    // @ts-ignore - accessing private property for flush
    if (invitationStorage.memoryStore) {
      // @ts-ignore
      invitationStorage.memoryStore.clear();
      console.log('✓ Cleared invitation memory store');
    }
    
    // Clear company storage
    // @ts-ignore - accessing private property for flush
    if (companyStorage.memoryStore) {
      // @ts-ignore
      companyStorage.memoryStore.companies.clear();
      // @ts-ignore
      companyStorage.memoryStore.users.clear();
      // @ts-ignore
      companyStorage.memoryStore.domainToCompany.clear();
      console.log('✓ Cleared company memory stores');
    }
    
    // If Redis is available, flush Redis keys too
    // @ts-ignore
    if (invitationStorage.redis && !invitationStorage.useMemoryFallback) {
      try {
        // @ts-ignore
        const redis = invitationStorage.redis;
        
        // Delete all invitation keys
        const inviteKeys = await redis.keys('invitation:*');
        if (inviteKeys.length > 0) {
          await redis.del(...inviteKeys);
          console.log(`✓ Deleted ${inviteKeys.length} invitation keys from Redis`);
        }
        
        // Delete invitations sorted set
        await redis.del('invitations:all');
        console.log('✓ Deleted invitations:all from Redis');
      } catch (error) {
        console.error('Failed to flush Redis invitation keys:', error);
      }
    }
    
    // @ts-ignore
    if (companyStorage.redis && !companyStorage.useMemoryFallback) {
      try {
        // @ts-ignore
        const redis = companyStorage.redis;
        
        // Delete all company keys
        const companyKeys = await redis.keys('company:*');
        if (companyKeys.length > 0) {
          await redis.del(...companyKeys);
          console.log(`✓ Deleted ${companyKeys.length} company keys from Redis`);
        }
        
        // Delete all user keys
        const userKeys = await redis.keys('user:*');
        if (userKeys.length > 0) {
          await redis.del(...userKeys);
          console.log(`✓ Deleted ${userKeys.length} user keys from Redis`);
        }
        
        // Delete all domain keys
        const domainKeys = await redis.keys('domain:*');
        if (domainKeys.length > 0) {
          await redis.del(...domainKeys);
          console.log(`✓ Deleted ${domainKeys.length} domain keys from Redis`);
        }
      } catch (error) {
        console.error('Failed to flush Redis company keys:', error);
      }
    }
    
    console.log('=== STORAGE FLUSH COMPLETE ===');
    
    return NextResponse.json({ 
      success: true, 
      message: 'All storage has been flushed successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Failed to flush storage:', error);
    return NextResponse.json({ 
      error: 'Failed to flush storage',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Provide a simple UI for flushing
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Flush Storage</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 600px;
          margin: 100px auto;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        h1 {
          color: #333;
          margin-bottom: 10px;
        }
        p {
          color: #666;
          line-height: 1.6;
        }
        .warning {
          background: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
          color: #856404;
        }
        button {
          background: #dc3545;
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        button:hover {
          background: #c82333;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
        }
        button:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }
        .success {
          background: #d4edda;
          border: 1px solid #28a745;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
          color: #155724;
          display: none;
        }
        .error {
          background: #f8d7da;
          border: 1px solid #dc3545;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
          color: #721c24;
          display: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🗑️ Flush All Storage</h1>
        <p>This will completely clear all stored data including:</p>
        <ul>
          <li>All invitations</li>
          <li>All companies</li>
          <li>All user records</li>
          <li>Both memory and Redis storage</li>
        </ul>
        
        <div class="warning">
          <strong>⚠️ Warning:</strong> This action cannot be undone. All data will be permanently deleted.
        </div>
        
        <div class="success" id="success">
          ✅ Storage flushed successfully! You can now start fresh.
        </div>
        
        <div class="error" id="error">
          ❌ Failed to flush storage. Check the console for details.
        </div>
        
        <button id="flushBtn" onclick="flushStorage()">
          Flush All Storage
        </button>
        
        <script>
          async function flushStorage() {
            if (!confirm('Are you sure you want to delete ALL data? This cannot be undone!')) {
              return;
            }
            
            const btn = document.getElementById('flushBtn');
            const success = document.getElementById('success');
            const error = document.getElementById('error');
            
            btn.disabled = true;
            btn.textContent = 'Flushing...';
            success.style.display = 'none';
            error.style.display = 'none';
            
            try {
              const response = await fetch('/api/admin/flush-storage', {
                method: 'POST'
              });
              
              const data = await response.json();
              
              if (response.ok) {
                success.style.display = 'block';
                btn.textContent = 'Storage Flushed';
                
                // Clear localStorage too
                localStorage.clear();
                console.log('✓ Cleared localStorage');
                
                // Redirect to home after 2 seconds
                setTimeout(() => {
                  window.location.href = '/';
                }, 2000);
              } else {
                error.style.display = 'block';
                error.textContent = data.error || 'Failed to flush storage';
                btn.disabled = false;
                btn.textContent = 'Flush All Storage';
              }
            } catch (err) {
              error.style.display = 'block';
              error.textContent = 'Network error: ' + err.message;
              btn.disabled = false;
              btn.textContent = 'Flush All Storage';
            }
          }
        </script>
      </div>
    </body>
    </html>
  `;
  
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}