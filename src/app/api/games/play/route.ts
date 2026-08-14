import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  const { gameName, gameType, entryFee, result } = await req.json();

  let pointsChange = 0;
  if (gameType === "coin") {
    if (user.points < entryFee) return NextResponse.json({ ok: false, message: "Not enough coins" });
    if (result === "win") pointsChange = entryFee;
    else if (result === "loss") pointsChange = -entryFee;
  }

  const newBalance = user.points + pointsChange;
  await db.$transaction([
    db.user.update({ where: { id: user.id }, data: { points: newBalance, dollarBalance: newBalance / 1000 } }),
    db.gameResult.create({ data: { userId: user.id, username: user.username, gameName, gameType, entryFee, result, pointsChange } }),
    ...(pointsChange !== 0 ? [db.coinHistory.create({ data: { userId: user.id, activity: `Game: ${gameName} (${result})`, pointsEarned: pointsChange > 0 ? pointsChange : 0, pointsDeducted: pointsChange < 0 ? Math.abs(pointsChange) : 0, balanceAfter: newBalance } })] : []),
  ]);

  return NextResponse.json({ ok: true, user: { ...user, points: newBalance } });
}
