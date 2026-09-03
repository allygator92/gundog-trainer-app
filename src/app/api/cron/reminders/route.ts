import { NextResponse } from "next/server";
import { sendDueReminders } from "@/lib/reminders";

function authorised(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return false;
  }
  const header = request.headers.get("authorization");
  const bearer = header === `Bearer ${secret}`;
  const query = new URL(request.url).searchParams.get("secret") === secret;
  return bearer || query;
}

export async function GET(request: Request) {
  if (!authorised(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await sendDueReminders();
  return NextResponse.json({ ok: true, ...result });
}
