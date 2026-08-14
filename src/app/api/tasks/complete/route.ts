import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  const { taskId } = await req.json();
  const task = await db.task.findUnique({ where: { id: taskId } });
  if (!task) return NextResponse.json({ ok: false, message: "Task not found" }, { status: 404 });
  if (task.completed >= task.availability) return NextResponse.json({ ok: false, message: "Task no longer available" });

  // user already authenticated

  const newBalance = user.points + task.rewardPoints;
  const xpGained = Math.floor(task.rewardPoints * 0.5);
  const newXP = user.roomXP + xpGained;
  const xpThresholds = [0, 500, 2000, 5000, 10000];
  let newLevel = user.roomLevel;
  for (let lvl = 5; lvl >= 1; lvl--) {
    if (newXP >= xpThresholds[lvl - 1]) { newLevel = lvl; break; }
  }

  const updated = await db.user.update({
    where: { id: user.id },
    data: { points: newBalance, dollarBalance: newBalance / 1000, roomXP: newXP, roomLevel: newLevel },
  });
  await db.task.update({ where: { id: taskId }, data: { completed: { increment: 1 } } });
  await db.coinHistory.create({ data: { userId: user.id, activity: `Completed Task: ${task.title}`, pointsEarned: task.rewardPoints, balanceAfter: newBalance } });

  if (newLevel > user.roomLevel) {
    await db.notification.create({ data: { userId: user.id, title: "Room Level Up!", message: `You reached Room Level ${newLevel}. New rooms unlocked!`, type: "room" } });
  }

  return NextResponse.json({ ok: true, user: updated, leveledUp: newLevel > user.roomLevel, newLevel });
}
