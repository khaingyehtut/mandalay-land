import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/mobileAuth";

export const dynamic = "force-dynamic";

function parsePlot(p) {
  return { ...p, images: JSON.parse(p.images || "[]") };
}

export async function GET(req) {
  const user = await getAuthUser(req);
  if (!user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const plots = await prisma.plot.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);
  return NextResponse.json(plots.map(parsePlot));
}
