import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const where = userId ? { userId } : {};
  const results = await db.gameResult.findMany({ where, orderBy: { playedAt: "desc" } });
  return NextResponse.json(results);
}
