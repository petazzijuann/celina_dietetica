import { Telegraf } from "telegraf";
import { getSession } from "./state";
import {
  handleNuevo,
  handlePhoto as handleUploadPhoto,
  handleText  as handleUploadText,
  handleCallback as handleUploadCallback,
} from "./handlers/upload-product";
import { handleVenta, handleSaleText, handleSaleCallback } from "./handlers/sale";
import { handleMetricas, handleStock } from "./handlers/metrics";

const globalForBot = globalThis as unknown as { telegramBot: Telegraf };

export const bot =
  globalForBot.telegramBot ?? new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

if (process.env.NODE_ENV !== "production") globalForBot.telegramBot = bot;

// Auth guard
bot.use(async (ctx, next) => {
  if (ctx.from?.id.toString() !== process.env.TELEGRAM_ADMIN_CHAT_ID) {
    await ctx.reply("No autorizado.");
    return;
  }
  return next();
});

// ── Comandos ──────────────────────────────────────────────────
bot.command("nuevo",    handleNuevo);
bot.command("venta",    handleVenta);
bot.command("metricas", handleMetricas);
bot.command("stock",    handleStock);
bot.command("ayuda", async (ctx) => {
  await ctx.reply(
    "*Comandos — Dietética Celina*\n\n" +
    "/nuevo — Cargar nuevo producto\n" +
    "/venta — Registrar venta offline\n" +
    "/metricas — Ver ventas y márgenes\n" +
    "/stock — Ver stock actual\n" +
    "/ayuda — Este mensaje",
    { parse_mode: "Markdown" }
  );
});

// ── Fotos ─────────────────────────────────────────────────────
bot.on("photo", handleUploadPhoto);

// ── Texto ─────────────────────────────────────────────────────
bot.on("text", async (ctx) => {
  const chatId  = ctx.from!.id.toString();
  const session = await getSession(chatId);

  if (session.state.startsWith("upload_")) return handleUploadText(ctx);
  if (session.state.startsWith("sale_"))   return handleSaleText(ctx);
});

// ── Callbacks ─────────────────────────────────────────────────
bot.on("callback_query", async (ctx) => {
  const data = (ctx.callbackQuery as { data?: string })?.data ?? "";

  if (
    data.startsWith("cat:") ||
    data.startsWith("upload:") ||
    data.startsWith("sabor_decision:") ||
    data.startsWith("sabor_more:")
  ) {
    return handleUploadCallback(ctx);
  }
  if (
    data.startsWith("product:") ||
    data.startsWith("sabor:") ||
    data.startsWith("peso:") ||
    data.startsWith("pay:") ||
    data.startsWith("sale:")
  ) {
    return handleSaleCallback(ctx);
  }

  await ctx.answerCbQuery().catch(() => null);
});
