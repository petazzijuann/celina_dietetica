import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function GET() {
  const orders = await prisma.order.findMany({ orderBy: { created_at: "desc" } });
  return NextResponse.json(
    orders.map((o) => ({
      id:                  o.id,
      customer_name:       o.customer_name,
      customer_email:      o.customer_email,
      customer_phone:      o.customer_phone,
      customer_address:    o.customer_address,
      items:               o.items,
      total_amount:        Number(o.total_amount),
      status:              o.status,
      payment_method:      o.payment_method,
      payment_proof_url:   o.payment_proof_url,
      shipping_method:     o.shipping_method,
      shipping_cost:       o.shipping_cost ? Number(o.shipping_cost) : null,
      shipping_days_label: o.shipping_days_label,
      coupon_code:         o.coupon_code,
      discount_amount:     o.discount_amount ? Number(o.discount_amount) : null,
      created_at:          o.created_at.toISOString(),
      updated_at:          o.updated_at.toISOString(),
    }))
  );
}
