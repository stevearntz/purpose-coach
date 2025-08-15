// DEPRECATED: Admin model has been removed
import { NextRequest, NextResponse } from 'next/server'

// This endpoint is no longer functional since Admin model was removed
// The app now uses Clerk for authentication
export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'This endpoint is deprecated. Admin model has been removed. Use Clerk authentication instead.' 
  }, { status: 410 })
}