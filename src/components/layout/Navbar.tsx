"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Coins, Menu, Bell, LayoutDashboard, LogOut, User as UserIcon, Shield, Building2, ChevronDown, MoreVertical, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import type { ViewKey } from "@/lib/types";
import { formatPoints } from "@/lib/mockData";

const publicNav: { key: ViewKey; label: string }[] = [
  { key: "home", label: "Home" },
  { key: "about", label: "About" },
  { key: "features", label: "Features" },
  { key: "how-it-works", label: "How It Works" },
  { key: "advertise", label: "Advertise" },
  { key: "faq", label: "FAQ" },
  { key: "contact", label: "Contact" },
];

const userNav: { key: ViewKey; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "videos", label: "Videos" },
  { key: "tasks", label: "Tasks" },
  { key: "events", label: "Events" },
  { key: "rooms", label: "Rooms" },
  { key: "referrals", label: "Referrals" },
  { key: "withdrawals", label: "Withdrawals" },
  { key: "coin-history", label: "Coin History" },
  { key: "leaderboard", label: "Leaderboard" },
];

const adminNav: { key: ViewKey; label: string }[] = [
  { key: "admin", label: "Admin Panel" },
];

const businessNav: { key: ViewKey; label: string }[] = [
  { key: "business", label: "Business" },
];

export function Logo({ onClick, bounce = false }: { onClick?: () => void; bounce?: boolean }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="flex items-center gap-2 font-bold text-lg tracking-tight"
    >
      <motion.img
        src="/logo.png"
        alt="EarnCoin Logo"
        className="w-10 h-10 rounded-full object-cover"
        animate={bounce ? { y: [0, -6, 0], rotate: [0, -8, 8, 0] } : {}}
        transition={bounce ? { duration: 1.6, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 } : { type: "spring", stiffness: 300 }}
      />
      <motion.span
        animate={bounce ? { color: ["var(--primary)", "var(--foreground)", "var(--primary)"] } : {}}
        transition={bounce ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
      >
        Earn<span className="text-primary">Coin</span>
      </motion.span>
    </motion.button>
  );
}

export function Navbar() {
  const { currentView, setView, openAuth, logout, currentUserId, users, notifications } = useStore();
  const user = users.find((u) => u.id === currentUserId) || null;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const unread = notifications.filter((n) => n.userId === currentUserId && !n.read).length;
  let nav = publicNav;
  if (user?.role === "admin") nav = [...userNav.slice(0, 6), ...adminNav];
  else if (user?.role === "business") nav = businessNav;
  else if (user) nav = userNav;

  const go = (v: ViewKey) => {
    setView(v);
    setMobileOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b bg-background/85 backdrop-blur-md transition-shadow ${
        scrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo onClick={() => go("home")} bounce={currentView === "home"} />
          <nav className="hidden lg:flex items-center gap-1">
            {nav.map((item) => (
              <motion.button
                key={item.key}
                onClick={() => go(item.key)}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.96 }}
                className={`relative px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent ${
                  currentView === item.key ? "text-primary" : "text-foreground/70"
                }`}
              >
                {item.label}
                {currentView === item.key && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-x-2 -bottom-0.5 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {user.role === "user" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex items-center gap-2"
                  onClick={() => go("dashboard")}
                >
                  <Coins className="w-4 h-4 text-primary" />
                  <span className="font-semibold">{formatPoints(user.points)}</span>
                  <span className="text-xs text-muted-foreground">pts</span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => go("notifications")}
                aria-label="Notifications"
              >
                <motion.div
                  animate={unread > 0 ? { rotate: [0, -15, 15, -10, 10, 0] } : {}}
                  transition={{ duration: 0.8, repeat: unread > 0 ? Infinity : 0, repeatDelay: 3 }}
                >
                  <Bell className="w-5 h-5" />
                </motion.div>
                <AnimatePresence>
                  {unread > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] grid place-items-center px-1"
                    >
                      {unread > 9 ? "9+" : unread}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-accent transition-colors">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback style={{ backgroundColor: user.avatarColor, color: "white" }}>
                        {user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="font-semibold text-sm truncate">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    <Badge variant="secondary" className="mt-1 capitalize">{user.role}</Badge>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => go("profile")}>
                    <UserIcon className="w-4 h-4 mr-2" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => go("dashboard")}>
                    <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem onClick={() => go("admin")}>
                      <Shield className="w-4 h-4 mr-2" /> Admin Panel
                    </DropdownMenuItem>
                  )}
                  {user.role === "business" && (
                    <DropdownMenuItem onClick={() => go("business")}>
                      <Building2 className="w-4 h-4 mr-2" /> Business Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { logout(); }} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => openAuth("login")}>
                Login
              </Button>
              <Button size="sm" onClick={() => openAuth("register")}>
                Get Started
              </Button>
            </div>
          )}

          {/* Theme toggle */}
          <ThemeToggleButton />

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex flex-col gap-1 mt-4">
                {nav.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => go(item.key)}
                    className={`text-left px-3 py-2.5 text-sm font-medium rounded-md transition-colors hover:bg-accent ${
                      currentView === item.key ? "text-primary bg-accent" : ""
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                {!user && (
                  <div className="flex flex-col gap-2 mt-4">
                    <Button variant="outline" onClick={() => { openAuth("login"); setMobileOpen(false); }}>
                      Login
                    </Button>
                    <Button onClick={() => { openAuth("register"); setMobileOpen(false); }}>
                      Get Started
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      className="grid place-items-center w-9 h-9 rounded-lg hover:bg-accent transition-colors relative"
    >
      <Sun className="w-5 h-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 absolute" />
      <Moon className="w-5 h-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 absolute" />
    </motion.button>
  );
}

export function Footer() {
  const { setView } = useStore();
  const year = new Date().getFullYear();
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Logo bounce />
          <p className="text-sm text-muted-foreground mt-3 max-w-xs">
            Earn rewards by watching videos, completing tasks, joining events, and inviting friends.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-3">Platform</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><button onClick={() => setView("about")} className="hover:text-primary">About Us</button></li>
            <li><button onClick={() => setView("features")} className="hover:text-primary">Features</button></li>
            <li><button onClick={() => setView("how-it-works")} className="hover:text-primary">How It Works</button></li>
            <li><button onClick={() => setView("advertise")} className="hover:text-primary">Advertise</button></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-3">Support</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><button onClick={() => setView("contact")} className="hover:text-primary">Contact</button></li>
            <li><button onClick={() => setView("faq")} className="hover:text-primary">FAQ</button></li>
            <li><button onClick={() => setView("terms")} className="hover:text-primary">Terms</button></li>
            <li><button onClick={() => setView("privacy")} className="hover:text-primary">Privacy Policy</button></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-3">Account</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><button onClick={() => useStore.getState().openAuth("login")} className="hover:text-primary">Login</button></li>
            <li><button onClick={() => useStore.getState().openAuth("register")} className="hover:text-primary">Register</button></li>
            <li><button onClick={() => useStore.getState().openAuth("forgot")} className="hover:text-primary">Forgot Password</button></li>
          </ul>
        </div>
      </div>
      <div className="border-t py-6 text-center text-sm text-muted-foreground">
        © {year} EarnCoin. All rights reserved.
      </div>
    </footer>
  );
}
