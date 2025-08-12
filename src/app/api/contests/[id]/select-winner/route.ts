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
      return NextResponse.json({ error: 'Only business owners can select winners' }, { status: 403 });
    }

    const params = await context.params;
    const { submissionId } = await request.json();

    if (!submissionId) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
    }

    const contest = await prisma.contest.findUnique({
      where: { id: params.id },
      include: {
        submissions: {
          where: { 
            status: 'ACCEPTED',
            round: 3
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
      return NextResponse.json({ error: 'Only active contests can have winners selected' }, { status: 400 });
    }

    if (contest.round !== 3) {
      return NextResponse.json({ error: 'Winner can only be selected in Round 3' }, { status: 400 });
    }

    // Check if the submission exists and is accepted in Round 3
    const submission = contest.submissions.find(s => s.id === submissionId);
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found or not accepted in Round 3' }, { status: 404 });
    }

    // Start a transaction to select winner and potentially complete contest
    const result = await prisma.$transaction(async (tx) => {
      // Mark the winning submission
      const winningSubmission = await tx.submission.update({
        where: { id: submissionId },
        data: { status: 'WINNER' },
      });

      // Count how many winners we now have
      const currentWinners = await tx.submission.count({
        where: {
          contestId: contest.id,
          status: 'WINNER',
        },
      });

      // Check if we have enough winners to complete the contest
      const hasEnoughWinners = currentWinners >= contest.winnersNeeded;
      
      let updatedContest;
      if (hasEnoughWinners) {
        // Contest is complete - mark as completed
        updatedContest = await tx.contest.update({
          where: { id: params.id },
          data: {
            status: 'COMPLETED',
            winningSubmissionId: submissionId, // Keep the last selected winner as primary
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
            winningSubmission: {
              include: {
                designer: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
                assets: true,
              },
            },
          },
        });
      } else {
        // Still need more winners - keep contest active
        updatedContest = await tx.contest.findUnique({
          where: { id: params.id },
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
      }

      return { contest: updatedContest, winningSubmission, hasEnoughWinners, currentWinners };
    });

    const message = result.hasEnoughWinners 
      ? `Winner selected successfully! Contest completed with ${result.currentWinners} winner(s).`
      : `Winner selected! You now have ${result.currentWinners}/${contest.winnersNeeded} winner(s). Select ${contest.winnersNeeded - result.currentWinners} more to complete the contest.`;

    return NextResponse.json({
      message,
      contest: result.contest,
      winningSubmission: result.winningSubmission,
      hasEnoughWinners: result.hasEnoughWinners,
      currentWinners: result.currentWinners,
    });
  } catch (error) {
    console.error('Error selecting winner:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
