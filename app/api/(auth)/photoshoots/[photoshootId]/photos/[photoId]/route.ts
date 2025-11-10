import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UpdatePhotoDTOZ } from "@/lib/dtos";
import { photoToDTO, updatePhotoDTOToPrisma } from "@/lib/mappers";

export async function GET(
  request: NextRequest,
  { params }: { params: { photoshootId: string, photoId: string } }
) {
  try {
    const { photoshootId, photoId } = await params;
    const id = parseInt(photoId);
    const psId = parseInt(photoshootId);

    const errorResponse = await PhotoShootErrorCheck(psId);
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
    
    return NextResponse.json(photoToDTO(photo), { status: 200 });
  } catch (error: any) {
    console.error("Error fetching photo:", error);
    return NextResponse.json(
      { error: "Failed to fetch photo", details: error.meta },
      { status: 400 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { photoshootId: string, photoId: string } }
) {
  try {
    const { photoshootId, photoId } = await params;
    const id = parseInt(photoId);
    const psId = parseInt(photoshootId);

    const errorResponse = await PhotoShootErrorCheck(psId);
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
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update photo", details: error.meta },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { photoshootId: string, photoId: string } }
) {
  try {
    const { photoshootId, photoId } = await params;
    const id = parseInt(photoId);
    const psId = parseInt(photoshootId);

    const errorResponse = await PhotoShootErrorCheck(psId);
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
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to delete photo", details: error.meta },
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