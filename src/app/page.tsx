"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useStore, useCurrentUser } from "@/lib/store";
import { syncFromDatabase } from "@/lib/dbSync";
import { Navbar, Footer } from "@/components/layout/Navbar";
import { AuthModals } from "@/components/auth/AuthModals";
import {
  Home, About, Features, HowItWorks, Advertise, Contact, FAQ, Terms, Privacy,
} from "@/components/public/Pages";
import { UserDashboard } from "@/components/dashboard/UserDashboard";
import {
  VideosPage, TasksPage, EventsPage, RoomsPage,
  ReferralsPage, WithdrawalsPage, CoinHistoryPage, LeaderboardPage,
  NotificationsPage, ProfilePage, GamesPage, BuyCoinsPage, QuizPage,
} from "@/components/dashboard/Pages";
import { ThemeCustomizer } from "@/components/dashboard/ThemeCustomizer";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { BusinessDashboard } from "@/components/business/BusinessDashboard";
import { VideoWatchPage } from "@/components/shared/VideoWatchPage";
import { TaskWatchPage } from "@/components/shared/TaskWatchPage";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import { BottomNav } from "@/components/shared/BottomNav";
import { CustomerService } from "@/components/shared/CustomerService";
import { PageTransition } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { Lock, Coins } from "lucide-react";
import type { ViewKey } from "@/lib/types";

// Views that should be wrapped in the user dashboard sidebar layout
const DASHBOARD_VIEWS: ViewKey[] = [
  "dashboard", "videos", "tasks", "events", "rooms", "games", "quizzes", "referrals",
  "withdrawals", "coin-history", "leaderboard", "notifications", "profile", "buy-coins", "theme",
];

// Map view to component
function renderView(view: ViewKey, user: ReturnType<typeof useCurrentUser>) {
  // Public views (no auth needed)
  switch (view) {
    case "home": return <Home />;
    case "about": return <About />;
    case "features": return <Features />;
    case "how-it-works": return <HowItWorks />;
    case "advertise": return <Advertise />;
    case "contact": return <Contact />;
    case "faq": return <FAQ />;
    case "terms": return <Terms />;
    case "privacy": return <Privacy />;
  }

  // Protected views (require auth)
  if (!user) {
    return <RequireAuth />;
  }

  // Role-based checks
  if (view === "admin" && user.role !== "admin") {
    return <RequireRole role="admin" />;
  }
  if (view === "business" && user.role !== "business" && user.role !== "admin") {
    return <RequireRole role="business" />;
  }

  // Admins should never see the user dashboard — always send them to the admin panel
  if (user.role === "admin" && view !== "admin" && view !== "profile" && view !== "notifications") {
    return <AdminDashboard />;
  }
  // Business users should never see the user dashboard — always send them to the business panel
  if (user.role === "business" && view !== "business" && view !== "profile" && view !== "notifications") {
    return <BusinessDashboard />;
  }

  // User dashboard views wrapped in sidebar shell
  if (DASHBOARD_VIEWS.includes(view) && user.role === "user") {
    let page: React.ReactNode = null;
    switch (view) {
      case "dashboard": page = <UserDashboard />; break;
      case "videos": page = <VideosPage />; break;
      case "tasks": page = <TasksPage />; break;
      case "events": page = <EventsPage />; break;
      case "rooms": page = <RoomsPage />; break;
      case "games": page = <GamesPage />; break;
      case "quizzes": page = <QuizPage />; break;
      case "referrals": page = <ReferralsPage />; break;
      case "withdrawals": page = <WithdrawalsPage />; break;
      case "coin-history": page = <CoinHistoryPage />; break;
      case "leaderboard": page = <LeaderboardPage />; break;
      case "notifications": page = <NotificationsPage />; break;
      case "profile": page = <ProfilePage />; break;
      case "buy-coins": page = <BuyCoinsPage />; break;
      case "theme": page = <ThemeCustomizer />; break;
    }
    return <DashboardShell>{page}</DashboardShell>;
  }

  switch (view) {
    case "dashboard": return <UserDashboard />;
    case "videos": return <VideosPage />;
    case "tasks": return <TasksPage />;
    case "events": return <EventsPage />;
    case "rooms": return <RoomsPage />;
    case "games": return <GamesPage />;
    case "quizzes": return <QuizPage />;
    case "referrals": return <ReferralsPage />;
    case "withdrawals": return <WithdrawalsPage />;
    case "coin-history": return <CoinHistoryPage />;
    case "leaderboard": return <LeaderboardPage />;
    case "notifications": return <NotificationsPage />;
    case "profile": return <ProfilePage />;
    case "buy-coins": return <BuyCoinsPage />;
    case "theme": return <ThemeCustomizer />;
    case "admin": return <AdminDashboard />;
    case "business": return <BusinessDashboard />;
    default: return <Home />;
  }
}

