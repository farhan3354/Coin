import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  const { videoId } = await req.json();

  const existing = await db.videoWatch.findUnique({ where: { userId_videoId: { userId: user.id, videoId } } });
  if (existing) return NextResponse.json({ ok: false, message: "Already watched" });

  const video = await db.video.findUnique({ where: { id: videoId } });
  if (!video) return NextResponse.json({ ok: false, message: "Video not found" }, { status: 404 });

  const newBalance = user.points + video.rewardPoints;
  const [updatedUser, ,] = await db.$transaction([
    db.user.update({ where: { id: user.id }, data: { points: newBalance, dollarBalance: newBalance / 1000 } }),
    db.videoWatch.create({ data: { userId: user.id, videoId, rewardPoints: video.rewardPoints } }),
    db.coinHistory.create({ data: { userId: user.id, activity: `Watched Video: ${video.title}`, pointsEarned: video.rewardPoints, balanceAfter: newBalance } }),
  ]);
  await db.video.update({ where: { id: videoId }, data: { totalViews: { increment: 1 } } });

  return NextResponse.json({ ok: true, user: updatedUser });
}
