import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin Dashboard · မန်းလေး မြေကွက်" };

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) redirect("/auth/login");
  if (session.user.email !== process.env.ADMIN_EMAIL) redirect("/");

  // Fetch all data in parallel
  const [allPlots, allUsers] = await Promise.all([
    prisma.plot.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, name: true, email: true, image: true } } },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, email: true, image: true,
        phone: true, createdAt: true,
        _count: { select: { plots: true } },
      },
    }),
  ]);

  // Parse images
  const plots = allPlots.map(p => ({ ...p, images: JSON.parse(p.images || "[]") }));

  // Stats
  const stats = {
    totalPlots: plots.length,
    available: plots.filter(p => p.status === "available").length,
    sold: plots.filter(p => p.status === "sold").length,
    pending: plots.filter(p => p.status === "pending").length,
    totalUsers: allUsers.length,
    totalValue: plots.reduce((sum, p) => sum + p.priceLakh, 0),
  };

  // Township breakdown
  const townshipMap = {};
  for (const p of plots) {
    if (!townshipMap[p.township]) townshipMap[p.township] = { count: 0, totalValue: 0 };
    townshipMap[p.township].count++;
    townshipMap[p.township].totalValue += p.priceLakh;
  }
  const townshipData = Object.entries(townshipMap)
    .map(([township, data]) => ({ township, ...data }))
    .sort((a, b) => b.count - a.count);

  // Recent 5 plots
  const recentPlots = plots.slice(0, 5);

  return (
    <DashboardClient
      stats={stats}
      plots={plots}
      users={allUsers}
      townshipData={townshipData}
      recentPlots={recentPlots}
      adminEmail={process.env.ADMIN_EMAIL ?? ""}
    />
  );
}
