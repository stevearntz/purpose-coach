import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const shareData = {
      ...body,
      createdAt: new Date().toISOString(),
    };
    
    const id = nanoid(10);
    
    await kv.set(`share:${id}`, shareData, {
      ex: 60 * 60 * 24 * 30, // 30 days expiry
    });
    
    return NextResponse.json({ id, url: `/share/${id}` });
  } catch (error) {
    console.error('Error saving share data:', error);
    return NextResponse.json(
      { error: 'Failed to create shareable link' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Share ID is required' },
        { status: 400 }
      );
    }
    
    const data = await kv.get(`share:${id}`);
    
    if (!data) {
      return NextResponse.json(
        { error: 'Share not found or expired' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error retrieving share data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve shared data' },
      { status: 500 }
    );
  }
}