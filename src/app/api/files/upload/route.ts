import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { RenderDiskStorage } from '@/lib/storage/render-disk-storage';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

const storage = new RenderDiskStorage();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'DESIGNER') {
      return NextResponse.json({ error: 'Only designers can upload files' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const submissionId = formData.get('submissionId') as string;
    const type = formData.get('type') as string;

    if (!file || !submissionId || !type) {
      return NextResponse.json({ 
        error: 'File, submissionId, and type are required' 
      }, { status: 400 });
    }

    // Verify the submission exists and belongs to this designer
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      select: {
        id: true,
        designerId: true,
        contestId: true,
      },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    if (submission.designerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only images and videos are allowed.' 
      }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File size too large. Maximum size is 10MB.' 
      }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const ext = path.extname(file.name);
    const filename = `${timestamp}_${randomString}${ext}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file using storage
    await storage.saveFile(filename, buffer);

    // Create asset record in database
    const asset = await prisma.asset.create({
      data: {
        submissionId,
        url: `/api/files/${filename}`,
        filename: file.name,
        type: type as 'IMAGE' | 'VIDEO',
        mimeType: file.type,
        fileSize: file.size,
      },
    });

    return NextResponse.json({
      message: 'File uploaded successfully',
      asset: {
        id: asset.id,
        url: asset.url,
        filename: asset.filename,
        type: asset.type,
      },
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
