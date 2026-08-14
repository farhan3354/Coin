import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  const { method, amountUSD, accountDetails } = await req.json();
  const settings = await db.settings.findUnique({ where: { id: "singleton" } });
  const userDb = await db.user.findUnique({ where: { id: user.id } });
  if (!userDb) return NextResponse.json({ ok: false, message: "User not found" }, { status: 404 });
  if (amountUSD < (settings?.minWithdrawal ?? 1)) return NextResponse.json({ ok: false, message: "Below minimum" });
  if (amountUSD > (settings?.maxWithdrawal ?? 500)) return NextResponse.json({ ok: false, message: "Above maximum" });
  const pointsNeeded = Math.ceil(amountUSD * (settings?.pointsPerDollar ?? 1000));
  if (user.points < pointsNeeded) return NextResponse.json({ ok: false, message: "Not enough points" });

  const w = await db.withdrawal.create({ data: { userId: user.id, username: userDb.username, amountUSD, pointsUsed: pointsNeeded, method, accountDetails, status: "pending" } });
  const newBalance = userDb.points - pointsNeeded;
  await db.$transaction([
    db.user.update({ where: { id: user.id }, data: { points: newBalance, dollarBalance: newBalance / 1000 } }),
    db.coinHistory.create({ data: { userId: user.id, activity: `Withdrawal request (${method})`, pointsDeducted: pointsNeeded, balanceAfter: newBalance } }),
    db.notification.create({ data: { userId: user.id, title: "Withdrawal Requested", message: `Your ${method} withdrawal of $${amountUSD.toFixed(2)} is pending review.`, type: "withdrawal" } }),
  ]);

  return NextResponse.json({ ok: true, withdrawal: w });
}
