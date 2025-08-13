import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'DESIGNER') {
      return NextResponse.json({ error: 'Only designers can browse contests' }, { status: 403 });
    }

    const contests = await prisma.contest.findMany({
      where: {
        status: 'ACTIVE',
        // Don't show contests created by this user (if they somehow have USER role too)
        NOT: {
          userId: session.user.id,
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        platform: true,
        status: true,
        round: true,
        packageQuota: true,
        expectedSubmissions: true,
        acceptedCount: true,
        createdAt: true,
        logoFileTypes: true,
        user: {
          select: {
            name: true,
          },
        },
        brand: {
          select: {
            logoUrl: true,
            colors: true,
            fonts: true,
            description: true,
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
        submissions: {
          where: {
            designerId: session.user.id,
          },
          select: {
            id: true,
            round: true,
            status: true,
          },
          orderBy: {
            round: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform the data to include user's submission status
    const contestsWithStatus = contests.map(contest => ({
      ...contest,
      userSubmission: contest.submissions.length > 0 ? contest.submissions[0] : null,
      submissions: undefined, // Remove the submissions array from the response
    }));

    return NextResponse.json({ contests: contestsWithStatus });
  } catch (error) {
    console.error('Error fetching contests for browse:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
