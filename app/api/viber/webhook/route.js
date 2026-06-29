import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Viber calls this URL to verify the webhook is alive
export async function POST() {
  return NextResponse.json({ status: 0 });
}
