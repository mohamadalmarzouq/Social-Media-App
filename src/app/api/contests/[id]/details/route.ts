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

    const params = await context.params;
    const contest = await prisma.contest.findUnique({
      where: {
        id: params.id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        platform: true,
        status: true,
        round: true,
        packageQuota: true,
        winnersNeeded: true,
        expectedSubmissions: true,
        acceptedCount: true,
        winningSubmissionId: true,
        createdAt: true,
        logoFileTypes: true,
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
        _count: {
          select: {
            submissions: true,
          },
        },
        submissions: userData.role === 'DESIGNER' ? {
          where: {
            designerId: userData.id,
          },
          select: {
            id: true,
            round: true,
            status: true,
            modificationsAllowed: true,
            modificationRequestedAt: true,
          },
          orderBy: {
            round: 'desc',
          },
          take: 1,
        } : undefined,
      },
    });

    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    // For designers, add their submission status
    let contestWithStatus = contest;
    if (userData.role === 'DESIGNER' && contest.submissions) {
      contestWithStatus = {
        ...contest,
        userSubmission: contest.submissions.length > 0 ? contest.submissions[0] : null,
      };
      // Remove the submissions array from the response
      delete (contestWithStatus as any).submissions;
    }

    return NextResponse.json({ contest: contestWithStatus });
  } catch (error) {
    console.error('Error fetching contest details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
