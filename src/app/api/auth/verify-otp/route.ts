import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail, welcomeEmailTemplate } from "@/lib/emailService";

export async function POST(req: NextRequest) {
  const { userId, otp } = await req.json();
  if (!userId) return NextResponse.json({ ok: false, message: "Missing userId" }, { status: 400 });

  const settings = await db.settings.findUnique({ where: { id: "singleton" } });
  const bonus = settings?.welcomeBonus ?? 150;
  const referralReward = settings?.referralReward ?? 90;

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ ok: false, message: "User not found" }, { status: 404 });
  if (user.emailVerified) return NextResponse.json({ ok: true, user });

  // Look up the most recent OTP log for this user
  const otpLog = await db.emailLog.findFirst({
    where: { to: user.email, type: "otp" },
    orderBy: { sentAt: "desc" },
  });

  if (!otpLog) {
    return NextResponse.json({ ok: false, message: "No OTP was sent for this account. Please register again." }, { status: 400 });
  }

  // Extract OTP from subject (stored as "OTP: 123456")
  const storedOTP = otpLog.subject.replace("OTP: ", "").trim();
  if (!otp) {
    return NextResponse.json({ ok: false, message: "Please enter the 6-digit OTP code sent to your email." }, { status: 400 });
  }
  if (storedOTP !== String(otp)) {
    return NextResponse.json({ ok: false, message: "Invalid OTP code. Please check your email and try again." }, { status: 400 });
  }

  const updated = await db.user.update({
    where: { id: userId },
    data: { emailVerified: true, points: { increment: bonus }, dollarBalance: bonus / (settings?.pointsPerDollar ?? 1000) },
  });

  await db.coinHistory.create({
    data: { userId, activity: "Welcome Bonus", pointsEarned: bonus, balanceAfter: updated.points, date: new Date() },
  });

  await db.notification.create({
    data: { userId, title: "Welcome to EarnCoin!", message: `Your account is verified. ${bonus} welcome bonus points credited.`, type: "announcement" },
  });

  // Send real welcome email (best-effort)
  try {
    const { subject, html } = welcomeEmailTemplate(user.fullName);
    const sent = await sendEmail(user.email, subject, html);
    await db.emailLog.create({
      data: { to: user.email, toName: user.fullName, subject, body: html, type: "welcome", status: sent ? "sent" : "failed" },
    });
  } catch (e) {
    console.error("Welcome email send error:", e);
  }

  // Credit inviter
  if (user.referredBy) {
    const inviter = await db.user.findFirst({ where: { referralCode: user.referredBy } });
    if (inviter) {
      const inviterUpdated = await db.user.update({
        where: { id: inviter.id },
        data: { points: { increment: referralReward }, totalReferrals: { increment: 1 }, activeReferrals: { increment: 1 } },
      });
      await db.coinHistory.create({
        data: { userId: inviter.id, activity: `Referral Reward (${user.username} verified)`, pointsEarned: referralReward, balanceAfter: inviterUpdated.points, date: new Date() },
      });
      await db.notification.create({
        data: { userId: inviter.id, title: "Referral Reward", message: `${user.username} joined using your code. +${referralReward} points!`, type: "referral" },
      });
    }
  }

  return NextResponse.json({ ok: true, user: updated });
}
