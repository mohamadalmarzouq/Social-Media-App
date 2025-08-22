import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });
    
    // Clear the user session cookie
    response.cookies.delete('user-session');
    
    return response;
  } catch (error) {
    console.error('Sign out error:', error);
    return NextResponse.json(
      { success: false, message: 'Error during sign out' },
      { status: 500 }
    );
  }
}