function RequireAuth() {
  const { openAuth, setView } = useStore();
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="grid place-items-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mx-auto mb-4">
        <Lock className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Login required</h1>
      <p className="text-muted-foreground mb-6">You need to be logged in to view this page.</p>
      <div className="flex gap-2 justify-center">
        <Button onClick={() => openAuth("login")}>Login</Button>
        <Button variant="outline" onClick={() => setView("home")}>Back to Home</Button>
      </div>
    </div>
  );
}

function RequireRole({ role }: { role: string }) {
  const { setView, logout } = useStore();
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="grid place-items-center w-16 h-16 rounded-2xl bg-destructive/10 text-destructive mx-auto mb-4">
        <Lock className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Access denied</h1>
      <p className="text-muted-foreground mb-6">You don&apos;t have permission to view this page. This area is for {role} accounts only.</p>
      <div className="flex gap-2 justify-center">
        <Button variant="outline" onClick={() => setView("home")}>Back to Home</Button>
        <Button variant="outline" onClick={() => { logout(); }}>Logout</Button>
      </div>
    </div>
  );
}

export default function Page() {
  const { currentView, currentUserId, openAuth, dbLoaded } = useStore();
  const user = useCurrentUser();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync data from database on mount and when tab regains focus
  useEffect(() => {
    if (isMounted && !dbLoaded) {
      syncFromDatabase();
    }

    const handleFocus = () => {
      // Re-sync from database when tab regains focus (e.g. after watching a video in a new tab)
      // This ensures the coin balance and other data is up to date without needing a manual reload
      if (useStore.getState().currentUserId) {
        syncFromDatabase();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        handleFocus();
      }
    });

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [dbLoaded, isMounted]);

  // Check for ?watch=VIDEO_ID or ?task=TASK_ID URL parameters — lazy init
  const [watchVideoId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    return params.get("watch");
  });
  
  const [watchTaskId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    return params.get("task");
  });

  // Handle referral code in URL on first load
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (watchVideoId || watchTaskId) return; // Skip on watch/task page
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
  }, [currentUserId, openAuth, watchVideoId, watchTaskId]);

  // If this is a video watch page (new tab), render only the watch page — no navbar/footer
  if (isMounted && watchVideoId) {
    return <VideoWatchPage videoId={watchVideoId} />;
  }

  // If this is a task watch page (new tab), render only the task watch page
  if (isMounted && watchTaskId) {
    return <TaskWatchPage taskId={watchTaskId} />;
  }

  // Show loading screen while fetching from database or before mount to avoid hydration mismatch
  if (!isMounted || !dbLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <img src="/logo.png" alt="EarnCoin" className="w-20 h-20 rounded-full object-cover animate-pulse mb-4" />
        <p className="text-muted-foreground">Loading EarnCoin...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <PageTransition key={currentView}>
            {renderView(currentView, user)}
          </PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
      <AuthModals />
      <ScrollToTop />
      <CustomerService />
      <BottomNav />
    </div>
  );
}
