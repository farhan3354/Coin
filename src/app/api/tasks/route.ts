import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const tasks = await db.task.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, type, rewardPoints, durationMin, link, availability, status } = body;

    if (!title || !description || !type) {
      return NextResponse.json({ ok: false, message: "Title, description, and type are required" }, { status: 400 });
    }

    const task = await db.task.create({
      data: {
        title,
        description,
        type,
        rewardPoints: rewardPoints || 10,
        durationMin: durationMin || 1,
        link: link || "",
        availability: availability || 1000,
        status: status || "active",
      },
    });
    return NextResponse.json({ ok: true, task });
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json({ ok: false, message: "Failed to create task" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, description, type, rewardPoints, durationMin, link, availability, status } = body;

    if (!id) {
      return NextResponse.json({ ok: false, message: "Task ID is required" }, { status: 400 });
    }

    const task = await db.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(type !== undefined && { type }),
        ...(rewardPoints !== undefined && { rewardPoints: Number(rewardPoints) }),
        ...(durationMin !== undefined && { durationMin: Number(durationMin) }),
        ...(link !== undefined && { link }),
        ...(availability !== undefined && { availability: Number(availability) }),
        ...(status !== undefined && { status }),
      },
    });
    return NextResponse.json({ ok: true, task });
  } catch (error) {
    console.error("Update task error:", error);
    return NextResponse.json({ ok: false, message: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ ok: false, message: "Task ID is required" }, { status: 400 });
    }

    await db.task.delete({ where: { id } });
    return NextResponse.json({ ok: true, message: "Task deleted" });
  } catch (error) {
    console.error("Delete task error:", error);
    return NextResponse.json({ ok: false, message: "Failed to delete task" }, { status: 500 });
  }
}

