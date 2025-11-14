import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UpdatePhotoDTOZ } from "@/lib/dtos";
import { photoToDTO, updatePhotoDTOToPrisma } from "@/lib/mappers";
import { requireRole } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ photoshootId: string, photoId: string }> }
) {
  const session = await requireRole(request, ["ADMIN", "USER"])
  if (session instanceof NextResponse) return session

  try {
    const { photoshootId, photoId } = await params;
    const id = parseInt(photoId);
    const psId = parseInt(photoshootId);

    const errorResponse = await PhotoShootErrorCheck(psId, session);
    if (errorResponse) {
      return errorResponse;
    }

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid photo ID" },
        { status: 400 }
      );
    }

    const photo = await prisma.photo.findUnique({
      where: { id: id, photoshootId: psId },
    });

    if (!photo) {
      return NextResponse.json(
        { error: "Photo not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(photoToDTO(photo), { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching photo:", error);
    return NextResponse.json(
      { error: "Failed to fetch photo", details: (error as { meta?: unknown })?.meta },
      { status: 400 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ photoshootId: string, photoId: string }> }
) {
  const session = await requireRole(request, ["ADMIN"])
  if (session instanceof NextResponse) return session

  try {
    const { photoshootId, photoId } = await params;
    const id = parseInt(photoId);
    const psId = parseInt(photoshootId);

    const errorResponse = await PhotoShootErrorCheck(psId, session);
    if (errorResponse) {
      return errorResponse;
    }

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid photo ID" },
        { status: 400 }
      );
    }

    const photo = await prisma.photo.findUnique({
      where: { id },
    });

    if (!photo) {
      return NextResponse.json(
        { error: "Photo not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validationResult = UpdatePhotoDTOZ.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.issues },
        { status: 422 }
      );
    }

    const updateDTO = validationResult.data;
    const updatedPhoto = await prisma.photo.update({
      where: { id },
      data: updatePhotoDTOToPrisma(updateDTO),
    });

    return NextResponse.json(photoToDTO(updatedPhoto), { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Failed to update photo", details: (error as { meta?: unknown })?.meta },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ photoshootId: string, photoId: string }> }
) {
  const session = await requireRole(request, ["ADMIN"])
  if (session instanceof NextResponse) return session

  try {
    const { photoshootId, photoId } = await params;
    const id = parseInt(photoId);
    const psId = parseInt(photoshootId);

    const errorResponse = await PhotoShootErrorCheck(psId, session);
    if (errorResponse) {
      return errorResponse;
    }

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid photo ID" },
        { status: 400 }
      );
    }

    const photo = await prisma.photo.findUnique({
      where: { id },
    });

    if (!photo) {
      return NextResponse.json(
        { error: "Photo not found" },
        { status: 404 }
      );
    }

    await prisma.photo.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: "Photo deleted successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Failed to delete photo", details: (error as { meta?: unknown })?.meta },
      { status: 400 }
    );
  }
}

async function PhotoShootErrorCheck(id: number, session: { user: { id: string; role: string } }) {
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
      { error: "photoshoot not found" },
      { status: 404 }
    );
  }

  if (photoshoot.ownerId != parseInt(session.user.id) && session.user.role != "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden - no permissions" },
      { status: 403 }
    )
  }
}
