import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UpdatePhotoshootDTOZ } from "@/lib/dtos";
import { photoshootToDTO, updatePhotoshootDTOToPrisma } from "@/lib/mappers";
import { requireRole } from "@/lib/auth";

export async function GET(
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

    if (photoshoot?.ownerId?.toString() != session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - no permission" },
        { status: 403 }
      )
    }

    if (!photoshoot) {
      return NextResponse.json(
        { error: "Photoshoot not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(photoshootToDTO(photoshoot), { status: 200 });
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

    const body = await request.json();
    const validationResult = UpdatePhotoshootDTOZ.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.issues },
        { status: 422 }
      );
    }

    const updateDTO = validationResult.data;
    const existing = await prisma.photoshoot.findUnique({
      where: { title: updateDTO.title }
    });
    if (existing && existing.id !== id) {
      return NextResponse.json(
        { error: "Title already exists" },
        { status: 409 }
      );
    }
    const updatedPhotoshoot = await prisma.photoshoot.update({
      where: { id },
      data: updatePhotoshootDTOToPrisma(updateDTO),
    });

    return NextResponse.json(photoshootToDTO(updatedPhotoshoot), { status: 200 });
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
