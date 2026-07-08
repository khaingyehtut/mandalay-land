import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/mobileAuth";
import { assertNoPhone } from "@/lib/phoneDetect";
import { postToViberChannel } from "@/lib/viber";

export const dynamic = "force-dynamic";

function parsePlot(p) {
  return { ...p, images: JSON.parse(p.images || "[]") };
}

// Public base URL of the incoming request (real domain behind the proxy).
function reqBaseUrl(req) {
  const host  = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "https";
  return host ? `${proto}://${host}` : "";
}

export async function GET() {
  const plots = await prisma.plot.findMany({ orderBy: { createdAt: "desc" } }).catch(() => []);
  return NextResponse.json(plots.map(parsePlot));
}

export async function POST(req) {
  const user = await getAuthUser(req);
  if (!user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const b = await req.json();
  const isRent = b.listingType === "rent";
  if (!b.township || !b.width || !b.height || (!isRent && !b.grant) || b.priceLakh == null) {
    return NextResponse.json({ error: "township, width, height, priceLakh လိုအပ်သည်" }, { status: 400 });
  }

  // Bulletproof server-side phone check (mirrors client-side isBypassingPhone)
  try {
    assertNoPhone({ street: b.street, note: b.note, tag: b.tag, road: b.road });
  } catch {
    return NextResponse.json({ error: "ဖုန်းနံပါတ် ထည့်၍ မရပါ" }, { status: 400 });
  }

  const raw = await prisma.plot.create({
    data: {
      userId: user.id,
      township: String(b.township),
      street: b.street || null,
      width: parseInt(b.width),
      height: parseInt(b.height),
      grant: isRent ? "—" : String(b.grant),
      priceLakh: parseInt(b.priceLakh),
      facing: b.facing || null,
      road: b.road || null,
      tag: b.tag || null,
      listingType: b.listingType === "rent" ? "rent" : "sale",
      status: b.status || "available",
      note: b.note || null,
      agentName: b.agentName || null,
      agentPhone: b.agentPhone || null,
      images: JSON.stringify(b.images || []),
    },
  });
  const plot = parsePlot(raw);
  // Fire-and-forget — Viber post doesn't block the user's response
  postToViberChannel(plot, reqBaseUrl(req)).catch(() => {});
  return NextResponse.json(plot, { status: 201 });
}
