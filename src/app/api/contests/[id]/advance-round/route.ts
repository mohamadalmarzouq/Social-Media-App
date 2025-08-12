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
            status: true,
            designerId: true
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

    // Keep status as ACTIVE even for Round 3 - user needs to select winner
    // Status will change to COMPLETED only when a winner is selected

    // Start a transaction to update contest and carry over accepted submissions
    const result = await prisma.$transaction(async (tx) => {
      // Count total accepted submissions across all rounds to get accurate count
      const totalAcceptedSubmissions = await tx.submission.count({
        where: {
          contestId: contest.id,
          status: 'ACCEPTED',
        },
      });

      // Update contest to next round with accurate accepted count
      const updatedContest = await tx.contest.update({
        where: { id: params.id },
        data: {
          round: newRound,
          status: newStatus,
          acceptedCount: totalAcceptedSubmissions, // Use actual count from database
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

      // Check if we already have accepted submissions in the new round
      const existingNewRoundAccepted = await tx.submission.findMany({
        where: {
          contestId: contest.id,
          round: newRound,
          status: 'ACCEPTED',
        },
      });

      // Only create new accepted submissions if they don't already exist
      if (existingNewRoundAccepted.length === 0) {
        // Carry over accepted submissions from previous round to new round
        // This allows designers to continue working on accepted designs
        for (const submission of currentRoundAcceptedSubmissions) {
          await tx.submission.create({
            data: {
              contestId: contest.id,
              designerId: submission.designerId,
              round: newRound,
              status: 'ACCEPTED', // Carry over the accepted status
            },
          });
        }
      }

      return updatedContest;
    });

    return NextResponse.json({
      message: `Contest advanced to ${getRoundName(newRound)}. ${currentRoundAcceptedSubmissions.length} accepted design(s) carried over to the next round.`,
      contest: result,
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
      return 'Round 3 (Final Selection)';
    default:
      return `Round ${round}`;
  }
}
