import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { userId, gameName, gameType, entryFee, result } = await req.json();
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ ok: false, message: "User not found" }, { status: 404 });

  let pointsChange = 0;
  if (gameType === "coin") {
    if (user.points < entryFee) return NextResponse.json({ ok: false, message: "Not enough coins" });
    if (result === "win") pointsChange = entryFee;
    else if (result === "loss") pointsChange = -entryFee;
  }

  const newBalance = user.points + pointsChange;
  await db.$transaction([
    db.user.update({ where: { id: userId }, data: { points: newBalance, dollarBalance: newBalance / 1000 } }),
    db.gameResult.create({ data: { userId, username: user.username, gameName, gameType, entryFee, result, pointsChange } }),
    ...(pointsChange !== 0 ? [db.coinHistory.create({ data: { userId, activity: `Game: ${gameName} (${result})`, pointsEarned: pointsChange > 0 ? pointsChange : 0, pointsDeducted: pointsChange < 0 ? Math.abs(pointsChange) : 0, balanceAfter: newBalance } })] : []),
  ]);

  return NextResponse.json({ ok: true, user: { ...user, points: newBalance } });
}
