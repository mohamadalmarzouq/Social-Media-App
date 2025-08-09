import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contest = await prisma.contest.findUnique({
      where: {
        id: params.id,
      },
      include: {
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
        submissions: session.user.role === 'DESIGNER' ? {
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
        } : undefined,
      },
    });

    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    // For designers, add their submission status
    let contestWithStatus = contest;
    if (session.user.role === 'DESIGNER' && contest.submissions) {
      contestWithStatus = {
        ...contest,
        userSubmission: contest.submissions.length > 0 ? contest.submissions[0] : null,
        submissions: undefined,
      };
    }

    return NextResponse.json({ contest: contestWithStatus });
  } catch (error) {
    console.error('Error fetching contest details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
