"use client";

import { useEffect, useState } from "react";
import { useStore, useCurrentUser } from "@/lib/store";
import { syncFromDatabase } from "@/lib/dbSync";
import { VideoWatchPage } from "@/components/shared/VideoWatchPage";
import { Home } from "@/components/public/Pages";

export default function Page() {
  const { currentUserId, openAuth, dbLoaded } = useStore();
  const user = useCurrentUser();

  // Sync data from database on mount
  useEffect(() => {
    if (!dbLoaded) {
      syncFromDatabase();
    }
  }, [dbLoaded]);

  // Check for ?watch=VIDEO_ID URL parameter (video opened in new tab)
  const [watchVideoId, setWatchVideoId] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const id = params.get("watch");
    setWatchVideoId(id);
  }, []);

  // Handle referral code in URL on first load
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (watchVideoId) return; // Skip on watch page
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      try {
        sessionStorage.setItem("pendingRef", ref);
      } catch {}
      const url = new URL(window.location.href);
      url.searchParams.delete("ref");
      window.history.replaceState({}, "", url.toString());
      if (!currentUserId) {
        setTimeout(() => openAuth("register"), 500);
      }
    }
  }, [currentUserId, openAuth, watchVideoId]);

  // If this is a video watch page (new tab), render only the watch page
  if (watchVideoId) {
    return <VideoWatchPage videoId={watchVideoId} />;
  }

  // Show loading screen while fetching from database
  if (!dbLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <img
          src="/logo.png"
          alt="EarnCoin"
          className="w-20 h-20 rounded-full object-cover animate-pulse mb-4"
        />
        <p className="text-muted-foreground">Loading EarnCoin...</p>
      </div>
    );
  }

  return <Home />;
}
