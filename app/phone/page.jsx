import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getSiteSettings } from "@/lib/siteSettings";
import PhonePageClient from "./PhonePageClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "ဆက်သွယ်ရန် · မန်းလေး မြေကွက်" };

export default async function PhonePage() {
  const [session, settings] = await Promise.all([
    getServerSession(authOptions),
    getSiteSettings(),
  ]);
  const isAdmin = session?.user?.email === process.env.ADMIN_EMAIL;

  return <PhonePageClient settings={settings} isAdmin={isAdmin} />;
}
