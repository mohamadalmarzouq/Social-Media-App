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

    const contests = await prisma.contest.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        _count: {
          select: {
            submissions: true,
          },
        },
        brand: {
          select: {
            logoUrl: true,
            colors: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({ contests });
  } catch (error) {
    console.error('Error fetching contests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'USER') {
      return NextResponse.json({ error: 'Only business owners can create contests' }, { status: 403 });
    }

    // Get user by email (safe even if session.id isn't present)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { brandName, ...contestData } = body;
    
    // Upsert brand so the FK is always valid
    const brand = await prisma.brand.upsert({
      where: { userId: user.id },
      update: {
        logoUrl: body.brandData?.logoUrl,
        colors: body.brandData?.colors || [],
        fonts: body.brandData?.fonts || [],
        description: body.brandData?.description,
      },
      create: {
        userId: user.id,
        logoUrl: body.brandData?.logoUrl,
        colors: body.brandData?.colors || [],
        fonts: body.brandData?.fonts || [],
        description: body.brandData?.description,
      },
    });

    // Create contest with new fields
    const contest = await prisma.contest.create({
      data: {
        userId: user.id,
        brandId: brand.id,
        title: contestData.title,
        description: contestData.description,
        platform: contestData.platform,
        fileType: contestData.fileType,
        packageType: contestData.packageType,
        packageQuota: contestData.packageQuota,
        winnersNeeded: contestData.winnersNeeded,
        expectedSubmissions: contestData.expectedSubmissions,
        status: 'ACTIVE',
      },
      include: {
        brand: true,
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    return NextResponse.json({ contest });
  } catch (error) {
    console.error('Error creating contest:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
