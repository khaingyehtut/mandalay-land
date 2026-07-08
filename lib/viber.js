import { prisma } from "@/lib/db";

async function getAgentPhones() {
  try {
    const row = await prisma.setting.findUnique({ where: { key: "agents" } });
    const agents = JSON.parse(row?.value || "[]");
    const phones = agents.map(a => a.phone).filter(Boolean);
    if (phones.length) return phones;
  } catch {}
  return [process.env.NEXT_PUBLIC_PHONE || "09760000000"];
}

// Resolve the public base URL for links + image media sent to Viber.
// Viber's servers must be able to fetch the media URL, so a localhost value
// is never usable — prefer the real request host, then SITE_URL / NEXTAUTH_URL,
// and fall back to the production domain as a last resort.
function resolveBaseUrl(reqBaseUrl) {
  const candidates = [reqBaseUrl, process.env.SITE_URL, process.env.NEXTAUTH_URL];
  for (const c of candidates) {
    const url = (c ?? "").trim().replace(/\/$/, "");
    if (url && !/(localhost|127\.0\.0\.1|0\.0\.0\.0)/.test(url)) return url;
  }
  return "https://mandalayland.com";
}

async function viberPost(token, sender, body) {
  const res = await fetch("https://chatapi.viber.com/pa/post", {
    method:  "POST",
    headers: { "X-Viber-Auth-Token": token, "Content-Type": "application/json" },
    body:    JSON.stringify({ from: sender, ...body }),
  }).catch(() => null);
  const data = await res?.json().catch(() => null);
  if (data?.status !== 0) console.error("[Viber] post failed:", data);
  return data?.message_token ?? null;
}

async function viberEdit(token, messageToken, body) {
  const res = await fetch("https://chatapi.viber.com/pa/edit_message", {
    method:  "POST",
    headers: { "X-Viber-Auth-Token": token, "Content-Type": "application/json" },
    body:    JSON.stringify({ message_token: String(messageToken), ...body }),
  }).catch(() => null);
  const data = await res?.json().catch(() => null);
  if (data?.status !== 0) console.error("[Viber] edit failed:", data);
}

function buildLines(plot, phones, siteName, statusLabel) {
  const header = statusLabel
    ? `${statusLabel} — မြေကွက် အပ်ဒိတ်`
    : plot.listingType === "rent"
      ? "🏡 မြေကွက် အဌားချမည်"
      : "🏡 မြေကွက် ရောင်းမည်";

  const lines = [
    header,
    "",
    `📍 ${plot.street || plot.township}`,
    plot.listingType === "rent"
      ? `📋 ${plot.width} × ${plot.height} ပေ`
      : `📋 ${plot.grant}  ·  ${plot.width} × ${plot.height} ပေ`,
    plot.listingType === "rent"
      ? `💰 ${plot.priceLakh} /1လ${plot.facing ? "  ·  " + plot.facing + "မျက်နှာလည့်" : ""}`
      : `💰 ${plot.priceLakh} သိန်း${plot.facing ? "  ·  " + plot.facing + "မျက်နှာလည့်" : ""}`,
  ];
  if (plot.road) lines.push(`🛣️  ${plot.road}`);
  if (plot.tag)  lines.push(`🏷️  ${plot.tag}`);
  if (plot.note) lines.push(`📝 ${plot.note}`);
  lines.push("");
  for (const phone of phones) lines.push(`📞 ${phone}`);
  if (!statusLabel) lines.push("👇 အသေးစိတ်ကြည့်ရှုရန် နှိပ်ပါ 👇");
  lines.push(`🌐 ${siteName}`);
  return lines.join("\n");
}

export async function postToViberChannel(plot, reqBaseUrl) {
  const token  = process.env.VIBER_BOT_TOKEN;
  const sender = process.env.VIBER_SENDER_ID;
  if (!token || !sender) return;

  const phones   = await getAgentPhones();
  const baseUrl  = resolveBaseUrl(reqBaseUrl);
  const siteName = baseUrl.replace(/^https?:\/\//, "");
  const text     = buildLines(plot, phones, siteName, null);

  const images = Array.isArray(plot.images) ? plot.images : [];
  const [first, ...rest] = images;

  let msgToken = null;
  if (first) {
    const url = baseUrl + first;
    msgToken = await viberPost(token, sender, { type: "picture", text, media: url, thumbnail: url });
  } else {
    msgToken = await viberPost(token, sender, { type: "text", text });
  }

  // Save message token so we can edit it later
  if (msgToken) {
    await prisma.plot.update({ where: { id: plot.id }, data: { viberToken: String(msgToken) } }).catch(() => {});
  }
}

const STATUS_LABEL = {
  sold:    "✅ ရောင်းပြီး",
  pending: "⏸️ ဆိုင်းငံ့",
};

export async function notifyStatusChange(plot, newStatus, reqBaseUrl) {
  const token  = process.env.VIBER_BOT_TOKEN;
  const sender = process.env.VIBER_SENDER_ID;
  if (!token || !sender) return;

  const label = STATUS_LABEL[newStatus];
  if (!label) return;

  const phones    = await getAgentPhones();
  const baseUrl   = resolveBaseUrl(reqBaseUrl);
  const siteName  = baseUrl.replace(/^https?:\/\//, "");
  const text      = buildLines(plot, phones, siteName, label);
  const images    = Array.isArray(plot.images) ? plot.images : [];
  const first     = images[0];
  const msgToken  = plot.viberToken;

  if (msgToken) {
    // Edit the original post
    if (first) {
      const url = baseUrl + first;
      await viberEdit(token, msgToken, { type: "picture", text, media: url, thumbnail: url });
    } else {
      await viberEdit(token, msgToken, { type: "text", text });
    }
  } else {
    // No saved token — fall back to new post
    if (first) {
      const url = baseUrl + first;
      await viberPost(token, sender, { type: "picture", text, media: url, thumbnail: url });
    } else {
      await viberPost(token, sender, { type: "text", text });
    }
  }
}
