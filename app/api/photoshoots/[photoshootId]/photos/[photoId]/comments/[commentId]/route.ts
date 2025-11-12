import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UpdateCommentDTOZ } from "@/lib/dtos";
import { commentToDTO, updateCommentDTOToPrisma } from "@/lib/mappers";

export async function GET(
  request: NextRequest,
  { params }: { params: { photoId: string, commentId: string } }
) {
  try {
    const { photoId, commentId } = await params;
    const phid = parseInt(photoId);
    const id = parseInt(commentId);

    let commentError = await ErrorCheck(phid, id);
    if (commentError) {
      return commentError;
    }

    const comment = await prisma.comment.findUniqueOrThrow({
      where: { id },
    });
    
    return NextResponse.json(commentToDTO(comment), { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch comment", details: error.meta },
      { status: 400 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { photoshootId: string, photoId: string, commentId: string } }
) {
  try {
    const { photoId, commentId } = await params;
    const phid = parseInt(photoId);
    const id = parseInt(commentId);

    let commentError = await ErrorCheck(phid, id);
    if (commentError) {
      return commentError;
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
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update comment", details: error.meta },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { photoId: string, commentId: string } }
) {
  try {
    const { photoId, commentId } = await params;
    const phid = parseInt(photoId);
    const id = parseInt(commentId);

    let commentError = await ErrorCheck(phid, id);
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
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to delete comment", details: error.meta },
      { status: 400 }
    );
  }
}

export async function PhotoShootErrorCheck(id: number) {
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
}

export async function PhotoErrorCheck(id: number) {
  if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid photo ID" },
        { status: 400 }
      );
    }

    const photo = await prisma.photo.findUnique({
      where: { id }
    });

    if (!photo) {
      return NextResponse.json(
        { error: "photo not found" },
        { status: 404 }
      );
    }
}

export async function ErrorCheck(phid: number, cid: number) {
    if (isNaN(phid)) {
      return NextResponse.json(
        { error: "Invalid photo ID" },
        { status: 400 }
      );
    }

    const photo = await prisma.photo.findUnique({
      where: { id: phid }
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
      where: { id: cid },
    });
    
    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }
}