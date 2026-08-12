import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail, otpEmailTemplate, generateOTP } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const user = await db.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });

  if (!user) {
    return NextResponse.json(
      { ok: false, message: "No account found with this email" },
      { status: 404 }
    );
  }

  if (user.password !== password) {
    return NextResponse.json(
      { ok: false, message: "Incorrect password" },
      { status: 401 }
    );
  }

  if (user.status !== "active") {
    return NextResponse.json(
      { ok: false, message: "Account suspended. Please contact support." },
      { status: 403 }
    );
  }

  // If email not verified, resend OTP and ask them to verify first
  if (!user.emailVerified) {
    // Invalidate old OTPs and send a new one
    await db.emailVerification.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await db.emailVerification.create({
      data: { userId: user.id, code: otp, expiresAt },
    });
    await sendEmail({
      to: user.email,
      subject: "Verify Your EarnCoin Email",
      html: otpEmailTemplate(user.fullName, otp),
    });

    return NextResponse.json({
      ok: false,
      unverified: true,
      userId: user.id,
      email: user.email,
      message: "Please verify your email first. A new OTP has been sent to your email.",
    }, { status: 200 });
  }

  const updated = await db.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  return NextResponse.json({ ok: true, user: updated });
}
