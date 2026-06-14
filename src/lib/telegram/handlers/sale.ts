import type { Context } from "telegraf";
import { prisma } from "@/lib/prisma/client";
import { getSession, setSession, clearSession } from "../state";
import { formatARS } from "@/lib/utils";
import type { ColorVariant } from "@/types";

const PAYMENT_KEYBOARD = {
  inline_keyboard: [
    [
      { text: "💵 Efectivo",      callback_data: "pay:efectivo" },
      { text: "🔁 Transferencia", callback_data: "pay:transferencia" },
    ],
    [
      { text: "💳 Débito",  callback_data: "pay:debito" },
      { text: "💳 Crédito", callback_data: "pay:credito" },
    ],
  ],
};

export async function handleVenta(ctx: Context) {
  const chatId = ctx.from!.id.toString();
  await clearSession(chatId);
  await setSession(chatId, { state: "sale_waiting_search" });
  await ctx.reply(
    "🛍 *Nueva venta*\n\nEscribí el nombre del producto:",
    { parse_mode: "Markdown" }
  );
}

export async function handleSaleText(ctx: Context) {
  const chatId  = ctx.from!.id.toString();
  const session = await getSession(chatId);
  const text    = (ctx.message as { text?: string })?.text?.trim() ?? "";

  switch (session.state) {
    case "sale_waiting_search": {
      const products = await prisma.product.findMany({
        where: { name: { contains: text, mode: "insensitive" } },
        take: 6,
        select: { id: true, name: true },
      });

      if (products.length === 0) {
        await ctx.reply("❌ No encontré productos. Intentá de nuevo:");
        return;
      }

      await ctx.reply("Seleccioná el producto:", {
        reply_markup: {
          inline_keyboard: products.map((p) => [
            { text: p.name, callback_data: `product:${p.id}` },
          ]),
        },
      });
      break;
    }

    case "sale_waiting_quantity": {
      const qty = parseInt(text);
      if (isNaN(qty) || qty <= 0) {
        await ctx.reply("❌ Cantidad inválida:");
        return;
      }
      const suggested = session.saleData?.suggested_price ?? 0;
      await setSession(chatId, {
        ...session,
        state: "sale_waiting_price",
        saleData: { ...session.saleData, quantity: qty },
      });
      await ctx.reply(
        `📦 Cantidad: ${qty}\n\n💰 ¿Precio de venta?\nPrecio actual: *${formatARS(suggested)}*\n\nEnviá el monto o *ok* para usar el sugerido.`,
        { parse_mode: "Markdown" }
      );
      break;
    }

    case "sale_waiting_price": {
      let price: number;
      if (text.toLowerCase() === "ok") {
        price = session.saleData?.suggested_price ?? 0;
      } else {
        price = parseFloat(text.replace(/[^\d.]/g, ""));
      }
      if (isNaN(price) || price <= 0) {
        await ctx.reply("❌ Precio inválido. Enviá un número o *ok*.", { parse_mode: "Markdown" });
        return;
      }
      await setSession(chatId, {
        ...session,
        state: "sale_waiting_payment",
        saleData: { ...session.saleData, sale_price: price },
      });
      await ctx.reply("💳 ¿Cómo pagó?", { reply_markup: PAYMENT_KEYBOARD });
      break;
    }

    default:
      break;
  }
}

