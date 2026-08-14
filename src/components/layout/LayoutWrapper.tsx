"use client";

import { useSearchParams } from 'next/navigation';
import { Navbar, Footer } from '@/components/layout/Navbar';
import { AuthModals } from '@/components/auth/AuthModals';
import { ScrollToTop } from '@/components/shared/ScrollToTop';
import { CustomerService } from '@/components/shared/CustomerService';
import { BottomNav } from '@/components/shared/BottomNav';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const isWatch = searchParams.get("watch") !== null;

  if (isWatch) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <AuthModals />
      <ScrollToTop />
      <CustomerService />
      <BottomNav />
    </>
  );
}
