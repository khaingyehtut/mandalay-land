import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const { token, password } = await req.json().catch(() => ({}));
  if (!token || !password) return NextResponse.json({ error: "token, password လိုအပ်သည်" }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: "Password အနည်းဆုံး ၆ လုံး" }, { status: 400 });

  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!record || record.expiresAt < new Date()) {
    return NextResponse.json({ error: "Reset link သက်တမ်းကုန်ဆုံးပြီ၊ ထပ်မံတောင်းဆိုပါ" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { email: record.email }, data: { password: hashed } });
  await prisma.passwordResetToken.delete({ where: { token } });

  return NextResponse.json({ ok: true });
}
