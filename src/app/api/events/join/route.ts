import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { userId, eventId } = await req.json();
  const existing = await db.eventParticipant.findUnique({ where: { eventId_userId: { eventId, userId } } });
  if (existing) return NextResponse.json({ ok: true, message: "Already joined" });
  await db.eventParticipant.create({ data: { eventId, userId } });
  return NextResponse.json({ ok: true });
}
