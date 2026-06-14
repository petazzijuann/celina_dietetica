import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";

const CATEGORIES = ["jugos","semillas","cereales","mermeladas","galletitas","barrita-de-cereales","mix","harina","pastelería","alfajores","aceites","frutas-desecadas","granola","snacks-salados","especias"] as const;

const updateSchema = z.object({
  name:           z.string().trim().min(1).max(200).optional(),
  description:    z.string().trim().max(2000).optional(),
  category:       z.enum(CATEGORIES).optional(),
  images:         z.array(z.string()).optional(),
  tags:           z.array(z.string()).optional(),
  price_sale:     z.number().positive().optional(),
  price_cost:     z.number().min(0).optional(),
  stock:          z.record(z.string(), z.number().int().min(0)).optional(),
  color_variants: z.array(z.any()).optional(),
  weight_kg:      z.number().positive().optional().nullable(),
  length_cm:      z.number().positive().optional().nullable(),
  width_cm:       z.number().positive().optional().nullable(),
  height_cm:      z.number().positive().optional().nullable(),
  is_published:   z.boolean().optional(),
  instagram_posted: z.boolean().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const p = await prisma.product.findUnique({ where: { id } });
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    id: p.id, name: p.name, slug: p.slug, description: p.description, category: p.category,
    images: p.images, tags: p.tags, price_sale: Number(p.price_sale), price_cost: Number(p.price_cost),
    stock: p.stock, color_variants: p.color_variants, weight_kg: p.weight_kg, length_cm: p.length_cm,
    width_cm: p.width_cm, height_cm: p.height_cm, is_published: p.is_published,
    instagram_posted: p.instagram_posted, created_at: p.created_at.toISOString(), updated_at: p.updated_at.toISOString(),
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id }  = await params;
  const body    = await request.json().catch(() => null);
  const parsed  = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const d = parsed.data;
  const updateData: Record<string, unknown> = { ...d };
  if (d.color_variants) updateData.color_variants = d.color_variants as object[];

  try {
    const p = await prisma.product.update({ where: { id }, data: updateData });
    return NextResponse.json({ id: p.id, slug: p.slug, updated_at: p.updated_at.toISOString() });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.product.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
