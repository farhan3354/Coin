"use client";

import { useStore } from "@/lib/store";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Video, ListChecks, Trophy, Crown,
  Wallet, Users, Home as HomeIcon, User as UserIcon
} from "lucide-react";
import type { ViewKey } from "@/lib/types";

const bottomNavItems: { key: ViewKey; label: string; icon: typeof HomeIcon }[] = [
  { key: "videos", label: "Videos", icon: Video },
  { key: "tasks", label: "Tasks", icon: ListChecks },
  { key: "dashboard", label: "Home", icon: HomeIcon },
  { key: "rooms", label: "Rooms", icon: Crown },
  { key: "buy-coins", label: "Buy", icon: Wallet },
];

export function BottomNav() {
  const { currentView, setView, currentUserId } = useStore();

  if (!currentUserId) return null;

  return (
    <motion.nav
      initial={{ y: 60 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur-md"
    >
      <div className="flex items-center justify-around h-16">
        {bottomNavItems.map((item) => {
          const isActive = currentView === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setView(item.key)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <motion.div
                whileTap={{ scale: 0.85 }}
                className="relative"
              >
                <item.icon className="w-5 h-5" />
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-active"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                  />
                )}
              </motion.div>
              <span className={`text-[10px] font-medium ${isActive ? "text-primary" : ""}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
}
