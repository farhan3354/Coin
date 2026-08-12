import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail, welcomeEmailTemplate } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { userId, code } = await req.json();
  const settings = await db.settings.findUnique({ where: { id: "singleton" } });
  const bonus = settings?.welcomeBonus ?? 150;
  const referralReward = settings?.referralReward ?? 90;

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ ok: false, message: "User not found" }, { status: 404 });
  if (user.emailVerified) return NextResponse.json({ ok: true, user });

  // Validate OTP code from database
  const verification = await db.emailVerification.findFirst({
    where: {
      userId,
      code,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!verification) {
    return NextResponse.json(
      { ok: false, message: "Invalid or expired verification code" },
      { status: 400 }
    );
  }

  // Mark code as used
  await db.emailVerification.update({
    where: { id: verification.id },
    data: { used: true },
  });

  const updated = await db.user.update({
    where: { id: userId },
    data: { emailVerified: true, points: { increment: bonus }, dollarBalance: bonus / (settings?.pointsPerDollar ?? 1000) },
  });

  // Coin history entry
  await db.coinHistory.create({
    data: { userId, activity: "Welcome Bonus", pointsEarned: bonus, balanceAfter: updated.points, date: new Date() },
  });

  // Notification
  await db.notification.create({
    data: { userId, title: "Welcome to EarnCoin!", message: `Your account is verified. ${bonus} welcome bonus points credited.`, type: "announcement" },
  });

  // Send welcome email
  await sendEmail({
    to: user.email,
    subject: "Welcome to EarnCoin! 🎉",
    html: welcomeEmailTemplate(user.fullName, bonus),
  });

  await db.emailLog.create({
    data: {
      to: user.email,
      toName: user.fullName,
      subject: "Welcome to EarnCoin",
      body: `Welcome email with ${bonus} bonus points`,
      type: "welcome",
      status: "sent",
    },
  });

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
