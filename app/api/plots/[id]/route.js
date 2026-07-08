import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/mobileAuth";
import { assertNoPhone } from "@/lib/phoneDetect";
import { deleteUploadedImages } from "@/lib/deleteImages";
import { notifyStatusChange } from "@/lib/viber";

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

export async function GET(_req, { params }) {
  const plot = await prisma.plot.findUnique({ where: { id: params.id } });
  if (!plot) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(parsePlot(plot));
}

export async function PUT(req, { params }) {
  const user = await getAuthUser(req);
  if (!user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const existing = await prisma.plot.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (existing.userId !== user.id) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const b = await req.json();

  try {
    assertNoPhone({ street: b.street, note: b.note, tag: b.tag, road: b.road });
  } catch {
    return NextResponse.json({ error: "ဖုန်းနံပါတ် ထည့်၍ မရပါ" }, { status: 400 });
  }

  const data = {};
  for (const k of ["township", "street", "grant", "facing", "road", "tag", "status", "note", "listingType", "agentName", "agentPhone"]) {
    if (b[k] !== undefined) data[k] = b[k] === "" ? null : b[k];
  }
  for (const k of ["width", "height", "priceLakh"]) {
    if (b[k] !== undefined) data[k] = parseInt(b[k]);
  }
  if (b.images !== undefined) {
    data.images = JSON.stringify(Array.isArray(b.images) ? b.images : []);
  }
  const raw  = await prisma.plot.update({ where: { id: params.id }, data });
  const plot = parsePlot(raw);
  if (data.status && data.status !== existing.status && ["sold", "pending"].includes(data.status)) {
    notifyStatusChange({ ...plot, viberToken: existing.viberToken }, data.status, reqBaseUrl(req)).catch(() => {});
  }
  return NextResponse.json(plot);
}

export async function DELETE(req, { params }) {
  const user = await getAuthUser(req);
  if (!user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const existing = await prisma.plot.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (existing.userId !== user.id) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  await deleteUploadedImages(existing.images);
  await prisma.plot.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
