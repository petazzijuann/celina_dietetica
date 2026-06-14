import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ products: [] });

  const products = await prisma.product.findMany({
    where: {
      is_published: true,
      OR: [
        { name:        { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { category:    { contains: q, mode: "insensitive" } },
        { tags:        { has: q } },
      ],
    },
    take: 8,
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json({
    products: products.map((p) => ({
      id:        p.id,
      name:      p.name,
      slug:      p.slug,
      category:  p.category,
      images:    p.images,
      price_sale: Number(p.price_sale),
    })),
  });
}
