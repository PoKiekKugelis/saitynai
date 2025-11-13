import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UpdateCommentDTOZ } from "@/lib/dtos";
import { commentToDTO, updateCommentDTOToPrisma } from "@/lib/mappers";
import { requireRole } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ photoshootId: string, photoId: string, commentId: string }> }
) {
  const session = await requireRole(request, ["ADMIN", "USER"])
  if (session instanceof NextResponse) return session

  try {
    const { photoshootId, photoId, commentId } = await params;
    const phid = parseInt(photoId);
    const id = parseInt(commentId);
    const phsid = parseInt(photoshootId)

    const commentError = await ErrorCheck(phid, id, phsid, session, "GET");
    if (commentError) {
      return commentError;
    }

    const comment = await prisma.comment.findUniqueOrThrow({
      where: { id },
    });

    return NextResponse.json(commentToDTO(comment), { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Failed to fetch comment", details: (error as { meta?: unknown })?.meta },
      { status: 400 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ photoshootId: string, photoId: string, commentId: string }> }
) {
  const session = await requireRole(request, ["ADMIN", "USER"])
  if (session instanceof NextResponse) return session

  try {
    const { photoshootId, photoId, commentId } = await params;
    const phid = parseInt(photoId);
    const id = parseInt(commentId);
    const phsid = parseInt(photoshootId)

    const commentError = await ErrorCheck(phid, id, phsid, session, "PUT");
    if (commentError) {
      return commentError;
    }

    const comment = await prisma.comment.findUnique({
      where: { id },
    })

    if (comment?.authorId.toString() != session.user.id) {
      return NextResponse.json(
        { error: "forbidden - no permissions" },
        { status: 403 }
      )
    }

    const body = await request.json();

    const validationResult = UpdateCommentDTOZ.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.issues },
        { status: 422 }
      );
    }

    const updateDTO = validationResult.data;
    const updatedComment = await prisma.comment.update({
      where: { id },
      data: updateCommentDTOToPrisma(updateDTO)
    });

    return NextResponse.json(commentToDTO(updatedComment), { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Failed to update comment", details: (error as { meta?: unknown })?.meta },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ photoshootId: string, photoId: string, commentId: string }> }
) {
  const session = await requireRole(request, ["ADMIN", "USER"])
  if (session instanceof NextResponse) return session

  try {
    const { photoshootId, photoId, commentId } = await params;
    const phid = parseInt(photoId);
    const id = parseInt(commentId);
    const phsid = parseInt(photoshootId)

    const commentError = await ErrorCheck(phid, id, phsid, session, "DELETE");
    if (commentError) {
      return commentError;
    }

    await prisma.comment.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Comment deleted successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Failed to delete comment", details: (error as { meta?: unknown })?.meta },
      { status: 400 }
    );
  }
}

export async function ErrorCheck(phid: number, cid: number, phsid: number, session: { user: { id: string; role: string } }, _CASE: string) {
  const photoshoot = await prisma.photoshoot.findUnique({
    where: { id: phsid }
  });

  if (photoshoot?.ownerId != parseInt(session.user.id) && session.user.role != "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden - no permissions" },
      { status: 403 }
    )
  }

  if (isNaN(phsid)) {
    return NextResponse.json(
      { error: "Invalid photoshoot ID" },
      { status: 400 }
    );
  }


  if (!photoshoot) {
    return NextResponse.json(
      { error: "photoshoot not found" },
      { status: 404 }
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

  if (isNaN(cid)) {
    return NextResponse.json(
      { error: "Invalid comment ID" },
      { status: 400 }
    );
  }

  const comment = await prisma.comment.findUnique({
    where: { id: cid, photoId: phid },
    // include: {
    //   photo: {
    //     include: {
    //       photoshoot: true
    //     }
    //   }
    // }
  });

  if (!comment) {
    return NextResponse.json(
      { error: "Comment not found" },
      { status: 404 }
    );
  }

  // switch (CASE) {
  //   case "GET":
  //     const canView = session.user.role === "ADMIN" || comment?.authorId === parseInt(session.user.id) || comment?.photo.photoshoot.ownerId === parseInt(session.user.id);
  //
  //     if (!canView) {
  //       return NextResponse.json(
  //         { error: "Forbidden - no permissions" },
  //         { status: 403 }
  //       )
  //     }
  //     break;
  //   case "PUT":
  //     if (comment.authorId != session.user.id) {
  //       return NextResponse.json(
  //         { error: "forbidden - no permissions" },
  //         { status: 403 }
  //       )
  //     }
  //   case "DELETE":
  //     if (comment.authorId != session.user.id && session.user.role != "ADMIN") {
  //       return NextResponse.json(
  //         { error: "Forbidden - no permissions" },
  //         { status: 403 }
  //       )
  //     }
  // }
}
