import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser, isAdminEmail } from "@/lib/mobileAuth";

export const dynamic = "force-dynamic";

// GET /api/mobile/me -> current user (validates a stored bearer token on launch)
export async function GET(req) {
  const auth = await getAuthUser(req);
  if (!auth?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await prisma.user
    .findUnique({
      where: { id: auth.id },
      select: { id: true, name: true, email: true, image: true, phone: true },
    })
    .catch(() => null);

  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ ...user, isAdmin: isAdminEmail(user.email) });
}
