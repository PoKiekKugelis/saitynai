import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreatePhotoshootDTOZ } from "@/lib/dtos";
import { photoshootToDTO, createPhotoshootDTOToPrisma } from "@/lib/mappers";

export async function GET() {
  try {
    const data = await prisma.photoshoot.findMany({
      orderBy: { id: 'asc' },
    });
    const photoshoots = data.map(photoshootToDTO);
    
    return NextResponse.json(photoshoots, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch photoshoots", details: error.meta },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = CreatePhotoshootDTOZ.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.issues },
        { status: 422 }
      );
    }

    const createDTO = validationResult.data;
    const newPhotoshoot = await prisma.photoshoot.create({
      data: createPhotoshootDTOToPrisma(createDTO),
    });

    return NextResponse.json(photoshootToDTO(newPhotoshoot), { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to create photoshoot", details: error.meta },
      { status: 400 }
    );
  }
}
