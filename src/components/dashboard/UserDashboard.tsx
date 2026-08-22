"use client";

import { motion } from "framer-motion";
import { useStore, useCurrentUser } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatCard } from "@/components/shared/StatCard";
import { CountdownTimer } from "@/components/shared/CountdownTimer";
import {
  Coins, DollarSign, TrendingUp, Gift, Users, Video, Calendar, Trophy,
  Crown, Bell, Copy, CheckCircle2, ArrowRight, Clock, Wallet
} from "lucide-react";
import { formatPoints, formatUSD, formatDate } from "@/lib/mockData";
import { toast } from "sonner";
import type { ViewKey } from "@/lib/types";

export function UserDashboard() {
  const user = useCurrentUser();
  const { setView, events, rooms, videos, tasks, coinHistory, notifications, settings, users } = useStore();

  if (!user) return null;

  const myHistory = coinHistory.filter((h) => h.userId === user.id);
  const now = new Date();
  const today = myHistory.filter((h) => new Date(h.date).toDateString() === now.toDateString());
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const monthAgo = new Date(now.getTime() - 30 * 86400000);
  const todayEarned = today.reduce((s, h) => s + h.pointsEarned - h.pointsDeducted, 0);
  const weekEarned = myHistory.filter((h) => new Date(h.date) >= weekAgo).reduce((s, h) => s + h.pointsEarned, 0);
  const monthEarned = myHistory.filter((h) => new Date(h.date) >= monthAgo).reduce((s, h) => s + h.pointsEarned, 0);

  const myNotifs = notifications.filter((n) => n.userId === user.id);
  const liveEvents = events.filter((e) => e.status === "live");
  const openRooms = rooms.filter((r) => r.status === "open");
  const recentVideos = videos.slice(0, 3);
  const recentTasks = tasks.slice(0, 4);

  const referralLink = `${typeof window !== "undefined" ? window.location.origin : ""}/?ref=${user.referralCode}`;

  const copyReferral = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const goTo = (v: ViewKey) => setView(v);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="overflow-hidden relative min-w-0">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent pointer-events-none" />
          <CardContent className="p-3 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                className="flex-shrink-0"
              >
                <Avatar className="w-10 h-10 sm:w-16 sm:h-16">
                  <AvatarFallback style={{ backgroundColor: user.avatarColor, color: "white" }} className="text-sm sm:text-xl font-bold">
                    {user.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Welcome back,</p>
                <h1 className="text-base sm:text-2xl font-bold truncate">{user.fullName}</h1>
                <p className="text-xs text-muted-foreground truncate">@{user.username} · {user.country}</p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button variant="outline" size="sm" onClick={() => goTo("withdrawals")}>
                  <Wallet className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Withdraw</span><span className="sm:hidden">Cash</span>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button size="sm" onClick={() => goTo("videos")}>
                  <Video className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Earn Now</span><span className="sm:hidden">Earn</span>
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 min-w-0">
        <StatCard title="Total Points" value={formatPoints(user.points)} subtitle={`${formatUSD(user.dollarBalance)} USD`} icon={Coins} accent="bg-amber-100 text-amber-700" delay={0.1} />
        <StatCard title="Today" value={`+${formatPoints(todayEarned)}`} subtitle="points earned" icon={TrendingUp} accent="bg-green-100 text-green-700" delay={0.15} />
        <StatCard title="This Week" value={`+${formatPoints(weekEarned)}`} subtitle="points earned" icon={Calendar} accent="bg-blue-100 text-blue-700" delay={0.2} />
        <StatCard title="This Month" value={`+${formatPoints(monthEarned)}`} subtitle="points earned" icon={Calendar} accent="bg-purple-100 text-purple-700" delay={0.25} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 min-w-0">
        {/* Referral */}
        <Card className="lg:col-span-2 min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg"><Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> Referral Program</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Invite friends — earn {settings.referralReward} points for each verified referral.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {/* Referral code — full width on mobile, stacks vertically */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Your referral code</Label>
              <div className="flex gap-2 items-center">
                <div className="flex-1 min-w-0 px-3 py-2 rounded-md bg-muted font-mono font-bold tracking-wider text-sm truncate overflow-hidden">{user.referralCode}</div>
                <Button size="icon" variant="outline" className="flex-shrink-0 w-9 h-9" onClick={() => copyReferral(user.referralCode, "Code")}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {/* Referral link — full width, truncates properly */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Your referral link</Label>
              <div className="flex gap-2 items-center">
                <div className="flex-1 min-w-0 px-3 py-2 rounded-md bg-muted text-xs truncate overflow-hidden whitespace-nowrap">{referralLink}</div>
                <Button size="icon" variant="outline" className="flex-shrink-0 w-9 h-9" onClick={() => copyReferral(referralLink, "Link")}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {/* Stats — single column on very small screens, 3 columns on sm+ */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-3 pt-1">
              <div className="text-center p-1.5 sm:p-3 rounded-lg bg-muted/50 min-w-0">
                <p className="text-base sm:text-2xl font-bold">{user.totalReferrals}</p>
                <p className="text-[9px] sm:text-xs text-muted-foreground truncate">Total</p>
              </div>
              <div className="text-center p-1.5 sm:p-3 rounded-lg bg-muted/50 min-w-0">
                <p className="text-base sm:text-2xl font-bold text-green-600">{user.activeReferrals}</p>
                <p className="text-[9px] sm:text-xs text-muted-foreground truncate">Active</p>
              </div>
              <div className="text-center p-1.5 sm:p-3 rounded-lg bg-muted/50 min-w-0">
                <p className="text-base sm:text-2xl font-bold text-amber-600">{user.totalReferrals - user.activeReferrals}</p>
                <p className="text-[9px] sm:text-xs text-muted-foreground truncate">Pending</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={() => goTo("referrals")}>
              View Full Referral Dashboard <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
            </Button>
            {users.filter(u => u.referredBy === user.referralCode).length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs font-semibold text-muted-foreground mb-3">Recent Referrals</p>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {users.filter(u => u.referredBy === user.referralCode).slice(-5).reverse().map(r => (
                    <div key={r.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-sm">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6"><AvatarFallback style={{ backgroundColor: r.avatarColor || "#4f46e5", color: "white" }} className="text-[10px] font-semibold">{r.username.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                        <span className="font-medium truncate max-w-[100px] sm:max-w-[120px]">{r.username}</span>
                      </div>
                      <Badge variant={r.emailVerified ? "secondary" : "outline"} className={`text-[9px] h-4 px-1 leading-none ${r.emailVerified ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-amber-50 text-amber-600 hover:bg-amber-100"}`}>
                        {r.emailVerified ? "Active" : "Pending"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conversion rate */}
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-primary" /> Conversion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center py-3">
              <p className="text-2xl sm:text-3xl font-bold text-primary">{formatPoints(user.points)}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">points</p>
              <div className="my-3 text-xl sm:text-2xl">↓</div>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">{formatUSD(user.dollarBalance)}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">USD balance</p>
            </div>
            <div className="text-center text-xs text-muted-foreground border-t pt-3">
              Rate: {formatPoints(settings.pointsPerDollar)} points = $1
            </div>
            <Button className="w-full" onClick={() => goTo("withdrawals")}>
              <Wallet className="w-4 h-4 mr-2" /> Withdraw
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 min-w-0">
        {/* Live Events */}
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-lg"><Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> Live Events</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => goTo("events")}>View all</Button>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            {liveEvents.length === 0 && <p className="text-sm text-muted-foreground">No live events right now.</p>}
            {liveEvents.slice(0, 3).map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-2 p-2 sm:p-3 rounded-lg border min-w-0">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-xs sm:text-sm truncate">{e.title}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground capitalize">{e.type} · +{e.rewardPoints} pts</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <Badge variant="secondary" className="bg-red-100 text-red-700 text-[10px]">LIVE</Badge>
                  <CountdownTimer endTime={e.endTime} compact className="block mt-1 text-[10px] sm:text-xs" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Open Rooms */}
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-lg"><Crown className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> Open Rooms</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => goTo("rooms")}>View all</Button>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            {openRooms.slice(0, 3).map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-2 p-2 sm:p-3 rounded-lg border min-w-0">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-xs sm:text-sm truncate">{r.name}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Level {r.level} · {r.seats} seats</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <Badge variant="outline" className="text-[10px]">L{r.level}</Badge>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{r.participants.length}/{r.seats}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 min-w-0">
        {/* Recent Videos */}
        <Card className="lg:col-span-2 min-w-0 overflow-hidden">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-lg"><Video className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> Recent Videos</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => goTo("videos")}>View all</Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentVideos.map((v) => (
              <div key={v.id} className="flex items-center justify-between gap-2 p-2 rounded-md hover:bg-muted/50 min-w-0">
                <div className="min-w-0 flex items-center gap-2 sm:gap-3 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-primary/10 grid place-items-center flex-shrink-0">
                    <Video className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-xs sm:text-sm truncate">{v.title}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground capitalize">{v.platform} · {v.watchDurationSec}s</p>
                  </div>
                </div>
                <Badge variant="outline" className="flex items-center gap-1 whitespace-nowrap flex-shrink-0 text-[10px] sm:text-xs">
                  <Coins className="w-3 h-3 text-primary" /> +{v.rewardPoints}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-lg"><Bell className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> Notifications</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => goTo("notifications")}>All</Button>
          </CardHeader>
          <CardContent className="space-y-2 max-h-64 overflow-y-auto">
            {myNotifs.slice(0, 5).map((n) => (
              <div key={n.id} className={`p-2 rounded-md text-sm ${n.read ? "" : "bg-primary/5"}`}>
                <p className="font-medium text-xs">{n.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{n.message}</p>
              </div>
            ))}
            {myNotifs.length === 0 && <p className="text-sm text-muted-foreground">No notifications.</p>}
          </CardContent>
        </Card>
      </div>

      {/* Recent tasks + withdrawal status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 min-w-0">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm sm:text-lg">Recent Tasks</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => goTo("tasks")}>View all</Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentTasks.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 min-w-0 gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-xs sm:text-sm truncate">{t.title}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{t.completed}/{t.availability} completed</p>
                </div>
                <Badge variant="outline" className="flex items-center gap-1 flex-shrink-0 text-[10px] sm:text-xs">
                  <Coins className="w-3 h-3 text-primary" /> +{t.rewardPoints}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-lg"><Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> Withdrawal Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Available</span>
                <span className="font-bold text-green-600">{formatUSD(user.dollarBalance)}</span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Min withdrawal</span>
                <span className="font-medium">{formatUSD(settings.minWithdrawal)}</span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Max withdrawal</span>
                <span className="font-medium">{formatUSD(settings.maxWithdrawal)}</span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Processing time</span>
                <span className="font-medium">{settings.withdrawalProcessingHours}</span>
              </div>
              <Button size="sm" className="w-full mt-2" onClick={() => goTo("withdrawals")}>
                <Wallet className="w-4 h-4 mr-2" /> Withdraw Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
