import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";

const schema = z.object({
  code:     z.string().trim().min(1),
  subtotal: z.number().min(0),
});

export async function POST(request: NextRequest) {
  const body   = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const { code, subtotal } = parsed.data;

  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
  if (!coupon) return NextResponse.json({ error: "Cupón no encontrado" }, { status: 404 });
  if (!coupon.is_active) return NextResponse.json({ error: "Cupón inactivo" }, { status: 400 });
  if (coupon.used_count >= coupon.stock) return NextResponse.json({ error: "Cupón agotado" }, { status: 400 });
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return NextResponse.json({ error: "Cupón expirado" }, { status: 400 });
  }
  if (coupon.min_purchase && subtotal < Number(coupon.min_purchase)) {
    return NextResponse.json({
      error: `Compra mínima: $${Number(coupon.min_purchase).toLocaleString("es-AR")}`,
    }, { status: 400 });
  }

  let discountAmount = 0;
  if (coupon.type === "percent" && coupon.value) {
    discountAmount = Math.round(subtotal * Number(coupon.value) / 100);
  } else if (coupon.type === "fixed" && coupon.value) {
    discountAmount = Math.min(subtotal, Number(coupon.value));
  } else if (coupon.type === "free_shipping") {
    discountAmount = 0;
  }

  return NextResponse.json({
    code:            coupon.code,
    type:            coupon.type,
    value:           coupon.value ? Number(coupon.value) : null,
    discount_amount: discountAmount,
  });
}
