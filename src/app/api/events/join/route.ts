import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  const { eventId } = await req.json();
  const existing = await db.eventParticipant.findUnique({ where: { eventId_userId: { eventId, userId: user.id } } });
  if (existing) return NextResponse.json({ ok: true, message: "Already joined" });
  await db.eventParticipant.create({ data: { eventId, userId: user.id } });
  return NextResponse.json({ ok: true });
}
