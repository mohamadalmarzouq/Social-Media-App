import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { submissionSchema } from '@/lib/validations/submission';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'DESIGNER') {
      return NextResponse.json({ error: 'Only designers can create submissions' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = submissionSchema.parse(body);
    const { contestId, comment } = validatedData;

    // Verify the contest exists and is active
    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
      select: {
        id: true,
        status: true,
        round: true,
        expectedSubmissions: true,
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    if (contest.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Contest is not active' }, { status: 400 });
    }

    // Check if designer already has a submission for this contest in the current round
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        contestId_designerId_round: {
          contestId,
          designerId: session.user.id,
          round: contest.round,
        },
      },
    });

    if (existingSubmission) {
      // Allow resubmission if previous submission was PASSED
      if (existingSubmission.status === 'PASSED') {
        // Delete the old passed submission to allow new one
        await prisma.submission.delete({
          where: { id: existingSubmission.id },
        });
      } else {
        return NextResponse.json({ 
          error: 'You already have a submission for this contest in the current round' 
        }, { status: 400 });
      }
    }

    // Create the submission
    const submission = await prisma.submission.create({
      data: {
        contestId,
        designerId: session.user.id,
        round: contest.round,
        status: 'PENDING',
      },
      include: {
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

    // If there's a comment, create it
    if (comment && comment.trim()) {
      await prisma.comment.create({
        data: {
          submissionId: submission.id,
          authorId: session.user.id,
          message: comment.trim(),
        },
      });
    }

    return NextResponse.json({
      message: 'Submission created successfully',
      submission: {
        id: submission.id,
        contestId: submission.contestId,
        round: submission.round,
        status: submission.status,
        createdAt: submission.createdAt,
        contest: submission.contest,
        designer: submission.designer,
      },
    });
  } catch (error) {
    console.error('Error creating submission:', error);
    
    if (error instanceof Error && 'issues' in error) {
      // Zod validation error
      return NextResponse.json(
        { error: 'Validation failed', issues: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
