import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateCommentDTOZ } from "@/lib/dtos";
import { commentToDTO, createCommentDTOToPrisma } from "@/lib/mappers";

export async function GET(request: NextRequest, 
  {params}: {params: {photoId: string}}) {
  try {
    const { photoId } = await params;
    const phid = parseInt(photoId);

    let errorResponse = await ErrorCheck(phid);
    if (errorResponse) {
      return errorResponse;
    }

    const comments = await prisma.comment.findMany({
      where: { photoId: phid },
      orderBy: { created_at: 'asc' },
    });
    
    const dtos = comments.map(commentToDTO);
    
    return NextResponse.json(dtos, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch comments", details: error.meta },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest, 
  {params}: {params: {photoId: string}}) {
  try {
    const body = await request.json();
    
    const { photoId } = await params;
    const phd = parseInt(photoId);

    let errorResponse = await ErrorCheck(phd);
    if (errorResponse) {
      return errorResponse;
    }

    const validationResult = CreateCommentDTOZ.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.issues },
        { status: 422 }
      );
    }
    
    const createDTO = validationResult.data;
    const newComment = await prisma.comment.create({
      data: createCommentDTOToPrisma(createDTO, photoId),
    });
    
    return NextResponse.json(commentToDTO(newComment), { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to create comment", details: error.meta },
      { status: 400 }
    );
  }
}

export async function ErrorCheck( phid: number) {
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
}