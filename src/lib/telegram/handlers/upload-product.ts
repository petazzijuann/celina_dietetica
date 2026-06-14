import type { Context } from "telegraf";
import slugify from "slugify";
import { prisma } from "@/lib/prisma/client";
import { uploadToCloudinary } from "@/lib/cloudinary/upload";
import { getSession, setSession, clearSession } from "../state";
import { formatARS } from "@/lib/utils";
import type { ColorVariant } from "@/types";

const CATEGORIES = [
  "jugos", "semillas", "cereales", "mermeladas", "galletitas",
  "barrita-de-cereales", "mix", "harina", "pastelería",
  "alfajores", "aceites", "frutas-desecadas", "granola",
  "snacks-salados", "especias",
];

const CATEGORY_KEYBOARD = {
  inline_keyboard: [
    [
      { text: "🥤 Jugos",       callback_data: "cat:jugos" },
      { text: "🌱 Semillas",    callback_data: "cat:semillas" },
    ],
    [
      { text: "🌾 Cereales",    callback_data: "cat:cereales" },
      { text: "🍓 Mermeladas",  callback_data: "cat:mermeladas" },
    ],
    [
      { text: "🍪 Galletitas",  callback_data: "cat:galletitas" },
      { text: "🌿 Especias",    callback_data: "cat:especias" },
    ],
    [
      { text: "🥜 Granola",     callback_data: "cat:granola" },
      { text: "🍫 Alfajores",   callback_data: "cat:alfajores" },
    ],
    [
      { text: "🫙 Aceites",     callback_data: "cat:aceites" },
      { text: "🍇 Frutas sec.", callback_data: "cat:frutas-desecadas" },
    ],
    [
      { text: "🥐 Pastelería",  callback_data: "cat:pastelería" },
      { text: "🧂 Snacks sal.", callback_data: "cat:snacks-salados" },
    ],
    [
      { text: "🥣 Barrita",     callback_data: "cat:barrita-de-cereales" },
      { text: "🫙 Harina",      callback_data: "cat:harina" },
    ],
    [{ text: "🎁 Mix",          callback_data: "cat:mix" }],
  ],
};

const SABOR_DECISION_KEYBOARD = {
  inline_keyboard: [[
    { text: "1️⃣ Un solo sabor",    callback_data: "sabor_decision:single" },
    { text: "🎨 Varios sabores",   callback_data: "sabor_decision:multi" },
  ]],
};

const SABOR_MORE_KEYBOARD = {
  inline_keyboard: [[
    { text: "✅ Sí, otro sabor", callback_data: "sabor_more:yes" },
    { text: "🏁 No, listo",      callback_data: "sabor_more:no" },
  ]],
};

function parseStock(text: string): Record<string, number> | null {
  const stock: Record<string, number> = {};
  const pairs = text.match(/([0-9]+(?:g|kg|ml|L|l))\s*[:\s]\s*(\d+)/gi);
  if (!pairs || pairs.length === 0) return null;
  for (const pair of pairs) {
    const parts = pair.split(/[:\s]+/).filter(Boolean);
    if (parts.length === 2) {
      const qty = parseInt(parts[1]);
      if (!isNaN(qty) && qty >= 0) stock[parts[0]] = qty;
    }
  }
  return Object.keys(stock).length > 0 ? stock : null;
}

function stockSummary(stock: Record<string, number>): string {
  return Object.entries(stock).map(([s, q]) => `${s}: ${q}`).join(" | ");
}

// ── Comando /nuevo ────────────────────────────────────────────
export async function handleNuevo(ctx: Context) {
  const chatId = ctx.from!.id.toString();
  await clearSession(chatId);
  await setSession(chatId, { state: "upload_waiting_photo" });
  await ctx.reply(
    "📸 *Nuevo producto*\n\nEnviá la primera foto del producto.",
    { parse_mode: "Markdown" }
  );
}

