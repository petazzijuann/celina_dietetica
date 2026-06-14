import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";
import { reserveStock } from "@/lib/orders/fulfill";

const orderSchema = z.object({
  customer_name:    z.string().trim().min(1),
  customer_email:   z.string().email(),
  customer_phone:   z.string().trim().min(1),
  customer_address: z.object({
    street:   z.string().trim().min(1),
    city:     z.string().trim().min(1),
    province: z.string().trim().min(1),
    zip:      z.string().trim().min(1),
  }),
  items: z.array(z.object({
    product_id: z.string(),
    slug:       z.string(),
    name:       z.string(),
    size:       z.string(),
    color:      z.string().nullable().optional(),
    qty:        z.number().int().positive(),
    price:      z.number().positive(),
  })).min(1),
  shipping_method:     z.string().optional(),
  shipping_cost:       z.number().min(0).optional(),
  shipping_days_label: z.string().optional(),
  payment_method:      z.enum(["transfer", "efectivo", "otro"]).default("transfer"),
  coupon_code:         z.string().nullable().optional(),
  discount_amount:     z.number().min(0).optional(),
});

export async function POST(request: NextRequest) {
  const body   = await request.json().catch(() => null);
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;

  const subtotal  = d.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping  = d.shipping_cost ?? 0;
  const discount  = d.discount_amount ?? 0;
  const total     = Math.max(0, subtotal + shipping - discount);

  // Update coupon usage
  if (d.coupon_code) {
    await prisma.coupon.updateMany({
      where: { code: d.coupon_code.toUpperCase() },
      data:  { used_count: { increment: 1 } },
    });
  }

  const order = await prisma.order.create({
    data: {
      customer_name:    d.customer_name,
      customer_email:   d.customer_email,
      customer_phone:   d.customer_phone,
      customer_address: d.customer_address,
      items:            d.items as object[],
      total_amount:     total,
      payment_method:   d.payment_method,
      shipping_method:  d.shipping_method ?? null,
      shipping_cost:    shipping,
      shipping_days_label: d.shipping_days_label ?? null,
      coupon_code:      d.coupon_code ?? null,
      discount_amount:  discount,
      status:           "pending_payment",
    },
  });

  await reserveStock(order.id);

  const response: Record<string, unknown> = {
    order_id:       order.id,
    total_amount:   total,
    payment_method: d.payment_method,
    transfer_info: {
      cbu:      process.env.CBU            ?? "",
      alias:    process.env.ALIAS_CBU      ?? "",
      titular:  process.env.TITULAR_CUENTA ?? "",
      amount:   total,
    },
  };

  return NextResponse.json(response, { status: 201 });
}
