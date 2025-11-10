import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreatePhotoDTOZ } from "@/lib/dtos";
import { photoToDTO, createPhotoDTOToPrisma } from "@/lib/mappers";

export async function GET(request: NextRequest, {params}: {params: {photoshootId: string}}) {
  try {
    const { photoshootId } = await params;
    const id = parseInt(photoshootId);
    const psId = parseInt(photoshootId);

    const errorResponse = await ErrorCheck(psId);
    if (errorResponse) {
      return errorResponse;
    }

    const photos = await prisma.photo.findMany({
      where: { photoshootId: id },
      orderBy: { id: 'asc' },
    });
    
    const dtos = photos.map(photoToDTO);
    
    return NextResponse.json(dtos, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch photos", details: error.meta },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest, {params}: {params: {photoshootId: string}}) {
  try {
    const { photoshootId } = await params;
    const id = parseInt(photoshootId);
    const body = await request.json();
    
    const errorResponse = await ErrorCheck(id);
    if (errorResponse) {
      return errorResponse;
    }
    
    const validationResult = CreatePhotoDTOZ.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.issues },
        { status: 422 }
      );
    }

    const createDTO = validationResult.data;
    const newPhoto = await prisma.photo.create({
      data: createPhotoDTOToPrisma(createDTO, photoshootId),
    });
    
    return NextResponse.json(photoToDTO(newPhoto), { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to create a photo", details: error.meta },
      { status: 400 }
    );
  }
}

export async function ErrorCheck(id: number) {
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
}