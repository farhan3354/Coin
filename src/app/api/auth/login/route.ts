import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  // PostgreSQL supports mode: "insensitive" for case-insensitive email match
  const user = await db.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });
  if (!user) return NextResponse.json({ ok: false, message: "No account found with this email" }, { status: 404 });
  if (user.password !== password) return NextResponse.json({ ok: false, message: "Incorrect password" }, { status: 401 });
  if (user.status !== "active") return NextResponse.json({ ok: false, message: "Account suspended" }, { status: 403 });
  const updated = await db.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
  return NextResponse.json({ ok: true, user: updated });
}
