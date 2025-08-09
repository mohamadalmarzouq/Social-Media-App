import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all accepted submissions from user's contests
    const acceptedSubmissions = await prisma.submission.findMany({
      where: {
        status: 'ACCEPTED',
        contest: {
          userId: session.user.id,
        },
      },
      include: {
        assets: {
          select: {
            id: true,
            url: true,
            filename: true,
            type: true,
            width: true,
            height: true,
          },
        },
        contest: {
          select: {
            id: true,
            title: true,
            platform: true,
          },
        },
        designer: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Transform the data to match the expected format
    const designs = acceptedSubmissions.map(submission => ({
      id: submission.id,
      submission: {
        id: submission.id,
        contest: submission.contest,
        designer: submission.designer,
        round: submission.round,
        createdAt: submission.createdAt.toISOString(),
      },
      assets: submission.assets,
    }));

    return NextResponse.json({ designs });
  } catch (error) {
    console.error('Error fetching accepted designs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
