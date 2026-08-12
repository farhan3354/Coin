import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  let settings = await db.settings.findUnique({ where: { id: "singleton" } });
  if (!settings) {
    settings = await db.settings.create({ data: { id: "singleton" } });
  }
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const settings = await db.settings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...body },
    update: body,
  });
  return NextResponse.json(settings);
}
