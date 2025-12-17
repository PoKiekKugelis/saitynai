
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UpdatePhotoshootDTOZ, UpdateUserDTOZ } from "@/lib/dtos";
import { requireRole } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await requireRole(request, ["ADMIN", "USER"])
  if (session instanceof NextResponse) return session

  try {
    const { userId } = await params;
    const id = parseInt(userId);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (user?.id.toString() != session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - no permission" },
        { status: 403 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await requireRole(request, ["USER", "ADMIN"])
  if (session instanceof NextResponse) return session

  try {
    const { userId } = await params;
    const id = parseInt(userId);
    if (parseInt(session.user.id) != id) {
      return Response.json(
        { error: "Forbidden - no permissions" },
        { status: 403 }
      )
    }

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }


    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validationResult = UpdateUserDTOZ.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.issues },
        { status: 422 }
      );
    }

    const updateDTO = validationResult.data;
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: updateDTO,
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Failed to update user", details: (error as { meta?: unknown })?.meta },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await requireRole(request, ["ADMIN"])
  if (session instanceof NextResponse) return session

  try {
    const { userId } = await params;
    const id = parseInt(userId);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Failed to delete user", details: (error as { meta?: unknown })?.meta },
      { status: 400 }
    );
  }
}
