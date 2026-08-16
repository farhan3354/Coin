import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET a single quiz with its questions (for the user to take)
// Accepts id as path param: /api/quizzes/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const quiz = await db.quiz.findUnique({
      where: { id },
      include: { questions: true },
    });
    if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

    // Hide correctIndex from client — send options + question id only
    const safe = {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
      rewardPoints: quiz.rewardPoints,
      passScore: quiz.passScore,
      timeLimitMin: quiz.timeLimitMin,
      questions: quiz.questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: JSON.parse(q.options),
        points: q.points,
      })),
    };
    return NextResponse.json(safe);
  } catch (e) {
    console.error("GET /api/quizzes/[id] error:", e);
    return NextResponse.json({ error: "Failed to fetch quiz" }, { status: 500 });
  }
}
