"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { deleteUploadedImages } from "@/lib/deleteImages";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("unauthorized");
  if (session.user.email !== process.env.ADMIN_EMAIL) throw new Error("forbidden");
  return session;
}

export async function adminDeletePlot(plotId) {
  await requireAdmin();
  const plot = await prisma.plot.findUnique({ where: { id: plotId }, select: { images: true } });
  if (plot) await deleteUploadedImages(plot.images);
  await prisma.plot.delete({ where: { id: plotId } });
  revalidatePath("/dashboard");
  revalidatePath("/");
}

export async function adminUpdatePlotStatus(plotId, status) {
  await requireAdmin();
  await prisma.plot.update({ where: { id: plotId }, data: { status } });
  revalidatePath("/dashboard");
  revalidatePath("/");
}

export async function adminDeleteUser(userId) {
  await requireAdmin();
  const plots = await prisma.plot.findMany({ where: { userId }, select: { images: true } });
  await Promise.allSettled(plots.map(p => deleteUploadedImages(p.images)));
  await prisma.plot.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/dashboard");
}