// ── Foto recibida ─────────────────────────────────────────────
export async function handlePhoto(ctx: Context) {
  const chatId  = ctx.from!.id.toString();
  const session = await getSession(chatId);
  const msg     = ctx.message as { photo?: Array<{ file_id: string }> };
  if (!msg?.photo?.length) return;

  const fileId = msg.photo[msg.photo.length - 1].file_id;

  if (session.state === "upload_waiting_photo") {
    const waiting = await ctx.reply("⏳ Subiendo imagen...");
    try {
      const fileLink = await ctx.telegram.getFileLink(fileId);
      const url      = await uploadToCloudinary(fileLink.toString());
      await setSession(chatId, {
        state: "upload_waiting_photos",
        uploadData: { photo_urls: [url] },
      });
      await ctx.telegram.deleteMessage(ctx.chat!.id, waiting.message_id);
      await ctx.reply("📷 Foto 1 recibida. Enviá más o escribí *LISTO*.", { parse_mode: "Markdown" });
    } catch {
      await ctx.telegram.deleteMessage(ctx.chat!.id, waiting.message_id);
      await ctx.reply("❌ Error subiendo la foto. Intentá de nuevo.");
    }
    return;
  }

  if (session.state === "upload_waiting_photos") {
    const waiting = await ctx.reply("⏳ Subiendo foto...");
    try {
      const fileLink = await ctx.telegram.getFileLink(fileId);
      const url      = await uploadToCloudinary(fileLink.toString());
      const updated  = [...(session.uploadData?.photo_urls ?? []), url];
      await setSession(chatId, { ...session, uploadData: { ...session.uploadData, photo_urls: updated } });
      await ctx.telegram.deleteMessage(ctx.chat!.id, waiting.message_id);
      await ctx.reply(`📷 Foto ${updated.length} recibida. Enviá más o escribí *LISTO*.`, { parse_mode: "Markdown" });
    } catch {
      await ctx.telegram.deleteMessage(ctx.chat!.id, waiting.message_id);
      await ctx.reply("❌ Error subiendo la foto. Intentá de nuevo.");
    }
    return;
  }

  if (session.state === "upload_waiting_sabor_photos") {
    const waiting = await ctx.reply("⏳ Subiendo foto...");
    try {
      const fileLink = await ctx.telegram.getFileLink(fileId);
      const url      = await uploadToCloudinary(fileLink.toString());
      const updated  = [...(session.uploadData?.current_photos ?? []), url];
      await setSession(chatId, { ...session, uploadData: { ...session.uploadData, current_photos: updated } });
      await ctx.telegram.deleteMessage(ctx.chat!.id, waiting.message_id);
      await ctx.reply(`📷 Foto ${updated.length} recibida. Seguí enviando o escribí *LISTO*.`, { parse_mode: "Markdown" });
    } catch {
      await ctx.reply("❌ Error subiendo la foto. Intentá de nuevo.");
    }
  }
}

