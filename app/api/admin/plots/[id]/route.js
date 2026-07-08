import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getAuthUser, isAdminEmail } from "@/lib/mobileAuth";
import { deleteUploadedImages } from "@/lib/deleteImages";

export const dynamic = "force-dynamic";

async function requireAdmin(req) {
  const auth = await getAuthUser(req);
  return isAdminEmail(auth?.email);
}

// PATCH /api/admin/plots/{id}  { status }  — admin can update any plot's status
export async function PATCH(req, { params }) {
  if (!(await requireAdmin(req)))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { status } = await req.json().catch(() => ({}));
  if (!["available", "sold", "pending"].includes(status))
    return NextResponse.json({ error: "invalid status" }, { status: 400 });

  await prisma.plot.update({ where: { id: params.id }, data: { status } }).catch(() => {});
  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/plots/{id}  — admin can delete any plot
export async function DELETE(req, { params }) {
  if (!(await requireAdmin(req)))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const plot = await prisma.plot.findUnique({
    where: { id: params.id },
    select: { images: true },
  });
  if (plot) await deleteUploadedImages(plot.images);
  await prisma.plot.delete({ where: { id: params.id } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
