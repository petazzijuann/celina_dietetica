import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";

const updateSchema = z.object({
  type:         z.enum(["percent", "fixed", "free_shipping"]).optional(),
  value:        z.number().positive().optional().nullable(),
  stock:        z.number().int().positive().optional(),
  min_purchase: z.number().min(0).optional().nullable(),
  expires_at:   z.string().optional().nullable(),
  is_active:    z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id }  = await params;
  const body    = await request.json().catch(() => null);
  const parsed  = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const d = parsed.data;
  try {
    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...(d.type         !== undefined ? { type: d.type }                                 : {}),
        ...(d.value        !== undefined ? { value: d.value }                               : {}),
        ...(d.stock        !== undefined ? { stock: d.stock }                               : {}),
        ...(d.min_purchase !== undefined ? { min_purchase: d.min_purchase }                 : {}),
        ...(d.expires_at   !== undefined ? { expires_at: d.expires_at ? new Date(d.expires_at) : null } : {}),
        ...(d.is_active    !== undefined ? { is_active: d.is_active }                       : {}),
      },
    });
    return NextResponse.json({ id: coupon.id });
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
    await prisma.coupon.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
