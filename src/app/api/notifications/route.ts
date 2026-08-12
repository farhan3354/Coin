import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const where = userId ? { userId } : {};
  const notifications = await db.notification.findMany({ where, orderBy: { createdAt: "desc" } });
  return NextResponse.json(notifications);
}
