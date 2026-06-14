import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const limit    = parseInt(searchParams.get("limit") ?? "50");

  const products = await prisma.product.findMany({
    where: {
      is_published: true,
      ...(category ? { category } : {}),
    },
    orderBy: { created_at: "desc" },
    take: limit,
  });

  return NextResponse.json(
    products.map((p) => ({
      id:             p.id,
      name:           p.name,
      slug:           p.slug,
      description:    p.description,
      category:       p.category,
      images:         p.images,
      tags:           p.tags,
      price_sale:     Number(p.price_sale),
      stock:          p.stock,
      color_variants: p.color_variants,
      is_published:   p.is_published,
      created_at:     p.created_at.toISOString(),
      updated_at:     p.updated_at.toISOString(),
    }))
  );
}
