import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function GET() {
  const links = await db.officialLink.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(links);
}

export async function DELETE(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'admin') return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 403 });
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ ok: false, message: 'Missing id' }, { status: 400 });
  try {
    await db.officialLink.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, message: 'Delete failed' }, { status: 500 });
  }
}
