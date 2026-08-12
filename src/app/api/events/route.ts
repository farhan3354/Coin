import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const events = await db.event.findMany({ orderBy: { startTime: "desc" }, include: { participants: true } });
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const event = await db.event.create({ data: body });
  return NextResponse.json(event);
}
