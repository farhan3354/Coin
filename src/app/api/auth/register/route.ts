import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
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

  // Check if user already exists
  const existingUser = await db.user.findFirst({
    where: {
      OR: [
        { email: { equals: email, mode: "insensitive" } },
        { username: { equals: username, mode: "insensitive" } },
      ],
    },
  });

  if (existingUser) {
    // If user exists by email and is NOT verified, resend OTP and let them verify
    if (
      existingUser.email.toLowerCase() === email.toLowerCase() &&
      !existingUser.emailVerified
    ) {
      // Invalidate old OTPs
      await db.emailVerification.updateMany({
        where: { userId: existingUser.id, used: false },
        data: { used: true },
      });

      // Generate new OTP
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await db.emailVerification.create({
        data: { userId: existingUser.id, code: otp, expiresAt },
      });

      // Send verification email
      const sent = await sendEmail({
        to: existingUser.email,
        subject: "Verify Your EarnCoin Email",
        html: otpEmailTemplate(existingUser.fullName, otp),
      });

      await db.emailLog.create({
        data: {
          to: existingUser.email,
          toName: existingUser.fullName,
          subject: "Email Verification OTP",
          body: `Verification OTP: ${otp}`,
          type: "verification",
          status: sent ? "sent" : "failed",
        },
      });

      return NextResponse.json({
        ok: false,
        unverified: true,
        userId: existingUser.id,
        email: existingUser.email,
        message: "Account already registered but not verified. A new OTP has been sent to your email.",
      }, { status: 200 });
    }

    // User exists and is verified (or username taken)
    return NextResponse.json(
      { ok: false, message: "Email or username already in use" },
      { status: 409 }
    );
  }

  const fp = genDeviceFingerprint(ua);
  // const dupDevice = await db.user.findFirst({ where: { deviceFingerprint: fp } });
  // if (dupDevice) return NextResponse.json({ ok: false, message: "This device already has an account." }, { status: 409 });

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await db.user.create({
    data: {
      fullName, username, email, password: hashedPassword, country,
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
    data: { userId: user.id, code: otp, expiresAt },
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

  return NextResponse.json({ ok: true, userId: user.id, email: user.email, sent });
}
