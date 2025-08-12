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
            // Look for accepted submissions from ANY round, not just Round 3
            // Since we don't create duplicate submissions when advancing rounds
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

    // Check if the submission exists and is accepted
    const submission = contest.submissions.find(s => s.id === submissionId);
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found or not accepted' }, { status: 404 });
    }

    // Start a transaction to select winner and complete contest
    const result = await prisma.$transaction(async (tx) => {
      // Mark the winning submission
      const winningSubmission = await tx.submission.update({
        where: { id: submissionId },
        data: { status: 'WINNER' },
      });

      // For Package 1 (1 winner), always complete the contest
      // For Package 2 (2 winners) and Package 3 (3 winners), check if we have enough
      const currentWinners = await tx.submission.count({
        where: {
          contestId: contest.id,
          status: 'WINNER',
        },
      });

      // Get contest details to check winners needed
      const contestDetails = await tx.contest.findUnique({
        where: { id: contest.id },
        select: { winnersNeeded: true }
      });

      const hasEnoughWinners = contestDetails && currentWinners >= contestDetails.winnersNeeded;
      
      let updatedContest;
      if (hasEnoughWinners) {
        // Contest is complete - mark as completed
        updatedContest = await tx.contest.update({
          where: { id: params.id },
          data: {
            status: 'COMPLETED',
            winningSubmissionId: submissionId,
          },
        });
      } else {
        // Still need more winners - keep contest active
        updatedContest = await tx.contest.findUnique({
          where: { id: params.id },
        });
      }

      return { contest: updatedContest, winningSubmission, hasEnoughWinners, currentWinners };
    });

    const message = result.hasEnoughWinners 
      ? `Winner selected successfully! Contest completed with ${result.currentWinners} winner(s).`
      : `Winner selected! You now have ${result.currentWinners}/${contestWithDetails.winnersNeeded} winner(s). Select ${contestWithDetails.winnersNeeded - result.currentWinners} more to complete the contest.`;

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
