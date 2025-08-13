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
    const { contestId, comment, files, isModification } = validatedData; // Add isModification to validation

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
      include: {
        assets: true,
      },
    });

    if (existingSubmission) {
      // If this is a modification submission, check if modifications are allowed
      if (isModification) {
        if (!existingSubmission.modificationsAllowed) {
          return NextResponse.json({ 
            error: 'Modifications are not allowed for this submission' 
          }, { status: 400 });
        }
        
        // For modifications, we create a new submission but mark it as a modification
        // The original accepted submission remains unchanged
      } else {
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
    }

    // Create the submission
    const submission = await prisma.submission.create({
      data: {
        contestId,
        designerId: session.user.id,
        round: contest.round,
        status: isModification ? 'MODIFICATION' : 'PENDING', // New status for modifications
        modificationsAllowed: false, // Reset for new submission
        modificationRequestedAt: null, // Reset for new submission
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

    // Create assets for the uploaded files
    if (files && files.length > 0) {
      for (const file of files) {
        await prisma.asset.create({
          data: {
            submissionId: submission.id,
            url: file.url,
            filename: file.filename,
            type: file.type,
            mimeType: file.type === 'IMAGE' ? 'image/jpeg' : 'video/mp4', // Default mime types
            fileSize: 0, // Will be updated when file is actually processed
            width: file.type === 'IMAGE' ? 1080 : undefined, // Default dimensions
            height: file.type === 'IMAGE' ? 1080 : undefined,
          },
        });
      }
    }

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

    // Return the complete submission with assets
    return NextResponse.json({
      message: 'Submission created successfully with design files.',
      submission,
    });
  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
