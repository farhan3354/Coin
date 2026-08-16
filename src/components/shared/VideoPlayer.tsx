"use client";

import { useState, useRef, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, CheckCircle2, Coins, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { Video } from "@/lib/types";

export function VideoPlayer({ video }: { video: Video }) {
  const { currentUserId, watchVideo } = useStore();
  const [watching, setWatching] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [claimed, setClaimed] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!watching) return;
    if (elapsed >= video.watchDurationSec) return;
    const t = setTimeout(() => {
      setElapsed((e) => {
        const next = e + 1;
        if (next >= video.watchDurationSec) {
          setWatching(false);
        }
        return next;
      });
    }, 1000);
    return () => clearTimeout(t);
  }, [watching, elapsed, video.watchDurationSec]);

  const progress = Math.min((elapsed / video.watchDurationSec) * 100, 100);
  const canClaim = elapsed >= video.watchDurationSec && !claimed;

  const handleClaim = () => {
    if (!currentUserId) {
      toast.error("Please login to earn points");
      return;
    }
    const r = watchVideo(video.id);
    if (r.ok) {
      setClaimed(true);
      toast.success(r.message);
    } else {
      toast.error(r.message);
    }
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="aspect-video bg-black relative">
        {video.platform === "youtube" || video.platform === "vimeo" || video.platform === "dailymotion" || video.platform === "facebook" ? (
          <iframe
            src={video.embedUrl}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white p-6 text-center gap-3">
            <Play className="w-12 h-12 opacity-50" />
            <p className="text-sm opacity-80">
              {video.platform.charAt(0).toUpperCase() + video.platform.slice(1)} video — open in new tab to watch, then come back to claim.
            </p>
            <a href={video.url} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="secondary">
                <ExternalLink className="w-4 h-4 mr-2" /> Open Video
              </Button>
            </a>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="capitalize">{video.platform}</Badge>
        </div>
      </div>
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-base line-clamp-2">{video.title}</h3>
          <Badge variant="outline" className="flex items-center gap-1 whitespace-nowrap">
            <Coins className="w-3 h-3 text-primary" />
            +{video.rewardPoints}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">{video.description}</p>

        {!currentUserId ? (
          <Button variant="outline" className="w-full" onClick={() => useStore.getState().openAuth("login")}>
            Login to earn
          </Button>
        ) : claimed ? (
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-green-600 py-2">
            <CheckCircle2 className="w-4 h-4" /> Reward claimed
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Watch {video.watchDurationSec}s to claim</span>
              <span>{elapsed}/{video.watchDurationSec}s</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => setWatching(!watching)}
                disabled={elapsed >= video.watchDurationSec}
              >
                {watching ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                {watching ? "Pause" : elapsed > 0 ? "Resume" : "Start Timer"}
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={handleClaim}
                disabled={!canClaim}
              >
                <Coins className="w-4 h-4 mr-1" /> Claim
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
