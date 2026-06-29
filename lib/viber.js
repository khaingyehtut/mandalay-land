import { getSitePhone } from "@/lib/siteSettings";

async function viberPost(token, sender, body) {
  const res = await fetch("https://chatapi.viber.com/pa/post", {
    method:  "POST",
    headers: { "X-Viber-Auth-Token": token, "Content-Type": "application/json" },
    body:    JSON.stringify({ from: sender, ...body }),
  }).catch(() => null);
  const data = await res?.json().catch(() => null);
  if (data?.status !== 0) console.error("[Viber] post failed:", data);
}

export async function postToViberChannel(plot) {
  const token  = process.env.VIBER_BOT_TOKEN;
  const sender = process.env.VIBER_SENDER_ID;
  if (!token || !sender) return;

  const phone    = await getSitePhone();
  const baseUrl  = (process.env.NEXTAUTH_URL ?? "").replace(/\/$/, "");
  const siteName = baseUrl.replace(/^https?:\/\//, "");

  const lines = [
    "🏡 မြေကွက် အသစ် ရောင်းမည်",
    "",
    `📍 ${plot.township}${plot.street ? " · " + plot.street : ""}`,
    `📋 ${plot.grant}  ·  ${plot.width} × ${plot.height} ပေ`,
    `💰 ${plot.priceLakh} သိန်း${plot.facing ? "  ·  " + plot.facing + "မျက်နှာ" : ""}`,
  ];
  if (plot.road) lines.push(`🛣️  ${plot.road}`);
  if (plot.tag)  lines.push(`🏷️  ${plot.tag}`);
  if (plot.note) lines.push(`📝 ${plot.note}`);
  lines.push("", `📞 ${phone}`, `🌐 ${siteName}`);

  // 1. Send text info
  await viberPost(token, sender, { type: "text", text: lines.join("\n") });

  // 2. Send each image separately
  const images = Array.isArray(plot.images) ? plot.images : [];
  for (const img of images) {
    const url = baseUrl + img;
    await viberPost(token, sender, {
      type:      "picture",
      text:      "",
      media:     url,
      thumbnail: url,
    });
  }
}
