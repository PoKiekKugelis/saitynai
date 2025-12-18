import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateCommentDTOZ } from "@/lib/dtos";
import { commentToDTO, createCommentDTOToPrisma } from "@/lib/mappers";
import { requireRole } from "@/lib/auth";

export async function GET(request: NextRequest,
  { params }: { params: Promise<{ photoshootId: string, photoId: string }> }) {
  const session = await requireRole(request, ["ADMIN", "USER"])
  if (session instanceof NextResponse) return session

  try {
    const { photoshootId, photoId } = await params;
    const phid = parseInt(photoId);
    const phsid = parseInt(photoshootId);

    const errorResponse = await ErrorCheck(phid, phsid, session);
    if (errorResponse) {
      return errorResponse;
    }

    const comments = await prisma.comment.findMany({
      where: { photoId: phid },
      orderBy: { created_at: 'asc' },
    });

    // Fetch usernames for all comments
    const commentsWithUsernames = await Promise.all(
      comments.map(async (comment) => {
        const user = await prisma.user.findUnique({
          where: { id: comment.authorId },
          select: { username: true }
        });
        return {
          ...commentToDTO(comment),
          authorUsername: user?.username || `User #${comment.authorId}`
        };
      })
    );

    return NextResponse.json(commentsWithUsernames, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Failed to fetch comments", details: (error as { meta?: unknown })?.meta },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest,
  { params }: { params: Promise<{ photoshootId: string, photoId: string }> }) {
  const session = await requireRole(request, ["ADMIN", "USER"])
  if (session instanceof NextResponse) return session

  try {
    const body = await request.json();

    const { photoshootId, photoId } = await params;
    const phd = parseInt(photoId);
    const phsid = parseInt(photoshootId);

    const errorResponse = await ErrorCheck(phd, phsid, session);
    if (errorResponse) {
      return errorResponse;
    }

    const validationResult = CreateCommentDTOZ.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Neteisinga įvestis", details: validationResult.error.issues },
        { status: 422 }
      );
    }

    const createDTO = validationResult.data;
    const newComment = await prisma.comment.create({
      data: createCommentDTOToPrisma(createDTO, phd, parseInt(session.user.id)),
    });

    return NextResponse.json(commentToDTO(newComment), { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Failed to create comment", details: (error as { meta?: unknown })?.meta },
      { status: 400 }
    );
  }
}

export async function ErrorCheck(phid: number, phsid: number, session: { user: { id: string; role: string } }) {
  if (isNaN(phsid)) {
    return NextResponse.json(
      { error: "Invalid photoshoot ID" },
      { status: 400 }
    );
  }

  const photoshoot = await prisma.photoshoot.findUnique({
    where: { id: phsid }
  });

  if (!photoshoot) {
    return NextResponse.json(
      { error: "photoshoot not found" },
      { status: 404 }
    );
  }

  // Check permissions: owner, shared user, admin, or public photoshoot
  const userId = parseInt(session.user.id);
  const isOwner = photoshoot.ownerId === userId;
  const isShared = photoshoot.sharedWith.includes(userId);
  const isAdmin = session.user.role === "ADMIN";
  const isPublic = photoshoot.public;

  if (!isOwner && !isShared && !isAdmin && !isPublic) {
    return NextResponse.json(
      { error: "Forbidden - no permissions" },
      { status: 403 }
    );
  }

  if (isNaN(phid)) {
    return NextResponse.json(
      { error: "Invalid photo ID" },
      { status: 400 }
    );
  }

  const photo = await prisma.photo.findUnique({
    where: { id: phid, photoshootId: phsid }
  });

  if (!photo) {
    return NextResponse.json(
      { error: "photo not found" },
      { status: 404 }
    );
  }
}
