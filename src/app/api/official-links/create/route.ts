import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function genReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  let code = "ERN";
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function POST(req: NextRequest) {
  const { label, username } = await req.json();
  const exists = await db.user.findFirst({ where: { username: { equals: username, mode: "insensitive" } } });
  if (exists) return NextResponse.json({ ok: false, message: "Username taken" }, { status: 409 });

  const code = genReferralCode();
  const link = await db.officialLink.create({
    data: { label, username, referralCode: code, referralLink: `/?ref=${code}` },
  });
  // Create a placeholder official user
  await db.user.create({
    data: { fullName: label, username, email: `${username}@official.earncoin.com`, password: code, country: "Official", role: "user", referralCode: code, isOfficialLink: true, officialLinkLabel: label, emailVerified: true, deviceFingerprint: `fp_off_${Date.now()}`, browserInfo: "Official Account" },
  });
  return NextResponse.json({ ok: true, link });
}
