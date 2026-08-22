"use client";

import { useState, useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Coins, Lock, CheckCircle2, ArrowLeft, ExternalLink, Clock, AlertCircle } from "lucide-react";
import { formatPoints } from "@/lib/mockData";
import { toast } from "sonner";

const taskTypeLabels: Record<string, string> = {
  "subscribe": "Subscribe",
  "like": "Like",
  "follow": "Follow",
  "comment": "Comment",
  "share": "Share",
  "report": "Report",
};

export function TaskWatchPage({ taskId }: { taskId: string }) {
  const { tasks, currentUserId, users, completeTask, hasCompletedTask, openAuth, setView } = useStore();
  const task = tasks.find((t) => t.id === taskId);
  const user = users.find((u) => u.id === currentUserId) || null;

  const [hasStarted, setHasStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [claimed, setClaimed] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Default duration for social tasks is 15 seconds if durationMin is not appropriate
  // We'll use 15 seconds for verification.
  const verifyDurationSec = 15;

  // Check if already completed
  const alreadyCompleted = user ? hasCompletedTask(user.id, taskId) : false;

  useEffect(() => {
    if (!task || claimed || alreadyCompleted || !hasStarted) return;
    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        if (prev + 1 >= verifyDurationSec) {
          if (timerRef.current) clearInterval(timerRef.current);
          return verifyDurationSec;
        }
        return prev + 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [task, claimed, alreadyCompleted, hasStarted, verifyDurationSec]);

  if (!task) {
    return (
      <div className="min-h-screen grid place-items-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <h1 className="text-xl font-bold mb-2">Task not found</h1>
            <p className="text-muted-foreground mb-4">This task may have been removed or loading.</p>
            <Button onClick={() => { if (typeof window !== "undefined") window.close(); }}>Close Tab</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = Math.min((elapsed / verifyDurationSec) * 100, 100);
  const timerComplete = elapsed >= verifyDurationSec;
  const isClaimed = claimed || alreadyCompleted;
  const canClaim = timerComplete && !isClaimed && !!user;

  const handleOpenLink = () => {
    if (task.link && task.link !== "#") {
      window.open(task.link, "_blank", "noopener,noreferrer");
    }
    setHasStarted(true);
  };

  const handleClaim = () => {
    if (!user) {
      toast.error("Please login to claim your reward");
      return;
    }
    setClaiming(true);
    setTimeout(() => {
      const r = completeTask(task.id);
      setClaiming(false);
      if (r.ok) {
        setClaimed(true);
        toast.success(r.message);
        // Auto-close after 2.5 seconds
        setTimeout(() => {
          if (typeof window !== "undefined") {
            window.close();
            setView("tasks");
          }
        }, 2500);
      } else {
        toast.error(r.message);
      }
    }, 500);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => {
              if (typeof window !== "undefined") {
                if (window.history.length > 1) window.history.back();
                else window.close();
              }
            }}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <span className="text-sm font-semibold">EarnCoin Task Verification</span>
          </div>
          <Badge variant="secondary" className="capitalize">{taskTypeLabels[task.type] || task.type}</Badge>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        {/* Task title */}
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-bold">{task.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
        </div>

        {/* Task Action Card */}
        <Card className="overflow-hidden mb-4">
          <div className="w-full h-48 bg-muted flex flex-col items-center justify-center p-6 text-center gap-4">
            <ExternalLink className="w-12 h-12 opacity-50" />
            <p className="text-sm opacity-80">
              Click below to open the profile/content in a new tab, perform the {taskTypeLabels[task.type] || "action"}, and return here.
            </p>
            <Button size="lg" onClick={handleOpenLink} disabled={hasStarted && isClaimed}>
              <ExternalLink className="w-4 h-4 mr-2" /> Open Link & Start Verification
            </Button>
          </div>
        </Card>

        {/* Timer + reward section */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <span className="font-semibold">Verification Timer</span>
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                <Coins className="w-3 h-3 text-primary" />
                Reward: +{task.rewardPoints} pts
              </Badge>
            </div>

            {!user ? (
              <div className="text-center py-6">
                <Lock className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="font-medium mb-2">Login required to earn rewards</p>
                <p className="text-sm text-muted-foreground mb-4">You need to be logged in to claim the task reward.</p>
                <Button onClick={() => openAuth("login")}>Login Now</Button>
              </div>
            ) : isClaimed ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 mx-auto text-green-600 mb-3" />
                <p className="font-bold text-lg text-green-600 mb-1">Reward Claimed!</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {alreadyCompleted
                    ? "You already completed this task and claimed the reward."
                    : `${task.rewardPoints} points have been credited to your account.`}
                </p>
                <Button onClick={() => {
                  if (typeof window !== "undefined") {
                    window.close();
                    setView("tasks");
                  }
                }}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tasks
                </Button>
              </div>
            ) : !hasStarted ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">Click the "Open Link & Start Verification" button above to start the timer.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Timer display */}
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">
                    {timerComplete ? "Timer complete!" : "Verifying your action..."}
                  </span>
                  <span className="font-mono font-bold text-lg tabular-nums">
                    {formatTime(elapsed)} / {formatTime(verifyDurationSec)}
                  </span>
                </div>
                <Progress value={progress} className="h-3" />

                {/* Claim button — appears only after timer completes */}
                <div className="pt-2">
                  {!timerComplete ? (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-3">
                      <Lock className="w-4 h-4" />
                      Reward button unlocks in {formatTime(verifyDurationSec - elapsed)}
                    </div>
                  ) : (
                    <Button
                      size="lg"
                      className="w-full text-base font-bold bg-green-600 hover:bg-green-700 text-white"
                      onClick={handleClaim}
                      disabled={!canClaim || claiming}
                    >
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      {claiming ? "Verifying..." : `Verify & Claim ${task.rewardPoints} Coins`}
                    </Button>
                  )}
                </div>

                {/* Info note */}
                <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-3">
                  <p className="flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>
                      Please make sure you performed the required action ({taskTypeLabels[task.type] || task.type}). The reward button appears after the verification timer finishes.
                    </span>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User balance display */}
        {user && (
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground px-2">
            <span>Your balance: <strong className="text-foreground">{formatPoints(user.points)} points</strong></span>
            <span>USD: <strong className="text-green-600">${(user.points / 1000).toFixed(2)}</strong></span>
          </div>
        )}
      </main>
    </div>
  );
}
