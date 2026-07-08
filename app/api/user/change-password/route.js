import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/mobileAuth";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const auth = await getAuthUser(req);
  if (!auth?.email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { currentPassword, newPassword } = await req.json().catch(() => ({}));
  if (!currentPassword || !newPassword) return NextResponse.json({ error: "Password လိုအပ်သည်" }, { status: 400 });
  if (newPassword.length < 6) return NextResponse.json({ error: "Password အနည်းဆုံး ၆ လုံး" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { email: auth.email },
    select: { password: true },
  });

  if (!user?.password) {
    return NextResponse.json(
      { error: "Google/Facebook ဖြင့် ဝင်ထားသောကြောင့် Password မပြောင်းနိုင်" },
      { status: 400 }
    );
  }

  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok) return NextResponse.json({ error: "လက်ရှိ Password မမှန်ပါ" }, { status: 400 });

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { email: auth.email }, data: { password: hashed } });

  return NextResponse.json({ ok: true });
}
