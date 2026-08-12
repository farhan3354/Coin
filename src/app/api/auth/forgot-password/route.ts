import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail, passwordResetEmailTemplate, generateOTP } from "@/lib/email";

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

  // Generate 6-digit OTP code
  const resetCode = generateOTP();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Invalidate old reset tokens for this user
  await db.passwordReset.updateMany({
    where: { userId: user.id, used: false },
    data: { used: true },
  });

  // Create new reset token
  await db.passwordReset.create({
    data: {
      userId: user.id,
      token: resetCode,
      expiresAt,
    },
  });

  // Send email
  const sent = await sendEmail({
    to: user.email,
    subject: "Reset Your EarnCoin Password",
    html: passwordResetEmailTemplate(user.fullName, resetCode),
  });

  // Log email
  await db.emailLog.create({
    data: {
      to: user.email,
      toName: user.fullName,
      subject: "Reset Your EarnCoin Password",
      body: `Password reset code: ${resetCode}`,
      type: "password-reset",
      status: sent ? "sent" : "failed",
    },
  });

  return NextResponse.json({
    ok: true,
    message: "Password reset code sent to your email",
    userId: user.id,
  });
}
