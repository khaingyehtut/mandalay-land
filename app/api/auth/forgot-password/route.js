import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendResetEmail } from "@/lib/email";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const { email } = await req.json().catch(() => ({}));
  if (!email) return NextResponse.json({ error: "Email လိုအပ်သည်" }, { status: 400 });

  const lower = email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: lower }, select: { password: true } });

  if (!user) return NextResponse.json({ ok: true }); // don't reveal existence

  if (!user.password) {
    return NextResponse.json(
      { error: "Google/Facebook ဖြင့် ဝင်ထားသောကြောင့် Password Reset မရပါ" },
      { status: 400 }
    );
  }

  // Delete any old tokens for this email
  await prisma.passwordResetToken.deleteMany({ where: { email: lower } });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({ data: { email: lower, token, expiresAt } });

  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
  await sendResetEmail(lower, resetUrl);

  return NextResponse.json({ ok: true });
}
