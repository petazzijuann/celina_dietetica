import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to   = searchParams.get("to");

  const where: Record<string, unknown> = {};
  if (from || to) {
    where.created_at = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to   ? { lte: new Date(to + "T23:59:59Z") } : {}),
    };
  }

  const sales    = await prisma.sale.findMany({ where });
  const expenses = await prisma.expense.findMany({
    where: from || to ? { date: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) } } : {},
  });

  const revenue       = sales.reduce((s, v) => s + Number(v.sale_price) * v.quantity, 0);
  const cogs          = sales.reduce((s, v) => s + Number(v.cost_price) * v.quantity, 0);
  const profit        = revenue - cogs;
  const expensesTotal = expenses.reduce((s, e) => s + Number(e.amount), 0);

  // By category
  const byCategory: Record<string, { revenue: number; units: number }> = {};
  for (const s of sales) {
    const cat = s.size ?? "otros";
    if (!byCategory[cat]) byCategory[cat] = { revenue: 0, units: 0 };
    byCategory[cat].revenue += Number(s.sale_price) * s.quantity;
    byCategory[cat].units   += s.quantity;
  }

  // By payment method
  const byPayment: Record<string, number> = {};
  for (const s of sales) {
    byPayment[s.payment_method] = (byPayment[s.payment_method] ?? 0) + Number(s.sale_price) * s.quantity;
  }

  return NextResponse.json({
    summary: {
      revenue,
      cogs,
      profit,
      expenses_total: expensesTotal,
      net_profit:     profit - expensesTotal,
      margin:         revenue > 0 ? Math.round((profit / revenue) * 100) : 0,
      sales_count:    sales.length,
    },
    by_category: Object.entries(byCategory).map(([name, d]) => ({ name, ...d })),
    by_payment:  Object.entries(byPayment).map(([method, revenue]) => ({ method, revenue })),
  });
}
