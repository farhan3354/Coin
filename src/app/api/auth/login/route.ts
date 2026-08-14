import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { sendEmail, otpEmailTemplate, generateOTP } from "@/lib/email";
import { createAuthTokenForUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  let user;
  try {
    user = await db.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });
  } catch (err) {
    // Database unreachable — return a friendly 503 so client can fallback to offline/local mode
    return NextResponse.json({ ok: false, message: "Database unavailable. Try offline mode." }, { status: 503 });
  }

  if (!user) {
    return NextResponse.json(
      { ok: false, message: "No account found with this email" },
      { status: 404 }
    );
  }

  let isPasswordValid = false;
  if (user.password === password) {
    isPasswordValid = true; // Support unhashed seeded users
  } else {
    isPasswordValid = await bcrypt.compare(password, user.password);
  }

  if (!isPasswordValid) {
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

  const token = createAuthTokenForUser({ id: updated.id, role: updated.role });
  const res = NextResponse.json({ ok: true, user: updated });
  // Set httpOnly cookie
  res.cookies.set({ name: "earn_token", value: token, httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 });
  return res;
}
