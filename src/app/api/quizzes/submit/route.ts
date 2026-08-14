import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  const { quizId, answers } = await req.json();

  // Load quiz from file fallback (same path as other route)
  try {
    const p = require("path");
    const fs = require("fs");
    const file = p.join(process.cwd(), "data", "quizzes.json");
    const raw = fs.readFileSync(file, "utf8");
    const quizzes = JSON.parse(raw || "[]");
    const quiz = quizzes.find((q: any) => q.id === quizId);
    if (!quiz) return NextResponse.json({ ok: false, message: "Quiz not found" }, { status: 404 });

    // compute score
    let score = 0;
    if (Array.isArray(quiz.questions) && Array.isArray(answers)) {
      for (let i = 0; i < quiz.questions.length; i++) {
        const q = quiz.questions[i];
        if (q && typeof q.correctIndex === "number" && answers[i] === q.correctIndex) score++;
      }
    }
    const awarded = Math.round((score / (quiz.questions?.length || 1)) * (quiz.rewardPoints || 0));

    // Try to update DB user points; if DB unreachable, return awarded so client can apply locally
    try {
      const newBalance = (user.points || 0) + awarded;
      const updated = await db.user.update({ where: { id: user.id }, data: { points: newBalance, dollarBalance: newBalance / 1000 } });
      return NextResponse.json({ ok: true, awarded, user: updated });
    } catch (e) {
      return NextResponse.json({ ok: true, awarded, user: null });
    }
  } catch (e) {
    return NextResponse.json({ ok: false, message: "Failed to process quiz" }, { status: 500 });
  }
}
