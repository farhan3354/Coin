import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== "admin") return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 403 });
  const { id, status, note } = await req.json();
  const w = await db.withdrawal.findUnique({ where: { id } });
  if (!w) return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });

  if (status === "rejected" || status === "cancelled") {
    const userDb = await db.user.findUnique({ where: { id: w.userId } });
    if (userDb) {
      const newBalance = userDb.points + w.pointsUsed;
      await db.coinHistory.create({ data: { userId: w.userId, activity: `Withdrawal refunded (${w.method})`, pointsEarned: w.pointsUsed, balanceAfter: newBalance } });
      await db.user.update({ where: { id: w.userId }, data: { points: newBalance, dollarBalance: newBalance / 1000 } });
    }
  }

  const updated = await db.withdrawal.update({ where: { id }, data: { status, processedAt: new Date(), adminNote: note } });

  await db.notification.create({ data: { userId: w.userId, title: `Withdrawal ${status.replace("-", " ")}`, message: `Your ${w.method} withdrawal of $${w.amountUSD.toFixed(2)} is now ${status.replace("-", " ")}.${note ? " Note: " + note : ""}`, type: "withdrawal" } });

  return NextResponse.json({ ok: true, withdrawal: updated });
}
