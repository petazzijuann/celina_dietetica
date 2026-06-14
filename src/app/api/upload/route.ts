import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "@/lib/prisma/client";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.file || !body?.orderId) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  try {
    const result = await cloudinary.uploader.upload(body.file, {
      folder: "celina/comprobantes",
    });

    await prisma.order.update({
      where: { id: body.orderId },
      data:  { payment_proof_url: result.secure_url },
    });

    return NextResponse.json({ url: result.secure_url });
  } catch {
    return NextResponse.json({ error: "Error al subir archivo" }, { status: 500 });
  }
}
