
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreatePhotoshootDTOZ, CreateUserDTOZ } from "@/lib/dtos";
import { requireRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await requireRole(request, ["ADMIN", "USER"])
  if (session instanceof NextResponse) return session

  try {
    const data = await prisma.user.findMany({
      orderBy: { id: 'asc' },
    });

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Failed to fetch users", details: (error as { meta?: unknown })?.meta },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = CreateUserDTOZ.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Neteisinga įvestis", details: validationResult.error.issues },
        { status: 422 }
      );
    }

    const createDTO = validationResult.data;
    const newUser = await prisma.user.create({
      data: createDTO,
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Failed to create user", details: (error as { meta?: unknown })?.meta },
      { status: 400 }
    );
  }
}
