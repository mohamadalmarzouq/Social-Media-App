import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserMobile } from '@/lib/mobileAuth';

export async function GET(request: NextRequest) {
  try {
    // Use dual authentication (web session OR mobile JWT)
    const userData = await requireUserMobile(request);

    // Get only winning submissions from user's contests
    const winningSubmissions = await prisma.submission.findMany({
      where: {
        status: 'WINNER', // Only show winning designs
        contest: {
          userId: userData.id,
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
            mimeType: true,
            fileSize: true,
          },
        },
        contest: {
          select: {
            id: true,
            title: true,
            platform: true,
            round: true,
          },
        },
        designer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Transform the data to match the expected format
    const designs = winningSubmissions.map(submission => ({
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
    console.error('Error fetching winning designs:', error);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
