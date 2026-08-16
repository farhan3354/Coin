import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const links = await db.officialLink.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(links);
}
