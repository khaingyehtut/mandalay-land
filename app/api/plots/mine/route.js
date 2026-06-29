import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

function parsePlot(p) {
  return { ...p, images: JSON.parse(p.images || "[]") };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const plots = await prisma.plot.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);
  return NextResponse.json(plots.map(parsePlot));
}
