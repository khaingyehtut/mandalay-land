import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getAuthUser, isAdminEmail } from "@/lib/mobileAuth";
import { deleteUploadedImages } from "@/lib/deleteImages";

export const dynamic = "force-dynamic";

// DELETE /api/admin/users/{id}  — delete a user and all their plots (cascade)
export async function DELETE(req, { params }) {
  const auth = await getAuthUser(req);
  if (!isAdminEmail(auth?.email))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const target = await prisma.user
    .findUnique({ where: { id: params.id }, select: { email: true } })
    .catch(() => null);
  if (!target) return NextResponse.json({ error: "not found" }, { status: 404 });
  // Never allow deleting the admin account itself.
  if (isAdminEmail(target.email))
    return NextResponse.json({ error: "cannot delete admin" }, { status: 400 });

  const plots = await prisma.plot.findMany({
    where: { userId: params.id },
    select: { images: true },
  });
  await Promise.allSettled(plots.map((p) => deleteUploadedImages(p.images)));
  await prisma.plot.deleteMany({ where: { userId: params.id } });
  await prisma.user.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
