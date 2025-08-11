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
      return NextResponse.json({ error: 'Only business owners can accept submissions' }, { status: 403 });
    }

    const params = await context.params;
    
    // Get the submission with contest details
    const submission = await prisma.submission.findUnique({
      where: { id: params.id },
      include: {
        contest: {
          select: {
            id: true,
            userId: true,
            packageQuota: true,
            acceptedCount: true,
            status: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Verify the contest belongs to this user
    if (submission.contest.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if contest is still active
    if (submission.contest.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Contest is not active' }, { status: 400 });
    }

    // Check if submission is pending
    if (submission.status !== 'PENDING') {
      return NextResponse.json({ error: 'Submission is not pending' }, { status: 400 });
    }

    // Check if contest quota is already reached
    if (submission.contest.acceptedCount >= submission.contest.packageQuota) {
      return NextResponse.json({ error: 'Contest quota already reached' }, { status: 400 });
    }

    // Use a transaction to update submission and contest
    const result = await prisma.$transaction(async (tx) => {
      // Update submission status to ACCEPTED
      const updatedSubmission = await tx.submission.update({
        where: { id: params.id },
        data: { status: 'ACCEPTED' },
      });

      // Increment contest accepted count
      const updatedContest = await tx.contest.update({
        where: { id: submission.contest.id },
        data: { acceptedCount: { increment: 1 } },
      });

      // Check if contest should be completed
      if (updatedContest.acceptedCount >= updatedContest.packageQuota) {
        await tx.contest.update({
          where: { id: submission.contest.id },
          data: { status: 'COMPLETED' },
        });
      }

      return { updatedSubmission, updatedContest };
    });

    return NextResponse.json({
      message: 'Submission accepted successfully',
      submission: result.updatedSubmission,
      contest: result.updatedContest,
    });
  } catch (error) {
    console.error('Error accepting submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
