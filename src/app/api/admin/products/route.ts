import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";
import slugify from "slugify";

const CATEGORIES = ["jugos","semillas","cereales","mermeladas","galletitas","barrita-de-cereales","mix","harina","pastelería","alfajores","aceites","frutas-desecadas","granola","snacks-salados","especias"] as const;

const productSchema = z.object({
  name:          z.string().trim().min(1).max(200),
  description:   z.string().trim().max(2000).optional().default(""),
  category:      z.enum(CATEGORIES),
  images:        z.array(z.string().url()).default([]),
  tags:          z.array(z.string()).default([]),
  price_sale:    z.number().positive(),
  price_cost:    z.number().min(0).default(0),
  stock:         z.record(z.string(), z.number().int().min(0)).default({}),
  color_variants: z.array(z.any()).default([]),
  weight_kg:     z.number().positive().optional().nullable(),
  length_cm:     z.number().positive().optional().nullable(),
  width_cm:      z.number().positive().optional().nullable(),
  height_cm:     z.number().positive().optional().nullable(),
  is_published:  z.boolean().default(false),
  instagram_posted: z.boolean().default(false),
});

export async function GET() {
  const products = await prisma.product.findMany({ orderBy: { created_at: "desc" } });
  return NextResponse.json(
    products.map((p) => ({
      id:               p.id,
      name:             p.name,
      slug:             p.slug,
      description:      p.description,
      category:         p.category,
      images:           p.images,
      tags:             p.tags,
      price_sale:       Number(p.price_sale),
      price_cost:       Number(p.price_cost),
      stock:            p.stock,
      color_variants:   p.color_variants,
      weight_kg:        p.weight_kg,
      length_cm:        p.length_cm,
      width_cm:         p.width_cm,
      height_cm:        p.height_cm,
      is_published:     p.is_published,
      instagram_posted: p.instagram_posted,
      created_at:       p.created_at.toISOString(),
      updated_at:       p.updated_at.toISOString(),
    }))
  );
}

export async function POST(request: NextRequest) {
  const body   = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const d = parsed.data;
  const baseSlug = slugify(d.name, { lower: true, strict: true });
  let slug = baseSlug;
  let i = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${i++}`;
  }

  const p = await prisma.product.create({
    data: { ...d, slug, stock: d.stock, color_variants: d.color_variants as object[] },
  });

  return NextResponse.json({ id: p.id, slug: p.slug }, { status: 201 });
}
