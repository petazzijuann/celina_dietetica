import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";

const couponSchema = z.object({
  code:         z.string().trim().min(1).max(50).toUpperCase(),
  type:         z.enum(["percent", "fixed", "free_shipping"]),
  value:        z.number().positive().optional().nullable(),
  stock:        z.number().int().positive().default(1),
  min_purchase: z.number().min(0).optional().nullable(),
  expires_at:   z.string().datetime().optional().nullable(),
  is_active:    z.boolean().default(true),
});

export async function GET() {
  const coupons = await prisma.coupon.findMany({ orderBy: { created_at: "desc" } });
  return NextResponse.json(
    coupons.map((c) => ({
      id:           c.id,
      code:         c.code,
      type:         c.type,
      value:        c.value ? Number(c.value) : null,
      stock:        c.stock,
      used_count:   c.used_count,
      min_purchase: c.min_purchase ? Number(c.min_purchase) : null,
      is_active:    c.is_active,
      expires_at:   c.expires_at?.toISOString() ?? null,
      created_at:   c.created_at.toISOString(),
      updated_at:   c.updated_at.toISOString(),
    }))
  );
}

export async function POST(request: NextRequest) {
  const body   = await request.json().catch(() => null);
  const parsed = couponSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const d = parsed.data;
  try {
    const coupon = await prisma.coupon.create({
      data: {
        code:         d.code,
        type:         d.type,
        value:        d.value ?? null,
        stock:        d.stock,
        min_purchase: d.min_purchase ?? null,
        expires_at:   d.expires_at ? new Date(d.expires_at) : null,
        is_active:    d.is_active,
      },
    });
    return NextResponse.json({ id: coupon.id, code: coupon.code }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "El código ya existe" }, { status: 409 });
  }
}
