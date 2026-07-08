import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signMobileToken, isAdminEmail } from "@/lib/mobileAuth";

export const dynamic = "force-dynamic";

// POST /api/mobile/login  { email, password } -> { token, user }
export async function POST(req) {
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json({ error: "Email နှင့် Password လိုအပ်သည်" }, { status: 400 });
  }

  const user = await prisma.user
    .findUnique({ where: { email: String(email).toLowerCase() } })
    .catch(() => null);

  if (!user?.password) {
    return NextResponse.json({ error: "Email (သို့) Password မမှန်ပါ" }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return NextResponse.json({ error: "Email (သို့) Password မမှန်ပါ" }, { status: 401 });
  }

  const token = await signMobileToken(user);
  return NextResponse.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      phone: user.phone,
      isAdmin: isAdminEmail(user.email),
    },
  });
}
