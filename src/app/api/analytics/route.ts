import { NextResponse } from "next/server";
import { z } from "zod";
import { isAnalyticsEventName } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/rate-limit";

const payloadSchema = z.object({
  name: z.string(),
  path: z.string().max(200).optional(),
  label: z.string().max(120).optional(),
  sessionId: z.string().max(80).optional(),
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(`analytics:${ip}`, 80, 60_000)) {
    return NextResponse.json({ ok: true });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success || !isAnalyticsEventName(parsed.data.name)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const path = parsed.data.path?.startsWith("/") ? parsed.data.path.slice(0, 200) : "/";
  if (path.startsWith("/admin") || path.startsWith("/api")) {
    return NextResponse.json({ ok: true });
  }

  try {
    await prisma.analyticsEvent.create({
      data: {
        name: parsed.data.name,
        path,
        label: parsed.data.label || undefined,
        sessionId: parsed.data.sessionId || undefined,
      },
    });
  } catch (error) {
    console.error("Analytics event failed:", error);
  }

  return NextResponse.json({ ok: true });
}
