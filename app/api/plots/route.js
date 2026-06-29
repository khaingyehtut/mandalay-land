import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { assertNoPhone } from "@/lib/phoneDetect";
import { postToViberChannel } from "@/lib/viber";

export const dynamic = "force-dynamic";

function parsePlot(p) {
  return { ...p, images: JSON.parse(p.images || "[]") };
}

export async function GET() {
  const plots = await prisma.plot.findMany({ orderBy: { createdAt: "desc" } }).catch(() => []);
  return NextResponse.json(plots.map(parsePlot));
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const b = await req.json();
  if (!b.township || !b.width || !b.height || !b.grant || b.priceLakh == null) {
    return NextResponse.json({ error: "township, width, height, grant, priceLakh လိုအပ်သည်" }, { status: 400 });
  }

  // Bulletproof server-side phone check (mirrors client-side isBypassingPhone)
  try {
    assertNoPhone({ street: b.street, note: b.note, tag: b.tag, road: b.road });
  } catch {
    return NextResponse.json({ error: "ဖုန်းနံပါတ် ထည့်၍ မရပါ" }, { status: 400 });
  }

  const raw = await prisma.plot.create({
    data: {
      userId: session.user.id,
      township: String(b.township),
      street: b.street || null,
      width: parseInt(b.width),
      height: parseInt(b.height),
      grant: String(b.grant),
      priceLakh: parseInt(b.priceLakh),
      facing: b.facing || null,
      road: b.road || null,
      tag: b.tag || null,
      status: b.status || "available",
      note: b.note || null,
      images: JSON.stringify(b.images || []),
    },
  });
  const plot = parsePlot(raw);
  // Fire-and-forget — Viber post doesn't block the user's response
  postToViberChannel(plot).catch(() => {});
  return NextResponse.json(plot, { status: 201 });
}
