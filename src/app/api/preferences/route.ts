import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req: NextRequest) {
  const { userId, prefs } = await req.json();
  const user = await db.user.update({
    where: { id: userId },
    data: {
      notifPrefWithdrawal: prefs.emailOnWithdrawal,
      notifPrefReferral: prefs.emailOnReferral,
      notifPrefEvent: prefs.emailOnEvent,
      notifPrefAnnouncement: prefs.emailOnAnnouncement,
      notifPrefNewsletter: prefs.emailOnNewsletter,
      browserNotifications: prefs.browserNotifications,
    },
  });
  return NextResponse.json({ ok: true, user });
}
