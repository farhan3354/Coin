import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

function mapTaskInput(body: Record<string, unknown>) {
  return {
    title: String(body.title || ""),
    description: String(body.description || ""),
    type: String(body.type || "visit-website"),
    rewardPoints: Number(body.rewardPoints ?? 10),
    durationMin: Number(body.durationMin ?? 1),
    link: String(body.link || ""),
    availability: Number(body.availability ?? 1000),
    status: String(body.status || "active"),
    hidden: Boolean(body.hidden),
    startTime: body.startTime ? new Date(String(body.startTime)) : null,
    endTime: body.endTime ? new Date(String(body.endTime)) : null,
  };
}

export async function GET() {
  const tasks = await db.task.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== "admin") return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 403 });
  const body = await req.json();
  const task = await db.task.create({ data: mapTaskInput(body) });
  return NextResponse.json(task);
}

export async function DELETE(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'admin') return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 403 });
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ ok: false, message: 'Missing id' }, { status: 400 });
  try {
    await db.task.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, message: 'Delete failed' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'admin') return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 403 });
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ ok: false, message: 'Missing id' }, { status: 400 });
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.hidden !== undefined) data.hidden = Boolean(body.hidden);
  if (body.status !== undefined) data.status = String(body.status);
  if (body.startTime !== undefined) data.startTime = body.startTime ? new Date(String(body.startTime)) : null;
  if (body.endTime !== undefined) data.endTime = body.endTime ? new Date(String(body.endTime)) : null;
  try {
    const updated = await db.task.update({ where: { id }, data });
    return NextResponse.json({ ok: true, data: updated });
  } catch (e) {
    return NextResponse.json({ ok: false, message: 'Update failed' }, { status: 500 });
  }
}
