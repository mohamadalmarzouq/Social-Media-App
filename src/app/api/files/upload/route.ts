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

    console.log('File upload attempt:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      submissionId,
      type
    });

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

    console.log('Generated filename:', filename);

    try {
      // Save file using storage - use the correct method
      const uploadResult = await storage.save(file, filename);
      console.log('File saved successfully to storage:', uploadResult);
    } catch (storageError) {
      console.error('Storage error:', storageError);
      return NextResponse.json({ 
        error: 'Failed to save file to storage',
        details: storageError instanceof Error ? storageError.message : 'Unknown storage error'
      }, { status: 500 });
    }

    // Create asset record in database using the storage result
    const asset = await prisma.asset.create({
      data: {
        submissionId,
        url: uploadResult.url, // Use the URL from storage result
        filename: file.name,
        type: type === 'IMAGE' ? 'IMAGE' : 'VIDEO', // Ensure correct type mapping
        mimeType: file.type,
        fileSize: file.size,
        width: type === 'IMAGE' ? undefined : undefined, // Will be set later if needed
        height: type === 'IMAGE' ? undefined : undefined, // Will be set later if needed
      },
    });

    console.log('Asset created in database:', {
      id: asset.id,
      url: asset.url,
      filename: asset.filename,
      type: asset.type,
      submissionId: asset.submissionId
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
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
