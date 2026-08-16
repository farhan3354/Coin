import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { subject, message } = await req.json();
  const subscribers = await db.user.findMany({ where: { emailSubscribed: true, notifPrefAnnouncement: true } });
  const logs = subscribers.map((u) => ({
    to: u.email, toName: u.fullName, subject, body: message, type: "announcement", status: "sent",
  }));
  if (logs.length > 0) {
    await db.emailLog.createMany({ data: logs });
  }
  return NextResponse.json({ ok: true, sent: logs.length });
}
