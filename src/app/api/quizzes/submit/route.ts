import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { userId, quizId, answers } = await req.json();
    if (!userId || !quizId || !Array.isArray(answers)) {
      return NextResponse.json({ ok: false, message: "Missing userId, quizId, or answers" }, { status: 400 });
    }

    // Fetch quiz with questions (to check correct answers)
    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });
    if (!quiz) return NextResponse.json({ ok: false, message: "Quiz not found" }, { status: 404 });
    if (quiz.status !== "active") {
      return NextResponse.json({ ok: false, message: "Quiz is not active" }, { status: 400 });
    }

    // Check if user already attempted
    const existing = await db.quizAttempt.findUnique({
      where: { userId_quizId: { userId, quizId } },
    });
    if (existing) {
      return NextResponse.json({ ok: false, message: "You have already taken this quiz." }, { status: 400 });
    }

    // Calculate score
    let earnedPoints = 0;
    let totalPoints = 0;
    for (const q of quiz.questions) {
      totalPoints += q.points;
      const userAnswer = answers.find((a: any) => a.questionId === q.id);
      if (userAnswer && userAnswer.selectedIndex === q.correctIndex) {
        earnedPoints += q.points;
      }
    }

    const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = percentage >= quiz.passScore;
    const pointsToCredit = passed ? quiz.rewardPoints : Math.floor(quiz.rewardPoints * (percentage / 100) * 0.3);

    // Create attempt record
    const attempt = await db.quizAttempt.create({
      data: {
        userId,
        quizId,
        score: earnedPoints,
        totalPoints,
        passed,
        pointsEarned: pointsToCredit,
      },
    });

    // Credit points to user if earned any
    if (pointsToCredit > 0) {
      const updated = await db.user.update({
        where: { id: userId },
        data: { points: { increment: pointsToCredit } },
      });
      await db.coinHistory.create({
        data: {
          userId,
          activity: `Quiz: ${quiz.title} (${percentage}%)`,
          pointsEarned: pointsToCredit,
          balanceAfter: updated.points,
          date: new Date(),
        },
      });
      await db.notification.create({
        data: {
          userId,
          title: passed ? "Quiz Passed! 🎉" : "Quiz Completed",
          message: `You scored ${percentage}% on "${quiz.title}" and earned ${pointsToCredit} points.`,
          type: "announcement",
        },
      });
    }

    return NextResponse.json({
      ok: true,
      attempt,
      score: earnedPoints,
      totalPoints,
      percentage,
      passed,
      pointsEarned: pointsToCredit,
    });
  } catch (e) {
    console.error("POST /api/quizzes/submit error:", e);
    return NextResponse.json({ ok: false, message: "Failed to submit quiz" }, { status: 500 });
  }
}
