import { NextRequest, NextResponse } from 'next/server';
import { requireUserMobile } from '@/lib/mobileAuth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Use dual authentication (web session OR mobile JWT)
    const userData = await requireUserMobile(request);
    console.log('🔐 User authenticated:', { userId: userData.id, role: userData.role });

    const params = await context.params;
    const contestId = params.id;
    console.log('🎯 Fetching submissions for contest:', contestId);
    
    // Verify the contest exists and belongs to this user
    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
      select: { userId: true },
    });

    if (!contest) {
      console.log('❌ Contest not found:', contestId);
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    if (contest.userId !== userData.id) {
      console.log('❌ Unauthorized access attempt:', { contestUserId: contest.userId, requestUserId: userData.id });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    console.log('✅ Contest access verified, fetching submissions...');

    // Get all submissions for this contest
    const submissions = await prisma.submission.findMany({
      where: {
        contestId: contestId,
        // Only show submissions that have design files uploaded
        assets: {
          some: {} // At least one asset must exist
        }
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

    console.log('📊 Found submissions:', submissions.length);
    console.log('📋 Submissions data:', JSON.stringify(submissions, null, 2));

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('❌ Error fetching contest submissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
