"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore, useCurrentUser } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard, Video, ListChecks, Trophy, Crown, Users, Wallet,
  History, TrendingUp, Bell, User as UserIcon, Menu, Coins, LogOut,
  X, Gamepad2, Palette
} from "lucide-react";
import { formatPoints, formatUSD } from "@/lib/mockData";
import type { ViewKey } from "@/lib/types";

interface NavItem {
  key: ViewKey;
  label: string;
  icon: typeof LayoutDashboard;
  group: "main" | "earning" | "account";
}

const navItems: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "main" },
  { key: "videos", label: "Videos", icon: Video, group: "earning" },
  { key: "tasks", label: "Tasks", icon: ListChecks, group: "earning" },
  { key: "events", label: "Events", icon: Trophy, group: "earning" },
  { key: "rooms", label: "Rooms", icon: Crown, group: "earning" },
  { key: "games", label: "Games", icon: Gamepad2, group: "earning" },
  { key: "leaderboard", label: "Leaderboard", icon: TrendingUp, group: "earning" },
  { key: "referrals", label: "Referrals", icon: Users, group: "account" },
  { key: "withdrawals", label: "Withdrawals", icon: Wallet, group: "account" },
  { key: "buy-coins", label: "Buy Coins", icon: Coins, group: "account" },
  { key: "coin-history", label: "Coin History", icon: History, group: "account" },
  { key: "notifications", label: "Notifications", icon: Bell, group: "account" },
  { key: "profile", label: "Profile", icon: UserIcon, group: "account" },
  { key: "theme", label: "Theme", icon: Palette, group: "account" },
];

const groupLabels: Record<NavItem["group"], string> = {
  main: "Main",
  earning: "Earn Points",
  account: "Account",
};

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const user = useCurrentUser();
  const { currentView, setView, logout, notifications, currentUserId } = useStore();

  if (!user) return null;

  const unread = notifications.filter((n) => n.userId === currentUserId && !n.read).length;

  return (
    <div className="flex flex-col h-full">
      {/* User card */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback style={{ backgroundColor: user.avatarColor, color: "white" }} className="font-semibold">
              {user.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm truncate">{user.fullName}</p>
            <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="rounded-md bg-muted/60 px-2.5 py-1.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Points</p>
            <p className="font-bold text-sm flex items-center gap-1">
              <Coins className="w-3 h-3 text-primary" />
              {formatPoints(user.points)}
            </p>
          </div>
          <div className="rounded-md bg-muted/60 px-2.5 py-1.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">USD</p>
            <p className="font-bold text-sm text-green-600">{formatUSD(user.dollarBalance)}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="p-3 space-y-5">
          {(Object.keys(groupLabels) as NavItem["group"][]).map((group) => {
            const items = navItems.filter((i) => i.group === group);
            return (
              <div key={group}>
                <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {groupLabels[group]}
                </p>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const isActive = currentView === item.key;
                    const showBadge = item.key === "notifications" && unread > 0;
                    return (
                      <motion.button
                        key={item.key}
                        onClick={() => {
                          setView(item.key);
                          onNavigate?.();
                        }}
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground/80 hover:bg-accent hover:text-foreground"
                        }`}
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        <span className="flex-1 text-left truncate">{item.label}</span>
                        {showBadge && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                          >
                            <Badge variant="secondary" className={`h-5 min-w-[20px] px-1 text-[10px] flex items-center justify-center ${isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-destructive text-destructive-foreground"}`}>
                              {unread > 9 ? "9+" : unread}
                            </Badge>
                          </motion.span>
                        )}
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-active"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-foreground rounded-r-full"
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Logout */}
      <div className="p-3 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => { logout(); onNavigate?.(); }}
        >
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:block w-64 flex-shrink-0"
        >
          <div className="sticky top-20 h-[calc(100vh-6rem)] rounded-xl border bg-card overflow-hidden">
            <SidebarContent />
          </div>
        </motion.aside>

        {/* Mobile sidebar trigger */}
        <div className="lg:hidden fixed bottom-4 right-4 z-30">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="icon" className="w-12 h-12 rounded-full shadow-lg">
                  <Menu className="w-5 h-5" />
                </Button>
              </motion.div>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
              <div className="flex items-center justify-between p-3 border-b">
                <span className="font-semibold text-sm">Menu</span>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setMobileOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="h-[calc(100vh-60px)]">
                <SidebarContent onNavigate={() => setMobileOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
