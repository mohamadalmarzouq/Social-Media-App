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

    // Start a transaction to select winner and complete contest
    const result = await prisma.$transaction(async (tx) => {
      // Mark the winning submission
      const winningSubmission = await tx.submission.update({
        where: { id: submissionId },
        data: { status: 'WINNER' },
      });

      // Update contest to completed and set winning submission
      const updatedContest = await tx.contest.update({
        where: { id: params.id },
        data: {
          status: 'COMPLETED',
          winningSubmissionId: submissionId,
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

      return { contest: updatedContest, winningSubmission };
    });

    return NextResponse.json({
      message: 'Winner selected successfully! Contest completed.',
      contest: result.contest,
      winningSubmission: result.winningSubmission,
    });
  } catch (error) {
    console.error('Error selecting winner:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
