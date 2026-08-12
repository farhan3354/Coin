import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail, otpEmailTemplate, generateOTP } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  const user = await db.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });

  if (!user) {
    return NextResponse.json(
      { ok: false, message: "No account found with this email" },
      { status: 404 }
    );
  }

  if (user.emailVerified) {
    return NextResponse.json(
      { ok: false, message: "Email is already verified" },
      { status: 400 }
    );
  }

  // Generate OTP
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Invalidate old codes
  await db.emailVerification.updateMany({
    where: { userId: user.id, used: false },
    data: { used: true },
  });

  // Save new OTP
  await db.emailVerification.create({
    data: {
      userId: user.id,
      code: otp,
      expiresAt,
    },
  });

  // Send email
  const sent = await sendEmail({
    to: user.email,
    subject: "Verify Your EarnCoin Email",
    html: otpEmailTemplate(user.fullName, otp),
  });

  // Log
  await db.emailLog.create({
    data: {
      to: user.email,
      toName: user.fullName,
      subject: "Email Verification OTP",
      body: `Verification OTP: ${otp}`,
      type: "verification",
      status: sent ? "sent" : "failed",
    },
  });

  return NextResponse.json({
    ok: true,
    message: sent ? "Verification code sent to your email" : "Failed to send email, please try again",
    userId: user.id,
  });
}
