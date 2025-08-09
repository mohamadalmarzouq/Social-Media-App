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

    const body = await request.json();
    
    // Create brand first
    const brand = await prisma.brand.create({
      data: {
        userId: session.user.id,
        logoUrl: body.brandData.logoUrl,
        colors: body.brandData.colors,
        fonts: body.brandData.fonts,
        description: body.brandData.description,
      },
    });

    // Create contest
    const contest = await prisma.contest.create({
      data: {
        userId: session.user.id,
        brandId: brand.id,
        title: body.title,
        description: body.description,
        platform: body.platform,
        packageQuota: body.packageQuota,
        expectedSubmissions: body.expectedSubmissions,
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