// ── Texto: ruteado por estado ─────────────────────────────────
export async function handleText(ctx: Context) {
  const chatId  = ctx.from!.id.toString();
  const session = await getSession(chatId);
  const text    = (ctx.message as { text?: string })?.text?.trim() ?? "";

  switch (session.state) {
    case "upload_waiting_photos": {
      if (text.toUpperCase() !== "LISTO") return;
      const photos = session.uploadData?.photo_urls ?? [];
      if (photos.length === 0) {
        await ctx.reply("❌ Subí al menos una foto antes de escribir LISTO.");
        return;
      }
      await setSession(chatId, { ...session, state: "upload_waiting_name" });
      await ctx.reply(`✅ ${photos.length} foto(s) guardadas.\n\n¿Cómo se llama el producto?`);
      break;
    }

    case "upload_waiting_name": {
      await setSession(chatId, {
        ...session,
        state: "upload_waiting_category",
        uploadData: { ...session.uploadData, name: text },
      });
      await ctx.reply("¿Categoría?", { reply_markup: CATEGORY_KEYBOARD });
      break;
    }

    case "upload_waiting_sabor_name": {
      const isFirst = (session.uploadData?.color_variants ?? []).length === 0;
      const initial = session.uploadData?.photo_urls ?? [];
      await setSession(chatId, {
        ...session,
        state: "upload_waiting_sabor_photos",
        uploadData: {
          ...session.uploadData,
          current_sabor:  text,
          current_photos: isFirst && initial.length > 0 ? initial : [],
        },
      });
      const msg = isFirst && initial.length > 0
        ? `Ya tengo ${initial.length} foto(s). Enviá más o escribí *LISTO*.`
        : `Enviá las fotos para el sabor *${text}*. Cuando termines escribí *LISTO*.`;
      await ctx.reply(msg, { parse_mode: "Markdown" });
      break;
    }

    case "upload_waiting_sabor_photos": {
      if (text.toUpperCase() !== "LISTO") return;
      const photos = session.uploadData?.current_photos ?? [];
      if (photos.length === 0) {
        await ctx.reply("❌ Subí al menos una foto antes de escribir LISTO.");
        return;
      }
      await setSession(chatId, { ...session, state: "upload_waiting_sabor_stock" });
      await ctx.reply(
        `✅ Fotos de *${session.uploadData?.current_sabor}* guardadas.\n\n📦 Stock por peso/volumen:\n\`500g:10 1kg:5 250g:8\``,
        { parse_mode: "Markdown" }
      );
      break;
    }

    case "upload_waiting_sabor_stock": {
      const stock = parseStock(text);
      if (!stock) {
        await ctx.reply("❌ Formato incorrecto. Usá:\n`500g:10 1kg:5 250g:8`", { parse_mode: "Markdown" });
        return;
      }
      const newVariant: ColorVariant = {
        name:   session.uploadData!.current_sabor!,
        images: session.uploadData!.current_photos!,
        stock,
      };
      const variants = [...(session.uploadData?.color_variants ?? []), newVariant];
      await setSession(chatId, {
        ...session,
        state: "upload_sabor_asking_more",
        uploadData: {
          ...session.uploadData,
          color_variants: variants,
          current_sabor:  undefined,
          current_photos: undefined,
        },
      });
      await ctx.reply(
        `Stock: ${stockSummary(stock)}\n\n¿Agregar otro sabor?`,
        { reply_markup: SABOR_MORE_KEYBOARD }
      );
      break;
    }

    case "upload_waiting_stock": {
      const stock = parseStock(text);
      if (!stock) {
        await ctx.reply("❌ Formato incorrecto. Usá:\n`500g:10 1kg:5 250g:8`\no\n`500ml:8 1L:4`", { parse_mode: "Markdown" });
        return;
      }
      await setSession(chatId, {
        ...session,
        state: "upload_waiting_price_sale",
        uploadData: { ...session.uploadData, stock },
      });
      await ctx.reply(`Stock: ${stockSummary(stock)}\n\n💰 ¿Precio de venta? (ej: 2500)`);
      break;
    }

    case "upload_waiting_price_sale": {
      const price = parseFloat(text.replace(/[^\d.]/g, ""));
      if (isNaN(price) || price <= 0) { await ctx.reply("❌ Precio inválido."); return; }
      await setSession(chatId, {
        ...session,
        state: "upload_waiting_price_cost",
        uploadData: { ...session.uploadData, price_sale: price },
      });
      await ctx.reply("🔒 ¿Precio de costo? (solo lo ves vos)");
      break;
    }

    case "upload_waiting_price_cost": {
      const cost = parseFloat(text.replace(/[^\d.]/g, ""));
      if (isNaN(cost) || cost <= 0) { await ctx.reply("❌ Precio inválido."); return; }
      await setSession(chatId, {
        ...session,
        state: "upload_waiting_description",
        uploadData: { ...session.uploadData, price_cost: cost },
      });
      await ctx.reply("📝 ¿Descripción del producto?");
      break;
    }

    case "upload_waiting_description": {
      if (text.length < 5) { await ctx.reply("❌ Descripción muy corta."); return; }
      const d = { ...session.uploadData, description: text };
      await setSession(chatId, { state: "upload_confirming", uploadData: d });

      const hasSabores = (d.color_variants?.length ?? 0) > 0;
      const margin     = Math.round(((d.price_sale! - d.price_cost!) / d.price_sale!) * 100);

      const preview = hasSabores
        ? `*Vista previa:*\n\n📌 *${d.name}*\n🏷 Categoría: ${d.category}\n🌿 Sabores:\n` +
          d.color_variants!.map(v => `  · ${v.name} — ${stockSummary(v.stock)}`).join("\n") +
          `\n💰 Venta: ${formatARS(d.price_sale!)}\n🔒 Costo: ${formatARS(d.price_cost!)} _(margen ${margin}%)_\n\n📝 _${d.description}_`
        : `*Vista previa:*\n\n📌 *${d.name}*\n🏷 Categoría: ${d.category}\n📦 Stock: ${stockSummary(d.stock ?? {})}\n💰 Venta: ${formatARS(d.price_sale!)}\n🔒 Costo: ${formatARS(d.price_cost!)} _(margen ${margin}%)_\n\n📝 _${d.description}_`;

      await ctx.reply(preview, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[
            { text: "✅ Confirmar", callback_data: "upload:confirm" },
            { text: "❌ Cancelar",  callback_data: "upload:cancel" },
          ]],
        },
      });
      break;
    }

    default:
      break;
  }
}

