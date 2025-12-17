
import { writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { mkdir } from "fs/promises";
export const runtime = "nodejs";
import { requireRole } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const photoId = formData.get("photoId") as string;
    const photoshootId = formData.get("photoshootId") as string;
    
    const session = await requireRole(request, ["ADMIN"])
    if (session instanceof Response) return session

    if (!file || !photoId || !photoshootId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }
    
    const uploadDir = path.join(process.cwd(), `public/uploads/photoshoot-${photoshootId}`);
    await mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.name);
    const filename = `photo-${photoId}${ext}`;
    const filepath = path.join(uploadDir, filename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    return NextResponse.json({
      filename,
      url: `/uploads/photoshoot-${photoshootId}/${filename}`
    }, { status: 200 });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
