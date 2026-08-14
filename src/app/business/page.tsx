"use client";

import { BusinessDashboard } from "@/components/business/BusinessDashboard";
import { useCurrentUser } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const user = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.push("/");
    } else if (user.role !== "business" && user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (!user || (user.role !== "business" && user.role !== "admin")) return null;

  return <BusinessDashboard />;
}
