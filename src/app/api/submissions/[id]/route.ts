import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'DESIGNER') {
      return NextResponse.json({ error: 'Only designers can update submissions' }, { status: 403 });
    }

    const params = await context.params;
    const { files } = await request.json();

    // Verify the submission exists and belongs to this designer
    const submission = await prisma.submission.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        designerId: true,
        status: true,
      },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    if (submission.designerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (submission.status !== 'PENDING') {
      return NextResponse.json({ error: 'Can only update pending submissions' }, { status: 400 });
    }

    // Update the submission with the files data
    const updatedSubmission = await prisma.submission.update({
      where: { id: params.id },
      data: {
        status: 'PENDING', // Keep as pending until reviewed
      },
      include: {
        assets: true,
        contest: {
          select: {
            title: true,
            platform: true,
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

    return NextResponse.json({
      message: 'Submission updated successfully with files',
      submission: updatedSubmission,
    });
  } catch (error) {
    console.error('Error updating submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'DESIGNER') {
      return NextResponse.json({ error: 'Only designers can delete submissions' }, { status: 403 });
    }

    const params = await context.params;

    // Verify the submission exists and belongs to this designer
    const submission = await prisma.submission.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        designerId: true,
        status: true,
      },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    if (submission.designerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Only allow deletion of pending submissions
    if (submission.status !== 'PENDING') {
      return NextResponse.json({ error: 'Can only delete pending submissions' }, { status: 400 });
    }

    // Delete the submission (this will cascade delete assets and comments)
    await prisma.submission.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: 'Submission deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
