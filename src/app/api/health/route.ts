import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simple health check for mobile app testing
    return NextResponse.json({
      ok: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'Backend is running'
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
