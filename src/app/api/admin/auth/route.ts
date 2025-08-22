import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Check admin credentials
    if (username === env.ADMIN_USERNAME && password === env.ADMIN_PASSWORD) {
      // Set admin session cookie
      const response = NextResponse.json({ 
        success: true, 
        message: 'Admin authentication successful' 
      });
      
      // Set secure admin session cookie
      response.cookies.set('admin-session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/'
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: 'Invalid admin credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  // Admin logout
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin-session');
  return response;
}
