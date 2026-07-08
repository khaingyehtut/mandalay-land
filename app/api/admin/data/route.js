import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getAuthUser, isAdminEmail } from "@/lib/mobileAuth";

export const dynamic = "force-dynamic";

function parsePlot(p) {
  return { ...p, images: JSON.parse(p.images || "[]") };
}

// GET /api/admin/data -> { plots (with user), users (with plotCount), stats }
export async function GET(req) {
  const auth = await getAuthUser(req);
  if (!isAdminEmail(auth?.email))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const [rawPlots, users] = await Promise.all([
    prisma.plot.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        createdAt: true,
        _count: { select: { plots: true } },
      },
    }),
  ]);

  const plots = rawPlots.map(parsePlot);

  // Township breakdown
  const townMap = {};
  for (const p of plots) {
    const t = (townMap[p.township] ??= { township: p.township, count: 0, totalValue: 0 });
    t.count += 1;
    t.totalValue += p.priceLakh || 0;
  }

  const stats = {
    totalPlots: plots.length,
    available: plots.filter((p) => p.status === "available").length,
    sold: plots.filter((p) => p.status === "sold").length,
    pending: plots.filter((p) => p.status === "pending").length,
    totalUsers: users.length,
    totalValue: plots.reduce((s, p) => s + (p.priceLakh || 0), 0),
    townships: Object.values(townMap).sort((a, b) => b.count - a.count),
  };

  return NextResponse.json({
    plots,
    users: users.map((u) => ({ ...u, plotCount: u._count.plots })),
    stats,
  });
}
