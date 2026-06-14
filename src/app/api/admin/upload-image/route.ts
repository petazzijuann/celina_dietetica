import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  try {
    const result = await cloudinary.uploader.upload(body.file, {
      folder:         "celina/products",
      transformation: [{ width: 1200, crop: "limit", quality: "auto:good" }],
    });
    return NextResponse.json({ url: result.secure_url });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
