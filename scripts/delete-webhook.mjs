const { TELEGRAM_BOT_TOKEN } = process.env;

if (!TELEGRAM_BOT_TOKEN) {
  console.error("❌ Falta TELEGRAM_BOT_TOKEN.");
  process.exit(1);
}

const res  = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook`, { method: "POST" });
const data = await res.json();

if (data.ok) {
  console.log("✅ Webhook eliminado.");
} else {
  console.error("❌ Error:", data.description);
  process.exit(1);
}
