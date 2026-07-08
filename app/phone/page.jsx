import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getSiteSettings } from "@/lib/siteSettings";
import { prisma } from "@/lib/db";
import PhonePageClient from "./PhonePageClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "ဆက်သွယ်ရန် · မန်းလေး မြေကွက်" };

async function getAgents() {
  try {
    const row = await prisma.setting.findUnique({ where: { key: "agents" } });
    return row ? JSON.parse(row.value) : [];
  } catch { return []; }
}

export default async function PhonePage() {
  const [session, settings, agents] = await Promise.all([
    getServerSession(authOptions),
    getSiteSettings(),
    getAgents(),
  ]);
  const isAdmin = session?.user?.email === process.env.ADMIN_EMAIL;

  return <PhonePageClient settings={settings} isAdmin={isAdmin} initialAgents={agents} />;
}
