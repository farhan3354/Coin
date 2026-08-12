import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail, passwordChangedEmailTemplate } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { userId, code, newPassword } = await req.json();

  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json(
      { ok: false, message: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  // Find valid reset token
  const resetRecord = await db.passwordReset.findFirst({
    where: {
      userId,
      token: code,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!resetRecord) {
    return NextResponse.json(
      { ok: false, message: "Invalid or expired reset code" },
      { status: 400 }
    );
  }

  // Mark token as used
  await db.passwordReset.update({
    where: { id: resetRecord.id },
    data: { used: true },
  });

  // Update password
  const user = await db.user.update({
    where: { id: userId },
    data: { password: newPassword },
  });

  // Send confirmation email
  await sendEmail({
    to: user.email,
    subject: "Your EarnCoin Password Has Been Changed",
    html: passwordChangedEmailTemplate(user.fullName),
  });

  await db.emailLog.create({
    data: {
      to: user.email,
      toName: user.fullName,
      subject: "Password Changed",
      body: "Password changed confirmation",
      type: "password-changed",
      status: "sent",
    },
  });

  return NextResponse.json({ ok: true, message: "Password reset successfully. You can now login." });
}
