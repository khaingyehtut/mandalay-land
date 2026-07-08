import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signMobileToken, isAdminEmail } from "@/lib/mobileAuth";

export const dynamic = "force-dynamic";

// POST /api/mobile/register  { name, email, password, phone } -> { token, user }
// Mirrors the validation in lib/actions/auth.js (registerUser).
export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  const phone = body.phone?.trim() || null;

  if (!name || name.length < 2)
    return NextResponse.json({ error: "နာမည် အနည်းဆုံး ၂ လုံး ထည့်ပါ" }, { status: 400 });
  if (!email || !email.includes("@"))
    return NextResponse.json({ error: "Email လိပ်စာ မှန်ကန်မှု မရှိပါ" }, { status: 400 });
  if (!password || password.length < 6)
    return NextResponse.json({ error: "Password အနည်းဆုံး ၆ လုံး ထည့်ပါ" }, { status: 400 });
  if (!phone)
    return NextResponse.json({ error: "ဖုန်းနံပါတ် ထည့်ပါ" }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email } }).catch(() => null);
  if (existing)
    return NextResponse.json({ error: "ဤ Email ဖြင့် အကောင့်ရှိပြီးသည်" }, { status: 409 });

  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { name, email, password: hash, phone } });

  const token = await signMobileToken(user);
  return NextResponse.json(
    {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        phone: user.phone,
        isAdmin: isAdminEmail(user.email),
      },
    },
    { status: 201 }
  );
}
