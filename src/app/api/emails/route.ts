import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const logs = await db.emailLog.findMany({ orderBy: { sentAt: "desc" }, take: 200 });
  return NextResponse.json(logs);
}
