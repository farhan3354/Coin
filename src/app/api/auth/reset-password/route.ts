import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json({ ok: false, message: "Email, code, and new password are required" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ ok: false, message: "Password must be at least 6 characters" }, { status: 400 });
    }

    const user = await db.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });

    if (!user) {
      return NextResponse.json({ ok: false, message: "Invalid request" }, { status: 400 });
    }

    const tokenRecord = await db.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        token: code,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!tokenRecord) {
      return NextResponse.json({ ok: false, message: "Invalid or expired reset code" }, { status: 400 });
    }

    // Update password and mark token as used
    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: { password: newPassword },
      }),
      db.passwordResetToken.update({
        where: { id: tokenRecord.id },
        data: { used: true },
      }),
    ]);

    return NextResponse.json({ ok: true, message: "Password has been successfully reset" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ ok: false, message: "Failed to reset password" }, { status: 500 });
  }
}
