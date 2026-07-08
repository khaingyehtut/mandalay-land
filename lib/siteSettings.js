import { prisma } from "@/lib/db";

const DEFAULTS = {
  phone:       () => process.env.NEXT_PUBLIC_PHONE        ?? "09760000000",
  phone2:      () => process.env.NEXT_PUBLIC_PHONE2       ?? "",
  agentName:   () => process.env.NEXT_PUBLIC_AGENT_NAME   ?? "ကိုအောင်",
  agentTitle:  () => process.env.NEXT_PUBLIC_AGENT_TITLE  ?? "အိမ်ခြံမြေ အကျိုးဆောင်လုပ်ငန်း",
  agentPhoto:  () => process.env.NEXT_PUBLIC_AGENT_PHOTO  ?? "",
  agent2Name:  () => "",
  agent2Title: () => "",
  agent2Photo: () => "",
};

export async function getSiteSettings() {
  try {
    const rows = await prisma.setting.findMany();
    const map  = Object.fromEntries(rows.map(r => [r.key, r.value]));
    return Object.fromEntries(
      Object.entries(DEFAULTS).map(([k, def]) => [k, map[k] || def()])
    );
  } catch {
    return Object.fromEntries(Object.entries(DEFAULTS).map(([k, def]) => [k, def()]));
  }
}

export async function getSitePhone() {
  try {
    const row = await prisma.setting.findUnique({ where: { key: "phone" } });
    return row?.value || process.env.NEXT_PUBLIC_PHONE || "09760000000";
  } catch {
    return process.env.NEXT_PUBLIC_PHONE || "09760000000";
  }
}
