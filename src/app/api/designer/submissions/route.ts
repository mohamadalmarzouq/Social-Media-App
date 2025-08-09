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

    if (session.user.role !== 'DESIGNER') {
      return NextResponse.json({ error: 'Only designers can view submissions' }, { status: 403 });
    }

    const submissions = await prisma.submission.findMany({
      where: {
        designerId: session.user.id,
      },
      include: {
        contest: {
          select: {
            id: true,
            title: true,
            platform: true,
            status: true,
          },
        },
        assets: {
          select: {
            id: true,
            url: true,
            type: true,
            filename: true,
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
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Error fetching designer submissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
