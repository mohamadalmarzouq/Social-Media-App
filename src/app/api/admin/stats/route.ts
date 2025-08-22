import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check admin session
    const adminSession = request.cookies.get('admin-session');
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      totalUsers,
      totalContests,
      totalSubmissions,
      activeContests,
      completedContests,
      businessUsers,
      designerUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.contest.count(),
      prisma.submission.count(),
      prisma.contest.count({ where: { status: 'ACTIVE' } }),
      prisma.contest.count({ where: { status: 'COMPLETED' } }),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.count({ where: { role: 'DESIGNER' } })
    ]);

    const stats = {
      totalUsers,
      totalContests,
      totalSubmissions,
      activeContests,
      completedContests,
      businessUsers,
      designerUsers,
      completionRate: totalContests > 0 ? Math.round((completedContests / totalContests) * 100) : 0,
      averageSubmissionsPerContest: totalContests > 0 ? Math.round(totalSubmissions / totalContests) : 0
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Admin stats fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
