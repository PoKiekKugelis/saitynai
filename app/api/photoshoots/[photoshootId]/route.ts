import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UpdatePhotoshootDTOZ } from "@/lib/dtos";
import { requireRole } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ photoshootId: string }> }
) {
  try {
    const { photoshootId } = await params;
    const id = parseInt(photoshootId);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid photoshoot ID" },
        { status: 400 }
      );
    }

    const photoshoot = await prisma.photoshoot.findUnique({
      where: { id }
    });

    if (!photoshoot) {
      return NextResponse.json(
        { error: "Photoshoot not found" },
        { status: 404 }
      );
    }
    // Public photoshoots - anyone can view
    if (photoshoot.public) {
      return NextResponse.json(photoshoot, { status: 200 });
    }
    const session = await requireRole(request, ["ADMIN", "USER"])
    if (session instanceof NextResponse) return session


    const userId = parseInt(session.user.id);
    const isOwner = photoshoot.ownerId === userId;
    const isShared = photoshoot.sharedWith.includes(userId);
    const isPublic = photoshoot.public;
    const isAdmin = session.user.role === "ADMIN";

    // Check if user has access
    if (!isOwner && !isShared && !isPublic && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden - no permission" },
        { status: 403 }
      );
    }

    return NextResponse.json(photoshoot, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch photoshoot" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ photoshootId: string }> }
) {
  const session = await requireRole(request, ["ADMIN", "USER"])
  if (session instanceof NextResponse) return session

  try {
    const { photoshootId } = await params;
    const id = parseInt(photoshootId);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid photoshoot ID" },
        { status: 400 }
      );
    }

    const photoshoot = await prisma.photoshoot.findUnique({
      where: { id }
    });
    
    if (!photoshoot) {
      return NextResponse.json(
        { error: "Photoshoot not found" },
        { status: 404 }
      );
    }

    const userId = parseInt(session.user.id);
    const isOwner = photoshoot.ownerId === userId;
    const isShared = photoshoot.sharedWith.includes(userId);
    


    // Cannot edit if only shared (not owner)
    if (!isOwner && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - cannot edit shared photoshoots" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validationResult = UpdatePhotoshootDTOZ.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.issues },
        { status: 422 }
      );
    }

    const updateDTO = validationResult.data;
    if(updateDTO.title){
    const existing = await prisma.photoshoot.findUnique({
      where: { title: updateDTO.title }
    });
    if (existing && existing.id !== id) {
      return NextResponse.json(
        { error: "Title already exists" },
        { status: 409 }
      );
    }
    }
    
    
    
    const updatedPhotoshoot = await prisma.photoshoot.update({
      where: { id: id },
      data: updateDTO,
    });

    return NextResponse.json(updatedPhotoshoot, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Failed to update photoshoot", details: (error as { meta?: unknown })?.meta },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ photoshootId: string }> }
) {
  const session = await requireRole(request, ["ADMIN"])
  if (session instanceof NextResponse) return session

  try {
    const { photoshootId } = await params;
    const id = parseInt(photoshootId);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid photoshoot ID" },
        { status: 400 }
      );
    }

    const photoshoot = await prisma.photoshoot.findUnique({
      where: { id }
    });

    if (!photoshoot) {
      return NextResponse.json(
        { error: "Photoshoot not found" },
        { status: 404 }
      );
    }

    const userId = parseInt(session.user.id);
    const isOwner = photoshoot.ownerId === userId;

    // Cannot delete if not owner
    if (!isOwner && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - only owner can delete" },
        { status: 403 }
      );
    }

    await prisma.photoshoot.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Photoshoot deleted successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Failed to delete photoshoot", details: (error as { meta?: unknown })?.meta },
      { status: 400 }
    );
  }
}
