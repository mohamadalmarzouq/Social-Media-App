import { NextRequest, NextResponse } from 'next/server';
import { getUserFromBearer } from '@/lib/mobileAuth';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromBearer(request);
    
    return NextResponse.json({
      user
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET'
      }
    });

  } catch (error) {
    console.error('Mobile /me error:', error);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, OPTIONS'
    }
  });
}
