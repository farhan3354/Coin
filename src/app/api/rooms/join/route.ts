import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  const { roomId } = await req.json();
  
  // fetch user from DB to get latest state
  const userDb = await db.user.findUnique({ where: { id: user.id } });
  if (!userDb) return NextResponse.json({ ok: false, message: "User not found" }, { status: 404 });
  const userId = user.id;
  const room = await db.room.findUnique({ where: { id: roomId }, include: { participants: true } });
  if (!room) return NextResponse.json({ ok: false, message: "Room not found" }, { status: 404 });
  if (room.participants.some((p) => p.userId === userId)) return NextResponse.json({ ok: true, message: "Already joined" });
  if (userDb.roomLevel < room.level) return NextResponse.json({ ok: false, message: `Need Room Level ${room.level}` });
  if (userDb.roomXP < room.entryPoints) return NextResponse.json({ ok: false, message: `Need ${room.entryPoints} Room XP` });
  if (room.participants.length >= room.seats) return NextResponse.json({ ok: false, message: "Room is full" });
  if (userDb.points < room.entryCost) return NextResponse.json({ ok: false, message: "Not enough points for entry" });

  const newBalance = userDb.points - room.entryCost;
  await db.$transaction([
    db.user.update({ where: { id: userId }, data: { points: newBalance, dollarBalance: newBalance / 1000 } }),
    db.roomParticipant.create({ data: { roomId, userId, score: 0 } }),
    ...(room.entryCost > 0 ? [db.coinHistory.create({ data: { userId, activity: `Joined ${room.name} (entry)`, pointsDeducted: room.entryCost, balanceAfter: newBalance } })] : []),
  ]);

  return NextResponse.json({ ok: true, message: `Joined ${room.name}` });
}
