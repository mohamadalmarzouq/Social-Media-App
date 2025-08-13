import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'USER') {
      return NextResponse.json({ error: 'Only users can modify submissions' }, { status: 403 });
    }

    const submissionId = params.id;

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
        designer: {
          select: {
            id: true,
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
      return NextResponse.json({ error: 'You can only modify submissions in your own contests' }, { status: 403 });
    }

    if (submission.status !== 'ACCEPTED') {
      return NextResponse.json({ error: 'Only accepted submissions can be modified' }, { status: 400 });
    }

    if (submission.contest.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Cannot modify submissions in completed contests' }, { status: 400 });
    }

    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        modificationsAllowed: true,
        modificationRequestedAt: new Date(),
      },
    });

    // Log the modification request for audit purposes
    await prisma.comment.create({
      data: {
        submissionId: submissionId,
        message: `Modification requested by contest owner. Designer can now provide additional submissions based on feedback.`,
        authorId: session.user.id,
      },
    });

    return NextResponse.json({
      message: 'Submission modification enabled successfully',
      submission: {
        id: updatedSubmission.id,
        modificationsAllowed: updatedSubmission.modificationsAllowed,
        modificationRequestedAt: updatedSubmission.modificationRequestedAt,
      },
    });

  } catch (error) {
    console.error('Error enabling submission modification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
