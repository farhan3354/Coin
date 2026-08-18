import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const videos = await db.video.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(videos);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, url, platform, rewardPoints, watchDurationSec, category, status, addedBy, thumbnail, embedUrl } = body;

    if (!title || !description || !url || !platform) {
      return NextResponse.json({ ok: false, message: "Title, description, URL, and platform are required" }, { status: 400 });
    }

    const video = await db.video.create({
      data: {
        title,
        description,
        url,
        platform,
        embedUrl: embedUrl || "",
        thumbnail: thumbnail || "",
        rewardPoints: rewardPoints || 10,
        watchDurationSec: watchDurationSec || 30,
        category: category || "",
        status: status || "active",
        addedBy: addedBy || "admin",
      },
    });
    return NextResponse.json({ ok: true, video });
  } catch (error) {
    console.error("Create video error:", error);
    return NextResponse.json({ ok: false, message: "Failed to create video" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ ok: false, message: "Video ID is required" }, { status: 400 });
    }

    // Delete related watches first to avoid foreign key constraint errors
    await db.videoWatch.deleteMany({ where: { videoId: id } });
    await db.video.delete({ where: { id } });
    return NextResponse.json({ ok: true, message: "Video deleted" });
  } catch (error) {
    console.error("Delete video error:", error);
    return NextResponse.json({ ok: false, message: "Failed to delete video" }, { status: 500 });
  }
}
