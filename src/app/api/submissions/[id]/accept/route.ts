import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { syncContestAcceptedCount } from '@/lib/utils';

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
    const submission = await prisma.submission.findUnique({
      where: { id: params.id },
      include: {
        contest: {
          select: {
            id: true,
            userId: true,
            title: true,
          },
        },
        designer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    if (submission.contest.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update submission status to accepted
    const updatedSubmission = await prisma.submission.update({
      where: { id: params.id },
      data: { status: 'ACCEPTED' },
      include: {
        contest: true,
        designer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Sync the contest's accepted count to ensure accuracy
    const newAcceptedCount = await syncContestAcceptedCount(updatedSubmission.contestId);

    return NextResponse.json({
      message: 'Submission accepted successfully',
      submission: updatedSubmission,
      newAcceptedCount,
    });
  } catch (error) {
    console.error('Error accepting submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
