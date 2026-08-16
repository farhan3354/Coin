import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail, generateOTP, otpEmailTemplate } from "@/lib/emailService";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ ok: false, message: "Missing email" }, { status: 400 });
  }

  const user = await db.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });

  if (!user) {
    return NextResponse.json({ ok: false, message: "User not found" }, { status: 404 });
  }

  if (user.emailVerified) {
    return NextResponse.json({ ok: false, message: "Email is already verified" }, { status: 400 });
  }

  const otp = generateOTP();
  
  let emailSent = false;
  try {
    const { subject, html } = otpEmailTemplate(user.fullName, otp);
    emailSent = await sendEmail(user.email, subject, html);
  } catch (e) {
    console.error("Resend OTP email send error:", e);
  }

  await db.emailLog.create({
    data: {
      to: user.email,
      toName: user.fullName,
      subject: `OTP: ${otp}`,
      body: `OTP code: ${otp}`,
      type: "otp",
      status: emailSent ? "sent" : "failed",
    },
  });

  return NextResponse.json({ ok: true, message: "A new OTP has been sent to your email." });
}
