import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getAuthUser, isAdminEmail } from "@/lib/mobileAuth";

export const dynamic = "force-dynamic";

async function isAdmin(req) {
  const user = await getAuthUser(req);
  return isAdminEmail(user?.email);
}

async function getAgents() {
  try {
    const row = await prisma.setting.findUnique({ where: { key: "agents" } });
    return row ? JSON.parse(row.value) : [];
  } catch { return []; }
}

async function saveAgents(agents) {
  await prisma.setting.upsert({
    where:  { key: "agents" },
    update: { value: JSON.stringify(agents) },
    create: { key: "agents", value: JSON.stringify(agents) },
  });
}

export async function GET() {
  return NextResponse.json(await getAgents());
}

export async function POST(req) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json();
  if (!body.name?.trim()) return NextResponse.json({ error: "name required" }, { status: 400 });

  const agents = await getAgents();
  const agent = { id: Date.now().toString(), name: body.name.trim(), title: body.title?.trim() || "", phone: body.phone?.trim() || "", photo: body.photo?.trim() || "" };
  agents.push(agent);
  await saveAgents(agents);
  return NextResponse.json(agent, { status: 201 });
}

export async function PUT(req) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const agents = await getAgents();
  const updated = agents.map(a => a.id === body.id
    ? { ...a, name: body.name?.trim() ?? a.name, title: body.title?.trim() ?? a.title, phone: body.phone?.trim() ?? a.phone, photo: body.photo?.trim() ?? a.photo }
    : a
  );
  await saveAgents(updated);
  return NextResponse.json(updated.find(a => a.id === body.id));
}

export async function DELETE(req) {
  if (!(await isAdmin(req)))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await req.json();
  const agents = await getAgents();
  await saveAgents(agents.filter(a => a.id !== id));
  return NextResponse.json({ ok: true });
}
