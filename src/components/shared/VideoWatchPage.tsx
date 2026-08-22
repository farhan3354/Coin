"use client";

import { useState, useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Coins, Lock, CheckCircle2, ArrowLeft, ExternalLink, Clock, AlertCircle, Play } from "lucide-react";
import { buildEmbedUrl, formatPoints } from "@/lib/mockData";
import { toast } from "sonner";

export function VideoWatchPage({ videoId }: { videoId: string }) {
  const { videos, currentUserId, users, watchVideo, hasWatchedVideo, openAuth, setView, dbLoaded } = useStore();
  const video = videos.find((v) => v.id === videoId);
  const user = users.find((u) => u.id === currentUserId) || null;

  const [hasStarted, setHasStarted] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [claimed, setClaimed] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Show loading spinner until video data is available or store is loaded
    if (!video && !dbLoaded) {
      const t = setTimeout(() => setLoading(true), 200);
      return () => clearTimeout(t);
    }
    setLoading(false);
  }, [video, dbLoaded]);

  // Check if already watched
  const alreadyWatched = user ? hasWatchedVideo(user.id, videoId) : false;

  // Start the timer when the user clicks the start button
  useEffect(() => {
    if (!video || claimed || alreadyWatched || !videoReady) return;
    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        if (prev + 1 >= video.watchDurationSec) {
          if (timerRef.current) clearInterval(timerRef.current);
          return video.watchDurationSec;
        }
        return prev + 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [video, claimed, alreadyWatched, videoReady]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center p-4 bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading video...</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen grid place-items-center p-4 bg-background">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <h1 className="text-xl font-bold mb-2">Video not found</h1>
            <p className="text-muted-foreground mb-4">This video may have been removed.</p>
            <Button onClick={() => { if (typeof window !== "undefined") window.close(); }}>Close Tab</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = Math.min((elapsed / video.watchDurationSec) * 100, 100);
  const timerComplete = elapsed >= video.watchDurationSec;
  // Consider it claimed if either the user just claimed it OR they already watched it before
  const isClaimed = claimed || alreadyWatched;
  const canClaim = timerComplete && !isClaimed && !!user;

  const handleClaim = () => {
    if (!user) {
      toast.error("Please login to claim your reward");
      return;
    }
    setClaiming(true);
    setTimeout(() => {
      const r = watchVideo(video.id);
      setClaiming(false);
      if (r.ok) {
        setClaimed(true);
        toast.success(r.message);
        // Auto-close after 2.5 seconds, or show close button
        setTimeout(() => {
          if (typeof window !== "undefined") {
            window.close();
            // Fallback if window.close doesn't work (tab not opened by script)
            setView("videos");
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
            <span className="text-sm font-semibold">EarnCoin Video Player</span>
          </div>
          <Badge variant="secondary" className="capitalize">{video.platform}</Badge>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        {/* Video title */}
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-bold">{video.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{video.description}</p>
        </div>

        {/* Video player — only this video plays */}
        <Card className="overflow-hidden mb-4">
          <div className="aspect-video bg-black relative">
            {!hasStarted && !isClaimed ? (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 text-white p-6 text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                    <Play className="w-8 h-8 text-primary ml-1" />
                  </div>
                  <h2 className="text-xl font-bold">Ready to watch?</h2>
                  <p className="text-sm opacity-80">
                    Click the button below to start the video.
                  </p>
                  <Button size="lg" className="mt-2" onClick={() => setHasStarted(true)}>
                    Start Video
                  </Button>
                </div>
              ) : null}
              {/* Loading indicator while the iframe is initializing */}
              {hasStarted && !videoReady && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 text-white p-4 text-center gap-2">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm">Preparing video, please wait...</p>
                </div>
              )}
            
            {hasStarted || isClaimed ? (
              video.platform === "youtube" || video.platform === "vimeo" || video.platform === "dailymotion" || video.platform === "facebook" ? (
                <iframe
                    src={buildEmbedUrl(video.url, video.platform, true)}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                    onLoad={() => setVideoReady(true)}
                  />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white p-6 text-center gap-4">
                    <ExternalLink className="w-12 h-12 opacity-50" />
                    <p className="text-sm opacity-80 capitalize">
                      {video.platform} video — click below to open in new tab, then return here to claim your reward.
                    </p>
                    <a href={video.url} target="_blank" rel="noopener noreferrer" onClick={() => setVideoReady(true)}>
                      <Button size="sm" variant="secondary">
                        <ExternalLink className="w-4 h-4 mr-2" /> Open {video.platform} Video
                      </Button>
                    </a>
                  </div>
              )
            ) : null}
          </div>
        </Card>

        {/* Timer + reward section */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <span className="font-semibold">Watch Timer</span>
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                <Coins className="w-3 h-3 text-primary" />
                Reward: +{video.rewardPoints} pts
              </Badge>
            </div>

            {!user ? (
              <div className="text-center py-6">
                <Lock className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="font-medium mb-2">Login required to earn rewards</p>
                <p className="text-sm text-muted-foreground mb-4">You need to be logged in to claim the video reward.</p>
                <Button onClick={() => openAuth("login")}>Login Now</Button>
              </div>
            ) : isClaimed ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 mx-auto text-green-600 mb-3" />
                <p className="font-bold text-lg text-green-600 mb-1">Reward Claimed!</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {alreadyWatched
                    ? "You already watched this video and claimed the reward."
                    : `${video.rewardPoints} points have been credited to your account.`}
                </p>
                <Button onClick={() => {
                  if (typeof window !== "undefined") {
                    window.close();
                    setView("videos");
                  }
                }}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Videos
                </Button>
              </div>
            ) : !hasStarted ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">Click the "Start Video & Timer" button on the video player to begin.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Timer display */}
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">
                    {timerComplete ? "Timer complete!" : "Watch until the timer finishes"}
                  </span>
                  <span className="font-mono font-bold text-lg tabular-nums">
                    {formatTime(elapsed)} / {formatTime(video.watchDurationSec)}
                  </span>
                </div>
                <Progress value={progress} className="h-3" />

                {/* Claim button — appears only after timer completes */}
                <div className="pt-2">
                  {!timerComplete ? (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-3">
                      <Lock className="w-4 h-4" />
                      Reward button unlocks in {formatTime(video.watchDurationSec - elapsed)}
                    </div>
                  ) : (
                    <Button
                      size="lg"
                      className="w-full text-base font-bold"
                      onClick={handleClaim}
                      disabled={!canClaim || claiming}
                    >
                      <Coins className="w-5 h-5 mr-2" />
                      {claiming ? "Crediting..." : `Claim ${video.rewardPoints} Coins`}
                    </Button>
                  )}
                </div>

                {/* Info note */}
                <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-3">
                  <p className="flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>
                      You must keep this tab open until the timer finishes. The reward button will appear only after {formatTime(video.watchDurationSec)} of watching. Even if the actual video is longer, only the required timer needs to complete.
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