// ── Callbacks ─────────────────────────────────────────────────
export async function handleCallback(ctx: Context) {
  const chatId  = ctx.from!.id.toString();
  const session = await getSession(chatId);
  const data    = (ctx as { callbackQuery?: { data?: string } }).callbackQuery?.data ?? "";

  await ctx.answerCbQuery().catch(() => null);

  if (data.startsWith("cat:")) {
    if (session.state !== "upload_waiting_category") return;
    const category = data.replace("cat:", "");
    if (!CATEGORIES.includes(category)) return;
    await setSession(chatId, {
      ...session,
      state: "upload_waiting_sabor_decision",
      uploadData: { ...session.uploadData, category },
    });
    await ctx.reply(
      `Categoría: *${category}*\n\n¿El producto tiene variantes de sabor?`,
      { parse_mode: "Markdown", reply_markup: SABOR_DECISION_KEYBOARD }
    );
    return;
  }

  if (data === "sabor_decision:single") {
    if (session.state !== "upload_waiting_sabor_decision") return;
    await setSession(chatId, { ...session, state: "upload_waiting_stock", uploadData: { ...session.uploadData, has_sabores: false } });
    await ctx.reply("📦 Stock por peso/volumen:\n`500g:10 1kg:5 250g:8`\no\n`500ml:8 1L:4`", { parse_mode: "Markdown" });
    return;
  }

  if (data === "sabor_decision:multi") {
    if (session.state !== "upload_waiting_sabor_decision") return;
    await setSession(chatId, { ...session, state: "upload_waiting_sabor_name", uploadData: { ...session.uploadData, has_sabores: true, color_variants: [] } });
    await ctx.reply("🌿 ¿Cómo se llama el primer sabor? (ej: Chocolate, Vainilla, Natural)");
    return;
  }

  if (data === "sabor_more:yes") {
    if (session.state !== "upload_sabor_asking_more") return;
    await setSession(chatId, { ...session, state: "upload_waiting_sabor_name" });
    await ctx.reply("🌿 ¿Cómo se llama el siguiente sabor?");
    return;
  }

  if (data === "sabor_more:no") {
    if (session.state !== "upload_sabor_asking_more") return;
    await setSession(chatId, { ...session, state: "upload_waiting_price_sale" });
    await ctx.reply("💰 ¿Precio de venta? (ej: 2500)");
    return;
  }

  if (data === "upload:confirm") {
    if (session.state !== "upload_confirming") return;
    const d = session.uploadData!;

    const baseSlug = slugify(d.name!, { lower: true, strict: true });
    let slug = baseSlug;
    let suffix = 2;
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const hasSabores    = (d.color_variants?.length ?? 0) > 0;
    const firstVariant  = hasSabores ? d.color_variants![0] : null;
    const baseImages    = hasSabores ? (firstVariant?.images ?? []) : (d.photo_urls ?? []);
    const colorVariants = hasSabores
      ? d.color_variants!
      : [{ name: "Único", images: d.photo_urls ?? [], stock: d.stock ?? {} }];

    const product = await prisma.product.create({
      data: {
        name:           d.name!,
        slug,
        description:    d.description!,
        category:       d.category!,
        images:         baseImages,
        tags:           [],
        price_sale:     d.price_sale!,
        price_cost:     d.price_cost!,
        stock:          hasSabores ? (firstVariant?.stock ?? {}) : (d.stock ?? {}),
        color_variants: colorVariants as object[],
        is_published:   false,
      },
    });

    await clearSession(chatId);
    await ctx.reply(
      `✅ *Producto creado*\n\nID: \`${product.id.slice(0, 8)}\`\nSlug: \`${product.slug}\`\n\nGuardado como *borrador*. Publicalo desde el panel admin.`,
      { parse_mode: "Markdown" }
    );
    return;
  }

  if (data === "upload:cancel") {
    await clearSession(chatId);
    await ctx.reply("❌ Carga cancelada.");
  }
}
