import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail, generateOTP, passwordResetEmailTemplate } from "@/lib/emailService";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ ok: false, message: "Email is required" }, { status: 400 });
    }

    const user = await db.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });

    if (!user) {
      // Don't reveal if user exists or not for security reasons, just return ok
      return NextResponse.json({ ok: true, message: "If an account exists, a reset code has been sent." });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // Invalidate existing unused tokens for this user
    await db.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    await db.passwordResetToken.create({
      data: {
        token: otp,
        userId: user.id,
        expiresAt,
      },
    });

    let emailSent = false;
    try {
      const { subject, html } = passwordResetEmailTemplate(user.fullName, otp);
      emailSent = await sendEmail(user.email, subject, html);
    } catch (e) {
      console.error("Forgot password email send error:", e);
    }

    await db.emailLog.create({
      data: {
        to: user.email,
        toName: user.fullName,
        subject: `Password Reset Code: ${otp}`,
        body: `Password Reset Code: ${otp}`,
        type: "forgot_password",
        status: emailSent ? "sent" : "failed",
      },
    });

    // Return the OTP in dev mode for easy testing
    const isDev = process.env.NODE_ENV === "development";

    return NextResponse.json({ 
      ok: true, 
      message: "If an account exists, a reset code has been sent.",
      ...(isDev ? { devOtp: otp } : {})
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ ok: false, message: "Failed to process request" }, { status: 500 });
  }
}
