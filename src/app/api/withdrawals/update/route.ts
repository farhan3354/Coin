import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { id, status, note } = await req.json();
  const w = await db.withdrawal.findUnique({ where: { id } });
  if (!w) return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });

  let refundData = {};
  if (status === "rejected" || status === "cancelled") {
    const user = await db.user.findUnique({ where: { id: w.userId } });
    if (user) {
      const newBalance = user.points + w.pointsUsed;
      refundData = {
        user: { update: { points: newBalance, dollarBalance: newBalance / 1000 } },
      };
      await db.coinHistory.create({ data: { userId: w.userId, activity: `Withdrawal refunded (${w.method})`, pointsEarned: w.pointsUsed, balanceAfter: newBalance } });
    }
  }

  const updated = await db.withdrawal.update({
    where: { id },
    data: { status, processedAt: new Date(), adminNote: note },
  });

  await db.notification.create({
    data: { userId: w.userId, title: `Withdrawal ${status.replace("-", " ")}`, message: `Your ${w.method} withdrawal of $${w.amountUSD.toFixed(2)} is now ${status.replace("-", " ")}.${note ? " Note: " + note : ""}`, type: "withdrawal" },
  });

  // Apply refund if needed
  if (status === "rejected" || status === "cancelled") {
    const user = await db.user.findUnique({ where: { id: w.userId } });
    if (user) {
      await db.user.update({ where: { id: w.userId }, data: { points: user.points + w.pointsUsed, dollarBalance: (user.points + w.pointsUsed) / 1000 } });
    }
  }

  return NextResponse.json({ ok: true, withdrawal: updated });
}
