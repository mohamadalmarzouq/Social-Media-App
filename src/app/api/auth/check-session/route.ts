import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check for user session cookie
    const userSession = request.cookies.get('user-session');
    
    if (!userSession) {
      return NextResponse.json(
        { success: false, message: 'No session found' },
        { status: 401 }
      );
    }

    // Parse the session data
    const sessionData = JSON.parse(userSession.value);
    
    return NextResponse.json({
      success: true,
      user: sessionData
    });

  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { success: false, message: 'Invalid session' },
      { status: 401 }
    );
  }
}
