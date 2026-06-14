import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";

const saleSchema = z.object({
  product_id:     z.string().optional(),
  product_name:   z.string().trim().min(1),
  size:           z.string().trim().min(1),
  color:          z.string().trim().optional().nullable(),
  quantity:       z.number().int().positive(),
  sale_price:     z.number().positive(),
  cost_price:     z.number().min(0).default(0),
  channel:        z.enum(["online", "offline"]).default("offline"),
  payment_method: z.enum(["transfer", "efectivo", "otro"]).default("efectivo"),
  customer_note:  z.string().trim().optional().nullable(),
});

export async function GET() {
  const sales = await prisma.sale.findMany({ orderBy: { created_at: "desc" } });
  return NextResponse.json(
    sales.map((s) => ({
      id:             s.id,
      product_id:     s.product_id,
      product_name:   s.product_name,
      size:           s.size,
      color:          s.color,
      quantity:       s.quantity,
      sale_price:     Number(s.sale_price),
      cost_price:     Number(s.cost_price),
      channel:        s.channel,
      payment_method: s.payment_method,
      order_id:       s.order_id,
      customer_note:  s.customer_note,
      created_at:     s.created_at.toISOString(),
    }))
  );
}

export async function POST(request: NextRequest) {
  const body   = await request.json().catch(() => null);
  const parsed = saleSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const d = parsed.data;

  // Look up product_id if not provided
  let productId = d.product_id;
  if (!productId) {
    const product = await prisma.product.findFirst({ where: { name: { contains: d.product_name, mode: "insensitive" } } });
    productId = product?.id ?? "manual";
  }

  const sale = await prisma.sale.create({
    data: {
      product_id:     productId,
      product_name:   d.product_name,
      size:           d.size,
      color:          d.color ?? null,
      quantity:       d.quantity,
      sale_price:     d.sale_price,
      cost_price:     d.cost_price,
      channel:        d.channel,
      payment_method: d.payment_method,
      customer_note:  d.customer_note ?? null,
    },
  });

  return NextResponse.json({ id: sale.id }, { status: 201 });
}
