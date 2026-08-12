import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const where = userId ? { userId } : {};
  const withdrawals = await db.withdrawal.findMany({ where, orderBy: { requestedAt: "desc" } });
  return NextResponse.json(withdrawals);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const w = await db.withdrawal.create({ data: body });
  return NextResponse.json(w);
}
