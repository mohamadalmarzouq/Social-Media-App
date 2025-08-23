import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserMobile } from '@/lib/mobileAuth';

export async function GET(request: NextRequest) {
  try {
    // Use dual authentication (web session OR mobile JWT)
    const userData = await requireUserMobile(request);

    const contests = await prisma.contest.findMany({
      where: {
        userId: userData.id,
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
      { error: 'Unauthorized' },
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Use dual authentication (web session OR mobile JWT)
    const userData = await requireUserMobile(request);

    if (userData.role !== 'USER') {
      return NextResponse.json(
        { error: 'Only business owners can create contests' },
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get user by email (safe even if session.id isn't present)
    const user = await prisma.user.findUnique({
      where: { email: userData.email! },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
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
        logoFileTypes: contestData.logoFileTypes || [], // Include logo file types
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
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
