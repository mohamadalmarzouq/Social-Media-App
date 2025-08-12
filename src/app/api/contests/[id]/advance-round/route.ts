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
      return NextResponse.json({ error: 'Only business owners can advance rounds' }, { status: 403 });
    }

    const params = await context.params;
    const contest = await prisma.contest.findUnique({
      where: { id: params.id },
      include: {
        submissions: {
          where: { 
            status: 'ACCEPTED',
            round: undefined // We'll filter this in the code
          },
          select: { 
            id: true,
            round: true,
            status: true
          }
        }
      }
    });

    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    if (contest.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (contest.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Only active contests can advance rounds' }, { status: 400 });
    }

    if (contest.round >= 3) {
      return NextResponse.json({ error: 'Contest is already at the final round' }, { status: 400 });
    }

    // Check if there are any accepted submissions in the current round
    const currentRoundAcceptedSubmissions = contest.submissions.filter(
      submission => submission.status === 'ACCEPTED' && submission.round === contest.round
    );

    if (currentRoundAcceptedSubmissions.length === 0) {
      return NextResponse.json({ 
        error: 'Cannot advance to next round without any accepted submissions in the current round' 
      }, { status: 400 });
    }

    // Advance to next round
    const newRound = contest.round + 1;
    let newStatus = contest.status;

    // If advancing to round 3, mark as completed
    if (newRound === 3) {
      newStatus = 'COMPLETED';
    }

    const updatedContest = await prisma.contest.update({
      where: { id: params.id },
      data: {
        round: newRound,
        status: newStatus,
        acceptedCount: 0, // Reset accepted count for new round
      },
      include: {
        _count: {
          select: {
            submissions: true,
          },
        },
        brand: {
          select: {
            logoUrl: true,
            colors: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: `Contest advanced to ${getRoundName(newRound)}`,
      contest: updatedContest,
    });
  } catch (error) {
    console.error('Error advancing contest round:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getRoundName(round: number): string {
  switch (round) {
    case 1:
      return 'Round 1';
    case 2:
      return 'Round 2';
    case 3:
      return 'Round 3';
    default:
      return `Round ${round}`;
  }
}