export async function handleSaleCallback(ctx: Context) {
  const chatId  = ctx.from!.id.toString();
  const session = await getSession(chatId);
  const data    = (ctx as { callbackQuery?: { data?: string } }).callbackQuery?.data ?? "";

  await ctx.answerCbQuery().catch(() => null);

  if (data.startsWith("product:")) {
    const productId = data.replace("product:", "");
    const product   = await prisma.product.findUnique({
      where:  { id: productId },
      select: { id: true, name: true, price_sale: true, price_cost: true, stock: true, color_variants: true },
    });
    if (!product) return;

    const variants     = product.color_variants as unknown as ColorVariant[];
    const hasSabores   = variants.length > 0 && variants[0].name !== "Único";

    const base = {
      product_id:      product.id,
      product_name:    product.name,
      product_cost:    Number(product.price_cost),
      suggested_price: Number(product.price_sale),
    };

    if (hasSabores) {
      const withStock = variants.filter((v) =>
        Object.values(v.stock).some((q) => q > 0)
      );
      if (withStock.length === 0) {
        await ctx.reply("❌ Este producto no tiene stock disponible.");
        await clearSession(chatId);
        return;
      }
      await setSession(chatId, { ...session, state: "sale_waiting_sabor", saleData: base });
      await ctx.reply(
        `Producto: *${product.name}*\n\n🌿 ¿Qué sabor vendiste?`,
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: withStock.map((v) => [
              { text: v.name, callback_data: `sabor:${v.name}` },
            ]),
          },
        }
      );
    } else {
      const stock     = product.stock as Record<string, number>;
      const available = Object.entries(stock).filter(([, q]) => q > 0);
      if (available.length === 0) {
        await ctx.reply("❌ Este producto no tiene stock disponible.");
        await clearSession(chatId);
        return;
      }
      await setSession(chatId, { ...session, state: "sale_waiting_peso", saleData: base });
      await ctx.reply(
        `Producto: *${product.name}*\n\n⚖️ ¿Qué peso/volumen?`,
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              available.map(([sz, q]) => ({
                text: `${sz} (${q})`,
                callback_data: `peso:${sz}`,
              })),
            ],
          },
        }
      );
    }
    return;
  }

  if (data.startsWith("sabor:")) {
    if (session.state !== "sale_waiting_sabor") return;
    const saborName = data.replace("sabor:", "");
    const product   = await prisma.product.findUnique({
      where:  { id: session.saleData!.product_id! },
      select: { color_variants: true },
    });
    if (!product) return;

    const variants = product.color_variants as unknown as ColorVariant[];
    const variant  = variants.find((v) => v.name === saborName);
    if (!variant) return;

    const available = Object.entries(variant.stock).filter(([, q]) => q > 0);
    if (available.length === 0) {
      await ctx.reply(`❌ El sabor *${saborName}* no tiene stock.`, { parse_mode: "Markdown" });
      await clearSession(chatId);
      return;
    }

    await setSession(chatId, {
      ...session,
      state: "sale_waiting_peso",
      saleData: { ...session.saleData, sabor: saborName },
    });
    await ctx.reply(
      `Sabor: *${saborName}*\n\n⚖️ ¿Qué peso/volumen?`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            available.map(([sz, q]) => ({
              text: `${sz} (${q})`,
              callback_data: `peso:${sz}`,
            })),
          ],
        },
      }
    );
    return;
  }

  if (data.startsWith("peso:")) {
    if (session.state !== "sale_waiting_peso") return;
    const peso = data.replace("peso:", "");
    await setSession(chatId, {
      ...session,
      state: "sale_waiting_quantity",
      saleData: { ...session.saleData, peso },
    });
    await ctx.reply(`Peso: *${peso}*\n\n📦 ¿Cuántas unidades?`, { parse_mode: "Markdown" });
    return;
  }

  if (data.startsWith("pay:")) {
    if (session.state !== "sale_waiting_payment") return;
    const payment_method = data.replace("pay:", "");
    const d = { ...session.saleData, payment_method };
    const margin = d.sale_price && d.product_cost
      ? Math.round(((d.sale_price - d.product_cost) / d.sale_price) * 100)
      : 0;

    await setSession(chatId, { state: "sale_confirming", saleData: d });

    const saborLine = d.sabor ? `🌿 Sabor: ${d.sabor}\n` : "";
    await ctx.reply(
      `*Vista previa de venta:*\n\n` +
      `📌 ${d.product_name}\n` +
      saborLine +
      `⚖️ Peso: ${d.peso} × ${d.quantity} u.\n` +
      `💰 Precio: ${formatARS(d.sale_price!)}\n` +
      `💵 Total: ${formatARS(d.sale_price! * d.quantity!)}\n` +
      `📊 Margen: ${margin}%\n` +
      `💳 Pago: ${payment_method}`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[
            { text: "✅ Confirmar", callback_data: "sale:confirm" },
            { text: "❌ Cancelar",  callback_data: "sale:cancel" },
          ]],
        },
      }
    );
    return;
  }

  if (data === "sale:confirm") {
    if (session.state !== "sale_confirming") return;
    const d = session.saleData!;

    const product = await prisma.product.findUnique({
      where:  { id: d.product_id! },
      select: { price_cost: true, stock: true, color_variants: true },
    });
    if (!product) return;

    const variants   = product.color_variants as unknown as ColorVariant[];
    const hasSabores = variants.length > 0 && variants[0].name !== "Único";

    let updatedStock: Record<string, number>;
    let updatedVariants: ColorVariant[];

    if (hasSabores && d.sabor) {
      const idx = variants.findIndex((v) => v.name === d.sabor);
      if (idx === -1) {
        await ctx.reply("❌ Error: sabor no encontrado.");
        await clearSession(chatId);
        return;
      }
      const variant    = variants[idx];
      const currentQty = variant.stock[d.peso!] ?? 0;
      if (currentQty < d.quantity!) {
        await ctx.reply(`❌ Stock insuficiente. Quedan ${currentQty} u. de *${d.sabor}* ${d.peso}.`, { parse_mode: "Markdown" });
        await clearSession(chatId);
        return;
      }
      updatedVariants = variants.map((v, i) =>
        i === idx
          ? { ...v, stock: { ...v.stock, [d.peso!]: currentQty - d.quantity! } }
          : v
      );
      updatedStock = idx === 0 ? updatedVariants[0].stock : (product.stock as Record<string, number>);
    } else {
      const stock      = product.stock as Record<string, number>;
      const currentQty = stock[d.peso!] ?? 0;
      if (currentQty < d.quantity!) {
        await ctx.reply(`❌ Stock insuficiente. Quedan ${currentQty} u. de ${d.peso}.`);
        await clearSession(chatId);
        return;
      }
      updatedStock    = { ...stock, [d.peso!]: currentQty - d.quantity! };
      updatedVariants = variants.map((v) =>
        v.name === "Único" ? { ...v, stock: updatedStock } : v
      );
    }

    await prisma.$transaction([
      prisma.sale.create({
        data: {
          product_id:     d.product_id!,
          product_name:   d.product_name!,
          size:           d.peso!,
          color:          d.sabor ?? null,
          quantity:       d.quantity!,
          sale_price:     d.sale_price!,
          cost_price:     Number(product.price_cost),
          channel:        "offline",
          payment_method: d.payment_method!,
        },
      }),
      prisma.product.update({
        where: { id: d.product_id! },
        data:  { stock: updatedStock, color_variants: updatedVariants as object[] },
      }),
    ]);

    await clearSession(chatId);
    const saborLine = d.sabor ? ` (${d.sabor})` : "";
    await ctx.reply(
      `✅ *Venta registrada*\n\n${d.product_name}${saborLine} — ${d.peso} × ${d.quantity}\nTotal: *${formatARS(d.sale_price! * d.quantity!)}*\nPago: ${d.payment_method}`,
      { parse_mode: "Markdown" }
    );
    return;
  }

  if (data === "sale:cancel") {
    await clearSession(chatId);
    await ctx.reply("❌ Venta cancelada.");
  }
}
