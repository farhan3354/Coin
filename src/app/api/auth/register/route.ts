import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail, generateOTP, otpEmailTemplate } from "@/lib/emailService";

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
  const { firstName, lastName, email, phone, password, country, referralCode } = await req.json();
  const ua = req.headers.get("user-agent") || "unknown";

  if (!email || !password || !country) {
    return NextResponse.json({ ok: false, message: "Missing required fields" }, { status: 400 });
  }

  // Check email uniqueness (PostgreSQL supports mode: "insensitive" natively)
  const existing = await db.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });
  if (existing) {
    return NextResponse.json({ ok: false, message: "This email is already registered. Try logging in." }, { status: 409 });
  }

  const fName = (firstName || "").trim();
  const lName = (lastName || "").trim();
  const fullName = `${fName} ${lName}`.trim() || "User";
  // Generate a username just for storage — not unique. Append random suffix for traceability.
  const username = `${(fName + lName).toLowerCase().replace(/[^a-z0-9]/g, "") || "user"}_${Math.random().toString(36).slice(2, 7)}`;
  const fp = genDeviceFingerprint(ua);

  const newReferralCode = genReferralCode();
  const otp = generateOTP();

  let user;
  try {
    user = await db.user.create({
      data: {
        fullName,
        firstName: fName || null,
        lastName: lName || null,
        username,
        email,
        phone: phone || null,
        password,
        country,
        referralCode: newReferralCode,
        referredBy: referralCode || null,
        deviceFingerprint: fp,
        browserInfo: ua,
        ipAddress: req.headers.get("x-forwarded-for") || "0.0.0.0",
      },
    });
  } catch (e: any) {
    if (e?.code === "P2002") {
      // Unique constraint violation (likely email race condition)
      return NextResponse.json({ ok: false, message: "This email is already registered." }, { status: 409 });
    }
    console.error("User create error:", e);
    return NextResponse.json({ ok: false, message: "Failed to create account. Please try again." }, { status: 500 });
  }

  // Send real OTP email
  let emailSent = false;
  try {
    const { subject, html } = otpEmailTemplate(fullName, otp);
    emailSent = await sendEmail(email, subject, html);
  } catch (e) {
    console.error("OTP email send error:", e);
  }

  // Persist OTP in EmailLog so verify-otp can check it
  await db.emailLog.create({
    data: {
      to: email,
      toName: fullName,
      subject: `OTP: ${otp}`,
      body: `OTP code: ${otp}`,
      type: "otp",
      status: emailSent ? "sent" : "failed",
    },
  });

  if (!emailSent) {
    // Still return ok — user can retry. The OTP is in the EmailLog.
    console.warn("OTP email failed to send, but OTP was logged.");
  }

  return NextResponse.json({ ok: true, userId: user.id, email: user.email, referralCode: user.referralCode });
}
