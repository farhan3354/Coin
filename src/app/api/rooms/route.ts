import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const rooms = await db.room.findMany({ orderBy: { level: "asc" }, include: { participants: true } });
  return NextResponse.json(rooms);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const room = await db.room.create({ data: body });
  return NextResponse.json(room);
}
