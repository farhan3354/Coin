import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  const n = await db.notification.findUnique({ where: { id } });
  if (!n || n.userId !== user.id) return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });
  await db.notification.update({ where: { id }, data: { read: true } });
  return NextResponse.json({ ok: true });
}
