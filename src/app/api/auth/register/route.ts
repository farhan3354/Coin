import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail, otpEmailTemplate, generateOTP } from "@/lib/email";

function genReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  let code = "ERN";
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function genDeviceFingerprint(ua: string): string {
  let hash = 0;
  for (let i = 0; i < ua.length; i++) { hash = (hash << 5) - hash + ua.charCodeAt(i); hash |= 0; }
  return `fp_${Math.abs(hash).toString(36)}`;
}

export async function POST(req: NextRequest) {
  const { fullName, username, email, password, country, referralCode } = await req.json();
  const ua = req.headers.get("user-agent") || "unknown";

  const exists = await db.user.findFirst({
    where: {
      OR: [
        { email: { equals: email, mode: "insensitive" } },
        { username: { equals: username, mode: "insensitive" } },
      ],
    },
  });
  if (exists) return NextResponse.json({ ok: false, message: "Email or username already in use" }, { status: 409 });

  const fp = genDeviceFingerprint(ua);
  const dupDevice = await db.user.findFirst({ where: { deviceFingerprint: fp } });
  if (dupDevice) return NextResponse.json({ ok: false, message: "This device already has an account." }, { status: 409 });

  const user = await db.user.create({
    data: {
      fullName, username, email, password, country,
      referralCode: genReferralCode(),
      referredBy: referralCode || null,
      deviceFingerprint: fp,
      browserInfo: ua,
      ipAddress: req.headers.get("x-forwarded-for") || "0.0.0.0",
    },
  });

  // Generate and save OTP
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db.emailVerification.create({
    data: {
      userId: user.id,
      code: otp,
      expiresAt,
    },
  });

  // Send verification email
  const sent = await sendEmail({
    to: user.email,
    subject: "Verify Your EarnCoin Email",
    html: otpEmailTemplate(fullName, otp),
  });

  // Log email
  await db.emailLog.create({
    data: {
      to: user.email,
      toName: fullName,
      subject: "Email Verification OTP",
      body: `Verification OTP: ${otp}`,
      type: "verification",
      status: sent ? "sent" : "failed",
    },
  });

  return NextResponse.json({ ok: true, userId: user.id, email: user.email });
}
