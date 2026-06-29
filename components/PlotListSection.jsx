// Async Server Component — runs on the server, result streams to the client.
// No "use client" = zero JS sent to browser for this file.
import { prisma } from "@/lib/db";
import ListingsContent from "./ListingsContent";

async function getPlots(town) {
  try {
    const raw = await prisma.plot.findMany({
      where: town ? { township: town } : undefined,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, phone: true } } },
    });
    return raw.map((p) => ({ ...p, images: JSON.parse(p.images || "[]") }));
  } catch {
    return [];
  }
}

async function getTownships() {
  try {
    const rows = await prisma.plot.findMany({
      select: { township: true },
      distinct: ["township"],
      orderBy: { township: "asc" },
    });
    return rows.map((r) => r.township);
  } catch {
    return [];
  }
}

export default async function PlotListSection({ town, phone, isAdmin }) {
  const [plots, townships] = await Promise.all([getPlots(town), getTownships()]);

  return (
    <ListingsContent
      plots={plots}
      phone={phone}
      townships={townships}
      activeTown={town}
      isAdmin={isAdmin}
    />
  );
}
