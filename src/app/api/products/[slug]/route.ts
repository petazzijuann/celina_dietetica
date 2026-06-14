import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const p = await prisma.product.findUnique({ where: { slug, is_published: true } });
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
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
  });
}
