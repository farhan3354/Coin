import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get("businessId");
  const where = businessId ? { businessId } : {};
  const campaigns = await db.businessCampaign.findMany({ where, orderBy: { startDate: "desc" } });
  return NextResponse.json(campaigns);
}
