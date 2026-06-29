"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function registerUser(_prev, formData) {
  const name = formData.get("name")?.trim();
  const email = formData.get("email")?.trim().toLowerCase();
  const password = formData.get("password");
  const phone = formData.get("phone")?.trim() || null;

  if (!name || name.length < 2)
    return { error: "နာမည် အနည်းဆုံး ၂ လုံး ထည့်ပါ" };
  if (!email || !email.includes("@"))
    return { error: "Email လိပ်စာ မှန်ကန်မှု မရှိပါ" };
  if (!password || password.length < 6)
    return { error: "Password အနည်းဆုံး ၆ လုံး ထည့်ပါ" };
  if (!phone)
    return { error: "ဖုန်းနံပါတ် ထည့်ပါ" };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "ဤ Email ဖြင့် အကောင့်ရှိပြီးသည်" };

  const hash = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { name, email, password: hash, phone } });

  return { success: true, email };
}
