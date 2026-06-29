import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

const DEFAULTS = {
  phone:      process.env.NEXT_PUBLIC_PHONE        ?? "09760000000",
  agentName:  process.env.NEXT_PUBLIC_AGENT_NAME   ?? "ကိုအောင်",
  agentTitle: process.env.NEXT_PUBLIC_AGENT_TITLE  ?? "အိမ်ခြံမြေ အကျိုးဆောင်လုပ်ငန်း",
  agentPhoto: process.env.NEXT_PUBLIC_AGENT_PHOTO  ?? "",
};

export async function GET() {
  const rows = await prisma.setting.findMany();
  const map = Object.fromEntries(rows.map(r => [r.key, r.value]));
  // merge with defaults so missing keys always have a value
  const result = Object.fromEntries(
    Object.entries(DEFAULTS).map(([k, def]) => [k, map[k] ?? def])
  );
  return NextResponse.json(result);
}

export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const allowed = Object.keys(DEFAULTS);

  await Promise.all(
    allowed
      .filter(k => body[k] != null)
      .map(k =>
        prisma.setting.upsert({
          where: { key: k },
          update: { value: String(body[k]) },
          create: { key: k, value: String(body[k]) },
        })
      )
  );

  return NextResponse.json({ ok: true });
}
