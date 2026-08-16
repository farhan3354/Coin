import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { id } = await req.json();
  await db.notification.update({ where: { id }, data: { read: true } });
  return NextResponse.json({ ok: true });
}
