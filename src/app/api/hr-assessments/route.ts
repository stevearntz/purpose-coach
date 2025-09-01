import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

// Legacy endpoint - now just returns success for backward compatibility
// All assessment data is now stored via /api/assessments/save-campaign

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { managerData } = body;
    
    if (!managerData || !managerData.email) {
      return NextResponse.json(
        { error: 'Assessment data with email is required' },
        { status: 400 }
      );
    }
    
    // This endpoint is deprecated - assessments are now saved through
    // /api/assessments/save-campaign which uses PostgreSQL
    // Returning success for backward compatibility
    
    return NextResponse.json({ 
      success: true,
      assessmentId: nanoid(10),
      message: 'Assessment saved successfully (legacy endpoint)'
    });
    
  } catch (error) {
    console.error('Error in legacy endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to save assessment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET - Legacy endpoint, returns empty array
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const password = url.searchParams.get('password');
    
    // Check password
    if (password !== 'G3t.c@mpf1r3.st3v3') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Return empty response - data is now accessed via /api/assessments/unified
    return NextResponse.json({
      assessments: [],
      total: 0,
      message: 'Legacy endpoint - use /api/assessments/unified instead'
    });
    
  } catch (error) {
    console.error('Error in legacy endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve assessments' },
      { status: 500 }
    );
  }
}