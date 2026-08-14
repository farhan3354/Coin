"use client";

import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { useCurrentUser } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) { 
  const user = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.push('/');
    }
  }, [user, router]);

  // Sync state from database when the user switches back to this tab
  // This ensures that rewards claimed in a new tab (like watching videos) appear immediately
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        import("@/lib/dbSync").then((module) => module.syncFromDatabase());
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  if (user === null) {
    return null; // Or a loading spinner
  }

  return <DashboardShell>{children}</DashboardShell>; 
}
