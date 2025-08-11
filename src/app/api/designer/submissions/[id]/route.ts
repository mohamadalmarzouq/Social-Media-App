import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'DESIGNER') {
      return NextResponse.json({ error: 'Only designers can view submission details' }, { status: 403 });
    }

    const params = await context.params;

    // Get the submission with all related data
    const submission = await prisma.submission.findUnique({
      where: { id: params.id },
      include: {
        contest: {
          select: {
            id: true,
            title: true,
            platform: true,
            status: true,
            description: true,
            user: {
              select: {
                name: true,
              },
            },
            brand: {
              select: {
                logoUrl: true,
                colors: true,
                fonts: true,
                description: true,
              },
            },
          },
        },
        assets: {
          select: {
            id: true,
            url: true,
            filename: true,
            type: true,
            fileSize: true,
            mimeType: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        comments: {
          include: {
            author: {
              select: {
                name: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
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

    return NextResponse.json({ submission });
  } catch (error) {
    console.error('Error fetching submission details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
