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

  if (user === null) {
    return null; // Or a loading spinner
  }

  return <DashboardShell>{children}</DashboardShell>; 
}
