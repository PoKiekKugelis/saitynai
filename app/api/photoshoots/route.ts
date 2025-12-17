import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreatePhotoshootDTOZ } from "@/lib/dtos";
import { requireRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerIdParam = searchParams.get('ownerId');
    const publicParam = searchParams.get('public');
    
    let whereClause: any = {};
    
    // Public photoshoots - anyone can view
    if (publicParam === 'true') {
      whereClause.public = true;
      const data = await prisma.photoshoot.findMany({
      where: whereClause,
      orderBy: { id: 'asc' },
      });
      return NextResponse.json(data, { status: 200 });
    }
    else if (ownerIdParam) {
      const session = await requireRole(request, ["ADMIN", "USER"])
      if (session instanceof NextResponse) return session
      const userId = parseInt(session.user.id);
      const requestedOwnerId = parseInt(ownerIdParam);
      
      // Only allow if requesting own photoshoots or admin
      if (requestedOwnerId !== userId && session.user.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Forbidden - no permission" },
          { status: 403 }
        );
      }
      
      whereClause = {
        OR: [
          { ownerId: requestedOwnerId },
          { sharedWith: { has: requestedOwnerId } }
        ]
      };
    }
    // Default to public photoshoots if no parameters provided
    else {
      whereClause.public = true;
    }
    
    const data = await prisma.photoshoot.findMany({
      where: whereClause,
      orderBy: { id: 'asc' },
    });

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Failed to fetch photoshoots", details: (error as { meta?: unknown })?.meta },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await requireRole(request, ["ADMIN", "USER"])
  if (session instanceof NextResponse) return session

  try {
    const body = await request.json();

    const validationResult = CreatePhotoshootDTOZ.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.issues },
        { status: 422 }
      );
    }

    const createDTO = validationResult.data;
    // Set ownerId to current user
    const newPhotoshoot = await prisma.photoshoot.create({
      data: {
        ...createDTO,
        ownerId: parseInt(session.user.id),
      },
    });

    return NextResponse.json(newPhotoshoot, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Failed to create photoshoot", details: (error as { meta?: unknown })?.meta },
      { status: 400 }
    );
  }
}
