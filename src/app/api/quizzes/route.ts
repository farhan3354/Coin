import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const quizzes = await db.quiz.findMany({
      where: { status: "active" },
      include: { questions: true },
      orderBy: { createdAt: "desc" },
    });
    // Don't expose correctIndex to the client
    const safe = quizzes.map((q) => ({
      id: q.id,
      title: q.title,
      description: q.description,
      category: q.category,
      rewardPoints: q.rewardPoints,
      passScore: q.passScore,
      timeLimitMin: q.timeLimitMin,
      status: q.status,
      createdAt: q.createdAt,
      questionCount: q.questions.length,
    }));
    return NextResponse.json(safe);
  } catch (e) {
    console.error("GET /api/quizzes error:", e);
    return NextResponse.json({ error: "Failed to fetch quizzes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, category, rewardPoints, passScore, timeLimitMin, questions } = body;

    if (!title || !description || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ ok: false, message: "Missing required fields" }, { status: 400 });
    }

    // Validate each question
    for (const q of questions) {
      if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || typeof q.correctIndex !== "number") {
        return NextResponse.json({ ok: false, message: "Each question needs text, 4 options, and correctIndex" }, { status: 400 });
      }
    }

    const quiz = await db.quiz.create({
      data: {
        title,
        description,
        category: category || "",
        rewardPoints: Number(rewardPoints) || 20,
        passScore: Number(passScore) || 60,
        timeLimitMin: Number(timeLimitMin) || 5,
        status: "active",
        questions: {
          create: questions.map((q: any) => ({
            question: q.question,
            options: JSON.stringify(q.options),
            correctIndex: Number(q.correctIndex),
            points: Number(q.points) || 1,
          })),
        },
      },
      include: { questions: true },
    });

    return NextResponse.json({ ok: true, quiz });
  } catch (e) {
    console.error("POST /api/quizzes error:", e);
    return NextResponse.json({ ok: false, message: "Failed to create quiz" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ ok: false, message: "Missing id" }, { status: 400 });
    await db.quiz.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/quizzes error:", e);
    return NextResponse.json({ ok: false, message: "Failed to delete quiz" }, { status: 500 });
  }
}
