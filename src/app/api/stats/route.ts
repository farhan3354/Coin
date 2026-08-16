import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("DB timeout")), 25000)
    );

    const queryPromise = Promise.all([
      db.user.findMany({ select: { id: true, fullName: true, username: true, email: true, password: true, country: true, role: true, referralCode: true, referredBy: true, points: true, dollarBalance: true, emailVerified: true, deviceFingerprint: true, browserInfo: true, ipAddress: true, createdAt: true, lastLogin: true, status: true, avatarColor: true, totalReferrals: true, activeReferrals: true, roomLevel: true, roomXP: true, isOfficialLink: true, officialLinkLabel: true, emailSubscribed: true, notifPrefWithdrawal: true, notifPrefReferral: true, notifPrefEvent: true, notifPrefAnnouncement: true, notifPrefNewsletter: true, browserNotifications: true } }),
      db.video.findMany(),
      db.task.findMany(),
      db.event.findMany({ include: { participants: { select: { userId: true } } } }),
      db.room.findMany({ include: { participants: { select: { userId: true } } } }),
      db.withdrawal.findMany(),
      db.coinHistory.findMany({ take: 500 }),
      db.notification.findMany({ take: 500 }),
      db.businessCampaign.findMany(),
      db.officialLink.findMany(),
      db.gameResult.findMany(),
      db.emailLog.findMany({ take: 200 }),
      db.videoWatch.findMany(),
      db.settings.findUnique({ where: { id: "singleton" } }),
      db.quiz.findMany({ include: { questions: true } }),
      db.quizAttempt.findMany(),
    ]);

    const data = await Promise.race([queryPromise, timeoutPromise]) as any[];

    return NextResponse.json({
      users: data[0],
      videos: data[1],
      tasks: data[2],
      events: data[3],
      rooms: data[4],
      withdrawals: data[5],
      coinHistory: data[6],
      notifications: data[7],
      campaigns: data[8],
      officialLinks: data[9],
      gameResults: data[10],
      emailLogs: data[11],
      videoWatches: data[12],
      settings: data[13],
      quizzes: data[14],
      quizAttempts: data[15],
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json({ error: "Database query failed", details: String(error) }, { status: 500 });
  }
}
