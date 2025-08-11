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

    const params = await context.params;
    
    // Verify the contest exists and belongs to this user
    const contest = await prisma.contest.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    if (contest.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get all submissions for this contest
    const submissions = await prisma.submission.findMany({
      where: {
        contestId: params.id,
      },
      include: {
        designer: {
          select: {
            name: true,
            email: true,
          },
        },
        assets: {
          select: {
            id: true,
            url: true,
            filename: true,
            type: true,
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
      orderBy: [
        { round: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Error fetching contest submissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
