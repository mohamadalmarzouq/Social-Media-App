import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'USER') {
      return NextResponse.json({ error: 'Only business owners can cancel contests' }, { status: 403 });
    }

    const params = await context.params;
    const contestId = params.id;

    // Get the contest with submissions to check business rules
    const contest = await prisma.contest.findUnique({
      where: {
        id: contestId,
        userId: session.user.id, // Ensure user owns the contest
      },
      include: {
        submissions: {
          where: {
            status: 'ACCEPTED',
          },
          select: {
            round: true,
          },
        },
      },
    });

    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    // Business Rule: Cannot cancel if contest has entered round 2 or beyond
    // Check if any designs were accepted in round 1 (which would advance to round 2)
    const hasAcceptedInRound1 = contest.submissions.some(sub => sub.round === 1);
    
    if (hasAcceptedInRound1) {
      return NextResponse.json({ 
        error: 'Cannot cancel contest after entering round 2. Some designs were already approved in round 1.' 
      }, { status: 400 });
    }

    // Business Rule: Cannot cancel if contest is already completed
    if (contest.status === 'COMPLETED') {
      return NextResponse.json({ 
        error: 'Cannot cancel a completed contest' 
      }, { status: 400 });
    }

    // Business Rule: Cannot cancel if contest is already cancelled
    if (contest.status === 'CANCELLED') {
      return NextResponse.json({ 
        error: 'Contest is already cancelled' 
      }, { status: 400 });
    }

    // Cancel the contest
    const updatedContest = await prisma.contest.update({
      where: {
        id: contestId,
      },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ 
      message: 'Contest cancelled successfully',
      contest: updatedContest 
    });
  } catch (error) {
    console.error('Error cancelling contest:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
