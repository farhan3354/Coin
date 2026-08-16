import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { userId, roomId } = await req.json();
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ ok: false, message: "User not found" }, { status: 404 });
  const room = await db.room.findUnique({ where: { id: roomId }, include: { participants: true } });
  if (!room) return NextResponse.json({ ok: false, message: "Room not found" }, { status: 404 });
  if (room.participants.some((p) => p.userId === userId)) return NextResponse.json({ ok: true, message: "Already joined" });
  if (user.roomLevel < room.level) return NextResponse.json({ ok: false, message: `Need Room Level ${room.level}` });
  if (user.roomXP < room.entryPoints) return NextResponse.json({ ok: false, message: `Need ${room.entryPoints} Room XP` });
  if (room.participants.length >= room.seats) return NextResponse.json({ ok: false, message: "Room is full" });
  if (user.points < room.entryCost) return NextResponse.json({ ok: false, message: "Not enough points for entry" });

  // Check task completion requirement
  if (room.tasksRequired > 0) {
    const taskCompletions = await db.coinHistory.count({
      where: { userId, activity: { startsWith: "Completed Task:" } },
    });
    if (taskCompletions < room.tasksRequired) {
      return NextResponse.json({
        ok: false,
        message: `You need to complete ${room.tasksRequired} tasks to join this room. You have completed ${taskCompletions} so far. Complete ${room.tasksRequired - taskCompletions} more task(s) to unlock.`,
      }, { status: 403 });
    }
  }

  const newBalance = user.points - room.entryCost;
  await db.$transaction([
    db.user.update({ where: { id: userId }, data: { points: newBalance, dollarBalance: newBalance / 1000 } }),
    db.roomParticipant.create({ data: { roomId, userId, score: 0 } }),
    ...(room.entryCost > 0 ? [db.coinHistory.create({ data: { userId, activity: `Joined ${room.name} (entry)`, pointsDeducted: room.entryCost, balanceAfter: newBalance } })] : []),
  ]);

  return NextResponse.json({ ok: true, message: `Joined ${room.name}` });
}
