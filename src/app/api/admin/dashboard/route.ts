import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import type { DashboardMetrics, StockMap, ColorVariant } from "@/types";

function getPeriodStart(period: string): Date | null {
  const now = new Date();
  if (period === "today") {
    const d = new Date(now); d.setHours(0, 0, 0, 0); return d;
  }
  if (period === "week") {
    const d = new Date(now); d.setDate(d.getDate() - 7); return d;
  }
  if (period === "month") {
    const d = new Date(now); d.setDate(d.getDate() - 30); return d;
  }
  return null;
}

export async function GET(request: NextRequest) {
  const period = (request.nextUrl.searchParams.get("period") ?? "month") as DashboardMetrics["period"];
  const since  = getPeriodStart(period);

  const salesWhere = since ? { created_at: { gte: since } } : {};
  const sales      = await prisma.sale.findMany({ where: salesWhere, include: { product: { select: { name: true } } } });

  const revenue  = sales.reduce((s, v) => s + Number(v.sale_price) * v.quantity, 0);
  const cogs     = sales.reduce((s, v) => s + Number(v.cost_price) * v.quantity, 0);
  const profit   = revenue - cogs;

  const expensesWhere = since ? { date: { gte: since } } : {};
  const expenses       = await prisma.expense.findMany({ where: expensesWhere });
  const expTotal       = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const netProfit      = profit - expTotal;
  const marginAvg      = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;

  // Top products
  const productSales: Record<string, { name: string; units: number; revenue: number; cost: number }> = {};
  for (const s of sales) {
    if (!productSales[s.product_id]) {
      productSales[s.product_id] = { name: s.product_name, units: 0, revenue: 0, cost: 0 };
    }
    productSales[s.product_id].units   += s.quantity;
    productSales[s.product_id].revenue += Number(s.sale_price) * s.quantity;
    productSales[s.product_id].cost    += Number(s.cost_price) * s.quantity;
  }

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map((p) => ({
      name:         p.name,
      units_sold:   p.units,
      profit_total: p.revenue - p.cost,
      margin:       p.revenue > 0 ? Math.round(((p.revenue - p.cost) / p.revenue) * 100) : 0,
    }));

  // Stock values
  const products = await prisma.product.findMany({ select: { price_sale: true, price_cost: true, stock: true, color_variants: true } });
  let stockCost = 0, stockSale = 0;
  for (const p of products) {
    const variants = p.color_variants as unknown as ColorVariant[];
    if (variants.length > 0) {
      for (const v of variants) {
        const total = Object.values(v.stock).reduce((a, q) => a + q, 0);
        stockCost += total * Number(p.price_cost);
        stockSale += total * Number(p.price_sale);
      }
    } else {
      const total = Object.values(p.stock as StockMap).reduce((a, q) => a + q, 0);
      stockCost += total * Number(p.price_cost);
      stockSale += total * Number(p.price_sale);
    }
  }

  // Low stock
  const allProducts = await prisma.product.findMany({
    select: { name: true, stock: true, color_variants: true, is_published: true },
    where: { is_published: true },
  });
  const LOW_THRESHOLD = 5;
  const lowStock = allProducts
    .map((p) => {
      const variants = p.color_variants as unknown as ColorVariant[];
      const stock = variants.length > 0
        ? variants.reduce((acc, v) => ({ ...acc, ...v.stock }), {} as StockMap)
        : p.stock as StockMap;
      const total = Object.values(stock).reduce((a, q) => a + q, 0);
      return { name: p.name, stock, total_units: total };
    })
    .filter((p) => p.total_units <= LOW_THRESHOLD)
    .sort((a, b) => a.total_units - b.total_units)
    .slice(0, 10);

  // Sales by day (last 14 days)
  const byDay: Record<string, { revenue: number; profit: number }> = {};
  for (const s of sales) {
    const day = s.created_at.toISOString().slice(0, 10);
    if (!byDay[day]) byDay[day] = { revenue: 0, profit: 0 };
    byDay[day].revenue += Number(s.sale_price) * s.quantity;
    byDay[day].profit  += (Number(s.sale_price) - Number(s.cost_price)) * s.quantity;
  }
  const salesByDay = Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, d]) => ({ date, ...d }));

  const metrics: DashboardMetrics = {
    period,
    revenue,
    cogs,
    profit,
    expenses_total:  expTotal,
    net_profit:      netProfit,
    margin_avg:      marginAvg,
    sales_count:     sales.length,
    stock_value_cost: stockCost,
    stock_value_sale: stockSale,
    top_products:    topProducts,
    low_stock:       lowStock,
    sales_by_day:    salesByDay,
  };

  return NextResponse.json(metrics);
}
