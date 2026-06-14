import { prisma } from "@/lib/prisma/client";
import type { OrderItem, StockMap, ColorVariant } from "@/types";

export async function reserveStock(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return;
  const items = order.items as unknown as OrderItem[];
  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.product_id },
      select: { stock: true, color_variants: true },
    });
    if (!product) continue;

    const colorVariants = product.color_variants as unknown as ColorVariant[];
    const isMultiColor = colorVariants.length > 0 && colorVariants[0].name !== "Único";

    if (isMultiColor && item.color) {
      const idx = colorVariants.findIndex(v => v.name === item.color);
      if (idx === -1) continue;
      const currentQty = colorVariants[idx].stock[item.size] ?? 0;
      const updatedVariants = colorVariants.map((v, i) =>
        i === idx
          ? { ...v, stock: { ...v.stock, [item.size]: Math.max(0, currentQty - item.qty) } }
          : v
      );
      const updatedStock = idx === 0
        ? updatedVariants[0].stock
        : (product.stock as StockMap);
      await prisma.product.update({
        where: { id: item.product_id },
        data: { stock: updatedStock, color_variants: updatedVariants as object[] },
      });
    } else {
      const stock = product.stock as StockMap;
      stock[item.size] = Math.max(0, (stock[item.size] ?? 0) - item.qty);
      await prisma.product.update({ where: { id: item.product_id }, data: { stock } });
    }
  }
}

export async function fulfillOrder(orderId: string, paymentMethod: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.status === "payment_confirmed") return;

  const items = order.items as unknown as OrderItem[];

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discount = Number(order.discount_amount ?? 0);
  const factor   = subtotal > 0 ? (subtotal - discount) / subtotal : 1;

  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.product_id },
      select: { price_cost: true },
    });
    if (!product) continue;

    const unitSalePrice = Math.round(item.price * factor * 100) / 100;

    await prisma.sale.create({
      data: {
        product_id:     item.product_id,
        product_name:   item.name,
        size:           item.size,
        color:          item.color ?? null,
        quantity:       item.qty,
        sale_price:     unitSalePrice,
        cost_price:     product.price_cost,
        channel:        "online",
        payment_method: paymentMethod,
        order_id:       orderId,
      },
    });
  }

  await prisma.order.update({ where: { id: orderId }, data: { status: "payment_confirmed" } });
}

export async function releaseStock(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return;
  const items = order.items as unknown as OrderItem[];
  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.product_id },
      select: { stock: true, color_variants: true },
    });
    if (!product) continue;

    const colorVariants = product.color_variants as unknown as ColorVariant[];
    const isMultiColor = colorVariants.length > 0 && colorVariants[0].name !== "Único";

    if (isMultiColor && item.color) {
      const idx = colorVariants.findIndex(v => v.name === item.color);
      if (idx === -1) continue;
      const currentQty = colorVariants[idx].stock[item.size] ?? 0;
      const updatedVariants = colorVariants.map((v, i) =>
        i === idx
          ? { ...v, stock: { ...v.stock, [item.size]: currentQty + item.qty } }
          : v
      );
      const updatedStock = idx === 0
        ? updatedVariants[0].stock
        : (product.stock as StockMap);
      await prisma.product.update({
        where: { id: item.product_id },
        data: { stock: updatedStock, color_variants: updatedVariants as object[] },
      });
    } else {
      const stock = product.stock as StockMap;
      stock[item.size] = (stock[item.size] ?? 0) + item.qty;
      await prisma.product.update({ where: { id: item.product_id }, data: { stock } });
    }
  }
  await prisma.order.update({ where: { id: orderId }, data: { status: "cancelled" } });
}
