import { NextRequest, NextResponse } from 'next/server';
import { requireUserMobile } from '@/lib/mobileAuth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Use dual authentication (web session OR mobile JWT)
    const userData = await requireUserMobile(request);

    const params = await context.params;
    const submissionId = params.id;

    // Get the submission with contest info
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        contest: {
          select: {
            id: true,
            userId: true,
            status: true,
            round: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Check if the user owns the contest
    if (submission.contest.userId !== userData.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if the contest is active
    if (submission.contest.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Contest is not active' }, { status: 400 });
    }

    // Check if the submission is in the current round
    if (submission.round !== submission.contest.round) {
      return NextResponse.json({ error: 'Submission is not in the current round' }, { status: 400 });
    }

    // Check if the submission is pending
    if (submission.status !== 'PENDING') {
      return NextResponse.json({ error: 'Submission is not pending' }, { status: 400 });
    }

    // Update the submission status
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: 'PASSED' },
    });

    return NextResponse.json({ message: 'Submission passed successfully' });
  } catch (error) {
    console.error('Error passing submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
