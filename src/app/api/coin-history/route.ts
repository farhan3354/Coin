import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const where = userId ? { userId } : {};
  const history = await db.coinHistory.findMany({ where, orderBy: { date: "desc" } });
  return NextResponse.json(history);
}
