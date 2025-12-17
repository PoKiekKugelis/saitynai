import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreatePhotoshootDTOZ } from "@/lib/dtos";
import { requireRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await requireRole(request, ["ADMIN", "USER"])
  if (session instanceof NextResponse) return session

  try {
    const { searchParams } = new URL(request.url);
    const ownerIdParam = searchParams.get('ownerId');
    if(!ownerIdParam){
      const session = await requireRole(request, ["ADMIN"])
      if (session instanceof NextResponse) return session
    }
    if(ownerIdParam != session.user.id && session.user.role != "ADMIN" && ownerIdParam != String(1)){
       return NextResponse.json(
        { error: "Forbidden - no permission" },
        { status: 403 }
      )
    }
    
    
    const whereClause = ownerIdParam ? { ownerId: parseInt(ownerIdParam) } : {};
    
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
  const session = await requireRole(request, ["ADMIN"])
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
    const newPhotoshoot = await prisma.photoshoot.create({
      data: createDTO,
    });

    return NextResponse.json(newPhotoshoot, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Failed to create photoshoot", details: (error as { meta?: unknown })?.meta },
      { status: 400 }
    );
  }
}
