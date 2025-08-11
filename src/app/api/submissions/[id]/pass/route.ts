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
      return NextResponse.json({ error: 'Only business owners can pass submissions' }, { status: 403 });
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

    // Update submission status to PASSED
    const updatedSubmission = await prisma.submission.update({
      where: { id: params.id },
      data: { status: 'PASSED' },
    });

    return NextResponse.json({
      message: 'Submission passed successfully',
      submission: updatedSubmission,
    });
  } catch (error) {
    console.error('Error passing submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
