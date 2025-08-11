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

    if (session.user.role !== 'DESIGNER') {
      return NextResponse.json({ error: 'Only designers can reply to submissions' }, { status: 403 });
    }

    const params = await context.params;
    const body = await request.json();
    const { message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Reply message is required' }, { status: 400 });
    }

    // Get the submission with contest details
    const submission = await prisma.submission.findUnique({
      where: { id: params.id },
      include: {
        contest: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Verify the submission belongs to this designer
    if (submission.designerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Create the reply comment
    const comment = await prisma.comment.create({
      data: {
        submissionId: params.id,
        authorId: session.user.id,
        message: message.trim(),
      },
      include: {
        author: {
          select: {
            name: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Reply added successfully',
      comment: {
        id: comment.id,
        message: comment.message,
        createdAt: comment.createdAt,
        author: comment.author,
      },
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
