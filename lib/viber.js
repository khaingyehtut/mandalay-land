import { getSitePhone } from "@/lib/siteSettings";

export async function postToViberChannel(plot) {
  const token = process.env.VIBER_BOT_TOKEN;
  if (!token) return;

  const phone = await getSitePhone();
  const baseUrl = (process.env.NEXTAUTH_URL ?? "").replace(/\/$/, "");
  const siteName = baseUrl.replace(/^https?:\/\//, "");

  const lines = [
    "🏡 မြေကွက် အသစ် ရောင်းမည်",
    "",
    `📍 ${plot.township}${plot.street ? " · " + plot.street : ""}`,
    `📋 ${plot.grant}  ·  ${plot.width} × ${plot.height} ပေ`,
    `💰 ${plot.priceLakh} သိန်း${plot.facing ? "  ·  " + plot.facing + "မျက်နှာ" : ""}`,
  ];

  if (plot.road)  lines.push(`🛣️ ${plot.road}`);
  if (plot.tag)   lines.push(`🏷️ ${plot.tag}`);
  if (plot.note)  lines.push(`📝 ${plot.note}`);

  lines.push("", `📞 ${phone}`, `🌐 ${siteName}`);

  const text = lines.join("\n");
  const firstImage = Array.isArray(plot.images) ? plot.images[0] : undefined;

  const body = firstImage
    ? {
        sender: { name: "မန်းလေး မြေကွက်" },
        type: "picture",
        text,
        media: baseUrl + firstImage,
        thumbnail: baseUrl + firstImage,
      }
    : {
        sender: { name: "မန်းလေး မြေကွက်" },
        type: "text",
        text,
      };

  try {
    const res = await fetch("https://chatapi.viber.com/pa/post", {
      method: "POST",
      headers: {
        "X-Viber-Auth-Token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.status !== 0) console.error("[Viber] channel post failed:", data);
  } catch (err) {
    console.error("[Viber] API error:", err);
  }
}
